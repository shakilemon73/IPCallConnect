import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Plus, Minus, CreditCard, Smartphone, Clock, Loader2, Phone } from "lucide-react";
import { format } from "date-fns";
import type { Transaction } from "@shared/schema";

export function WalletTab() {
  const [customAmount, setCustomAmount] = useState("");
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const rechargeMutation = useMutation({
    mutationFn: async (data: { amount: string; paymentMethod: string }) => {
      const response = await apiRequest("POST", "/api/wallet/recharge", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: t("Recharge Successful"),
        description: `New balance: ৳ ${data.newBalance}`,
      });
      setCustomAmount("");
    },
    onError: (error: any) => {
      toast({
        title: t("Recharge Failed"),
        description: error.message || t("Failed to process recharge"),
        variant: "destructive",
      });
    },
  });

  const handleQuickRecharge = (amount: number, paymentMethod: string = "bkash") => {
    rechargeMutation.mutate({
      amount: amount.toString(),
      paymentMethod,
    });
  };

  const handleCustomRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(customAmount);
    if (!amount || amount <= 0) {
      toast({
        title: t("Invalid Amount"),
        description: t("Please enter a valid amount"),
        variant: "destructive",
      });
      return;
    }

    rechargeMutation.mutate({
      amount: customAmount,
      paymentMethod: "bkash", // Default to bKash
    });
  };

  const getEstimatedMinutes = (amount: number, rate: number = 0.35) => {
    return Math.floor(amount / rate);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === "recharge") {
      return <Plus className="w-4 h-4 text-secondary" />;
    }
    return <Phone className="w-4 h-4 text-destructive" />;
  };

  const lastRecharge = (transactions as Transaction[]).find((t: Transaction) => t.type === "recharge");

  return (
    <div className="p-4">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">{t("Current Balance")}</p>
            <h2 className="text-3xl font-bold" data-testid="text-current-balance">
              ৳ {user?.balance || "0.00"}
            </h2>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>{t("Last recharge:")}</span>
          <span data-testid="text-last-recharge">
            {lastRecharge && lastRecharge.createdAt ? formatDate(lastRecharge.createdAt as unknown as string) : "Never"}
          </span>
        </div>
      </div>

      {/* Quick Recharge */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">{t("Quick Recharge")}</h3>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => handleQuickRecharge(50)}
            disabled={rechargeMutation.isPending}
            className="p-4 h-auto flex flex-col"
            data-testid="button-recharge-50"
          >
            <div className="font-bold text-lg">৳50</div>
            <div className="text-xs text-muted-foreground">
              ~{getEstimatedMinutes(50)} mins
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickRecharge(100)}
            disabled={rechargeMutation.isPending}
            className="p-4 h-auto flex flex-col"
            data-testid="button-recharge-100"
          >
            <div className="font-bold text-lg">৳100</div>
            <div className="text-xs text-muted-foreground">
              ~{getEstimatedMinutes(100)} mins
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickRecharge(200)}
            disabled={rechargeMutation.isPending}
            className="p-4 h-auto flex flex-col"
            data-testid="button-recharge-200"
          >
            <div className="font-bold text-lg">৳200</div>
            <div className="text-xs text-muted-foreground">
              ~{getEstimatedMinutes(200)} mins
            </div>
          </Button>
        </div>
      </div>

      {/* Custom Amount */}
      <div className="mb-6">
        <Label htmlFor="custom-amount" className="block text-sm font-medium mb-2">
          {t("Custom Amount")}
        </Label>
        <form onSubmit={handleCustomRecharge} className="flex space-x-2">
          <Input
            id="custom-amount"
            type="number"
            placeholder={t("Enter amount")}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="flex-1"
            min="1"
            step="0.01"
            data-testid="input-custom-amount"
          />
          <Button
            type="submit"
            disabled={rechargeMutation.isPending}
            data-testid="button-custom-recharge"
          >
            {rechargeMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("Recharge")}
          </Button>
        </form>
      </div>

      {/* Payment Methods */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">{t("Payment Methods")}</h3>
        <div className="space-y-2">
          <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">bK</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium">bKash</h4>
              <p className="text-sm text-muted-foreground">{t("Mobile Payment")}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickRecharge(100, "bkash")}
              disabled={rechargeMutation.isPending}
              data-testid="button-bkash-payment"
            >
              Use
            </Button>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Nagad</h4>
              <p className="text-sm text-muted-foreground">{t("Digital Payment")}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickRecharge(100, "nagad")}
              disabled={rechargeMutation.isPending}
              data-testid="button-nagad-payment"
            >
              Use
            </Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{t("Credit Card")}</h4>
              <p className="text-sm text-muted-foreground">Visa/Mastercard</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickRecharge(100, "card")}
              disabled={rechargeMutation.isPending}
              data-testid="button-card-payment"
            >
              Use
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="font-semibold mb-3">{t("Recent Transactions")}</h3>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div>
                    <div className="h-3 bg-muted rounded w-24 mb-1"></div>
                    <div className="h-2 bg-muted rounded w-32"></div>
                  </div>
                </div>
                <div className="h-4 bg-muted rounded w-12"></div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("No transactions yet")}
          </div>
        ) : (
          <div className="space-y-2">
            {(transactions as Transaction[]).slice(0, 10).map((transaction: Transaction) => (
              <div key={transaction.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between" data-testid={`transaction-${transaction.id}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === "recharge" ? "bg-secondary/10" : "bg-destructive/10"
                  }`}>
                    {getTransactionIcon(transaction)}
                  </div>
                  <div>
                    <p className="font-medium text-sm" data-testid={`transaction-description-${transaction.id}`}>
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <Clock className="inline w-3 h-3 mr-1" />
                      {transaction.createdAt ? formatDate(transaction.createdAt as unknown as string) : "N/A"}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  transaction.type === "recharge" ? "text-secondary" : "text-destructive"
                }`} data-testid={`transaction-amount-${transaction.id}`}>
                  {transaction.type === "recharge" ? "+" : ""}৳{transaction.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
