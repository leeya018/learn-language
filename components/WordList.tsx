"use client";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Word } from "../types/word";
import { useRouter } from "next/navigation";

interface WordListProps {
  words: Word[];
  mode: "regular" | "test" | "testOpposite";
  category: string;
  onUpdate: () => void;
}

export type WordListRef = {
  handleReset: () => void;
};

const WordList = forwardRef<WordListRef, WordListProps>(
  ({ words, mode, category, onUpdate }, ref) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedWord, setEditedWord] = useState<Word | null>(null);
    const [testAnswers, setTestAnswers] = useState<string[]>(
      words.map(() => "")
    );
    const [testResults, setTestResults] = useState<boolean[]>([]);
    const [exposedAssociations, setExposedAssociations] = useState<boolean[]>(
      words.map(() => false)
    );
    const [grade, setGrade] = useState<number | null>(null);
    const router = useRouter();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
      handleReset: () => {
        setTestAnswers(words.map(() => ""));
        setTestResults([]);
        setGrade(null);
        setExposedAssociations(words.map(() => false));
      },
    }));

    const handleDoubleClick = (word: Word) => {
      if (mode === "regular") {
        setEditingId(word.id);
        setEditedWord(word);
      }
    };

    const handleSave = async () => {
      if (editedWord) {
        const trimmedWord = {
          ...editedWord,
          word: editedWord.word.trim().toLowerCase(),
          translation: editedWord.translation.trim().toLowerCase(),
        };

        const response = await fetch(`/api/words?category=${category}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(trimmedWord),
        });

        if (response.ok) {
          setEditingId(null);
          setEditedWord(null);
          onUpdate();
        }
      }
    };

    const handleDelete = async (id: string) => {
      const response = await fetch(`/api/words?category=${category}&id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
        setEditingId(null);
        setEditedWord(null);
      } else {
        alert("Failed to delete word");
      }
    };

    const handleTestInput = (index: number, value: string) => {
      const newAnswers = [...testAnswers];
      newAnswers[index] = value;
      setTestAnswers(newAnswers);

      // Clear exposed association when typing
      const newExposedAssociations = [...exposedAssociations];
      newExposedAssociations[index] = false;
      setExposedAssociations(newExposedAssociations);
    };

    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>,
      index: number
    ) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (editingId) {
          handleSave();
        } else if (mode === "test" || mode === "testOpposite") {
          const nextIndex = (index + 1) % words.length;
          inputRefs.current[nextIndex]?.focus();
        }
      }
    };

    const handleSubmitTest = async () => {
      const completedAnswers = testAnswers.map((answer) =>
        answer.trim() === "" ? "none" : answer
      );
      setTestAnswers(completedAnswers);

      const results = words.map((word, index) => {
        const userAnswer = completedAnswers[index].toLowerCase();
        if (mode === "test") {
          return userAnswer === word.translation.toLowerCase();
        } else {
          return userAnswer === word.word.toLowerCase();
        }
      });
      setTestResults(results);

      const correctAnswers = results.filter((result) => result).length;
      const calculatedGrade = Math.round((correctAnswers / words.length) * 100);
      setGrade(calculatedGrade);

      // Update points for correct answers
      const updatedWords = words.map((word, index) => {
        if (results[index]) {
          return { ...word, points: word.points + 1 };
        }
        return word;
      });

      // Save updated words with new points
      await fetch(`/api/words?category=${category}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedWords),
      });

      // Save the grade
      await fetch("/api/grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          mode: mode === "test" ? "regularMode" : "testOppositeMode",
          grade: calculatedGrade,
        }),
      });

      onUpdate();
      router.refresh();
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
          <div key={word.id} className="mb-2">
            {mode === "regular" && (
              <div
                onDoubleClick={() => handleDoubleClick(word)}
                className="p-2 border rounded cursor-pointer flex items-center"
              >
                {editingId === word.id ? (
                  <>
                    <Input
                      type="text"
                      value={editedWord?.word || ""}
                      onChange={(e) =>
                        setEditedWord({ ...editedWord!, word: e.target.value })
                      }
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="mr-2 p-1 border rounded w-1/5"
                    />
                    <Input
                      type="text"
                      value={editedWord?.translation || ""}
                      onChange={(e) =>
                        setEditedWord({
                          ...editedWord!,
                          translation: e.target.value,
                        })
                      }
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="mr-2 p-1 border rounded w-1/5"
                    />
                    <Input
                      type="text"
                      value={editedWord?.association || ""}
                      onChange={(e) =>
                        setEditedWord({
                          ...editedWord!,
                          association: e.target.value,
                        })
                      }
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="mr-2 p-1 border rounded w-1/4"
                    />
                    <span className="mr-2 w-1/10">
                      Points: {editedWord?.points}
                    </span>
                    <Button
                      onClick={handleSave}
                      className="p-1 bg-green-500 text-white rounded mr-2"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => handleDelete(word.id)}
                      className="p-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="mr-2 w-1/5 inline-block">{word.word}</span>
                    <span className="mr-2 w-1/5 inline-block">
                      {word.translation}
                    </span>
                    <span className="w-1/4 inline-block">
                      {word.association}
                    </span>
                    <span className="mr-2 w-1/10">Points: {word.points}</span>
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
                <span className="mr-2 w-1/5">
                  {mode === "test" ? word.word : word.translation}
                </span>
                <Input
                  type="text"
                  value={testAnswers[index]}
                  onChange={(e) => handleTestInput(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="p-1 border rounded mr-2 w-1/5"
                  ref={(el) => (inputRefs.current[index] = el)}
                />
                {word.association && (
                  <Button
                    onClick={() => handleExposeAssociation(index)}
                    className="p-1 bg-yellow-500 text-white rounded mr-2"
                  >
                    Expose
                  </Button>
                )}
                {testResults[index] !== undefined && (
                  <span
                    className={`${
                      testResults[index] ? "text-green-500" : "text-red-500"
                    } mr-2`}
                  >
                    {testResults[index] ? "Correct" : "Wrong"}
                  </span>
                )}
                {exposedAssociations[index] && word.association && (
                  <span className="mr-2 w-1/4">{word.association}</span>
                )}
                <span className="mr-2 w-1/10">Points: {word.points}</span>
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
          <div className="mt-4 flex items-center">
            <Button
              onClick={handleSubmitTest}
              className="p-2 bg-blue-500 text-white rounded mr-4"
            >
              Submit
            </Button>
            <Button
              onClick={() => {
                setTestAnswers(words.map(() => ""));
                setTestResults([]);
                setGrade(null);
                setExposedAssociations(words.map(() => false));
              }}
              className="p-2 bg-gray-500 text-white rounded mr-4"
            >
              Reset
            </Button>
            {grade !== null && (
              <span className="text-lg font-bold">Grade: {grade}%</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

WordList.displayName = "WordList";

export default WordList;
