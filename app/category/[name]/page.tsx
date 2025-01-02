"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import WordList from "../../../components/WordList";
import AddWord from "../../../components/AddWord";
import { Button } from "@/components/ui/Button";
import DeleteCategoryModal from "../../../components/DeleteCategoryModal";
import { Input } from "@/components/ui/Input";
import { ArrowLeft } from "lucide-react";

export default function CategoryPage() {
  const router = useRouter();
  const { name } = useParams();
  const [words, setWords] = useState<
    { id: string; word: string; translation: string; association: string }[]
  >([]);
  const [mode, setMode] = useState<"regular" | "test" | "testOpposite">(
    "regular"
  );
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editedCategoryName, setEditedCategoryName] = useState(name as string);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchWords();
  }, [name]);

  const fetchWords = async () => {
    const response = await fetch(`/api/words?category=${name}`);
    const data = await response.json();
    setWords(data);
  };

  const handleCategoryNameUpdate = async () => {
    if (editedCategoryName.trim() === "" || editedCategoryName === name) {
      setIsEditingCategory(false);
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
    }
  };

  const handleGoBack = () => {
    router.push("/");
  };

  const handleDeleteCategory = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <Button onClick={handleGoBack} variant="outline" className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
      </Button>
      {isEditingCategory ? (
        <div className="flex items-center mb-4">
          <Input
            type="text"
            value={editedCategoryName}
            onChange={(e) => setEditedCategoryName(e.target.value)}
            className="text-3xl font-bold mr-2"
          />
          <Button onClick={handleCategoryNameUpdate} className="mr-2">
            Update
          </Button>
          <Button onClick={handleDeleteCategory} variant="destructive">
            Delete
          </Button>
        </div>
      ) : (
        <h1
          className="text-3xl font-bold mb-4 cursor-pointer"
          onDoubleClick={() => setIsEditingCategory(true)}
        >
          {name}
        </h1>
      )}
      <div className="mb-4">
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
      <WordList
        words={words}
        mode={mode}
        category={name as string}
        onUpdate={fetchWords}
      />
      {mode === "regular" && (
        <AddWord category={name as string} onAdd={fetchWords} />
      )}
      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={() => {
          // Implement delete logic here
          router.push("/");
        }}
        categoryName={name as string}
      />
    </div>
  );
}
