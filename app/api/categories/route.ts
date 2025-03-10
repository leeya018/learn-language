import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Category } from "@/types/category";

const dataDir = path.join(process.cwd(), "data");
const categoriesDir = path.join(dataDir, "categories");
const categoriesFilePath = path.join(dataDir, "categories.json");

function readCategories(): Category[] {
  if (!fs.existsSync(categoriesFilePath)) {
    return [];
  }
  const data = fs.readFileSync(categoriesFilePath, "utf-8");
  return JSON.parse(data);
}

function writeCategories(categories: Category[]) {
  fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  const categories = readCategories();

  if (name) {
    const category = categories.find((c) => c.name === name);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(category);
  }

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { category } = await req.json();

  const categories = readCategories();

  const today = new Date().toDateString();
  const categoryAddedToday = categories.some(
    (c) => new Date(c.date).toDateString() === today
  );

  if (categoryAddedToday) {
    return NextResponse.json(
      { error: "You can only add one category per day" },
      { status: 400 }
    );
  }

  // Check if the category already exists
  if (categories.some((c) => c.name.toLowerCase() === category.toLowerCase())) {
    return NextResponse.json(
      { error: "Category already exists" },
      { status: 400 }
    );
  }

  const newCategory: Category = {
    name: category,
    date: new Date().toISOString(),
    level: 0,
    lastExamTest: null,
    lastExamOpposeTest: null,
  };

  categories.push(newCategory);
  writeCategories(categories);

  return NextResponse.json({ success: true, category: newCategory });
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const { increaseLevel, lastExamTest, lastExamOpposeTest, newName } =
    await req.json();

  if (!name) {
    return NextResponse.json(
      { error: "Category name is required" },
      { status: 400 }
    );
  }

  const categories = readCategories();
  const categoryIndex = categories.findIndex((c) => c.name === name);

  if (categoryIndex === -1) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  if (increaseLevel) {
    categories[categoryIndex].level += 1;
  }

  if (lastExamTest) {
    categories[categoryIndex].lastExamTest = lastExamTest;
  }

  if (lastExamOpposeTest) {
    categories[categoryIndex].lastExamOpposeTest = lastExamOpposeTest;
  }

  if (newName) {
    if (categories.some((c) => c.name === newName)) {
      return NextResponse.json(
        { error: "New category name already exists" },
        { status: 400 }
      );
    }
    categories[categoryIndex].name = newName;
  }

  writeCategories(categories);

  return NextResponse.json({
    success: true,
    category: categories[categoryIndex],
  });
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

  try {
    // Step 1: Delete the [categoryName].json file
    const categoryFilePath = path.join(categoriesDir, `${name}.json`);
    if (fs.existsSync(categoryFilePath)) {
      fs.unlinkSync(categoryFilePath);
    } else {
      console.warn(`Category file not found: ${categoryFilePath}`);
    }

    // Step 2: Remove the category from categories.json
    const categories = readCategories();
    const updatedCategories = categories.filter((c) => c.name !== name);

    // if (categories.length === updatedCategories.length) {
    //   return NextResponse.json(
    //     { error: "Category not found" },
    //     { status: 404 }
    //   );
    // }

    writeCategories(updatedCategories);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
