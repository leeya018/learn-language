"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AddCategory from "../components/AddCategory";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Category {
  name: string;
  createdAt: string;
  isNew?: boolean;
}

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

  const handleAddCategory = async (newCategoryName: string) => {
    await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category: newCategoryName }),
    });

    const updatedCategories = [
      {
        name: newCategoryName,
        createdAt: new Date().toISOString(),
        isNew: true,
      },
      ...categories,
    ];
    setCategories(updatedCategories);

    setTimeout(() => {
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.name === newCategoryName
            ? { ...category, isNew: false }
            : category
        )
      );
    }, 1000);
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
            }`}
          >
            {category.name}
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
