import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model } = body;

    if (!prompt || !model) {
      return NextResponse.json({ error: "Prompt and model are required" }, { status: 400 });
    }

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MUSIC_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[MusicAPI] Error:", errorText);
      return NextResponse.json({ error: "Failed to generate music" }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    return NextResponse.json({ audio: `data:audio/wav;base64,${base64Audio}` });
  } catch (error) {
    console.error("[MusicAPI] Internal Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
