import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { Word } from "../../../types/word";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

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

  // Read existing words from the category file
  const filePath = path.join(categoriesDir, `${category}.json`);
  let existingWords: Word[] = [];
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    existingWords = JSON.parse(fileContent);
  }

  // Create a list of existing words to send to GPT
  const existingWordsList = existingWords
    .map((word) => word.word.toLowerCase())
    .join(", ");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that suggests words for language learning.",
        },
        {
          role: "user",
          content: `Suggest 10 popular words in English and their translations in Tagalog for the category: ${category}. Format as JSON array of objects with 'word' and 'translation' properties. Do not include these existing words: ${existingWordsList}`,
        },
      ],
    });
    let suggestionsString = completion.choices[0].message.content || "[]";

    suggestionsString = suggestionsString
      .replace(/\`\`\`json\n?|\n?\`\`\`/g, "")
      .trim();

    let suggestedWords = JSON.parse(suggestionsString);
    // Double-check to filter out any words that might still be in the existing list
    const filteredSuggestedWords = suggestedWords.filter(
      (suggestedWord: { word: string }) =>
        !existingWords.some(
          (existingWord) =>
            existingWord.word.toLowerCase() === suggestedWord.word.toLowerCase()
        )
    );

    return NextResponse.json(filteredSuggestedWords);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to get suggestions" },
      { status: 500 }
    );
  }
}
