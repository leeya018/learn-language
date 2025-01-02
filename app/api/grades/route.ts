import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Grade } from "../../../types/grade";

const gradesFilePath = path.join(process.cwd(), "data", "__grades__.json");

export async function GET() {
  if (!fs.existsSync(gradesFilePath)) {
    return NextResponse.json([]);
  }

  const gradesData = fs.readFileSync(gradesFilePath, "utf-8");
  const grades: Grade[] = JSON.parse(gradesData);

  return NextResponse.json(grades);
}

export async function POST(req: Request) {
  const { category, mode, grade } = await req.json();

  let grades: Grade[] = [];
  if (fs.existsSync(gradesFilePath)) {
    const gradesData = fs.readFileSync(gradesFilePath, "utf-8");
    grades = JSON.parse(gradesData);
  }

  const existingGradeIndex = grades.findIndex((g) => g.category === category);
  if (existingGradeIndex !== -1) {
    grades[existingGradeIndex] = {
      ...grades[existingGradeIndex],
      [mode]: grade,
    };
  } else {
    grades.push({
      category,
      regularMode: mode === "regularMode" ? grade : null,
      testOppositeMode: mode === "testOppositeMode" ? grade : null,
    });
  }

  fs.writeFileSync(gradesFilePath, JSON.stringify(grades, null, 2));

  return NextResponse.json({ success: true });
}
