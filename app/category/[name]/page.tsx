"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import WordList from "../../../components/WordList";
import AddWord from "../../../components/AddWord";
import DeleteCategoryModal from "../../../components/DeleteCategoryModal";
import GPTSuggestions from "@/components/GPTSuggestions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft,
  Shuffle,
  Edit2,
  Check,
  X,
  ArrowUpDown,
  Brain,
} from "lucide-react";
import { Word } from "../../../types/word";

export default function CategoryPage() {
  const router = useRouter();
  const { name } = useParams();
  const [words, setWords] = useState<Word[]>([]);
  const [mode, setMode] = useState<"regular" | "test" | "testOpposite">(
    "regular"
  );
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editedCategoryName, setEditedCategoryName] = useState(name as string);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOrderedByPoints, setIsOrderedByPoints] = useState(false);
  const [showGPTSuggestions, setShowGPTSuggestions] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const wordListRef = useRef<{ handleReset: () => void } | null>(null);

  useEffect(() => {
    fetchWords();
  }, [name]);

  useEffect(() => {
    if (isEditingCategory && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditingCategory]);

  const fetchWords = async () => {
    const response = await fetch(`/api/words?category=${name}`);
    const data = await response.json();
    setWords(data);
  };

  const handleCategoryNameUpdate = async () => {
    if (editedCategoryName.trim() === "" || editedCategoryName === name) {
      setIsEditingCategory(false);
      setEditedCategoryName(name as string);
      return;
    }

    const response = await fetch("/api/categories", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldName: name,
        newName: editedCategoryName,
      }),
    });

    if (response.ok) {
      setIsEditingCategory(false);
      router.push(`/category/${editedCategoryName}`);
    } else {
      alert("Failed to update category name");
      setEditedCategoryName(name as string);
    }
  };

  const handleGoBack = () => {
    router.push("/");
  };

  const handleDeleteCategory = () => {
    setIsDeleteModalOpen(true);
  };

  const handleScramble = () => {
    const scrambledWords = [...words].sort(() => Math.random() - 0.5);
    setWords(scrambledWords);
    wordListRef.current?.handleReset();
  };

  const handleOrderByPoints = () => {
    const sortedWords = [...words].sort((a, b) => a.points - b.points);
    setWords(sortedWords);
    setIsOrderedByPoints(!isOrderedByPoints);
    wordListRef.current?.handleReset();
  };

  const handleChooseWithGPT = () => {
    setShowGPTSuggestions(true);
  };

  const handleCloseSuggestions = () => {
    setShowGPTSuggestions(false);
  };

  const handleAddSelectedWords = async (selectedWords: Word[]) => {
    for (const word of selectedWords) {
      await fetch(`/api/words?category=${name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(word),
      });
    }
    fetchWords();
    setShowGPTSuggestions(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handleGoBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
        <Link href="/grades">
          <Button
            variant="default"
            className="bg-black text-white hover:bg-gray-800"
          >
            View Grades
          </Button>
        </Link>
      </div>
      <div className="flex items-center mb-4">
        {isEditingCategory ? (
          <div className="flex items-center w-full">
            <Input
              type="text"
              value={editedCategoryName}
              onChange={(e) => setEditedCategoryName(e.target.value)}
              className="text-3xl font-bold mr-2 flex-grow"
              ref={editInputRef}
            />
            <Button onClick={handleCategoryNameUpdate} className="mr-2">
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={() => {
                setIsEditingCategory(false);
                setEditedCategoryName(name as string);
              }}
              variant="outline"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center w-full">
            <h1 className="text-3xl font-bold mr-4 flex-grow">{name}</h1>
            <Button
              onClick={() => setIsEditingCategory(true)}
              variant="outline"
              className="mr-2"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button onClick={handleDeleteCategory} variant="destructive">
              Delete
            </Button>
          </div>
        )}
      </div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <Button
            onClick={() => setMode("regular")}
            className={`mr-2 ${
              mode === "regular" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Regular
          </Button>
          <Button
            onClick={() => setMode("test")}
            className={`mr-2 ${
              mode === "test" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Test
          </Button>
          <Button
            onClick={() => setMode("testOpposite")}
            className={`${
              mode === "testOpposite" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Test Opposite
          </Button>
        </div>
        <div>
          <Button onClick={handleScramble} variant="outline" className="mr-2">
            <Shuffle className="mr-2 h-4 w-4" /> Scramble
          </Button>
          <Button
            onClick={handleOrderByPoints}
            variant="outline"
            className={`mr-2 ${
              isOrderedByPoints ? "bg-blue-500 text-white" : ""
            }`}
          >
            <ArrowUpDown className="mr-2 h-4 w-4" /> Order by Points
          </Button>
          <Button onClick={handleChooseWithGPT} variant="outline">
            <Brain className="mr-2 h-4 w-4" /> Choose with GPT
          </Button>
        </div>
      </div>
      <WordList
        words={words}
        mode={mode}
        category={name as string}
        onUpdate={fetchWords}
        ref={wordListRef}
      />
      {mode === "regular" && (
        <AddWord category={name as string} onAdd={fetchWords} />
      )}
      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={async () => {
          const response = await fetch(`/api/categories?name=${name}`, {
            method: "DELETE",
          });
          if (response.ok) {
            router.push("/");
          } else {
            alert("Failed to delete category");
          }
        }}
        categoryName={name as string}
      />
      {showGPTSuggestions && (
        <GPTSuggestions
          category={name as string}
          onClose={handleCloseSuggestions}
          onAddWords={handleAddSelectedWords}
        />
      )}
    </div>
  );
}
