import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage, LanguageContext, useLanguageProvider } from "@/hooks/useLanguage";
import { useTheme, ThemeContext, useThemeProvider } from "@/hooks/useTheme";
import { useWebSocket } from "@/hooks/useWebSocket";
import { LoginScreen } from "@/components/LoginScreen";
import { OTPScreen } from "@/components/OTPScreen";
import { MainApp } from "@/components/MainApp";
import { useToast } from "@/hooks/use-toast";

type AuthStep = "login" | "otp" | "complete";

function HomeContent() {
  const [authStep, setAuthStep] = useState<AuthStep>("login");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Initialize WebSocket connection for real-time notifications
  useWebSocket({
    onMessage: (data) => {
      if (data.type === "incoming_call") {
        toast({
          title: "Incoming Call",
          description: `Call from ${data.from}`,
          duration: 10000,
        });
      }
    },
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and has completed phone verification, show main app
  if (isAuthenticated && user?.isVerified) {
    return <MainApp />;
  }

  // If user is authenticated but hasn't verified phone, show verification flow
  if (isAuthenticated && !user?.isVerified) {
    if (authStep === "login") {
      return (
        <LoginScreen
          onOTPSent={(phone) => {
            setPhoneNumber(phone);
            setAuthStep("otp");
          }}
        />
      );
    }

    if (authStep === "otp") {
      return (
        <OTPScreen
          phone={phoneNumber}
          onVerified={() => {
            setAuthStep("complete");
            // Refresh user data
            window.location.reload();
          }}
          onBack={() => setAuthStep("login")}
        />
      );
    }
  }

  // For non-authenticated users, redirect to login
  window.location.href = "/api/login";
  return null;
}

export default function Home() {
  const languageProvider = useLanguageProvider();
  const themeProvider = useThemeProvider();

  return (
    <ThemeContext.Provider value={themeProvider}>
      <LanguageContext.Provider value={languageProvider}>
        <HomeContent />
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}
