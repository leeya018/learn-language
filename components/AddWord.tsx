"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Word } from "../types/word";

interface AddWordProps {
  category: string;
  onAdd: () => void;
}

export default function AddWord({ category, onAdd }: AddWordProps) {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [association, setAssociation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim() && translation.trim()) {
      const newWord: Word = {
        id: uuidv4(),
        word: word.trim(),
        translation: translation.trim(),
        association,
      };

      const response = await fetch(`/api/words?category=${category}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWord),
      });

      if (response.ok) {
        setWord("");
        setTranslation("");
        setAssociation("");
        onAdd();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        type="text"
        placeholder="Word"
        className="p-2 border rounded mr-2 w-1/4"
        value={word}
        onChange={(e) => setWord(e.target.value)}
      />
      <input
        type="text"
        placeholder="Translation"
        className="p-2 border rounded mr-2 w-1/4"
        value={translation}
        onChange={(e) => setTranslation(e.target.value)}
      />
      <input
        type="text"
        placeholder="Association"
        className="p-2 border rounded mr-2 w-1/3"
        value={association}
        onChange={(e) => setAssociation(e.target.value)}
      />
      <button type="submit" className="p-2 bg-blue-500 text-white rounded">
        Add Word
      </button>
    </form>
  );
}
