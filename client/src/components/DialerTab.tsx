import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Video, Delete } from "lucide-react";

interface DialerTabProps {
  onCall: (phoneNumber: string, contactName?: string, callType?: 'voice' | 'video' | 'pstn') => void;
}

const dialerKeys = [
  { key: "1", letters: "" },
  { key: "2", letters: "ABC" },
  { key: "3", letters: "DEF" },
  { key: "4", letters: "GHI" },
  { key: "5", letters: "JKL" },
  { key: "6", letters: "MNO" },
  { key: "7", letters: "PQRS" },
  { key: "8", letters: "TUV" },
  { key: "9", letters: "WXYZ" },
  { key: "*", letters: "" },
  { key: "0", letters: "+" },
  { key: "#", letters: "" },
];

export function DialerTab({ onCall }: DialerTabProps) {
  const [number, setNumber] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("0.00");
  const { t } = useLanguage();

  // Fetch call rate for entered number
  const { data: rateData } = useQuery({
    queryKey: ["/api/call-rates/calculate", number],
    enabled: !!number,
  });

  useEffect(() => {
    if (rateData) {
      setEstimatedCost(rateData.rate);
    }
  }, [rateData]);

  const handleKeyPress = (key: string) => {
    setNumber(prev => prev + key);
  };

  const handleDelete = () => {
    setNumber(prev => prev.slice(0, -1));
  };

  const handleCall = (callType: 'voice' | 'video' | 'pstn' = 'pstn') => {
    if (number.trim()) {
      onCall(number, undefined, callType);
    }
  };

  return (
    <div className="p-4">
      {/* Call Rate Banner */}
      <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{rateData?.description || t("Bangladesh Mobile")}</p>
            <p className="text-xs text-muted-foreground">{t("Per minute rate")}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-accent">৳ {estimatedCost}</p>
            <p className="text-xs text-muted-foreground">{t("Every second billing")}</p>
          </div>
        </div>
      </div>

      {/* Dialer Display */}
      <div className="bg-card rounded-lg p-4 mb-6 border border-border">
        <div className="mb-4">
          <Input
            type="tel"
            placeholder="+880 1XXXXXXXXX"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="text-2xl font-mono text-center border-none bg-transparent p-2 focus:ring-0"
            data-testid="input-dialer-number"
          />
        </div>
        
        {/* Rate Calculator */}
        <div className="text-center text-sm text-muted-foreground">
          <span>{t("Estimated cost for 1 min:")}</span>
          <span className="font-medium text-foreground ml-1" data-testid="text-estimated-cost">
            ৳ {estimatedCost}
          </span>
        </div>
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {dialerKeys.map(({ key, letters }) => (
          <Button
            key={key}
            variant="outline"
            onClick={() => handleKeyPress(key)}
            className="aspect-square rounded-full text-2xl font-medium border border-border hover:bg-muted"
            data-testid={`button-dialer-${key}`}
          >
            <div className="text-center">
              <div>{key}</div>
              {letters && <div className="text-xs text-muted-foreground">{letters}</div>}
            </div>
          </Button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={handleDelete}
          className="flex-1 py-3 rounded-lg"
          data-testid="button-delete"
        >
          <Delete className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => handleCall('pstn')}
          className="flex-[3] py-3 rounded-lg space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={!number.trim()}
          data-testid="button-call"
        >
          <Phone className="w-5 h-5" />
          <span className="font-medium">{t("Call")}</span>
        </Button>
        <Button
          onClick={() => handleCall('video')}
          className="flex-1 py-3 rounded-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          disabled={!number.trim()}
          data-testid="button-video-call"
        >
          <Video className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
