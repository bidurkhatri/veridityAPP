/**
 * Complete Nepali Language Integration for Veridity
 * Supporting Devanagari script and Nepal-specific terminology
 */

export const nepaliTranslations = {
  // Navigation and Layout
  "nav.dashboard": "ड्यासबोर्ड",
  "nav.generate": "प्रमाण बनाउनुहोस्",
  "nav.verify": "प्रमाणीकरण गर्नुहोस्",
  "nav.settings": "सेटिङहरू",
  "nav.help": "सहायता",
  "nav.profile": "प्रोफाइल",

  // Welcome and Onboarding
  "welcome.title": "स्वागतम्!",
  "welcome.subtitle": "तपाईंको गोपनीयता-प्राथमिकता डिजिटल पहिचान प्लेटफर्म",
  "welcome.description": "Veridity मा तपाईंको व्यक्तिगत जानकारी सुरक्षित राख्दै पहिचान प्रमाणीकरण गर्नुहोस्",
  "welcome.getStarted": "सुरु गर्नुहोस्",
  "welcome.learnMore": "थप जान्नुहोस्",

  // Proof Generation
  "proof.generate": "प्रमाण बनाउनुहोस्",
  "proof.type.age": "उमेर प्रमाणीकरण",
  "proof.type.citizenship": "नागरिकता प्रमाणीकरण",
  "proof.type.income": "आम्दानी प्रमाणीकरण",
  "proof.type.education": "शिक्षा प्रमाणीकरण",
  
  "proof.age.title": "उमेर प्रमाणीकरण",
  "proof.age.description": "तपाईंको सही उमेर प्रकट नगरी १८ वर्ष भन्दा माथिको प्रमाण दिनुहोस्",
  "proof.age.threshold": "न्यूनतम उमेर आवश्यकता",
  "proof.age.yourAge": "तपाईंको उमेर",
  
  "proof.citizenship.title": "नेपाली नागरिकता प्रमाणीकरण",
  "proof.citizenship.description": "नेपाली नागरिकता प्रमाणित गर्नुहोस् सरकारी सेवाहरूको लागि",
  "proof.citizenship.number": "नागरिकता नम्बर",
  "proof.citizenship.district": "जिल्ला",
  
  "proof.income.title": "आम्दानी प्रमाणीकरण",
  "proof.income.description": "ऋण र सेवाहरूको लागि आम्दानी योग्यता प्रमाणित गर्नुहोस्",
  "proof.income.monthly": "मासिक आम्दानी",
  "proof.income.threshold": "आवश्यक न्यूनतम आम्दानी",
  "proof.income.currency": "रु.", // Nepali Rupees symbol
  
  "proof.education.title": "शैक्षिक योग्यता प्रमाणीकरण",
  "proof.education.description": "तपाईंको शैक्षिक योग्यता गोप्य रूपमा प्रमाणित गर्नुहोस्",
  "proof.education.level": "शिक्षाको तह",
  "proof.education.institution": "शिक्षण संस्था",
  "proof.education.grade": "ग्रेड/प्रतिशत",

  // Education Levels in Nepal
  "education.slc": "SLC/SEE (कक्षा १०)",
  "education.plus2": "+२ (कक्षा १२)",
  "education.bachelor": "स्नातक",
  "education.master": "स्नातकोत्तर",
  "education.phd": "पीएचडी",

  // Verification Status
  "status.generating": "प्रमाण बनाउँदै...",
  "status.generated": "प्रमाण तयार भयो!",
  "status.verifying": "प्रमाणीकरण गर्दै...",
  "status.verified": "प्रमाणीकरण सफल!",
  "status.failed": "प्रमाणीकरण असफल",
  "status.pending": "पर्खाइमा",
  "status.expired": "म्याद सकिएको",

  // Offline and Connectivity
  "offline.title": "अफलाइन मोड",
  "offline.description": "तपाईं अफलाइन हुनुहुन्छ, तर फेरि पनि प्रमाण बनाउन सक्नुहुन्छ!",
  "offline.dataLocal": "तपाईंको डेटा स्थानीय रूपमा सुरक्षित छ",
  "offline.willSync": "इन्टरनेट फर्किएपछि स्वचालित रूपमा sync हुनेछ",
  "offline.syncPending": "Sync पर्खाइमा",
  "offline.syncComplete": "Sync सम्पन्न!",

  // Biometric Authentication
  "biometric.title": "बायोमेट्रिक प्रमाणीकरण",
  "biometric.fingerprint": "औंला छाप",
  "biometric.faceId": "अनुहार पहिचान",
  "biometric.touchId": "टच आईडी",
  "biometric.authenticate": "पहिचान पुष्टि गर्नुहोस्",
  "biometric.fallback": "पिन प्रयोग गर्नुहोस्",
  "biometric.privacy": "🔒 तपाईंको बायोमेट्रिक डेटा तपाईंको यन्त्रबाट बाहिर जाँदैन",

  // Forms and Input
  "form.name": "नाम",
  "form.email": "इमेल",
  "form.phone": "फोन नम्बर",
  "form.address": "ठेगाना",
  "form.submit": "पेश गर्नुहोस्",
  "form.cancel": "रद्द गर्नुहोस्",
  "form.save": "सेभ गर्नुहोस्",
  "form.edit": "सम्पादन गर्नुहोस्",
  "form.delete": "मेटाउनुहोस्",
  "form.required": "आवश्यक",
  "form.optional": "वैकल्पिक",

  // Nepal-specific Places
  "province.1": "प्रदेश नं. १",
  "province.madhesh": "मधेस प्रदेश",
  "province.bagmati": "बागमती प्रदेश",
  "province.gandaki": "गण्डकी प्रदेश",
  "province.lumbini": "लुम्बिनी प्रदेश",
  "province.karnali": "कर्णाली प्रदेश",
  "province.sudurpaschim": "सुदूरपश्चिम प्रदेश",

  // Major Cities
  "city.kathmandu": "काठमाडौं",
  "city.pokhara": "पोखरा",
  "city.lalitpur": "ललितपुर",
  "city.bhaktapur": "भक्तपुर",
  "city.biratnagar": "विराटनगर",
  "city.birgunj": "वीरगञ्ज",
  "city.dharan": "धरान",
  "city.bharatpur": "भरतपुर",

  // Time and Date
  "date.today": "आज",
  "date.yesterday": "हिजो",
  "date.tomorrow": "भोलि",
  "date.thisWeek": "यो हप्ता",
  "date.thisMonth": "यो महिना",
  "date.thisYear": "यो वर्ष",

  // Nepali Calendar Months
  "nepali.baishakh": "बैशाख",
  "nepali.jestha": "जेठ",
  "nepali.ashadh": "आषाढ",
  "nepali.shrawan": "श्रावण",
  "nepali.bhadra": "भाद्र",
  "nepali.ashwin": "आश्विन",
  "nepali.kartik": "कार्तिक",
  "nepali.mangsir": "मंसिर",
  "nepali.poush": "पौष",
  "nepali.magh": "माघ",
  "nepali.falgun": "फाल्गुन",
  "nepali.chaitra": "चैत्र",

  // Festivals and Cultural
  "festival.dashain": "दशैं",
  "festival.tihar": "तिहार",
  "festival.holi": "होली",
  "festival.teej": "तीज",
  "festival.janai": "जनै पूर्णिमा",

  // Error Messages
  "error.network": "इन्टरनेट जडान समस्या",
  "error.server": "सर्भर समस्या",
  "error.validation": "गलत जानकारी",
  "error.unauthorized": "अनधिकृत पहुँच",
  "error.notFound": "फेला परेन",
  "error.tryAgain": "फेरि प्रयास गर्नुहोस्",

  // Success Messages
  "success.saved": "सफलतापूर्वक सेभ भयो!",
  "success.generated": "प्रमाण सफलतापूर्वक बनाइयो!",
  "success.verified": "सफलतापूर्वक प्रमाणित भयो!",
  "success.synced": "डेटा सफलतापूर्वक sync भयो!",

  // Privacy and Security
  "privacy.title": "गोपनीयता र सुरक्षा",
  "privacy.dataStaysLocal": "तपाईंको डेटा तपाईंको यन्त्रमा नै रहन्छ",
  "privacy.noPersonalData": "कुनै व्यक्तिगत जानकारी साझा गरिंदैन",
  "privacy.zeroKnowledge": "जीरो-नालेज प्रमाण प्रविधि",
  "privacy.encrypted": "सबै डेटा एन्क्रिप्ट गरिएको छ",

  // Help and Support
  "help.title": "सहायता र समर्थन",
  "help.faq": "बारम्बार सोधिने प्रश्नहरू",
  "help.contact": "सम्पर्क गर्नुहोस्",
  "help.tutorial": "ट्युटोरियल",
  "help.documentation": "कागजातहरू",

  // Voice Commands
  "voice.generate": "प्रमाण बनाउनुहोस्",
  "voice.verify": "प्रमाणीकरण गर्नुहोस्",
  "voice.check": "स्थिति जाँच गर्नुहोस्",
  "voice.help": "सहायता",
  "voice.settings": "सेटिङ खोल्नुहोस्",

  // Loading States
  "loading.please_wait": "कृपया पर्खनुहोस्...",
  "loading.processing": "प्रक्रिया गर्दै...",
  "loading.connecting": "जडान गर्दै...",
  "loading.syncing": "Sync गर्दै...",
  "loading.almost_done": "झन्डै सकियो...",

  // Gestures and Navigation
  "gesture.swipeUp": "माथि स्वाइप गर्नुहोस्",
  "gesture.swipeDown": "तल स्वाइप गर्नुहोस्",
  "gesture.swipeLeft": "बायाँ स्वाइप गर्नुहोस्",
  "gesture.swipeRight": "दायाँ स्वाइप गर्नुहोस्",
  "gesture.tapToOpen": "खोल्न ट्याप गर्नुहोस्",
  "gesture.longPress": "लामो समय थिच्नुहोस्",

  // Accessibility
  "accessibility.menu": "मेनु",
  "accessibility.button": "बटन",
  "accessibility.link": "लिङ्क",
  "accessibility.image": "तस्बिर",
  "accessibility.loading": "लोड हुँदै",
  "accessibility.close": "बन्द गर्नुहोस्",

  // Analytics and Stats
  "stats.totalProofs": "कुल प्रमाणहरू",
  "stats.verifiedProofs": "प्रमाणित प्रमाणहरू",
  "stats.successRate": "सफलता दर",
  "stats.thisMonth": "यो महिना",
  "stats.lastMonth": "गत महिना",

  // Government Integration
  "govt.services": "सरकारी सेवाहरू",
  "govt.passport": "राहदानी",
  "govt.license": "लाइसेन्स",
  "govt.banking": "बैंकिङ",
  "govt.education": "शिक्षा मन्त्रालय",
  "govt.health": "स्वास्थ्य मन्त्रालय"
};

// Devanagari script utilities
export const devanagariUtils = {
  // Convert English numbers to Devanagari numbers
  toDevanagariNumbers: (text: string): string => {
    const englishToDevanagari: { [key: string]: string } = {
      '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
      '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
    };
    
    return text.replace(/[0-9]/g, (match) => englishToDevanagari[match] || match);
  },

  // Convert Devanagari numbers to English
  toEnglishNumbers: (text: string): string => {
    const devanagariToEnglish: { [key: string]: string } = {
      '०': '0', '१': '1', '२': '2', '३': '3', '④': '4',
      '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
    };
    
    return text.replace(/[०-९]/g, (match) => devanagariToEnglish[match] || match);
  },

  // Check if text contains Devanagari script
  isDevanagari: (text: string): boolean => {
    return /[\u0900-\u097F]/.test(text);
  },

  // Format Nepali currency
  formatNepaliCurrency: (amount: number): string => {
    const devanagariAmount = devanagariUtils.toDevanagariNumbers(amount.toLocaleString());
    return `रु. ${devanagariAmount}`;
  }
};

// Cultural color schemes
export const nepalCulturalColors = {
  // Nepal flag inspired colors
  crimson: '#DC143C',
  blue: '#003893',
  white: '#FFFFFF',
  
  // Festival colors
  dashain: {
    primary: '#FF6B35',
    secondary: '#F7931E',
    accent: '#FFD700'
  },
  
  tihar: {
    primary: '#FFD700',
    secondary: '#FF8C00',
    accent: '#FF4500'
  },
  
  holi: {
    primary: '#FF69B4',
    secondary: '#00CED1',
    accent: '#32CD32'
  },

  // Traditional colors
  traditional: {
    maroon: '#800000',
    gold: '#FFD700',
    saffron: '#FF9933',
    emerald: '#50C878'
  }
};