import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  if (!category) {
    return NextResponse.json(
      { error: "Category is required" },
      { status: 400 }
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that provides popular words and their translations for language learning categories. Respond with a JSON array only, no additional formatting or explanation.",
        },
        {
          role: "user",
          content: `Provide a list of 10 popular words and their translations for the category "${category}" in a JSON array format. Each item should be an object with "word" and "translation" properties.`,
        },
      ],
    });

    let suggestionsString = completion.choices[0].message.content || "[]";

    // Remove any markdown formatting
    suggestionsString = suggestionsString
      .replace(/\`\`\`json\n?|\n?\`\`\`/g, "")
      .trim();

    const suggestions = JSON.parse(suggestionsString);

    if (!Array.isArray(suggestions)) {
      throw new Error("Invalid response format");
    }

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Error fetching GPT suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
