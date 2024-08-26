// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { prompt, amount = 1, resolution = "512x512" } = body;

//     if (!prompt) {
//       return NextResponse.json(
//         { error: "Prompt is required" },
//         { status: 400 }
//       );
//     }

//     const response = await fetch(
//       "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ inputs: prompt }),
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.text();
//       console.error("[HuggingFace API Error]", errorData);
//       return NextResponse.json(
//         { error: "Error from image generation API" },
//         { status: response.status }
//       );
//     }

//     const imageBlob = await response.blob();
//     const imageArrayBuffer = await imageBlob.arrayBuffer();
//     const base64Image = Buffer.from(imageArrayBuffer).toString("base64");

//     return NextResponse.json({
//       image: `data:${imageBlob.type};base64,${base64Image}`,
//     });
//   } catch (error) {
//     console.error("[ImageError]", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512" } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const images = [];
    for (let i = 0; i < amount; i++) {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
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
        console.error("[HuggingFace API Error]", errorData);
        return NextResponse.json({ error: "Error from image generation API" }, { status: response.status });
      }

      const imageBlob = await response.blob();
      const imageArrayBuffer = await imageBlob.arrayBuffer();
      const base64Image = Buffer.from(imageArrayBuffer).toString('base64');
      images.push(`data:${imageBlob.type};base64,${base64Image}`);
    }

    return NextResponse.json({ images });
  } catch (error) {
    console.error("[ImageError]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}