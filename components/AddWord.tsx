'use client'

import { useState } from 'react'

interface AddWordProps {
  category: string
  onAdd: () => void
}

export default function AddWord({ category, onAdd }: AddWordProps) {
  const [word, setWord] = useState('')
  const [translation, setTranslation] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!word.trim() || !translation.trim()) return

    const response = await fetch(`/api/words?category=${category}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word, translation }),
    })

    if (response.ok) {
      setWord('')
      setTranslation('')
      onAdd()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        type="text"
        placeholder="Word"
        className="p-2 border rounded mr-2"
        value={word}
        onChange={(e) => setWord(e.target.value)}
      />
      <input
        type="text"
        placeholder="Translation"
        className="p-2 border rounded mr-2"
        value={translation}
        onChange={(e) => setTranslation(e.target.value)}
      />
      <button type="submit" className="p-2 bg-blue-500 text-white rounded">
        Add Word
      </button>
    </form>
  )
}

