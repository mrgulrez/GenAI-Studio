import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

const STABILITY_API_URL = "https://api.stability.ai/v2beta/image-to-video";
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;

    if (!image || !prompt) {
      return NextResponse.json({ error: "Image and prompt are required" }, { status: 400 });
    }

    const data = new FormData();
    data.append("image", image.stream(), image.name);
    data.append("cfg_scale", "1.8");
    data.append("motion_bucket_id", "127");

    const response = await axios.post(STABILITY_API_URL, data, {
      headers: {
        ...data.getHeaders(),
        Authorization: `Bearer ${STABILITY_API_KEY}`,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Stability API responded with status ${response.status}`);
    }

    const generationId = response.data.id;

    // Poll for results
    let resultResponse;
    do {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds between polls
      resultResponse = await axios.get(`https://api.stability.ai/v2beta/image-to-video/result/${generationId}`, {
        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,
          Accept: "video/*",
        },
        responseType: 'arraybuffer',
      });
    } while (resultResponse.status === 202);

    if (resultResponse.status === 200) {
      const base64Video = Buffer.from(resultResponse.data).toString('base64');
      return NextResponse.json({ video: `data:video/mp4;base64,${base64Video}` });
    } else {
      throw new Error(`Failed to fetch video: ${resultResponse.status}`);
    }
  } catch (error) {
    console.error("[VideoAPI] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}