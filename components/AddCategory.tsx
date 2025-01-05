"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Category } from "@/types/category";

interface AddCategoryProps {
  onAdd: (category: Category) => void;
}

export default function AddCategory({ onAdd }: AddCategoryProps) {
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newCategory.trim()) return;

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category: newCategory }),
    });

    if (response.ok) {
      const data = await response.json();
      onAdd(data.category);
      setNewCategory("");
    } else {
      const errorData = await response.json();
      setError(errorData.error || "Failed to add category");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit">Add Category</Button>
      </div>
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
