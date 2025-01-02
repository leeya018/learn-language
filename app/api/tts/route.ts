import { NextResponse } from "next/server";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { v4 as uuidv4 } from "uuid";

const client = new TextToSpeechClient();

export async function POST(req: Request) {
  const { text } = await req.json();

  try {
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: "fil-PH", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    });

    const audioContent = response.audioContent as Buffer;
    const fileName = `${uuidv4()}.mp3`;

    // In a production environment, you'd want to store this file in a cloud storage service
    // For this example, we'll send the audio data directly in the response
    return new NextResponse(audioContent, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error calling Google Text-to-Speech API:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
