
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  className?: string;
}

const ModeCard = ({ title, description, icon, color, route, className }: ModeCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className={cn(
        "mode-card flex flex-col items-center text-center h-full", 
        className
      )}
      onClick={() => navigate(route)}
    >
      <CardContent className="pt-6 pb-4 px-2 flex flex-col items-center gap-4 h-full">
        <div 
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white mb-2`}
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-muted-foreground flex-grow">{description}</p>
        <Button 
          className="senior-friendly-button mt-auto w-full"
          style={{ backgroundColor: color }}
        >
          Start
        </Button>
      </CardContent>
    </Card>
  );
};

export default ModeCard;
