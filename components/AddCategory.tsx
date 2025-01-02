'use client'

import { useState } from 'react'

export default function AddCategory({ onAdd }: { onAdd: () => void }) {
  const [newCategory, setNewCategory] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return

    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category: newCategory }),
    })

    if (response.ok) {
      setNewCategory('')
      onAdd()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        type="text"
        placeholder="New category name"
        className="p-2 border rounded mr-2"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
      />
      <button type="submit" className="p-2 bg-blue-500 text-white rounded">
        Add Category
      </button>
    </form>
  )
}

