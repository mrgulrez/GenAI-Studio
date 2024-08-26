// import { NextResponse } from "next/server";
// import Replicate from "replicate";

// const replicate = new Replicate({
//   auth: process.env.REPLICATE_API_TOKEN!,
// });

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { prompt } = body;

//     if (!prompt) {
//       return new NextResponse("Prompt is required", { status: 400 });
//     }

//     const response = await replicate.run(
//       "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
//       {
//         input: {
//           prompt,
//         },
//       }
//     );

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("[MusicAPI] Error:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }




import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      console.error("[MusicAPI] Error:", await response.text());
      return NextResponse.json({ error: "Failed to generate music" }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    return NextResponse.json({ audio: `data:audio/wav;base64,${base64Audio}` });
  } catch (error) {
    console.error("[MusicAPI] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}