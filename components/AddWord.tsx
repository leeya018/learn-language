"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Word } from "../types/word";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { AlertCircle } from "lucide-react";

interface AddWordProps {
  category: string;
  onAdd: () => void;
}

export default function AddWord({ category, onAdd }: AddWordProps) {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [association, setAssociation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const wordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    let wordToAdd = word.trim().toLowerCase();
    const translationToAdd = translation.trim().toLowerCase();

    if (!wordToAdd && translationToAdd) {
      try {
        const response = await fetch("/api/gpt-word", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ translation: translationToAdd, category }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate word");
        }

        const data = await response.json();
        wordToAdd = data.word.trim().toLowerCase();
      } catch (error) {
        setError("Failed to generate word. Please enter it manually.");
        setIsLoading(false);
        return;
      }
    }

    if (wordToAdd && translationToAdd) {
      const newWord: Word = {
        id: uuidv4(),
        word: wordToAdd,
        translation: translationToAdd,
        association,
        points: 0,
        category: category,
      };

      try {
        const response = await fetch(`/api/words?category=${category}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newWord),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to add word");
        }

        setWord("");
        setTranslation("");
        setAssociation("");
        setSuccess("Word added successfully!");
        onAdd();

        if (wordInputRef.current) {
          wordInputRef.current.focus();
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    } else {
      setError("Please provide both word and translation");
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2"
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
        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Word"}
        </Button>
      </form>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert
          variant="default"
          className="bg-green-100 text-green-800 border-green-300"
        >
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
