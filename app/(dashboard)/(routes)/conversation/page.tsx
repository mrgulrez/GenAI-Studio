// app/conversation/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

export default function ConversationPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState<Array<{role: string, text: string, flagged?: boolean, language?: string}>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState<'english' | 'arabic'>('english');
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Request microphone permission on component mount
    async function enableStream() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    }
    
    enableStream();
  }, []);

  // Scroll to bottom of conversation when new messages are added
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        } 
      });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = processAudio;
      
      mediaRecorder.start();
      setIsRecording(true);
      setTtsError(null); // Clear previous errors
      setRateLimitInfo(null); // Clear rate limit info
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    setIsProcessing(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Create FormData and append the audio blob and language
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', language);
      
      // Send to our API endpoint
      const response = await fetch('/api/conversation', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error: ' + response.status);
      }
      
      const data = await response.json();
      
      // Update conversation
      setConversation(prev => [
        ...prev,
        { role: 'user', text: data.userInput || "User audio message" },
        { 
          role: 'assistant', 
          text: data.text, 
          flagged: data.flagged, 
          language: data.language 
        }
      ]);
      
      // Set TTS error if exists
      if (data.ttsError) {
        setTtsError(data.ttsError);
        
        // Check if it's a rate limit error
        if (data.ttsError.includes('429')) {
          setRateLimitInfo('Please wait a moment before making another request. You may be hitting API rate limits.');
        }
      }
      
      // Play the response audio if available and not flagged
      if (data.audio && audioRef.current && !data.flagged) {
        // Convert base64 to Blob
        const byteCharacters = atob(data.audio);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        const audioBlob = new Blob(byteArrays, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Set up audio element
        audioRef.current.src = audioUrl;
        audioRef.current.onloadedmetadata = () => {
          audioRef.current?.play().catch(e => console.error('Error playing audio:', e));
        };
        
        // Clean up the URL when done
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing audio: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const clearConversation = () => {
    setConversation([]);
    setTtsError(null);
    setRateLimitInfo(null);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'english' ? 'arabic' : 'english');
    setTtsError(null);
    setRateLimitInfo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">
            AI Conversation Assistant
          </h1>
          <div className="flex items-center gap-4">
            {conversation.length > 0 && (
              <button
                onClick={clearConversation}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
              >
                Clear Chat
              </button>
            )}
            <button
              onClick={toggleLanguage}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                language === 'english' 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {language === 'english' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
        
        {/* Language Indicator */}
        <div className="mb-4 text-center">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            language === 'english' 
              ? 'bg-indigo-100 text-indigo-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            {language === 'english' ? 'Output: English' : 'الإخراج: العربية'}
          </span>
        </div>
        
        {/* TTS Error Alert */}
        {ttsError && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800 text-sm">
            <p className="font-medium">TTS Warning</p>
            <p>Audio generation failed: {ttsError}. Showing text response only.</p>
            {rateLimitInfo && (
              <p className="mt-2">{rateLimitInfo}</p>
            )}
          </div>
        )}
        
        {/* Conversation Display */}
        <div className="h-96 overflow-y-auto mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {conversation.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-center">Start a conversation by clicking the microphone button</p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-indigo-100 text-indigo-800'
                        : msg.flagged 
                          ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                          : msg.language === 'arabic'
                            ? 'bg-amber-100 text-amber-800 text-right'
                            : 'bg-green-100 text-green-800'
                    }`}
                    dir={msg.language === 'arabic' ? 'rtl' : 'ltr'}
                  >
                    <p className="text-sm font-medium mb-1">
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                      {msg.flagged && <span className="ml-2 text-xs">⚠️ Flagged</span>}
                      {msg.language === 'arabic' && <span className="ml-2 text-xs">🇸🇦</span>}
                      {msg.role === 'assistant' && ttsError && (
                        <span className="ml-2 text-xs">🔇 No Audio</span>
                      )}
                    </p>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={conversationEndRef} />
            </div>
          )}
        </div>
        
        {/* Recording Controls */}
        <div className="flex flex-col items-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || (rateLimitInfo !== null)}
              className={`p-5 rounded-full text-white font-bold transition-all shadow-md ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : (rateLimitInfo !== null)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRecording ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            
            {isProcessing && (
              <div className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-sm">Processing...</span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-500 text-center">
            {isRecording 
              ? "Recording... Speak now" 
              : rateLimitInfo
                ? "Please wait before making another request"
                : "Click the microphone to start a conversation"}
          </p>
        </div>
        
        {/* Info panel */}
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg text-sm border border-indigo-100">
          <p className="font-medium text-indigo-800 mb-1">How it works</p>
          <ul className="list-disc list-inside text-indigo-700 space-y-1">
            <li>Your speech is converted to text using Whisper</li>
            <li>Content is checked for safety</li>
            <li>AI generates a response using a language model</li>
            <li>Response is converted to speech using {language === 'english' ? 'PlayAI TTS (English)' : 'PlayAI TTS Arabic'}</li>
            {rateLimitInfo && (
              <li className="text-yellow-700 font-medium">Note: Currently experiencing API rate limits</li>
            )}
          </ul>
        </div>
        
        {/* Hidden audio element for playing responses */}
        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  );
}