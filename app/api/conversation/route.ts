// app/api/conversation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// System prompt for the assistant
const SYSTEM_PROMPT = `You are a helpful, friendly AI assistant. Provide concise, helpful responses to user queries. 
Be conversational but professional. You are built by Gulrez Alam. If asked about controversial or inappropriate topics, politely decline to answer. 
Keep responses under 2-3 sentences for natural conversation flow.`;

// Function to check if content is safe
async function isContentSafe(text: string): Promise<{safe: boolean, reason?: string}> {
  try {
    // Use a different model for content moderation
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a content safety checker. Analyze the text and determine if it contains harmful, inappropriate, or unsafe content. Respond with only 'safe' or 'unsafe'."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 10,
      temperature: 0.1
    });

    const result = response.choices[0]?.message?.content?.toLowerCase() || '';
    
    if (result.includes('safe')) {
      return { safe: true };
    } else if (result.includes('unsafe')) {
      return { 
        safe: false, 
        reason: 'Content flagged as inappropriate' 
      };
    }
    
    // If we can't determine, use a simpler regex-based check as fallback
    const unsafePatterns = [
      /(sex|porn|nude|explicit)/i,
      /(violence|kill|murder|harm)/i,
      /(hate|racist|discriminat)/i,
      /(illegal|drugs|weapon)/i
    ];
    
    const isUnsafe = unsafePatterns.some(pattern => pattern.test(text));
    return { safe: !isUnsafe, reason: isUnsafe ? 'Content matches unsafe patterns' : undefined };
    
  } catch (error) {
    console.error('Error in content safety check:', error);
    // Fallback to simple regex check if API call fails
    const unsafePatterns = [
      /(sex|porn|nude|explicit)/i,
      /(violence|kill|murder|harm)/i,
      /(hate|racist|discriminat)/i,
      /(illegal|drugs|weapon)/i
    ];
    
    const isUnsafe = unsafePatterns.some(pattern => pattern.test(text));
    return { safe: !isUnsafe, reason: isUnsafe ? 'Content matches unsafe patterns' : undefined };
  }
}

// Function to generate AI response using a language model
async function generateAIResponse(userInput: string): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: userInput
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
      top_p: 0.9
    });

    return response.choices[0]?.message?.content || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I encountered an error processing your request. Please try again.";
  }
}

// Function to generate speech using TTS with retry logic
async function generateSpeech(text: string, language: string): Promise<{audio: Buffer | null, error: string | null}> {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      // Configure TTS based on language selection
      const ttsConfig: any = {
        model: language === 'arabic' ? 'playai-tts-arabic' : 'playai-tts',
        response_format: 'wav',
        input: text.substring(0, 2000) // Limit input length to avoid API issues
      };

      // Add voice parameter only for supported models
      if (language === 'arabic') {
        ttsConfig.voice = 'Hala-PlayAI'; // Arabic voice
      } else {
        ttsConfig.voice = 'Aaliyah-PlayAI'; // English voice
      }

      // Generate speech from response text using the Groq API directly
      const ttsResponse = await fetch('https://api.groq.com/openai/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ttsConfig)
      });

      if (ttsResponse.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = parseInt(ttsResponse.headers.get('Retry-After') || '5');
        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        retryCount++;
        continue;
      }

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        console.error('TTS API error details:', ttsResponse.status, errorText);
        return { audio: null, error: `TTS API error: ${ttsResponse.status} ${ttsResponse.statusText}` };
      }

      // Convert response to buffer
      const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
      return { audio: audioBuffer, error: null };
    } catch (error) {
      console.error('Error in TTS generation:', error);
      retryCount++;
      
      if (retryCount >= maxRetries) {
        return { audio: null, error: `TTS generation failed after ${maxRetries} attempts: ${error}` };
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, retryCount) * 1000;
      console.log(`Retrying TTS in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  return { audio: null, error: 'TTS generation failed after multiple attempts' };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'english';
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a temporary file
    const tempDir = tmpdir();
    const inputFilePath = path.join(tempDir, `input-${Date.now()}.m4a`);
    fs.writeFileSync(inputFilePath, buffer);

    // Transcribe audio with Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(inputFilePath),
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
    });

    // Clean up input file
    fs.unlinkSync(inputFilePath);

    const userInput = transcription.text;
    
    // Check if the transcribed content is safe
    const safetyCheck = await isContentSafe(userInput);
    
    if (!safetyCheck.safe) {
      return NextResponse.json({
        text: `I cannot respond to that request. It appears to contain inappropriate content.`,
        flagged: true,
        userInput: userInput
      });
    }

    // Generate AI response using the language model
    const responseText = await generateAIResponse(userInput);

    // Generate speech from response text
    const { audio: audioBuffer, error: ttsError } = await generateSpeech(responseText, language);
    
    if (ttsError) {
      console.error('TTS failed, returning text only:', ttsError);
      return NextResponse.json({
        text: responseText,
        userInput: userInput,
        language: language,
        ttsError: ttsError
      });
    }

    // Create output file path
    const outputFilePath = path.join(tempDir, `output-${Date.now()}.wav`);
    fs.writeFileSync(outputFilePath, audioBuffer as Buffer);

    // Read the file and convert to base64 for easy transmission
    const base64Audio = fs.readFileSync(outputFilePath).toString('base64');
    
    // Clean up output file
    fs.unlinkSync(outputFilePath);

    return NextResponse.json({
      text: responseText,
      audio: base64Audio,
      userInput: userInput,
      language: language
    });

  } catch (error) {
    console.error('Error processing audio:', error);
    return NextResponse.json(
      { error: 'Failed to process audio' }, 
      { status: 500 }
    );
  }
}