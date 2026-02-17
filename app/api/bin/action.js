import { supabase } from '@/lib/supabase/supabase'

// FETCH & SEARCH
export async function getBinSpBase(sloc, searchTerm = '', page = 0) {
  try {
    const ITEMS_PER_PAGE = 50;
    const from = page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from(`bin_${sloc.toLowerCase()}`)
      .select('*', { count: 'exact' }) // 'exact' returns total count of matches
      .order('id', { ascending: true })
      .range(from, to); // This handles the "Limit 50" logic

    if (searchTerm) {
      query = query.ilike('mid', `%${searchTerm}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      totalCount: count || 0
    };
  } catch (error) {
    console.log("Error fetching bin data:", error);
    return {
      data: [],
      totalCount: 0
    };
  }
}

export async function getCheckBinSpBase(sloc, searchBin = '') {
  try {


    let query = supabase
      .from(`bin_${sloc.toLowerCase()}`)
      .select('*', { count: 'exact' }) // 'exact' returns total count of matches
      .order('id', { ascending: true })

    if (searchBin) {
      query = query.ilike('bin', `%${searchBin}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      totalCount: count || 0
    };
  } catch (error) {
    console.log("Error fetching bin data:", error);
    return {
      data: [],
      totalCount: 0
    };
  }
}

// CREATE
export async function addBinSpBase(sloc, binValue) {
  // According to your image, the column name is 'bin'
  const { data, error } = await supabase
    .from(`bin_${sloc.toLowerCase()}`)
    .insert([binValue])
    .select()

  if (error) {
    console.error("Insert Error:", error)
    throw error
  }
  return data[0]
}

// DELETE
export async function deleteBinSpBase(sloc, id) {
  // id is int8 (number), Supabase handles the conversion if passed as string
  const { error } = await supabase
    .from(`bin_${sloc.toLowerCase()}`)
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}