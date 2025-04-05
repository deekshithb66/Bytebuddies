
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Send } from "lucide-react";
import { toast } from 'sonner';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  mode: {
    name: string;
    color: string;
    systemPrompt: string;
  };
  onLocationRequest?: () => void;
}

const ChatInterface = ({ mode, onLocationRequest }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState<string>('');
  
  // Initialize with a welcome message
  useEffect(() => {
    const welcomeMessage = {
      text: `Hello! I'm your ${mode.name} assistant. How can I help you today?`,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    // Check for API key in local storage
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, [mode.name]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech recognition setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening]);

  // Handle speech synthesis
  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to get a more natural voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Natural') || 
        voice.name.includes('Female')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 0.9; // Slightly slower
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (input.trim() === '') return;
    
    // Check if API key is present
    if (!apiKey) {
      const key = prompt("Please enter your Gemini API Key:");
      if (key) {
        localStorage.setItem('geminiApiKey', key);
        setApiKey(key);
      } else {
        toast.error("API key is required to continue");
        return;
      }
    }
    
    const userMessage = {
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Check for location request in shopping mode
    if (mode.name === "Shopping" && 
        (input.toLowerCase().includes("order") || 
         input.toLowerCase().includes("buy") || 
         input.toLowerCase().includes("purchase"))) {
      if (onLocationRequest) {
        onLocationRequest();
      }
    }
    
    try {
      // For now, mock the API call
      setTimeout(() => {
        // This would be replaced with actual Gemini API call
        const responseText = generateMockResponse(input, mode.name);
        
        const assistantMessage = {
          text: responseText,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        speakResponse(responseText);
        setIsLoading(false);
      }, 1500);
      
      // TODO: Replace with actual Gemini API integration
      // const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${apiKey}`
      //   },
      //   body: JSON.stringify({
      //     contents: [
      //       {
      //         role: "user",
      //         parts: [{ text: mode.systemPrompt + "\n\nUser: " + input }]
      //       }
      //     ],
      //     safetySettings: [
      //       {
      //         category: "HARM_CATEGORY_HARASSMENT",
      //         threshold: "BLOCK_MEDIUM_AND_ABOVE"
      //       }
      //     ],
      //     generationConfig: {
      //       temperature: 0.7,
      //       topP: 0.8,
      //       topK: 40,
      //       maxOutputTokens: 2048,
      //     }
      //   })
      // });
      
      // const data = await response.json();
      // const responseText = data.candidates[0].content.parts[0].text;
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: "Sorry, I encountered an error. Please try again later.",
        isUser: false,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }
  };

  const generateMockResponse = (input: string, modeName: string) => {
    // Just for demonstration, returns mode-specific responses
    switch(modeName) {
      case "Religious":
        return "In many religious traditions, the concept of mindfulness and being present has deep significance. For example, in the Bhagavad Gita, Lord Krishna advises Arjuna to focus on his actions without attachment to the results. Would you like me to share more about this teaching?";
      case "Wellness":
        return "Maintaining good health at any age involves balanced nutrition, regular physical activity, and mental well-being. Have you tried gentle stretching exercises in the morning? Just 5-10 minutes can help improve flexibility and reduce stiffness in your joints.";
      case "Information":
        return "That's an interesting question. Based on reliable sources, senior citizens in many countries can access special benefits like healthcare subsidies, transportation discounts, and tax benefits. Would you like me to provide more specific information about programs available in your region?";
      case "Shopping":
        return "I'd be happy to help you place an order. To proceed, I'll need to know your delivery address. You can either share your current location or provide a specific address where you'd like your items delivered.";
      default:
        return "Thank you for your message. How else can I assist you today?";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-4 ${
                  message.isUser
                    ? `bg-primary text-white`
                    : 'bg-muted'
                }`}
                style={message.isUser ? {} : { backgroundColor: `${mode.color}20` }}
              >
                <p className="text-lg">{message.text}</p>
                <div className={`text-xs mt-1 ${message.isUser ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-xl p-4 bg-muted">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={`rounded-full ${isListening ? 'bg-red-100' : ''}`}
          onClick={toggleListening}
        >
          {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="text-lg p-6 rounded-full"
        />
        <Button 
          type="submit" 
          size="icon" 
          className="rounded-full"
          style={{ backgroundColor: mode.color }}
        >
          <Send className="h-6 w-6" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
