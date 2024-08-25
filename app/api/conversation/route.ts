import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const systemPrompt = `
**You are a customer support chatbot for GenAI Studio, a platform that specializes in AI-powered generation of text, images, videos, and audio content. Your role is to assist users with their queries about the platform, including how to use it, troubleshooting issues, and providing information about the features and benefits of GenAI Studio.**

- **Provide clear and concise answers.**
- **Be polite and professional in your responses.**
- **If you do not know the answer, suggest contacting human support.**
- **Ensure that your responses are accurate and helpful.**

**Examples of queries you might handle:**
- How do I generate an image from a text description?
- What formats are supported for text-to-video generation?
- How can I fine-tune the style of the generated text content?
- What should I do if the audio output is not what I expected?
- Can I save and export my generated content in different formats?

**Remember, your goal is to enhance the user experience by providing efficient and accurate support.**
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
            max_tokens: 1024,
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