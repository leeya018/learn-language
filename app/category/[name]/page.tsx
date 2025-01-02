"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import WordList from "../../../components/WordList";
import AddWord from "../../../components/AddWord";

export default function CategoryPage() {
  const { name } = useParams();
  const [words, setWords] = useState<
    { word: string; translation: string; association: string }[]
  >([]);
  const [mode, setMode] = useState<"regular" | "test" | "testOpposite">(
    "regular"
  );

  useEffect(() => {
    fetchWords();
  }, [name]);

  const fetchWords = async () => {
    const response = await fetch(`/api/words?category=${name}`);
    const data = await response.json();
    setWords(data);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{name}</h1>
      <div className="mb-4">
        <button
          onClick={() => setMode("regular")}
          className={`mr-2 p-2 ${
            mode === "regular" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded`}
        >
          Regular
        </button>
        <button
          onClick={() => setMode("test")}
          className={`mr-2 p-2 ${
            mode === "test" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded`}
        >
          Test
        </button>
        <button
          onClick={() => setMode("testOpposite")}
          className={`p-2 ${
            mode === "testOpposite" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded`}
        >
          Test Opposite
        </button>
      </div>
      <WordList
        words={words}
        mode={mode}
        category={name as string}
        onUpdate={fetchWords}
      />
      {mode === "regular" && (
        <AddWord category={name as string} onAdd={fetchWords} />
      )}
    </div>
  );
}
