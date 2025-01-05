"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AddCategory from "../components/AddCategory";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Category } from "@/types/category";
import { Lock } from "lucide-react";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const response = await fetch("/api/categories");
    const data: Category[] = await response.json();
    setCategories(data.map((category) => ({ ...category, isNew: false })));
  };

  const handleAddCategory = (newCategory: Category) => {
    setCategories((prevCategories) => [
      { ...newCategory, isNew: true },
      ...prevCategories,
    ]);

    setTimeout(() => {
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.name === newCategory.name
            ? { ...category, isNew: false }
            : category
        )
      );
    }, 1000);
  };

  const isTestLocked = (lastExam: string | null) => {
    if (!lastExam) return false;
    const lastExamDate = new Date(lastExam);
    const today = new Date();
    return lastExamDate.toDateString() === today.toDateString();
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Language Learning App</h1>
      <Input
        type="text"
        placeholder="Filter categories..."
        className="w-full mb-4"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <Link
            href={`/category/${category.name}`}
            key={category.name}
            className={`p-4 border rounded hover:bg-gray-100 transition-colors duration-300 ${
              category.isNew ? "bg-green-500 text-white" : ""
            } relative`}
          >
            <div className="font-bold">{category.name}</div>
            <div className="text-sm text-gray-500">
              Created: {new Date(category.date).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-500">Level: {category.level}</div>
            {isTestLocked(category.lastExam) && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full flex items-center">
                <Lock className="w-4 h-4 mr-1" />
                <span className="text-xs">Test Locked</span>
              </div>
            )}
          </Link>
        ))}
      </div>
      <div className="absolute top-4 right-4">
        <Link href="/grades">
          <Button
            variant="default"
            className="bg-black text-white hover:bg-gray-800"
          >
            View Grades
          </Button>
        </Link>
      </div>
      <AddCategory onAdd={handleAddCategory} />
    </div>
  );
}
