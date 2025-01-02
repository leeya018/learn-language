import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export async function GET() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  const categories = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(".json", ""));

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { category } = await req.json();

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  const filePath = path.join(dataDir, `${category}.json`);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }

  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const { oldName, newName } = await req.json();

  const oldPath = path.join(dataDir, `${oldName}.json`);
  const newPath = path.join(dataDir, `${newName}.json`);

  if (!fs.existsSync(oldPath)) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  if (fs.existsSync(newPath)) {
    return NextResponse.json(
      { error: "New category name already exists" },
      { status: 400 }
    );
  }

  fs.renameSync(oldPath, newPath);

  return NextResponse.json({ success: true });
}
