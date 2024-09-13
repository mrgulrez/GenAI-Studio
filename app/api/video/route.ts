
import { NextResponse } from 'next/server';
import { MODELS, API_KEY } from '../../(dashboard)/(routes)/video/constants';

async function query(data: any) {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${MODELS[0].id}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.error("Rate limit exceeded. Please try again later.");
        } else {
          console.error(`HTTP error! status: ${response.status}`);
        }
        retries++;
        await new Promise((resolve) => setTimeout(resolve, 500)); // wait 500ms before retrying
      } else {
        const result = await response.json();
        return result;
      }
    } catch (error) {
      console.error("Error:", error);
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 500)); // wait 500ms before retrying
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const data = { inputs: prompt };
    const response = await query(data);

    if (!response) {
      return NextResponse.json({ error: "Failed to generate video" }, { status: 500 });
    }

    const videoBuffer = response.video;
    const base64Video = Buffer.from(videoBuffer).toString("base64");
    return NextResponse.json({ video: `data:video/mp4;base64,${base64Video}` });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}