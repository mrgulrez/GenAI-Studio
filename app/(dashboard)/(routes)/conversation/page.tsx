// app/conversation/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Particles } from '@/components/ui/particles';
import { SphericalCloud } from '@/components/ui/spherical-cloud';

export default function ConversationPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [conversation, setConversation] = useState<Array<{role: string, text: string, flagged?: boolean, language?: string}>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState<'english' | 'arabic'>('english');
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const recordingStartTimeRef = useRef<number>(0);

  // Voice activity detection parameters
  const VOICE_THRESHOLD = 0.02; // Minimum audio level to detect voice
  const SILENCE_DURATION = 1500; // Milliseconds of silence before stopping
  const MIN_RECORDING_DURATION = 500; // Minimum recording duration in ms

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

  // Voice Activity Detection using Web Audio API
  useEffect(() => {
    if (!autoDetect || isProcessing || rateLimitInfo) return;

    let isActive = true;

    const startVoiceDetection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: true,
          }
        });

        streamRef.current = stream;

        // Create audio context and analyser
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass({ latencyHint: 'interactive' });
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const microphone = audioContext.createMediaStreamSource(stream);
        microphoneRef.current = microphone;
        microphone.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudioLevel = () => {
          if (!isActive || !analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate average audio level
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const normalizedLevel = average / 255;

          setAudioLevel(normalizedLevel);

          // Voice activity detection
          if (normalizedLevel > VOICE_THRESHOLD) {
            // Voice detected
            if (!isRecording && !isListening) {
              // Start recording automatically
              setIsListening(true);
              startRecordingFromStream(stream);
            } else if (isRecording) {
              // Clear silence timer if recording
              if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
              }
            }
          } else {
            // Silence detected
            if (isRecording) {
              // Start silence timer
              if (!silenceTimerRef.current) {
                silenceTimerRef.current = setTimeout(() => {
                  if (isRecording && Date.now() - recordingStartTimeRef.current > MIN_RECORDING_DURATION) {
                    stopRecording();
                  }
                }, SILENCE_DURATION);
              }
            } else if (isListening) {
              setIsListening(false);
            }
          }

          animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
        };

        checkAudioLevel();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting voice detection:', err);
        setIsListening(false);
      }
    };

    startVoiceDetection();

    return () => {
      isActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      cleanupAudioResources();
    };
  }, [autoDetect, isProcessing, rateLimitInfo]);

  const cleanupAudioResources = () => {
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsListening(false);
  };

  const startRecordingFromStream = async (stream?: MediaStream) => {
    try {
      const audioStream = stream || await navigator.mediaDevices.getUserMedia({ 
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        } 
      });

      if (!stream) {
        streamRef.current = audioStream;
      }

      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(audioStream, {
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
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
      setTtsError(null);
      setRateLimitInfo(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Error accessing microphone. Please check permissions.');
      setIsListening(false);
    }
  };

  const startRecording = async () => {
    if (autoDetect) {
      // If auto-detect is on, it will handle starting
      return;
    }
    await startRecordingFromStream();
  };

  const stopRecording = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
      
      // Don't stop the stream if auto-detect is on
      if (!autoDetect && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const processAudio = async () => {
    setIsProcessing(true);
    setIsRecording(false);
    setIsListening(false);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', language);
      
      const response = await fetch('/api/conversation', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error: ' + response.status);
      }
      
      const data = await response.json();
      
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
      
      if (data.ttsError) {
        setTtsError(data.ttsError);
        if (data.ttsError.includes('429')) {
          setRateLimitInfo('Please wait a moment before making another request. You may be hitting API rate limits.');
        }
      }
      
      if (data.audio && audioRef.current && !data.flagged) {
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
        
        audioRef.current.src = audioUrl;
        audioRef.current.onloadedmetadata = () => {
          audioRef.current?.play().catch(e => console.error('Error playing audio:', e));
        };
        
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

  const toggleAutoDetect = () => {
    setAutoDetect(prev => !prev);
    if (isRecording) {
      stopRecording();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent flex flex-col items-center justify-center p-4">
      {/* Animated Particles Background */}
      <Particles />
      
      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Glassmorphic Card */}
        <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-gray-200/30 p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              AI Conversation Assistant
            </h1>
            <div className="flex items-center gap-3">
              {conversation.length > 0 && (
                <button
                  onClick={clearConversation}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all duration-300 border border-gray-200"
                >
                  Clear Chat
                </button>
              )}
              <button
                onClick={toggleLanguage}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                  language === 'english' 
                    ? 'bg-purple-100 text-purple-700 border-purple-300' 
                    : 'bg-amber-100 text-amber-700 border-amber-300'
                }`}
              >
                {language === 'english' ? 'English' : 'العربية'}
              </button>
            </div>
          </div>
          
          {/* Auto-Detect Toggle */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <button
              onClick={toggleAutoDetect}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                autoDetect
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              {autoDetect ? '🎤 Auto-Detect: ON' : '🎤 Auto-Detect: OFF'}
            </button>
            {autoDetect && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-gray-600">Listening...</span>
              </div>
            )}
          </div>
          
          {/* Language Indicator */}
          <div className="mb-6 text-center">
            <span className={`px-4 py-2 rounded-full text-xs font-medium border ${
              language === 'english' 
                ? 'bg-purple-100 text-purple-700 border-purple-300' 
                : 'bg-amber-100 text-amber-700 border-amber-300'
            }`}>
              {language === 'english' ? 'Output: English' : 'الإخراج: العربية'}
            </span>
          </div>
          
          {/* TTS Error Alert */}
          {ttsError && (
            <div className="mb-6 p-4 bg-yellow-50 backdrop-blur-sm border border-yellow-300 rounded-xl text-yellow-800 text-sm">
              <p className="font-medium mb-1">TTS Warning</p>
              <p>{ttsError}. Showing text response only.</p>
              {rateLimitInfo && (
                <p className="mt-2">{rateLimitInfo}</p>
              )}
            </div>
          )}
          
          {/* Conversation Display with Glassmorphic Design */}
          <div className="h-96 overflow-y-auto mb-8 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-gray-200/20 shadow-inner scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
            {conversation.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-700">
                <div className="relative w-32 h-32 mb-6">
                  <SphericalCloud isActive={isListening || isRecording} intensity={isRecording ? 2.5 : isListening ? 1.5 : 0.5} />
                </div>
                <p className="text-center text-lg font-medium">
                  {autoDetect 
                    ? "Speak naturally - I'm listening..." 
                    : "Start a conversation by clicking the spherical cloud"}
                </p>
                <p className="text-center text-sm text-gray-500 mt-2">Your voice will be transformed into an interactive experience</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`max-w-xs md:max-w-md p-4 rounded-2xl border ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-900 border-purple-300 shadow-lg'
                          : msg.flagged 
                            ? 'bg-yellow-50 text-yellow-800 border-yellow-300'
                            : msg.language === 'arabic'
                              ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-900 text-right border-amber-300'
                              : 'bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-900 border-indigo-300'
                      } transition-all duration-300 hover:scale-105`}
                      dir={msg.language === 'arabic' ? 'rtl' : 'ltr'}
                    >
                      <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                        {msg.role === 'user' ? '👤 You' : '🤖 Assistant'}
                        {msg.flagged && <span className="text-xs">⚠️</span>}
                        {msg.language === 'arabic' && <span className="text-xs">🇸🇦</span>}
                        {msg.role === 'assistant' && ttsError && (
                          <span className="text-xs">🔇</span>
                        )}
                      </p>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={conversationEndRef} />
              </div>
            )}
          </div>
          
          {/* Enhanced Spherical Cloud Button */}
          <div className="flex flex-col items-center">
            <div className="relative flex justify-center items-center mb-6">
              {/* Spherical Cloud Background - Active when recording or listening */}
              {(isRecording || isListening) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    <SphericalCloud isActive={true} intensity={isRecording ? 2.5 : 1.5} />
                  </div>
                </div>
              )}
              
              {/* Spherical Cloud Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing || (rateLimitInfo !== null) || autoDetect}
                className={`relative z-10 w-32 h-32 rounded-full font-bold transition-all duration-500 shadow-2xl transform ${
                  isRecording
                    ? 'scale-110 animate-pulse'
                    : (rateLimitInfo !== null || autoDetect)
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:scale-110'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <SphericalCloud 
                    isActive={isRecording || isListening} 
                    intensity={isRecording ? 2.5 : isListening ? 1.5 : 1} 
                  />
                </div>
              </button>
              
              {/* Audio Level Indicator */}
              {autoDetect && isListening && (
                <div className="absolute -left-32 flex flex-col items-center gap-2">
                  <div className="w-2 h-16 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="w-full bg-green-500 transition-all duration-100 rounded-full"
                      style={{ 
                        height: `${Math.min(audioLevel * 1000, 100)}%`,
                        transform: 'translateY(100%)',
                        transformOrigin: 'bottom'
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">Level</span>
                </div>
              )}
              
              {/* Processing Indicator */}
              {isProcessing && (
                <div className="absolute -right-32 flex items-center bg-purple-100 backdrop-blur-sm text-purple-700 px-4 py-2 rounded-full border border-purple-300">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent mr-2"></div>
                  <span className="text-sm font-medium">Processing...</span>
                </div>
              )}
            </div>
            
            {/* Status Text */}
            <p className="text-sm text-gray-600 text-center font-medium">
              {isRecording 
                ? "🎤 Recording... Speak now" 
                : isListening
                  ? "👂 Listening... Start speaking"
                  : rateLimitInfo
                    ? "⏳ Please wait before making another request"
                    : autoDetect
                      ? "✨ Auto-detect is ON - Just start speaking!"
                      : "✨ Click the spherical cloud to start a conversation"}
            </p>
          </div>
          
          {/* Info Panel with Glassmorphic Design */}
          <div className="mt-8 p-5 bg-gray-50 backdrop-blur-md rounded-xl text-sm border border-gray-200">
            <p className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
              <span>💡</span> How it works
            </p>
            <ul className="list-none text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">→</span>
                <span>{autoDetect ? 'Auto-detects your voice and starts recording automatically' : 'Click to start recording manually'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">→</span>
                <span>Your speech is converted to text using Whisper AI</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">→</span>
                <span>Content is checked for safety and appropriateness</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">→</span>
                <span>AI generates a response using advanced language models</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">→</span>
                <span>Response is converted to speech using {language === 'english' ? 'PlayAI TTS (English)' : 'PlayAI TTS Arabic'}</span>
              </li>
              {rateLimitInfo && (
                <li className="flex items-start gap-2 text-yellow-700">
                  <span className="text-yellow-600 mt-1">⚠</span>
                  <span>Note: Currently experiencing API rate limits</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
