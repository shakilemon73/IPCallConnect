import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone } from "lucide-react";

interface LoginScreenProps {
  onSignupComplete?: () => void;
}

export function LoginScreen({ onSignupComplete }: LoginScreenProps) {
  const [phone, setPhone] = useState("");
  const [nid, setNid] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const signupMutation = useMutation({
    mutationFn: async (data: { phone: string; nid: string; firstName?: string; lastName?: string }) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("Account Created"),
        description: t("Welcome to VoiceLink!"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      onSignupComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to create account"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.match(/^\+880[1-9]\d{8,9}$/)) {
      toast({
        title: t("Invalid phone number"),
        description: t("Please enter a valid Bangladesh phone number"),
        variant: "destructive",
      });
      return;
    }

    if (nid.length < 10) {
      toast({
        title: t("Invalid NID"),
        description: t("Please enter a valid National ID"),
        variant: "destructive",
      });
      return;
    }

    signupMutation.mutate({ phone, nid, firstName, lastName });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-secondary p-8 text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">VoiceLink</h1>
          <p className="text-white/80">{t("Secure IP Calling for Bangladesh")}</p>
        </div>

        {/* Language Selector */}
        <div className="p-4">
          <div className="flex bg-muted rounded-lg p-1 mb-6">
            <button
              onClick={() => setLanguage("en")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                language === "en"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
              data-testid="button-language-en"
            >
              English
            </button>
            <button
              onClick={() => setLanguage("bn")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                language === "bn"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
              data-testid="button-language-bn"
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="phone" className="block text-sm font-medium mb-2">
                {t("Phone Number")}
              </Label>
              <div className="flex">
                <select className="bg-input border border-border rounded-l-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="+880">🇧🇩 +880</option>
                </select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="1XXXXXXXXX"
                  value={phone.replace("+880", "")}
                  onChange={(e) => setPhone("+880" + e.target.value)}
                  className="flex-1 rounded-l-none"
                  data-testid="input-phone"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="nid" className="block text-sm font-medium mb-2">
                {t("National ID (NID)")}
              </Label>
              <Input
                id="nid"
                type="text"
                placeholder="10 or 13 digit NID"
                value={nid}
                onChange={(e) => setNid(e.target.value)}
                data-testid="input-nid"
              />
            </div>

            <div>
              <Label htmlFor="firstName" className="block text-sm font-medium mb-2">
                {t("First Name")} ({t("Optional")})
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                data-testid="input-firstname"
              />
            </div>

            <div>
              <Label htmlFor="lastName" className="block text-sm font-medium mb-2">
                {t("Last Name")} ({t("Optional")})
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                data-testid="input-lastname"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={signupMutation.isPending}
              data-testid="button-signup"
            >
              {signupMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("Create Account")}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t("By continuing, you agree to our Terms & Privacy Policy")}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
