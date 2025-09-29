import { useLanguage, LanguageContext, useLanguageProvider } from "@/hooks/useLanguage";
import { useTheme, ThemeContext, useThemeProvider } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Phone, CheckCircle, Shield, Zap, Globe, ArrowRight } from "lucide-react";

function LandingContent() {
  const { language, setLanguage, t } = useLanguage();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-secondary p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Phone className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">VoiceLink</h1>
          <p className="text-white/90 text-lg max-w-md mx-auto leading-relaxed">
            {t("Secure IP Calling for Bangladesh")}
          </p>
        </div>
      </header>

      {/* Language Selector */}
      <div className="p-6">
        <div className="flex bg-muted rounded-lg p-1 mb-8 max-w-sm mx-auto">
          <button
            onClick={() => setLanguage("en")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              language === "en"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="button-language-en"
          >
            English
          </button>
          <button
            onClick={() => setLanguage("bn")}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              language === "bn"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="button-language-bn"
          >
            বাংলা
          </button>
        </div>

        {/* Features Section */}
        <div className="max-w-md mx-auto space-y-6 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("Why Choose VoiceLink?")}
            </h2>
            <p className="text-muted-foreground">
              {t("Experience the best IP calling service in Bangladesh")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-card rounded-lg border border-border">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {t("Free App-to-App Calls")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("Unlimited voice and video calls between VoiceLink users")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-card rounded-lg border border-border">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {t("Low Cost PSTN Calls")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("Call any Bangladesh mobile at just ৳0.35/minute")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-card rounded-lg border border-border">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {t("Secure & Verified")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("BTRC compliant with NID verification and end-to-end encryption")}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-card rounded-lg border border-border">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {t("Easy Payments")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("Recharge with bKash, Nagad, or credit cards")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleLogin}
            className="w-full py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            data-testid="button-get-started"
          >
            {t("Get Started")}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            {t("Sign up with your phone number and NID")}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-xs text-muted-foreground">
            {t("By continuing, you agree to our Terms & Privacy Policy")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const languageProvider = useLanguageProvider();
  const themeProvider = useThemeProvider();

  return (
    <ThemeContext.Provider value={themeProvider}>
      <LanguageContext.Provider value={languageProvider}>
        <LandingContent />
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}
