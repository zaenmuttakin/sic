import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Read at runtime, not module load time
function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  return { apiKey, model, url };
}

/**
 * Detect user intent from message
 */
function detectIntent(message) {
  const lower = message.toLowerCase().trim();

  // "empty" + bin name → find empty bins
  if (lower.startsWith('empty') || lower.includes('empty bin') || lower.includes('bin kosong')) {
    const binSearch = lower.replace(/empty\s*(bin)?s?\s*/i, '').replace(/bin\s*kosong\s*/i, '').trim();
    return { type: 'empty_bin', search: binSearch || null };
  }

  // "stock" + MID/desc → show stock summary
  if (lower.startsWith('stock') || lower.startsWith('stok')) {
    const search = lower.replace(/^(stock|stok)\s*/i, '').trim();
    return { type: 'stock', search };
  }

  // General query - could be MID or description lookup
  return { type: 'general', search: message.trim() };
}

/**
 * Fetch material data from material_master_view
 */
async function fetchMaterials(search, limit = 10) {
  const isNumber = /^\d+$/.test(search);
  let query = supabase
    .from('material_master_view')
    .select('*')
    .limit(limit * 3); // fetch more rows to account for bin joins

  if (isNumber) {
    query = query.or(`mid.eq.${search},material_name.ilike.%${search}%`);
  } else {
    query = query.or(`material_name.ilike.%${search}%,mid.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Group by MID (same logic as useDataList)
  const grouped = (data || []).reduce((acc, row) => {
    if (!acc[row.mid]) {
      acc[row.mid] = {
        mid: row.mid,
        desc: row.material_name,
        uom: row.uom,
        actual: row.actual,
        draft: row.draft,
        project: row.project,
        g002: row.g002,
        g003: row.g003,
        g004: row.g004,
        gt01: row.gt01,
        bin_sap: row.bin_sap,
        bins: [],
      };
    }
    if (row.bin_location) {
      acc[row.mid].bins.push({
        bin: row.bin_location,
        type: row.bin_type,
        detail: row.bin_detail,
      });
    }
    return acc;
  }, {});

  return Object.values(grouped).slice(0, limit);
}

/**
 * Fetch old_mid mapping data
 */
async function fetchOldMid(search, limit = 15) {
  const isNumber = /^\d+$/.test(search);
  const filter = isNumber
    ? `old_mat.eq.${search},old_mat.ilike.%${search}%,new_mat.eq.${search},new_mat.ilike.%${search}%,old_desc.ilike.%${search}%`
    : `old_mat.ilike.%${search}%,old_desc.ilike.%${search}%,new_mat.ilike.%${search}%,new_desc.ilike.%${search}%`;

  const { data, error } = await supabase
    .from('old_mid')
    .select('*')
    .or(filter)
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Fetch bins data (empty or by search)
 */
async function fetchBins(search, emptyOnly = false, limit = 20) {
  let query = supabase.from('bins').select('*');

  if (emptyOnly) {
    // A bin is considered empty if mid is null or an empty string
    query = query.or('mid.is.null,mid.eq.""');
    
    // If searching for a specific bin while looking for empty ones
    if (search) {
      query = query.ilike('bin', `%${search}%`);
    }
  } else if (search) {
    // General bin search
    query = query.or(`bin.ilike.%${search}%,mid.ilike.%${search}%,desc.ilike.%${search}%`);
  }

  const { data, error } = await query.limit(limit).order('bin', { ascending: true });
  if (error) throw error;

  // Group bins to handle duplicates if any (though for empty bins it should be unique)
  const grouped = (data || []).reduce((acc, item) => {
    const binName = item.bin || '(NULL)';
    if (!acc[binName]) {
      acc[binName] = { 
        bin: binName, 
        items: [],
        type: item.type,
        detail: item.detail 
      };
    }
    if (item.mid) {
      acc[binName].items.push({ mid: item.mid, desc: item.desc });
    }
    return acc;
  }, {});

  return Object.values(grouped);
}

/**
 * Build system prompt for Gemini
 */
function buildSystemPrompt() {
  return `You are an inventory assistant for a warehouse management system called SIC (Stock Inventory Control).

You help users query information about:
- **Materials**: identified by MID (Material ID number), with description, UOM, and stock levels across warehouses (G001 with draft/unrestricted/project, G002, G003, G004, GT01)
- **Bins**: physical storage locations where materials are stored
- **Old MID mapping**: legacy ECC material numbers (old_mat) mapped to new SAP material numbers (new_mat)

Rules:
- Answer in the same language as the user (Indonesian or English)
- Be concise and use structured formatting (tables, bullet points)
- When showing stock, calculate total stock = actual + gt01 + g002 + g003 + g004
- For G001 breakdown: Unrestricted = actual - project - draft
- When a MID appears in old_mid table as old_mat, it is an OLD/legacy MID
- When a MID appears in old_mid table as new_mat, it is a NEW/current MID  
- If data is not found, say so clearly
- Do NOT invent data, only use what is provided in the context`;
}

/**
 * Call Gemini API
 */
async function callGemini(systemPrompt, userMessage, dataContext) {
  const { url } = getGeminiConfig();

  const prompt = `${systemPrompt}

=== DATABASE RESULTS ===
${dataContext}
========================

User question: ${userMessage}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (res.status === 429) {
    return {
      error: 'rate_limit',
      message: 'Rate limit reached. Free plan allows ~15 requests/minute. Please wait a moment and try again.',
      retryAfter: 60,
    };
  }

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`Gemini API error [${res.status}]:`, errBody);

    // Parse error for more helpful message
    let detail = '';
    try {
      const errJson = JSON.parse(errBody);
      detail = errJson.error?.message || '';
    } catch {}

    if (res.status === 403) {
      return {
        error: 'api_error',
        message: `API key issue: ${detail || 'Access denied. Check that your GEMINI_API_KEY is valid and the Generative Language API is enabled in Google Cloud Console.'}`,
      };
    }

    return {
      error: 'api_error',
      message: `AI service error (${res.status}): ${detail || 'Please try again later.'}`,
    };
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    return { error: 'empty_response', message: 'AI returned no response. Try rephrasing your question.' };
  }

  return { text };
}

export async function POST(req) {
  try {
    const { apiKey } = getGeminiConfig();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured. Add GEMINI_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const { message, history } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const intent = detectIntent(message);
    let dataContext = '';

    try {
      if (intent.type === 'empty_bin') {
        // Find empty bins
        const bins = await fetchBins(intent.search, true);
        dataContext = `Empty bins query for "${intent.search || 'all'}":\n`;
        if (bins.length === 0) {
          dataContext += 'No empty bins found matching the search.\n';
          // Also try fetching bins matching the name to show what exists
          if (intent.search) {
            const allBins = await fetchBins(intent.search, false, 10);
            dataContext += `\nBins matching "${intent.search}" (with contents):\n${JSON.stringify(allBins, null, 2)}`;
          }
        } else {
          dataContext += JSON.stringify(bins, null, 2);
        }

      } else if (intent.type === 'stock') {
        // Stock lookup
        const materials = await fetchMaterials(intent.search, 5);
        dataContext += `Material/Stock data for "${intent.search}":\n${JSON.stringify(materials, null, 2)}\n`;

        // Also fetch old_mid mappings
        const oldMids = await fetchOldMid(intent.search, 5);
        if (oldMids.length > 0) {
          dataContext += `\nOld MID mappings found:\n${JSON.stringify(oldMids, null, 2)}`;
        }

      } else {
        // General query - fetch from all sources
        const [materials, oldMids, bins] = await Promise.all([
          fetchMaterials(intent.search, 5),
          fetchOldMid(intent.search, 5),
          fetchBins(intent.search, false, 5),
        ]);

        if (materials.length > 0) {
          dataContext += `Material data:\n${JSON.stringify(materials, null, 2)}\n\n`;
        }
        if (oldMids.length > 0) {
          dataContext += `Old MID mapping data:\n${JSON.stringify(oldMids, null, 2)}\n\n`;
        }
        if (bins.length > 0) {
          dataContext += `Bin data:\n${JSON.stringify(bins, null, 2)}\n\n`;
        }
        if (!dataContext) {
          dataContext = `No data found matching "${intent.search}" in any table (material_master_view, old_mid, bins).`;
        }
      }
    } catch (dbError) {
      console.error('Database query error:', dbError);
      dataContext = `Database query error: ${dbError.message}. Inform the user about this issue.`;
    }

    // Build conversation context from history (last few messages)
    let conversationContext = '';
    if (history?.length > 0) {
      const recentHistory = history.slice(-4);
      conversationContext = recentHistory
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');
      conversationContext = `\n=== PREVIOUS CONVERSATION ===\n${conversationContext}\n=============================\n`;
    }

    const systemPrompt = buildSystemPrompt() + conversationContext;
    const result = await callGemini(systemPrompt, message, dataContext);

    if (result.error) {
      return NextResponse.json(
        { error: result.message, type: result.error, retryAfter: result.retryAfter },
        { status: result.error === 'rate_limit' ? 429 : 500 }
      );
    }

    return NextResponse.json({ response: result.text, intent: intent.type });

  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
