import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { v4 as uuidv4 } from "uuid";
import { Word } from "../types/word";

interface GPTSuggestionsProps {
  category: string;
  onAddWords: (words: Word[]) => void;
  onClose: () => void;
}

export default function GPTSuggestions({
  category,
  onAddWords,
  onClose,
}: GPTSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Word[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchSuggestions();
      fetchedRef.current = true;
    }
  }, [category]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/gpt-suggestions?category=${category}`);
      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }
      const data = await response.json();
      setSuggestions(
        data.map((item: { word: string; translation: string }) => ({
          ...item,
          id: uuidv4(),
          association: "",
          points: 0,
        }))
      );
    } catch (err) {
      setError("Failed to fetch suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (wordId: string) => {
    setSelectedWords((prev) =>
      prev.includes(wordId)
        ? prev.filter((id) => id !== wordId)
        : [...prev, wordId]
    );
  };

  const handleAddSelected = () => {
    const wordsToAdd = suggestions.filter((word) =>
      selectedWords.includes(word.id)
    );
    onAddWords(wordsToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          GPT Suggestions for {category}
        </h2>
        {isLoading && <p>Loading suggestions...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {suggestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Suggested Words:</h3>
            {suggestions.map((word) => (
              <div key={word.id} className="flex items-center mb-2">
                <Checkbox
                  id={word.id}
                  checked={selectedWords.includes(word.id)}
                  onCheckedChange={() => handleCheckboxChange(word.id)}
                />
                <label htmlFor={word.id} className="ml-2">
                  {word.word} - {word.translation}
                </label>
              </div>
            ))}
            <div className="flex justify-between mt-4">
              <Button
                onClick={handleAddSelected}
                disabled={selectedWords.length === 0}
              >
                Add Selected Words
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
