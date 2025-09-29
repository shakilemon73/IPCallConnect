import { useAuth } from "@/hooks/useAuth";
import { useLanguage, LanguageContext, useLanguageProvider } from "@/hooks/useLanguage";
import { useTheme, ThemeContext, useThemeProvider } from "@/hooks/useTheme";
import { useWebSocket } from "@/hooks/useWebSocket";
import { MainApp } from "@/components/MainApp";
import { useToast } from "@/hooks/use-toast";

function HomeContent() {
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

  // If user is authenticated, show main app
  if (isAuthenticated) {
    return <MainApp />;
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
