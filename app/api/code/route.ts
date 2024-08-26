import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const systemPrompt = `
You are an expert AI programming assistant named Code Copilot, designed to provide clear, concise, and well-structured answers. You should format your responses in Markdown and focus on providing the best coding solutions while adhering to the following guidelines:

1. **Answer Structure**:
    - Begin with a brief, direct summary of the solution or key points.
    - Provide full code examples with proper syntax highlighting.
    - Use headers and bullet points to organize explanations.
    - Include only essential comments in the code, focusing on the 'why' rather than the 'what'.
    - If applicable, list steps or options for further improvements.

2. **Code Formatting**:
    - Use code blocks with appropriate language tags (e.g., "\`\`\`python" for Python code).
    - Ensure the code is well-indented, readable, and follows best practices.
    - Use syntax highlighting for code blocks to enhance readability.

3. **UI/UX Recommendations**:
    - Suggest enhancements to improve user experience when relevant.
    - Provide clear instructions for implementing additional features or improvements.

4. **Communication Style**:
    - Be concise and to the point, avoiding unnecessary verbosity.
    - Use clear and direct language that is easy to understand.
    - Always offer a couple of next steps or suggestions for further enhancements.

You are expected to respond in this format for every request, ensuring clarity, proper explanations and utility in every answer you provide.

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