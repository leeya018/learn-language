"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Word } from "../types/word";

interface GPTSuggestionsProps {
  category: string;
  onClose: () => void;
  onAddWords: (words: Word[]) => void;
}

export default function GPTSuggestions({
  category,
  onClose,
  onAddWords,
}: GPTSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Word[]>([]);
  const [selectedWords, setSelectedWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`/api/gpt-suggestions?category=${category}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setSuggestions(
          data.map((item: any) => ({
            ...item,
            id: Math.random().toString(36).substr(2, 9),
            points: 0,
          }))
        );
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Invalid response format");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const handleToggleWord = (word: Word) => {
    setSelectedWords((prev) =>
      prev.some((w) => w.id === word.id)
        ? prev.filter((w) => w.id !== word.id)
        : [...prev, word]
    );
  };

  const handleApprove = () => {
    onAddWords(selectedWords);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>GPT Suggestions for {category}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <p>Loading suggestions...</p>
        ) : suggestions.length > 0 ? (
          <div className="mt-4">
            {suggestions.map((word) => (
              <div key={word.id} className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={word.id}
                  checked={selectedWords.some((w) => w.id === word.id)}
                  onCheckedChange={() => handleToggleWord(word)}
                />
                <label
                  htmlFor={word.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {word.word} - {word.translation}
                </label>
              </div>
            ))}
            <div className="flex justify-end space-x-2 mt-4">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={selectedWords.length === 0}
              >
                Add Selected Words
              </Button>
            </div>
          </div>
        ) : (
          <p>No suggestions available. Please try again later.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
