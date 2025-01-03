"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Grade } from "../../types/grade";

type SortColumn = "category" | "regularMode" | "testOppositeMode";
type SortDirection = "asc" | "desc";

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>("category");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    const response = await fetch("/api/grades");
    const data = await response.json();
    setGrades(data);
  };

  const sortGrades = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortedGrades = () => {
    return [...grades].sort((a, b) => {
      if (sortColumn === "category") {
        return sortDirection === "asc"
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      } else {
        const aValue = a[sortColumn] ?? 0;
        const bValue = b[sortColumn] ?? 0;
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
    });
  };

  const renderSortIcon = (column: SortColumn) => {
    if (column === sortColumn) {
      return sortDirection === "asc" ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      );
    }
    return <ArrowUpDown className="h-4 w-4" />;
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
            <th
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => sortGrades("category")}
            >
              <div className="flex items-center justify-between">
                Category
                {renderSortIcon("category")}
              </div>
            </th>
            <th
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => sortGrades("regularMode")}
            >
              <div className="flex items-center justify-between">
                Regular Mode
                {renderSortIcon("regularMode")}
              </div>
            </th>
            <th
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => sortGrades("testOppositeMode")}
            >
              <div className="flex items-center justify-between">
                Test Opposite Mode
                {renderSortIcon("testOppositeMode")}
              </div>
            </th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {getSortedGrades().map((grade, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
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
