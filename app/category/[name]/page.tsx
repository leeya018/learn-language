"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import WordList from "../../../components/WordList";
import AddWord from "../../../components/AddWord";
import DeleteCategoryModal from "../../../components/DeleteCategoryModal";
import GPTSuggestions from "../../../components/GPTSuggestions";
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
  Lock,
} from "lucide-react";
import { Word } from "../../../types/word";
import { Category } from "../../../types/category";
import { Alert, AlertDescription } from "@/components/ui/Alert";

type Mode = "regular" | "test" | "testOpposite" | "practice";
type PracticeSubMode = "tagalogToEnglish" | "englishToTagalog";

export default function CategoryPage() {
  const router = useRouter();
  const { name } = useParams();
  const [words, setWords] = useState<Word[]>([]);
  const [mode, setMode] = useState<Mode>("regular");
  const [practiceSubMode, setPracticeSubMode] =
    useState<PracticeSubMode>("tagalogToEnglish");
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editedCategoryName, setEditedCategoryName] = useState(name as string);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOrderedByPoints, setIsOrderedByPoints] = useState(false);
  const [showGPTSuggestions, setShowGPTSuggestions] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [isTestTagalogToEnglishLocked, setIsTestTagalogToEnglishLocked] =
    useState(false);
  const [isTestEnglishToTagalogLocked, setIsTestEnglishToTagalogLocked] =
    useState(false);
  const [testSubMode, setTestSubMode] = useState<
    "tagalogToEnglish" | "englishToTagalog"
  >("tagalogToEnglish");
  const editInputRef = useRef<HTMLInputElement>(null);
  const wordListRef = useRef<{ handleReset: () => void } | null>(null);

  useEffect(() => {
    fetchWords();
    fetchCategoryDetails();
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

  const fetchWordsScores = async (words: Word[]) => {
    const response = await fetch(`/api/words?category=${name}`);
    const data = await response.json();
    const updatedWords = words.map((itemA) => {
      const matchingItem = data.find((itemB: Word) => itemB.id === itemA.id);
      return matchingItem ? { ...itemA, points: matchingItem.points } : itemA;
    });
    setWords(updatedWords);
  };

  const fetchCategoryDetails = async () => {
    const response = await fetch(`/api/categories?name=${name}`);
    if (response.ok) {
      const categoryData: Category = await response.json();
      setCategory(categoryData);
      checkTestLocked(categoryData);
    } else {
      console.error("Failed to fetch category details");
    }
  };

  const checkTestLocked = (categoryData: Category) => {
    const today = new Date().toDateString();
    setIsTestTagalogToEnglishLocked(
      new Date(categoryData.lastExamTest || "").toDateString() === today
    );
    setIsTestEnglishToTagalogLocked(
      new Date(categoryData.lastExamOpposeTest || "").toDateString() === today
    );
  };

  const handleCategoryNameUpdate = async () => {
    if (editedCategoryName.trim() === "" || editedCategoryName === name) {
      setIsEditingCategory(false);
      setEditedCategoryName(name as string);
      return;
    }

    const response = await fetch(`/api/categories?name=${name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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

  const handleTestCompletion = async (
    testMode: "test",
    subMode: "tagalogToEnglish" | "englishToTagalog",
    grade: number
  ) => {
    if (grade === 100) {
      const today = new Date().toISOString();
      const updateField =
        subMode === "tagalogToEnglish" ? "lastExamTest" : "lastExamOpposeTest";

      const response = await fetch(`/api/categories?name=${name}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [updateField]: today,
          increaseLevel: true,
        }),
      });

      if (response.ok) {
        fetchCategoryDetails();
      } else {
        console.error("Failed to update category after test completion");
      }
    }
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
      <div className="mb-4 flex flex-wrap justify-between items-center">
        <div className="space-y-2">
          <div>
            <Button
              onClick={() => setMode("regular")}
              className={`mr-2 ${
                mode === "regular" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Regular
            </Button>
            {/*Removed Test Opposite Button*/}
            <Button
              onClick={() => setMode("practice")}
              className={`mr-2 ${
                mode === "practice" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Practice
            </Button>
            <Button
              onClick={() => setMode("test")}
              className={`mr-2 ${
                mode === "test" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              disabled={
                isTestTagalogToEnglishLocked && isTestEnglishToTagalogLocked
              }
            >
              Test
            </Button>
          </div>
          {mode === "practice" && (
            <div>
              <Button
                onClick={() => setPracticeSubMode("tagalogToEnglish")}
                className={`mr-2 ${
                  practiceSubMode === "tagalogToEnglish"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                Tagalog to English
              </Button>
              <Button
                onClick={() => setPracticeSubMode("englishToTagalog")}
                className={`mr-2 ${
                  practiceSubMode === "englishToTagalog"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                English to Tagalog
              </Button>
            </div>
          )}
          {mode === "test" && (
            <div>
              <Button
                onClick={() => setTestSubMode("tagalogToEnglish")}
                className={`mr-2 ${
                  testSubMode === "tagalogToEnglish"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200"
                }`}
                disabled={isTestTagalogToEnglishLocked}
              >
                Tagalog to English
              </Button>
              <Button
                onClick={() => setTestSubMode("englishToTagalog")}
                className={`mr-2 ${
                  testSubMode === "englishToTagalog"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200"
                }`}
                disabled={isTestEnglishToTagalogLocked}
              >
                English to Tagalog
              </Button>
            </div>
          )}
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
      {(isTestTagalogToEnglishLocked || isTestEnglishToTagalogLocked) && (
        <Alert variant="destructive" className="mb-4">
          <Lock className="h-4 w-4 mr-2" />
          <AlertDescription>
            {isTestTagalogToEnglishLocked && isTestEnglishToTagalogLocked
              ? "Both test modes are locked until tomorrow. You've completed both tests successfully today."
              : isTestTagalogToEnglishLocked
              ? "Tagalog to English test mode is locked until tomorrow. You've completed this test successfully today."
              : "English to Tagalog test mode is locked until tomorrow. You've completed this test successfully today."}
          </AlertDescription>
        </Alert>
      )}
      <WordList
        words={words}
        mode={mode}
        testSubMode={testSubMode}
        practiceSubMode={practiceSubMode}
        category={name as string}
        onUpdate={fetchWords}
        onUpdateScores={fetchWordsScores}
        ref={wordListRef}
        isTestTagalogToEnglishLocked={isTestTagalogToEnglishLocked}
        isTestEnglishToTagalogLocked={isTestEnglishToTagalogLocked}
        setMode={setMode}
        onTestCompletion={handleTestCompletion}
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
