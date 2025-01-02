import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  if (!category) {
    return NextResponse.json(
      { error: "Category is required" },
      { status: 400 }
    );
  }

  const filePath = path.join(dataDir, `${category}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json([]);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const words = JSON.parse(fileContent);

  return NextResponse.json(words);
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const { word, translation, association } = await req.json();

  if (!category) {
    return NextResponse.json(
      { error: "Category is required" },
      { status: 400 }
    );
  }

  const filePath = path.join(dataDir, `${category}.json`);

  let words = [];
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    words = JSON.parse(fileContent);
  }

  words.push({ word, translation, association });
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      words.map((w) => ({
        ...w,
        combined: `${w.word} - ${w.translation} - ${w.association}`,
      }))
    )
  );

  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const { word, translation, association } = await req.json();

  if (!category) {
    return NextResponse.json(
      { error: "Category is required" },
      { status: 400 }
    );
  }

  const filePath = path.join(dataDir, `${category}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  let words = JSON.parse(fileContent);

  const index = words.findIndex((w: { word: string }) => w.word === word);
  if (index !== -1) {
    words[index] = { word, translation, association };
    fs.writeFileSync(
      filePath,
      JSON.stringify(
        words.map((w) => ({
          ...w,
          combined: `${w.word} - ${w.translation} - ${w.association}`,
        }))
      )
    );
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }
}
