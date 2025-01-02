"use client";

import { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Word {
  word: string;
  translation: string;
  association: string;
}

interface WordListProps {
  words: Word[];
  mode: "regular" | "test" | "testOpposite";
  category: string;
  onUpdate: () => void;
}

export default function WordList({
  words,
  mode,
  category,
  onUpdate,
}: WordListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedWord, setEditedWord] = useState<Word | null>(null);
  const [testAnswers, setTestAnswers] = useState<string[]>(words.map(() => ""));
  const [testResults, setTestResults] = useState<boolean[]>([]);
  const [exposedAssociations, setExposedAssociations] = useState<boolean[]>(
    words.map(() => false)
  );

  useEffect(() => {
    setTestAnswers(words.map(() => ""));
    setTestResults([]);
    setExposedAssociations(words.map(() => false));
    setEditingIndex(null);
    setEditedWord(null);
  }, [mode, words]);

  const handleDoubleClick = (index: number, word: Word) => {
    if (mode === "regular") {
      setEditingIndex(index);
      setEditedWord(word);
    }
  };

  const handleSave = async () => {
    if (editedWord) {
      const response = await fetch(`/api/words?category=${category}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedWord),
      });

      if (response.ok) {
        setEditingIndex(null);
        setEditedWord(null);
        onUpdate();
      }
    }
  };

  const handleTestInput = (index: number, value: string) => {
    const newAnswers = [...testAnswers];
    newAnswers[index] = value;
    setTestAnswers(newAnswers);
  };

  const handleSubmitTest = () => {
    const results = words.map((word, index) => {
      if (mode === "test") {
        return (
          testAnswers[index].toLowerCase() === word.translation.toLowerCase()
        );
      } else {
        return testAnswers[index].toLowerCase() === word.word.toLowerCase();
      }
    });
    setTestResults(results);
  };

  const handleExposeAssociation = (index: number) => {
    const newExposedAssociations = [...exposedAssociations];
    newExposedAssociations[index] = !newExposedAssociations[index];
    setExposedAssociations(newExposedAssociations);
  };

  const speakWord = async (word: string) => {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: word }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        console.error("Failed to get speech audio");
      }
    } catch (error) {
      console.error("Error calling text-to-speech API:", error);
    }
  };

  return (
    <div>
      {words.map((word, index) => (
        <div key={index} className="mb-2">
          {mode === "regular" && (
            <div
              onDoubleClick={() => handleDoubleClick(index, word)}
              className="p-2 border rounded cursor-pointer flex items-center"
            >
              {editingIndex === index ? (
                <>
                  <input
                    type="text"
                    value={editedWord?.word || ""}
                    onChange={(e) =>
                      setEditedWord({ ...editedWord!, word: e.target.value })
                    }
                    className="mr-2 p-1 border rounded w-1/4"
                  />
                  <input
                    type="text"
                    value={editedWord?.translation || ""}
                    onChange={(e) =>
                      setEditedWord({
                        ...editedWord!,
                        translation: e.target.value,
                      })
                    }
                    className="mr-2 p-1 border rounded w-1/4"
                  />
                  <input
                    type="text"
                    value={editedWord?.association || ""}
                    onChange={(e) =>
                      setEditedWord({
                        ...editedWord!,
                        association: e.target.value,
                      })
                    }
                    className="mr-2 p-1 border rounded w-1/3"
                  />
                  <button
                    onClick={handleSave}
                    className="p-1 bg-green-500 text-white rounded"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <span className="mr-2 w-1/4 inline-block">{word.word}</span>
                  <span className="mr-2 w-1/4 inline-block">
                    {word.translation}
                  </span>
                  <span className="w-1/3 inline-block">{word.association}</span>
                  <Button
                    onClick={() => speakWord(word.word)}
                    className="ml-2"
                    size="icon"
                    variant="outline"
                    aria-label={`Pronounce ${word.word} in Tagalog`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
          {(mode === "test" || mode === "testOpposite") && (
            <div className="flex items-center">
              <span className="mr-2 w-1/4">
                {mode === "test" ? word.word : word.translation}
              </span>
              <input
                type="text"
                value={testAnswers[index]}
                onChange={(e) => handleTestInput(index, e.target.value)}
                className="p-1 border rounded mr-2 w-1/4"
              />
              <button
                onClick={() => handleExposeAssociation(index)}
                className="p-1 bg-yellow-500 text-white rounded mr-2"
              >
                Expose
              </button>
              {testResults[index] !== undefined && (
                <span
                  className={`${
                    testResults[index] ? "text-green-500" : "text-red-500"
                  } mr-2`}
                >
                  {testResults[index] ? "Correct" : "Wrong"}
                </span>
              )}
              {exposedAssociations[index] && (
                <span className="mr-2 w-1/3">{word.association}</span>
              )}
              <Button
                onClick={() =>
                  speakWord(mode === "test" ? word.word : word.translation)
                }
                size="icon"
                variant="outline"
                aria-label={`Pronounce ${
                  mode === "test" ? word.word : word.translation
                } in Tagalog`}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
      {(mode === "test" || mode === "testOpposite") && (
        <button
          onClick={handleSubmitTest}
          className="mt-4 p-2 bg-blue-500 text-white rounded"
        >
          Submit
        </button>
      )}
    </div>
  );
}
