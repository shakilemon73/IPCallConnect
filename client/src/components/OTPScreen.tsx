import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";

interface OTPScreenProps {
  phone: string;
  onVerified: () => void;
  onBack: () => void;
}

export function OTPScreen({ phone, onVerified, onBack }: OTPScreenProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { t } = useLanguage();
  const { toast } = useToast();

  const verifyOTPMutation = useMutation({
    mutationFn: async (data: { phone: string; otp: string }) => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Store Twilio token if provided
      if (data.twilioToken) {
        localStorage.setItem('twilio-token', data.twilioToken);
      }
      toast({
        title: t("Verification Successful"),
        description: t("Welcome to VoiceLink!"),
      });
      onVerified();
    },
    onError: (error: any) => {
      toast({
        title: t("Verification Failed"),
        description: error.message || t("Invalid OTP code"),
        variant: "destructive",
      });
    },
  });

  const resendOTPMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/verify-phone", { 
        phone,
        nid: "dummy" // In real app, store NID from previous step
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("OTP Resent"),
        description: t("Please check your phone for the new verification code"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to resend OTP"),
        variant: "destructive",
      });
    },
  });

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      toast({
        title: t("Invalid OTP"),
        description: t("Please enter the complete 6-digit code"),
        variant: "destructive",
      });
      return;
    }

    verifyOTPMutation.mutate({ phone, otp: otpCode });
  };

  useEffect(() => {
    // Auto-submit when all 6 digits are entered
    if (otp.every(digit => digit !== "") && !verifyOTPMutation.isPending) {
      handleSubmit(new Event('submit') as any);
    }
  }, [otp]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col min-h-screen">
        <div className="flex items-center p-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold">{t("Verify Phone")}</h2>
        </div>

        <div className="flex-1 p-6 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("Enter OTP Code")}</h3>
            <p className="text-muted-foreground mb-1">
              {t("We sent a 6-digit code to")}
            </p>
            <p className="font-medium" data-testid="text-phone-number">{phone}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center space-x-3 mb-8">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold"
                  data-testid={`input-otp-${index}`}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full mb-4"
              disabled={verifyOTPMutation.isPending}
              data-testid="button-verify-otp"
            >
              {verifyOTPMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("Verify & Continue")}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {t("Didn't receive code?")}
            </p>
            <Button
              variant="link"
              onClick={() => resendOTPMutation.mutate()}
              disabled={resendOTPMutation.isPending}
              data-testid="button-resend-otp"
            >
              {resendOTPMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("Resend OTP")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
