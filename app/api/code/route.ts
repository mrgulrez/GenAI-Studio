import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const systemPrompt = `
You are a code generator. You must answer only in markdown code snippets. Use code commnets for explanation.

`;

export async function POST(req: Request) {
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });
    
    try {
        const body = await req.json();
        const { messages } = body;

        if (!Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages must be a non-empty array");
        }

        const formattedMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                ...formattedMessages,
            ],
            model: "llama3-70b-8192",
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1,
            stream: false, 
            stop: null,
        });

        const responseContent = completion.choices[0]?.message?.content || "No response generated";
        return new NextResponse(responseContent);
    } catch (error) {
        console.error("[ConversationAPI] Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}