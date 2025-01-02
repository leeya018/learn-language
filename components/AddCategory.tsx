"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AddCategoryProps {
  onAdd: (categoryName: string) => void;
}

export default function AddCategory({ onAdd }: AddCategoryProps) {
  const [newCategory, setNewCategory] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    onAdd(newCategory);
    setNewCategory("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <Input
        type="text"
        placeholder="New category name"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        className="flex-grow"
      />
      <Button type="submit">Add Category</Button>
    </form>
  );
}
