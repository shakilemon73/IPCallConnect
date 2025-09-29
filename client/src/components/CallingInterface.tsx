import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Users, Grid3X3, Loader2 } from "lucide-react";

interface CallingInterfaceProps {
  callData: {
    phoneNumber: string;
    contactName?: string;
    callType: 'voice' | 'video' | 'pstn';
    startTime: number;
  };
  onEndCall: () => void;
}

export function CallingInterface({ callData, onEndCall }: CallingInterfaceProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [duration, setDuration] = useState(0);
  const [cost, setCost] = useState("0.00");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callStatus, setCallStatus] = useState("Connecting...");
  const { t } = useLanguage();
  const { toast } = useToast();

  const initiateCallMutation = useMutation({
    mutationFn: async (data: { to: string; callType: string }) => {
      const response = await apiRequest("POST", "/api/calls/initiate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setIsConnected(true);
      setCallStatus("Connected");
      toast({
        title: t("Call Connected"),
        description: `Estimated cost: ৳ ${data.estimatedCost}/min`,
      });
    },
    onError: (error: any) => {
      toast({
        title: t("Call Failed"),
        description: error.message || t("Failed to connect call"),
        variant: "destructive",
      });
      onEndCall();
    },
  });

  // Initialize call on mount
  useEffect(() => {
    initiateCallMutation.mutate({
      to: callData.phoneNumber,
      callType: callData.callType,
    });
  }, []);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isConnected) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callData.startTime) / 1000);
        setDuration(elapsed);
        
        // Calculate cost for PSTN calls (৳0.35 per minute)
        if (callData.callType === 'pstn') {
          const costPerSecond = 0.35 / 60;
          setCost((elapsed * costPerSecond).toFixed(2));
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected, callData.startTime, callData.callType]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getContactInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEndCall = () => {
    // In real implementation, use Twilio SDK to end the call
    toast({
      title: t("Call Ended"),
      description: `Duration: ${formatDuration(duration)}${callData.callType === 'pstn' ? ` | Cost: ৳${cost}` : ''}`,
    });
    onEndCall();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex flex-col">
      {/* Call Status */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-6 flex items-center justify-center relative">
            {callData.callType === 'video' ? (
              // Video call placeholder - in real implementation, show video feed
              <div className="w-full h-full rounded-full bg-black/20 flex items-center justify-center text-white text-4xl font-bold">
                {getContactInitials(callData.contactName || "?")}
              </div>
            ) : (
              <span className="text-white text-4xl font-bold">
                {getContactInitials(callData.contactName || "?")}
              </span>
            )}
            
            {/* Pulsing animation for connecting state */}
            {!isConnected && (
              <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
            )}
          </div>
          
          <h2 className="text-2xl font-semibold mb-2" data-testid="text-contact-name">
            {callData.contactName || "Unknown Contact"}
          </h2>
          <p className="text-muted-foreground mb-4" data-testid="text-phone-number">
            {callData.phoneNumber}
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-accent mb-4">
            {!isConnected && <Loader2 className="w-4 h-4 animate-spin" />}
            <span className="font-medium" data-testid="text-call-status">
              {t(callStatus)}
            </span>
          </div>
        </div>

        {/* Call Timer */}
        {isConnected && (
          <div className="bg-card/50 backdrop-blur-sm rounded-lg px-4 py-2 mb-8 border border-border/50">
            <span className="font-mono text-lg" data-testid="text-call-duration">
              {formatDuration(duration)}
            </span>
          </div>
        )}

        {/* Call Cost */}
        {callData.callType === 'pstn' && isConnected && (
          <div className="text-center text-sm text-muted-foreground">
            <span>{t("Call cost:")}</span>
            <span className="font-medium text-accent ml-1" data-testid="text-call-cost">
              ৳ {cost}
            </span>
          </div>
        )}

        {/* Free call indicator */}
        {(callData.callType === 'voice' || callData.callType === 'video') && isConnected && (
          <div className="text-center text-sm text-secondary font-medium">
            {t("Free VoiceLink Call")}
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="p-8">
        <div className="flex justify-center space-x-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsMuted(!isMuted)}
            className={`w-16 h-16 rounded-full ${isMuted ? 'bg-destructive/10 text-destructive' : 'bg-card/50 backdrop-blur-sm border-border/50'}`}
            data-testid="button-toggle-mute"
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-16 h-16 rounded-full ${isSpeakerOn ? 'bg-primary/10 text-primary' : 'bg-card/50 backdrop-blur-sm border-border/50'}`}
            data-testid="button-toggle-speaker"
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full hover:scale-105 transition-transform"
            data-testid="button-end-call"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full bg-card/50 backdrop-blur-sm border-border/50"
            data-testid="button-show-dialpad"
          >
            <Grid3X3 className="w-6 h-6" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full bg-card/50 backdrop-blur-sm border-border/50"
            data-testid="button-add-call"
          >
            <Users className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
