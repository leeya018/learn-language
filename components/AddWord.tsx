"use client";

import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Word } from "../types/word";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AddWordProps {
  category: string;
  onAdd: () => void;
}

export default function AddWord({ category, onAdd }: AddWordProps) {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [association, setAssociation] = useState("");
  const wordInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim() && translation.trim()) {
      const newWord: Word = {
        id: uuidv4(),
        word: word.trim().toLowerCase(),
        translation: translation.trim().toLowerCase(),
        association,
        points: 0,
      };

      await fetch(`/api/words?category=${category}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWord),
      });

      setWord("");
      setTranslation("");
      setAssociation("");
      onAdd();

      if (wordInputRef.current) {
        wordInputRef.current.focus();
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2"
    >
      <Input
        type="text"
        placeholder="Word"
        className="w-full sm:w-1/4"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        ref={wordInputRef}
      />
      <Input
        type="text"
        placeholder="Translation"
        className="w-full sm:w-1/4"
        value={translation}
        onChange={(e) => setTranslation(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Association"
        className="w-full sm:w-1/3"
        value={association}
        onChange={(e) => setAssociation(e.target.value)}
      />
      <Button type="submit" className="w-full sm:w-auto">
        Add Word
      </Button>
    </form>
  );
}
