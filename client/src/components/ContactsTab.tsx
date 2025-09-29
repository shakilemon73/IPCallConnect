import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Phone, Video, Loader2 } from "lucide-react";
import type { Contact } from "@shared/schema";

interface ContactsTabProps {
  onCall: (phoneNumber: string, contactName?: string, callType?: 'voice' | 'video' | 'pstn') => void;
}

export function ContactsTab({ onCall }: ContactsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contacts
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["/api/contacts"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Search contacts
  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/contacts/search", { q: searchQuery }],
    enabled: !!searchQuery.trim(),
  });

  const addContactMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setShowAddDialog(false);
      setNewContactName("");
      setNewContactPhone("");
      toast({
        title: t("Contact Added"),
        description: t("Contact has been added successfully"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to add contact"),
        variant: "destructive",
      });
    },
  });

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newContactName.trim()) {
      toast({
        title: t("Invalid Name"),
        description: t("Please enter a contact name"),
        variant: "destructive",
      });
      return;
    }

    if (!newContactPhone.match(/^\+?[1-9]\d{1,14}$/)) {
      toast({
        title: t("Invalid phone number"),
        description: t("Please enter a valid phone number"),
        variant: "destructive",
      });
      return;
    }

    // Ensure phone starts with +
    const formattedPhone = newContactPhone.startsWith("+") ? newContactPhone : `+${newContactPhone}`;

    addContactMutation.mutate({
      name: newContactName,
      phone: formattedPhone,
    });
  };

  const getContactInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayedContacts = searchQuery.trim() ? searchResults : contacts;

  return (
    <div className="p-4">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder={t("Search contacts...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-3"
          data-testid="input-search-contacts"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      </div>

      {/* Add Contact Button */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button className="w-full mb-4" data-testid="button-add-contact">
            <Plus className="w-4 h-4 mr-2" />
            {t("Add New Contact")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Add New Contact")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddContact} className="space-y-4">
            <div>
              <Label htmlFor="contact-name">{t("Contact Name")}</Label>
              <Input
                id="contact-name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder={t("Contact Name")}
                data-testid="input-contact-name"
              />
            </div>
            <div>
              <Label htmlFor="contact-phone">{t("Phone Number (with country code)")}</Label>
              <Input
                id="contact-phone"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                placeholder="+880 1XXXXXXXXX"
                data-testid="input-contact-phone"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="flex-1"
                data-testid="button-cancel-add"
              >
                {t("Cancel")}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={addContactMutation.isPending}
                data-testid="button-confirm-add"
              >
                {addContactMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("Add Contact")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contacts List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 flex items-center space-x-3 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      ) : displayedContacts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? t("No contacts found") : t("No contacts yet")}
        </div>
      ) : (
        <div className="space-y-2">
          {displayedContacts.map((contact: Contact) => (
            <div key={contact.id} className="bg-card border border-border rounded-lg p-4 flex items-center space-x-3" data-testid={`contact-item-${contact.id}`}>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                {getContactInitials(contact.name)}
              </div>
              <div className="flex-1">
                <h3 className="font-medium" data-testid={`contact-name-${contact.id}`}>{contact.name}</h3>
                <p className="text-sm text-muted-foreground" data-testid={`contact-phone-${contact.id}`}>{contact.phone}</p>
                {contact.isVoiceLinkUser && (
                  <p className="text-xs text-secondary">{t("VoiceLink User")}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => onCall(contact.phone, contact.name, contact.isVoiceLinkUser ? 'voice' : 'pstn')}
                  className="p-2 rounded-full"
                  data-testid={`button-call-${contact.id}`}
                >
                  <Phone className="w-4 h-4" />
                </Button>
                {contact.isVoiceLinkUser && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onCall(contact.phone, contact.name, 'video')}
                    className="p-2 rounded-full"
                    data-testid={`button-video-call-${contact.id}`}
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
