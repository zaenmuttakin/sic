import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import sharp from 'sharp';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const mid = formData.get('mid');
    const slot = formData.get('slot'); // 'img1', 'img2', 'img3'
    const user = formData.get('user') || 'system';
    const oldFileId = formData.get('oldFileId');

    // Verify ENV presence
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    if (!scriptUrl || !folderId) {
      console.error('Missing GOOGLE_APPS_SCRIPT_URL or GOOGLE_DRIVE_FOLDER_ID');
      return NextResponse.json({ error: 'Server configuration error (missing script URL)' }, { status: 500 });
    }

    if (!file || !mid || !slot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Read file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Process image with Sharp (Compression + Resize)
    const processedBuffer = await sharp(buffer)
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();

    const fileName = `SIC_${mid}_${slot}_${Date.now()}.jpg`;
    const base64Data = processedBuffer.toString('base64');

    // 2.5 Optional: Delete old image if it exists to prevent "orphans"
    if (oldFileId && oldFileId !== 'null' && oldFileId !== 'undefined') {
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', fileId: oldFileId })
        });
      } catch (e) {
        console.warn("Failed to delete old image:", e);
      }
    }

    // 3. Upload via Google Apps Script
    const uploadRes = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upload',
        folderId: folderId,
        filename: fileName,
        mimeType: 'image/jpeg',
        base64Data: base64Data
      })
    });

    const scriptData = await uploadRes.json();
    if (!scriptData.success) {
      throw new Error(scriptData.error || 'Apps Script upload failed');
    }

    const fileId = scriptData.id;

    // 4. Update Supabase images table
    const updateAt = new Date().toISOString();
    const { error: dbError } = await supabase
      .from('images')
      .upsert({
        mid,
        [slot]: fileId,
        user,
        update_at: updateAt,
        detail_change: slot
      }, { onConflict: 'mid' });

    if (dbError) {
      // Cleanup Drive file if DB update fails
      await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', fileId: fileId })
      });
      throw dbError;
    }

    return NextResponse.json({ 
      success: true, 
      fileId: fileId,
      url: `https://drive.google.com/uc?id=${fileId}`
    });

  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');
    const mid = searchParams.get('mid');
    const slot = searchParams.get('slot');
    const user = searchParams.get('user') || 'system';

    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!fileId || !mid || !slot) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (!scriptUrl) {
      return NextResponse.json({ error: 'Missing Script URL' }, { status: 500 });
    }

    // 1. Delete from Google Drive via Apps Script
    const deleteRes = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', fileId: fileId })
    });
    
    const scriptData = await deleteRes.json();
    if (!scriptData.success) {
       console.warn("Apps Script deletion failed/file not found:", scriptData.error);
    }

    // 2. Update Supabase (set slot to NULL)
    const updateAt = new Date().toISOString();
    const { error: dbError } = await supabase
      .from('images')
      .update({
        [slot]: null,
        user,
        update_at: updateAt,
        detail_change: `delete_${slot}`
      })
      .eq('mid', mid);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
