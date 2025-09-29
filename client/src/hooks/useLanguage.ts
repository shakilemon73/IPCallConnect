import { useState, useEffect, createContext, useContext } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'Secure IP Calling for Bangladesh': 'Secure IP Calling for Bangladesh',
    'Phone Number': 'Phone Number',
    'National ID (NID)': 'National ID (NID)',
    'Send OTP': 'Send OTP',
    'By continuing, you agree to our Terms & Privacy Policy': 'By continuing, you agree to our Terms & Privacy Policy',
    'Verify Phone': 'Verify Phone',
    'Enter OTP Code': 'Enter OTP Code',
    'We sent a 6-digit code to': 'We sent a 6-digit code to',
    'Verify & Continue': 'Verify & Continue',
    "Didn't receive code?": "Didn't receive code?",
    'Resend OTP': 'Resend OTP',
    'Online': 'Online',
    'Dialer': 'Dialer',
    'Contacts': 'Contacts',
    'History': 'History',
    'Wallet': 'Wallet',
    'Bangladesh Mobile': 'Bangladesh Mobile',
    'Per minute rate': 'Per minute rate',
    'Every second billing': 'Every second billing',
    'Estimated cost for 1 min:': 'Estimated cost for 1 min:',
    'Call': 'Call',
    'Search contacts...': 'Search contacts...',
    'Add New Contact': 'Add New Contact',
    'VoiceLink User': 'VoiceLink User',
    'Mobile Contact': 'Mobile Contact',
    'All': 'All',
    'Missed': 'Missed',
    'Outgoing': 'Outgoing',
    'Incoming': 'Incoming',
    'Call not answered': 'Call not answered',
    'Video Call': 'Video Call',
    'Free': 'Free',
    'Current Balance': 'Current Balance',
    'Last recharge:': 'Last recharge:',
    'Quick Recharge': 'Quick Recharge',
    'Custom Amount': 'Custom Amount',
    'Enter amount': 'Enter amount',
    'Recharge': 'Recharge',
    'Payment Methods': 'Payment Methods',
    'Mobile Payment': 'Mobile Payment',
    'Digital Payment': 'Digital Payment',
    'Credit Card': 'Credit Card',
    'Recent Transactions': 'Recent Transactions',
    'Recharge via bKash': 'Recharge via bKash',
    'Connecting...': 'Connecting...',
    'Call cost:': 'Call cost:',
    'Settings': 'Settings',
    'Verified Account': 'Verified Account',
    'Language': 'Language',
    'App language preference': 'App language preference',
    'English': 'English',
    'Dark Mode': 'Dark Mode',
    'Switch to dark theme': 'Switch to dark theme',
    'Notifications': 'Notifications',
    'Call Settings': 'Call Settings',
    'Privacy & Security': 'Privacy & Security',
    'Help & Support': 'Help & Support',
    'About VoiceLink': 'About VoiceLink',
    'Logout': 'Logout',
    'Sign out of your account': 'Sign out of your account',
    'Contact Name': 'Contact Name',
    'Phone Number (with country code)': 'Phone Number (with country code)',
    'Add Contact': 'Add Contact',
    'Cancel': 'Cancel',
    'Invalid phone number': 'Invalid phone number',
  },
  bn: {
    'Secure IP Calling for Bangladesh': 'বাংলাদেশের জন্য নিরাপদ আইপি কলিং',
    'Phone Number': 'ফোন নম্বর',
    'National ID (NID)': 'জাতীয় পরিচয়পত্র',
    'Send OTP': 'ওটিপি পাঠান',
    'By continuing, you agree to our Terms & Privacy Policy': 'এগিয়ে গিয়ে, আপনি আমাদের শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত হচ্ছেন',
    'Verify Phone': 'ফোন যাচাই করুন',
    'Enter OTP Code': 'ওটিপি কোড লিখুন',
    'We sent a 6-digit code to': 'আমরা একটি ৬-অঙ্কের কোড পাঠিয়েছি',
    'Verify & Continue': 'যাচাই করুন ও এগিয়ে যান',
    "Didn't receive code?": 'কোড পাননি?',
    'Resend OTP': 'পুনরায় ওটিপি পাঠান',
    'Online': 'অনলাইন',
    'Dialer': 'ডায়ালার',
    'Contacts': 'যোগাযোগ',
    'History': 'ইতিহাস',
    'Wallet': 'ওয়ালেট',
    'Bangladesh Mobile': 'বাংলাদেশ মোবাইল',
    'Per minute rate': 'প্রতি মিনিট হার',
    'Every second billing': 'প্রতি সেকেন্ড বিলিং',
    'Estimated cost for 1 min:': '১ মিনিটের আনুমানিক খরচ:',
    'Call': 'কল করুন',
    'Search contacts...': 'যোগাযোগ খুঁজুন...',
    'Add New Contact': 'নতুন যোগাযোগ যোগ করুন',
    'VoiceLink User': 'ভয়েসলিংক ব্যবহারকারী',
    'Mobile Contact': 'মোবাইল যোগাযোগ',
    'All': 'সব',
    'Missed': 'মিসড',
    'Outgoing': 'আউটগোয়িং',
    'Incoming': 'ইনকামিং',
    'Call not answered': 'কল নেওয়া হয়নি',
    'Video Call': 'ভিডিও কল',
    'Free': 'ফ্রি',
    'Current Balance': 'বর্তমান ব্যালেন্স',
    'Last recharge:': 'শেষ রিচার্জ:',
    'Quick Recharge': 'দ্রুত রিচার্জ',
    'Custom Amount': 'কাস্টম পরিমাণ',
    'Enter amount': 'পরিমাণ লিখুন',
    'Recharge': 'রিচার্জ',
    'Payment Methods': 'পেমেন্ট পদ্ধতি',
    'Mobile Payment': 'মোবাইল পেমেন্ট',
    'Digital Payment': 'ডিজিটাল পেমেন্ট',
    'Credit Card': 'ক্রেডিট কার্ড',
    'Recent Transactions': 'সাম্প্রতিক লেনদেন',
    'Recharge via bKash': 'বিকাশের মাধ্যমে রিচার্জ',
    'Connecting...': 'সংযোগ করা হচ্ছে...',
    'Call cost:': 'কল খরচ:',
    'Settings': 'সেটিংস',
    'Verified Account': 'যাচাইকৃত অ্যাকাউন্ট',
    'Language': 'ভাষা',
    'App language preference': 'অ্যাপের ভাষার পছন্দ',
    'English': 'ইংরেজি',
    'Dark Mode': 'ডার্ক মোড',
    'Switch to dark theme': 'ডার্ক থিমে স্যুইচ করুন',
    'Notifications': 'বিজ্ঞপ্তি',
    'Call Settings': 'কল সেটিংস',
    'Privacy & Security': 'গোপনীয়তা ও নিরাপত্তা',
    'Help & Support': 'সাহায্য ও সহায়তা',
    'About VoiceLink': 'ভয়েসলিংক সম্পর্কে',
    'Logout': 'লগআউট',
    'Sign out of your account': 'আপনার অ্যাকাউন্ট থেকে সাইন আউট করুন',
    'Contact Name': 'যোগাযোগের নাম',
    'Phone Number (with country code)': 'ফোন নম্বর (দেশের কোড সহ)',
    'Add Contact': 'যোগাযোগ যোগ করুন',
    'Cancel': 'বাতিল',
    'Invalid phone number': 'অবৈধ ফোন নম্বর',
  },
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useLanguageProvider() {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('voicelink-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'bn')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('voicelink-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return {
    language,
    setLanguage: handleSetLanguage,
    t,
  };
}
