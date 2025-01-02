import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const categoriesDir = path.join(process.cwd(), "data", "categories");

export async function GET() {
  if (!fs.existsSync(categoriesDir)) {
    fs.mkdirSync(categoriesDir, { recursive: true });
  }

  const categories = fs
    .readdirSync(categoriesDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const filePath = path.join(categoriesDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file.replace(".json", ""),
        createdAt: stats.birthtime,
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { category } = await req.json();

  if (!fs.existsSync(categoriesDir)) {
    fs.mkdirSync(categoriesDir, { recursive: true });
  }

  const filePath = path.join(categoriesDir, `${category}.json`);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }

  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const { oldName, newName } = await req.json();

  const oldPath = path.join(categoriesDir, `${oldName}.json`);
  const newPath = path.join(categoriesDir, `${newName}.json`);

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

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { error: "Category name is required" },
      { status: 400 }
    );
  }

  const filePath = path.join(categoriesDir, `${name}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  fs.unlinkSync(filePath);

  return NextResponse.json({ success: true });
}
