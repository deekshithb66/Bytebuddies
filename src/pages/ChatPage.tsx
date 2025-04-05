
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatInterface from '@/components/ChatInterface';
import LocationPrompt from '@/components/LocationPrompt';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book, Heart, Info, ShoppingBag } from 'lucide-react';

interface ModeConfig {
  name: string;
  color: string;
  icon: React.ReactNode;
  systemPrompt: string;
}

const ChatPage = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [location, setLocation] = useState<string | null>(null);

  const modeConfigs: Record<string, ModeConfig> = {
    religious: {
      name: "Religious Companion",
      color: "#8B5CF6",
      icon: <Book className="h-6 w-6" />,
      systemPrompt: "You are a religious companion for elderly users. Respond with compassion, wisdom, and respect for all beliefs. Focus on providing religious teachings, stories, and spiritual guidance when asked. Avoid political commentary and respect the user's faith tradition. Keep responses concise and easy to understand for senior citizens."
    },
    wellness: {
      name: "Wellness Guide",
      color: "#34D399",
      icon: <Heart className="h-6 w-6" />,
      systemPrompt: "You are a wellness guide for elderly users. Provide gentle, practical health advice, focusing on exercises suitable for seniors, nutrition guidance, and mental wellbeing tips. Never give specific medical diagnoses or replace professional medical advice. Keep responses concise and easy to understand for senior citizens."
    },
    information: {
      name: "Information Assistant",
      color: "#3B82F6",
      icon: <Info className="h-6 w-6" />,
      systemPrompt: "You are an information assistant for elderly users. Provide clear, factual, and helpful information about government schemes, local resources, technology usage, and general knowledge. Avoid complex jargon and explain concepts in simple terms. Keep responses concise and easy to understand for senior citizens."
    },
    shopping: {
      name: "Shopping Helper",
      color: "#F97316",
      icon: <ShoppingBag className="h-6 w-6" />,
      systemPrompt: "You are a shopping assistant for elderly users. Help them navigate online shopping platforms, place orders for food, groceries, and other essentials. When the user wants to place an order, ask for their location or address. Keep responses concise and easy to understand for senior citizens."
    }
  };

  const currentMode = mode && modeConfigs[mode] ? modeConfigs[mode] : modeConfigs.information;

  const handleLocationRequest = () => {
    setShowLocationPrompt(true);
  };

  const handleLocationConfirm = (address: string, coordinates?: { latitude: number; longitude: number }) => {
    setLocation(address);
    setShowLocationPrompt(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center p-4 border-b" style={{ backgroundColor: `${currentMode.color}10` }}>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/')}
          className="mr-4"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center gap-2">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: currentMode.color }}
          >
            {currentMode.icon}
          </div>
          <h1 className="text-2xl font-bold">{currentMode.name}</h1>
        </div>
        
        {location && (
          <div className="ml-auto flex items-center text-sm text-muted-foreground">
            <span>Location: {location}</span>
          </div>
        )}
      </header>
      
      <main className="flex-grow overflow-hidden">
        <ChatInterface 
          mode={currentMode} 
          onLocationRequest={mode === 'shopping' ? handleLocationRequest : undefined}
        />
      </main>
      
      <LocationPrompt 
        isOpen={showLocationPrompt}
        onClose={() => setShowLocationPrompt(false)}
        onConfirm={handleLocationConfirm}
      />
    </div>
  );
};

export default ChatPage;
