import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { DialerTab } from "./DialerTab";
import { ContactsTab } from "./ContactsTab";
import { HistoryTab } from "./HistoryTab";
import { WalletTab } from "./WalletTab";
import { CallingInterface } from "./CallingInterface";
import { SettingsModal } from "./SettingsModal";
import { Button } from "@/components/ui/button";
import { Phone, Users, History, Wallet, Settings } from "lucide-react";

type Tab = "dialer" | "contacts" | "history" | "wallet";

export function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>("dialer");
  const [showSettings, setShowSettings] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callData, setCallData] = useState<any>(null);
  const { user } = useAuth();
  const typedUser = user as any;
  const { t } = useLanguage();

  const startCall = (phoneNumber: string, contactName?: string, callType: 'voice' | 'video' | 'pstn' = 'pstn') => {
    setCallData({
      phoneNumber,
      contactName,
      callType,
      startTime: Date.now(),
    });
    setIsInCall(true);
  };

  const endCall = () => {
    setIsInCall(false);
    setCallData(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dialer":
        return <DialerTab onCall={startCall} />;
      case "contacts":
        return <ContactsTab onCall={startCall} />;
      case "history":
        return <HistoryTab onCall={startCall} />;
      case "wallet":
        return <WalletTab />;
      default:
        return <DialerTab onCall={startCall} />;
    }
  };

  if (isInCall) {
    return <CallingInterface callData={callData} onEndCall={endCall} />;
  }

  return (
    <div className="max-w-md mx-auto bg-card shadow-xl min-h-screen relative overflow-hidden">
      {/* Top Bar */}
      <header className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">VoiceLink</h1>
            <p className="text-xs text-muted-foreground">{t("Online")}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Balance Display */}
          <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
            <Wallet className="w-4 h-4 inline mr-1" />
            <span data-testid="text-balance">৳ {typedUser?.balance || "0.00"}</span>
          </div>
          
          {/* Settings Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full"
            data-testid="button-settings"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Tab Content */}
      <main className="pb-20 bg-background min-h-screen">
        {renderTabContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-card border-t border-border fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md">
        <div className="flex">
          <button
            onClick={() => setActiveTab("dialer")}
            className={`flex-1 py-3 flex flex-col items-center space-y-1 transition-colors ${
              activeTab === "dialer" ? "text-primary" : "text-muted-foreground"
            }`}
            data-testid="tab-dialer"
          >
            <Phone className="w-5 h-5" />
            <span className="text-xs">{t("Dialer")}</span>
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex-1 py-3 flex flex-col items-center space-y-1 transition-colors ${
              activeTab === "contacts" ? "text-primary" : "text-muted-foreground"
            }`}
            data-testid="tab-contacts"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">{t("Contacts")}</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 flex flex-col items-center space-y-1 transition-colors ${
              activeTab === "history" ? "text-primary" : "text-muted-foreground"
            }`}
            data-testid="tab-history"
          >
            <History className="w-5 h-5" />
            <span className="text-xs">{t("History")}</span>
          </button>
          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex-1 py-3 flex flex-col items-center space-y-1 transition-colors ${
              activeTab === "wallet" ? "text-primary" : "text-muted-foreground"
            }`}
            data-testid="tab-wallet"
          >
            <Wallet className="w-5 h-5" />
            <span className="text-xs">{t("Wallet")}</span>
          </button>
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
