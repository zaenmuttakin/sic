'use client'
import { useState, useEffect } from 'react'
import { getBin, addBin, deleteBin } from '../api/bin/action'

export default function ClientPage() {
  const [bin, setBin] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Initial Fetch & Search Fetch
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      const data = await getBin(search)
      console.log(data)
      setBin(data)
      setLoading(false)
    }

    // Debounce search slightly to avoid hitting Supabase too hard
    const timer = setTimeout(() => fetchItems(), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Handlers
  const handleAdd = async (e) => {
    e.preventDefault()
    const bin = e.target.bin.value
    const newBin = await addBin(bin)
    setBin([newBin, ...bin]) // Optimistic update
    e.target.reset()
  }

  const handleDelete = async (id) => {
    await deleteBin(id)
    setBin(bin.filter(t => t.id !== id))
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Client-Side CRUD</h1>

      {/* SEARCH */}
      <input
        className="w-full p-2 border rounded mb-4 text-black"
        placeholder="Search bin..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* CREATE */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input name="bin" className="flex-1 border p-2 rounded text-black" placeholder="New bin" required />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>

      {/* LIST (READ) */}
      {loading ? <p>Loading...</p> : (
        <ul className="space-y-2">
          {JSON.stringify(bin) === '[]' ? (
            <p>No items found.</p>
          ) : null}
          {/* {bin.map(bin => (
            <li key={bin.id} className="flex justify-between border-b py-2">
              {bin.mid}
              <button onClick={() => handleDelete(bin.id)} className="text-red-500">
                Delete
              </button>
            </li>
          ))} */}
        </ul>
      )}
    </div>
  )
}