import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512", models } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!models || models.length === 0) {
      return NextResponse.json({ error: "At least one model must be selected" }, { status: 400 });
    }

    const images = [];
    for (const model of models) {
      for (let i = 0; i < amount; i++) {
        const response = await fetch(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: prompt }),
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`[HuggingFace API Error for ${model}]`, errorData);
          continue;
        }

        const imageBlob = await response.blob();
        const imageArrayBuffer = await imageBlob.arrayBuffer();
        const base64Image = Buffer.from(imageArrayBuffer).toString('base64');
        images.push({
          url: `data:${imageBlob.type};base64,${base64Image}`,
          model: model
        });
      }
    }

    return NextResponse.json({ images });
  } catch (error) {
    console.error("[ImageError]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}