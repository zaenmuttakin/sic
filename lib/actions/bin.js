import { supabase } from '@/lib/supabase/supabase'

// FETCH & SEARCH
export async function getBin(searchTerm = '') {
  let query = supabase
    .from('bin_g002')
    .select('*')
    .order('id', { ascending: true }) 
  
  if (searchTerm) {
    query = query.ilike('mid', `%${searchTerm}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// CREATE
export async function addBin(binValue) {
  // According to your image, the column name is 'bin'
  const { data, error } = await supabase
    .from('bin_g002')
    .insert([{ 
      bin: binValue, 
      rak: binValue.substring(0, 2), // Example: takes "AA" from "AA-01-01"
      mid: "Pending", // mid is text, cannot be null based on your table setup
      desc: "New Entry" 
    }])
    .select()

  if (error) {
    console.error("Insert Error:", error)
    throw error
  }
  return data[0]
}

// DELETE
export async function deleteBin(id) {
  // id is int8 (number), Supabase handles the conversion if passed as string
  const { error } = await supabase
    .from('bin_g002')
    .delete()
    .eq('id', id)
    
  if (error) throw error
}