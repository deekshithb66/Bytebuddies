
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

interface LocationPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: string, coordinates?: { latitude: number; longitude: number }) => void;
}

const LocationPrompt = ({ isOpen, onClose, onConfirm }: LocationPromptProps) => {
  const [manualAddress, setManualAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleShareLocation = () => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onConfirm("Current Location", { latitude, longitude });
          toast.success("Location shared successfully");
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Couldn't get your location. Please enter manually.");
          setIsLoading(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualAddress.trim()) {
      onConfirm(manualAddress);
      toast.success("Address saved successfully");
    } else {
      toast.error("Please enter a valid address");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share your location</DialogTitle>
          <DialogDescription className="text-lg">
            We need your location to process your order.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <Button 
            onClick={handleShareLocation} 
            className="w-full senior-friendly-button bg-sahayak-blue"
            disabled={isLoading}
          >
            {isLoading ? "Getting location..." : "Share my current location"}
          </Button>
          
          <div className="relative flex items-center">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-gray-500">OR</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>
          
          <form onSubmit={handleManualSubmit}>
            <Input
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="Enter your address manually"
              className="text-lg p-6 mb-4"
            />
            <DialogFooter>
              <Button type="submit" className="w-full senior-friendly-button bg-sahayak-green">
                Confirm address
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPrompt;
