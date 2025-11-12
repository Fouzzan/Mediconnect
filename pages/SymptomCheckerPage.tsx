

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleGenAI, Chat } from '@google/genai';
import { SparklesIcon, XIcon } from '../components/Icons';
import AIAssistantInput from '../components/AIAssistantInput';

interface Message {
    sender: 'user' | 'ai';
    text: string;
    image?: string | null;
}

const systemInstruction = `You are AURA, a friendly and empathetic AI Health Assistant from Mediconnect. 
Your goal is to assist users with their health-related questions in a conversational manner.

Your capabilities include:
1.  **Symptom Checking (Text & Image):** 
    - If a user describes symptoms with text, ask clarifying questions one by one to get more details (like duration, severity, location, etc.). Ask at least 3-4 questions before providing any summary.
    - If a user uploads an image of a symptom along with a text description, analyze both. First, describe what you see in the image objectively. Then, list a few potential (non-diagnostic) possibilities. Finally, recommend an appropriate specialist (e.g., Dermatologist, General Practitioner).
2.  **General Health Information:** Answer questions about wellness, diet, exercise, and healthy habits.
3.  **Medical Terminology:** Explain complex medical terms in simple, easy-to-understand language.
4.  **First-Aid Guidance:** Provide basic first-aid information when asked.
5.  **Finding Nearby Care:** If a user asks to find nearby hospitals, clinics, or pharmacies, you MUST direct them to use the "Find Nearby Care" page in the portal for a map-based search. For example, say "You can find nearby care facilities using the map on the 'Find Nearby Care' page." Do not ask for their location.

After gathering details for a symptom check, or when providing any significant health information, provide a summary of potential next steps or recommendations (e.g., 'Rest and monitor', 'Consider consulting a general practitioner', 'This may require urgent medical care').

IMPORTANT: You must end EVERY single message with this exact disclaimer: "Disclaimer: I am an AI assistant, not a medical professional. This information is not a substitute for professional medical advice. Please consult with a doctor for any health concerns."`;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error('Failed to read file as base64 string.'));
            }
        };
        reader.onerror = error => reject(error);
    });
};


const SuggestionChip: React.FC<{ text: string; onClick: () => void }> = ({ text, onClick }) => (
    <button 
      onClick={onClick}
      className="bg-slate-700/60 backdrop-blur-sm border border-slate-600 hover:bg-slate-600/80 text-slate-200 px-5 py-2.5 rounded-full text-sm transition-colors duration-200"
    >
      {text}
    </button>
);

const AIHealthAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const initialMessageSent = useRef(false);
  const aiRef = useRef<GoogleGenAI | null>(null);

  const handleImageSelect = (file: File) => {
      setImageFile(file);
      // create object URL for preview and revoke previous if exists
      if(imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
  };

  const handleClearImage = () => {
      if(imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(null);
      setImagePreview(null);
  };


  const sendTextMessage = async (message: string) => {
    if (!chatRef.current) return;
    setIsLoading(true);

    try {
      const stream = await chatRef.current.sendMessageStream({ message });
      let aiResponseText = '';
      setMessages(prev => [...prev, { sender: 'ai', text: '' }]);

      for await (const chunk of stream) {
        aiResponseText += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = aiResponseText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { sender: 'ai', text: "I'm sorry, an error occurred. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendMultimodalMessage = async (prompt: string, file: File) => {
      if (!aiRef.current) return;
      setIsLoading(true);

      try {
          const base64Data = await fileToBase64(file);
          const imagePart = { inlineData: { mimeType: file.type, data: base64Data } };
          const textPart = { text: prompt };

          const response = await aiRef.current.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts: [imagePart, textPart] },
              config: { systemInstruction }
          });
          
          setMessages(prev => [...prev, { sender: 'ai', text: response.text }]);
      } catch (error) {
          console.error('Gemini API error:', error);
          setMessages(prev => [...prev, { sender: 'ai', text: "I'm sorry, an error occurred while analyzing the image. Please try again." }]);
      } finally {
          setIsLoading(false);
      }
  };

  const handleSendMessage = async (message: string) => {
    if ((!message.trim() && !imageFile) || isLoading) return;
    
    const userMessage: Message = { sender: 'user', text: message, image: imagePreview };
    setMessages(prev => [...prev, userMessage]);

    const currentImageFile = imageFile;

    handleClearImage();
    
    if(currentImageFile) {
        await sendMultimodalMessage(message, currentImageFile);
    } else {
        await sendTextMessage(message);
    }
  };
  
  useEffect(() => {
    const initChat = async () => {
      try {
        aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatRef.current = aiRef.current.chats.create({
          model: 'gemini-2.5-flash',
          config: { systemInstruction },
        });
        
        const initialAiMessage: Message = {
            sender: 'ai',
            text: "Hello! I'm AURA, your personal AI health assistant. How can I help you today? You can ask me about symptoms, medical terms, or general wellness advice."
        };
        setMessages([initialAiMessage]);
        
        const initialMessageFromNav = location.state?.initialMessage;
        if (initialMessageFromNav && !initialMessageSent.current) {
            initialMessageSent.current = true;
            window.history.replaceState({}, document.title);
            await handleSendMessage(initialMessageFromNav);
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setMessages([{
            sender: 'ai',
            text: "Sorry, I'm having trouble connecting right now. Please try again later."
        }]);
      }
    };
    initChat();
    
    return () => {
        if(imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const hasUserMessaged = messages.some(m => m.sender === 'user');

  return (
    <div className="h-full">
        <div className="relative flex flex-col h-full bg-gradient-to-br from-slate-900 to-gray-800 rounded-2xl p-6 text-white overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full filter blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl opacity-50"></div>
            
            <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender === 'ai' && 
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <SparklesIcon className="w-5 h-5 text-teal-400" />
                        </div>
                      }
                      <div
                        className={`max-w-xl p-3.5 rounded-2xl shadow-md ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-slate-700/80 text-slate-200 rounded-bl-lg'}`}
                      >
                         {msg.sender === 'user' && msg.image && (
                            <img src={msg.image} alt="Symptom upload" className="mb-2 rounded-lg max-h-48" />
                         )}
                        {msg.text && <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                       <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <SparklesIcon className="w-5 h-5 text-teal-400" />
                       </div>
                       <div className="max-w-lg p-3.5 rounded-2xl bg-slate-700/80 rounded-bl-lg shadow-md">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-0"></span>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
                        </div>
                       </div>
                    </div>
                  )}
                <div ref={messagesEndRef} />
            </div>

            {!hasUserMessaged && !isLoading && (
                <div className="my-6 z-10 flex gap-3 flex-wrap justify-center max-w-3xl animate-in fade-in-0 duration-500">
                    <SuggestionChip text="What are common flu symptoms?" onClick={() => handleSendMessage("What are common flu symptoms?")} />
                    <SuggestionChip text="Explain what BMI means" onClick={() => handleSendMessage("Explain what BMI means")} />
                    <SuggestionChip text="First-aid for a minor burn" onClick={() => handleSendMessage("First-aid for a minor burn")} />
                    <SuggestionChip text="I have a strange rash on my arm" onClick={() => handleSendMessage("I have a strange rash on my arm")} />
                </div>
            )}

            <div className="w-full mt-auto z-10">
                <AIAssistantInput 
                    onSendMessage={handleSendMessage}
                    placeholder="Ask AURA anything, or attach an image..."
                    onImageSelect={handleImageSelect}
                    imagePreview={imagePreview}
                    onClearImage={handleClearImage}
                    isInline={true}
                />
                <p className="text-center text-xs text-slate-500 mt-4">AURA is an AI assistant and does not provide medical advice. Consult a doctor for any health concerns.</p>
            </div>
        </div>
    </div>
  );
};

export default AIHealthAssistantPage;