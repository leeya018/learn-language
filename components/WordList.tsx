'use client'

import { useState } from 'react'

interface Word {
  word: string
  translation: string
}

interface WordListProps {
  words: Word[]
  mode: 'regular' | 'test' | 'testOpposite'
  category: string
  onUpdate: () => void
}

export default function WordList({ words, mode, category, onUpdate }: WordListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedWord, setEditedWord] = useState<Word | null>(null)
  const [testAnswers, setTestAnswers] = useState<string[]>(words.map(() => ''))
  const [testResults, setTestResults] = useState<boolean[]>([])

  const handleDoubleClick = (index: number, word: Word) => {
    setEditingIndex(index)
    setEditedWord(word)
  }

  const handleSave = async () => {
    if (editedWord) {
      const response = await fetch(`/api/words?category=${category}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedWord),
      })

      if (response.ok) {
        setEditingIndex(null)
        setEditedWord(null)
        onUpdate()
      }
    }
  }

  const handleTestInput = (index: number, value: string) => {
    const newAnswers = [...testAnswers]
    newAnswers[index] = value
    setTestAnswers(newAnswers)
  }

  const handleSubmitTest = () => {
    const results = words.map((word, index) => {
      if (mode === 'test') {
        return testAnswers[index].toLowerCase() === word.translation.toLowerCase()
      } else {
        return testAnswers[index].toLowerCase() === word.word.toLowerCase()
      }
    })
    setTestResults(results)
  }

  return (
    <div>
      {words.map((word, index) => (
        <div key={index} className="mb-2">
          {mode === 'regular' && (
            <div
              onDoubleClick={() => handleDoubleClick(index, word)}
              className="p-2 border rounded cursor-pointer"
            >
              {editingIndex === index ? (
                <>
                  <input
                    type="text"
                    value={editedWord?.word || ''}
                    onChange={(e) => setEditedWord({ ...editedWord!, word: e.target.value })}
                    className="mr-2 p-1 border rounded"
                  />
                  <input
                    type="text"
                    value={editedWord?.translation || ''}
                    onChange={(e) => setEditedWord({ ...editedWord!, translation: e.target.value })}
                    className="mr-2 p-1 border rounded"
                  />
                  <button onClick={handleSave} className="p-1 bg-green-500 text-white rounded">
                    Save
                  </button>
                </>
              ) : (
                <>
                  <span className="mr-2">{word.word}</span>
                  <span>{word.translation}</span>
                </>
              )}
            </div>
          )}
          {(mode === 'test' || mode === 'testOpposite') && (
            <div className="flex items-center">
              <span className="mr-2">{mode === 'test' ? word.word : word.translation}</span>
              <input
                type="text"
                value={testAnswers[index]}
                onChange={(e) => handleTestInput(index, e.target.value)}
                className="p-1 border rounded mr-2"
              />
              {testResults[index] !== undefined && (
                <span className={testResults[index] ? 'text-green-500' : 'text-red-500'}>
                  {testResults[index] ? 'Correct' : 'Wrong'}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
      {(mode === 'test' || mode === 'testOpposite') && (
        <button onClick={handleSubmitTest} className="mt-4 p-2 bg-blue-500 text-white rounded">
          Submit
        </button>
      )}
    </div>
  )
}

