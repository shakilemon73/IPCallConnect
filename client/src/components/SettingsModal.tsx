import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  User, 
  Edit, 
  Globe, 
  Moon, 
  Bell, 
  Phone, 
  Shield, 
  HelpCircle, 
  Info, 
  LogOut,
  ChevronRight
} from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "?";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleLanguageToggle = () => {
    setLanguage(language === "en" ? "bn" : "en");
  };

  return (
    <div className="absolute inset-0 z-50 bg-background">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="mr-4"
            data-testid="button-close-settings"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold">{t("Settings")}</h2>
        </div>

        <div className="flex-1 p-4">
          {/* Profile Section */}
          <div className="mb-6">
            <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xl font-bold">
                <span data-testid="text-user-initials">
                  {getInitials(user?.firstName, user?.lastName)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold" data-testid="text-user-name">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"
                  }
                </h3>
                <p className="text-sm text-muted-foreground" data-testid="text-user-phone">
                  {user?.phone || user?.email || "Not provided"}
                </p>
                <p className="text-xs text-secondary">{t("Verified Account")}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                data-testid="button-edit-profile"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Settings Options */}
          <div className="space-y-2">
            {/* Language Setting */}
            <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium">{t("Language")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("App language preference")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLanguageToggle}
                  data-testid="button-toggle-language"
                >
                  {language === "en" ? "English" : "বাংলা"}
                </Button>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Moon className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium">{t("Dark Mode")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("Switch to dark theme")}
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                data-testid="switch-dark-mode"
              />
            </div>

            {/* Notifications */}
            <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium">{t("Notifications")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("Manage notification settings")}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Call Settings */}
            <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium">{t("Call Settings")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("Audio quality and preferences")}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Privacy & Security */}
            <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium">{t("Privacy & Security")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("Account security settings")}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Support */}
            <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium">{t("Help & Support")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("Get help and contact support")}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* About */}
            <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Info className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium">{t("About VoiceLink")}</h4>
                  <p className="text-sm text-muted-foreground">Version 1.0.0</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Logout */}
            <div 
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-muted transition-colors"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5 text-destructive" />
                <div>
                  <h4 className="font-medium text-destructive">{t("Logout")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("Sign out of your account")}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
