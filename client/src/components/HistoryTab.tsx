import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Phone, Video, PhoneOff, Clock, Wallet, Gift } from "lucide-react";
import { format } from "date-fns";
import type { CallHistory } from "@shared/schema";

interface HistoryTabProps {
  onCall: (phoneNumber: string, contactName?: string, callType?: 'voice' | 'video' | 'pstn') => void;
}

type FilterType = "all" | "missed" | "outgoing" | "incoming";

export function HistoryTab({ onCall }: HistoryTabProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const { t } = useLanguage();

  // Fetch call history
  const { data: callHistory = [], isLoading } = useQuery({
    queryKey: ["/api/call-history"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const filteredHistory = callHistory.filter((call: CallHistory) => {
    if (filter === "all") return true;
    return call.callType === filter;
  });

  const getCallIcon = (call: CallHistory) => {
    if (call.callType === "missed") {
      return <PhoneOff className="w-4 h-4 text-destructive" />;
    }
    if (call.callCategory === "video") {
      return <Video className="w-4 h-4 text-primary" />;
    }
    return <Phone className="w-4 h-4 text-secondary" />;
  };

  const getCallTypeLabel = (call: CallHistory) => {
    if (call.callType === "missed") return t("Missed");
    if (call.callType === "outgoing") return t("Outgoing");
    if (call.callType === "incoming") return t("Incoming");
    return call.callType;
  };

  const getCallTypeColor = (call: CallHistory) => {
    if (call.callType === "missed") return "text-destructive";
    if (call.callType === "outgoing") return "text-secondary";
    if (call.callType === "incoming") return "text-primary";
    return "text-muted-foreground";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffHours < 48) {
      return "Yesterday";
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  return (
    <div className="p-4">
      {/* Filter Tabs */}
      <div className="flex bg-muted rounded-lg p-1 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          }`}
          data-testid="filter-all"
        >
          {t("All")}
        </button>
        <button
          onClick={() => setFilter("missed")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            filter === "missed"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          }`}
          data-testid="filter-missed"
        >
          {t("Missed")}
        </button>
        <button
          onClick={() => setFilter("outgoing")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            filter === "outgoing"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          }`}
          data-testid="filter-outgoing"
        >
          {t("Outgoing")}
        </button>
      </div>

      {/* Call History List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-32"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("No call history found")}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredHistory.map((call: CallHistory) => (
            <div key={call.id} className="bg-card border border-border rounded-lg p-4" data-testid={`call-history-${call.id}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {getContactInitials(call.contactName || "Unknown")}
                  </div>
                  <div>
                    <h3 className="font-medium" data-testid={`call-contact-${call.id}`}>
                      {call.contactName || "Unknown"}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`call-number-${call.id}`}>
                      {call.phoneNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center space-x-1 ${getCallTypeColor(call)}`}>
                    {getCallIcon(call)}
                    <span className="text-xs">{getCallTypeLabel(call)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground" data-testid={`call-date-${call.id}`}>
                    {formatDate(call.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  {call.duration > 0 && (
                    <span className="text-muted-foreground">
                      <Clock className="inline w-3 h-3 mr-1" />
                      <span data-testid={`call-duration-${call.id}`}>
                        {formatDuration(call.duration)}
                      </span>
                    </span>
                  )}
                  {call.cost && parseFloat(call.cost) > 0 ? (
                    <span className="text-accent font-medium">
                      <Wallet className="inline w-3 h-3 mr-1" />
                      <span data-testid={`call-cost-${call.id}`}>৳ {call.cost}</span>
                    </span>
                  ) : call.callCategory === "voice" || call.callCategory === "video" ? (
                    <span className="text-secondary font-medium">
                      <Gift className="inline w-3 h-3 mr-1" />
                      <span>{t("Free")}</span>
                    </span>
                  ) : (
                    call.status === "failed" && (
                      <span className="text-destructive">
                        {t("Call not answered")}
                      </span>
                    )
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCall(call.phoneNumber, call.contactName || undefined, call.callCategory as any)}
                  data-testid={`button-call-back-${call.id}`}
                >
                  {call.callCategory === "video" ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
