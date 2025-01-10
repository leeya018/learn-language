import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { translation, category } = await req.json();

  if (!translation || !category) {
    return NextResponse.json(
      { error: "Translation and category are required" },
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
            "You are a helpful assistant that provides Tagalog translations for English words.",
        },
        {
          role: "user",
          content: `Provide the Tagalog word for the English word "${translation}" in the category "${category}". Respond with only the Tagalog word, nothing else.`,
        },
      ],
    });

    const word = completion.choices[0].message.content?.trim();

    if (!word) {
      throw new Error("Failed to generate word");
    }

    return NextResponse.json({ word });
  } catch (error) {
    console.error("Error generating word:", error);
    return NextResponse.json(
      { error: "Failed to generate word" },
      { status: 500 }
    );
  }
}
