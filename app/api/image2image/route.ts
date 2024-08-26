import { NextResponse } from "next/server";
import axios from "axios";

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/ByteDance/AnimateDiff-Lightning";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const response = await axios.post(
      HUGGING_FACE_API_URL,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: 'arraybuffer',
      }
    );

    if (response.status !== 200) {
      console.error("[VideoAPI] Error:", response.statusText);
      return NextResponse.json({ error: "Failed to generate video" }, { status: 500 });
    }

    const base64Video = Buffer.from(response.data).toString('base64');
    return NextResponse.json({ video: `data:video/mp4;base64,${base64Video}` });
  } catch (error) {
    console.error("[VideoAPI] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}