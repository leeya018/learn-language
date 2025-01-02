"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AddCategory from "../components/AddCategory";
import { Input } from "@/components/ui/Input";

export default function Home() {
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const response = await fetch("/api/categories");
    const data = await response.json();
    setCategories(data);
  };

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(filter.toLowerCase())
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
            href={`/category/${category}`}
            key={category}
            className="p-4 border rounded hover:bg-gray-100"
          >
            {category}
          </Link>
        ))}
      </div>
      <AddCategory onAdd={fetchCategories} />
    </div>
  );
}
