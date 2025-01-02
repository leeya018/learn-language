"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { Grade } from "../../types/grade";

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    const response = await fetch("/api/grades");
    const data = await response.json();
    setGrades(data);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-4">Grades</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Category</th>
            <th className="border border-gray-300 p-2">Regular Mode</th>
            <th className="border border-gray-300 p-2">Test Opposite Mode</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2">{grade.category}</td>
              <td className="border border-gray-300 p-2">
                {grade.regularMode ?? "MISSING"}
              </td>
              <td className="border border-gray-300 p-2">
                {grade.testOppositeMode ?? "MISSING"}
              </td>
              <td className="border border-gray-300 p-2">
                <Link href={`/category/${grade.category}`}>
                  <Button variant="outline" size="sm">
                    To Category
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
