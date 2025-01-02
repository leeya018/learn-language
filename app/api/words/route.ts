import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Word } from "../../../types/word";

const categoriesDir = path.join(process.cwd(), "data", "categories");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  if (!category) {
    return NextResponse.json(
      { error: "Category is required" },
      { status: 400 }
    );
  }

  const filePath = path.join(categoriesDir, `${category}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json([]);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const words: Word[] = JSON.parse(fileContent);

  return NextResponse.json(words);
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const newWord: Word = await req.json();

  if (!category) {
    return NextResponse.json(
      { error: "Category is required" },
      { status: 400 }
    );
  }

  const filePath = path.join(categoriesDir, `${category}.json`);

  let words: Word[] = [];
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    words = JSON.parse(fileContent);
  }

  words.push(newWord);
  fs.writeFileSync(filePath, JSON.stringify(words));

  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const updatedWord: Word = await req.json();

  if (!category) {
    return NextResponse.json(
      { error: "Category is required" },
      { status: 400 }
    );
  }

  const filePath = path.join(categoriesDir, `${category}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  let words: Word[] = JSON.parse(fileContent);

  const index = words.findIndex((w) => w.id === updatedWord.id);
  if (index !== -1) {
    words[index] = updatedWord;
    fs.writeFileSync(filePath, JSON.stringify(words));
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const id = searchParams.get("id");

  if (!category || !id) {
    return NextResponse.json(
      { error: "Category and word ID are required" },
      { status: 400 }
    );
  }

  const filePath = path.join(categoriesDir, `${category}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  let words: Word[] = JSON.parse(fileContent);

  const updatedWords = words.filter((word) => word.id !== id);

  fs.writeFileSync(filePath, JSON.stringify(updatedWords));

  return NextResponse.json({ success: true });
}
