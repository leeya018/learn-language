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
  isTestModeDisabled: boolean;
  setMode: (mode: "regular" | "test" | "testOpposite") => void;
}

export type WordListRef = {
  handleReset: () => void;
};

const WordList = forwardRef<WordListRef, WordListProps>(
  ({ words, mode, category, onUpdate, setMode, isTestModeDisabled }, ref) => {
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
    const [testCompleted, setTestCompleted] = useState(false);
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

    const updateWord = async (wordId: string, updates: Partial<Word>) => {
      const response = await fetch(
        `/api/words?category=${category}&id=${wordId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (response.ok) {
        onUpdate();
      } else {
        console.error("Failed to update word");
      }
    };

    const handleSave = async () => {
      if (editedWord) {
        const updates = {
          word: editedWord.word.trim().toLowerCase(),
          translation: editedWord.translation.trim().toLowerCase(),
          association: editedWord.association,
        };
        await updateWord(editedWord.id, updates);
        setEditingId(null);
        setEditedWord(null);
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
      const completedAnswers = testAnswers.map(
        (answer) => answer?.trim()?.toLowerCase() || ""
      );
      setTestAnswers(completedAnswers);

      const results = words.map((word, index) => {
        const userAnswer = completedAnswers[index];
        if (mode === "test") {
          return (
            userAnswer !== "" && userAnswer === word.translation.toLowerCase()
          );
        } else {
          return userAnswer !== "" && userAnswer === word.word.toLowerCase();
        }
      });
      setTestResults(results);

      const correctAnswers = results.filter((result) => result).length;
      const calculatedGrade = Math.round((correctAnswers / words.length) * 100);
      setGrade(calculatedGrade);

      const allCorrect = results.every((result) => result);
      setTestCompleted(allCorrect);

      for (let i = 0; i < words.length; i++) {
        if (results[i]) {
          await updateWord(words[i].id, { points: words[i].points + 1 });
        }
      }

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

      if (allCorrect) {
        await fetch(`/api/categories?name=${category}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            increaseLevel: true,
            lastExam: new Date().toISOString(),
          }),
        });
        setMode("regular");
      }

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
                  className={`p-1 border rounded mr-2 w-1/5 ${
                    testResults[index] !== undefined &&
                    testAnswers[index].trim() === ""
                      ? "bg-red-100"
                      : ""
                  }`}
                  readOnly={testResults.length > 0 || testCompleted}
                  disabled={testCompleted || isTestModeDisabled}
                  ref={(el) => (inputRefs.current[index] = el)}
                />
                {word.association && (
                  <Button
                    onClick={() => handleExposeAssociation(index)}
                    className="p-1 bg-yellow-500 text-white rounded mr-2"
                    disabled={testCompleted || isTestModeDisabled}
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
                  disabled={testCompleted || isTestModeDisabled}
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
              disabled={testCompleted || isTestModeDisabled}
            >
              Submit
            </Button>
            <Button
              onClick={() => {
                setTestAnswers(words.map(() => ""));
                setTestResults([]);
                setGrade(null);
                setExposedAssociations(words.map(() => false));
                setTestCompleted(false);
              }}
              className="p-2 bg-gray-500 text-white rounded mr-4"
              disabled={testCompleted || isTestModeDisabled}
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
