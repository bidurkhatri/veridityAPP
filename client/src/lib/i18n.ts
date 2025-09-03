export type Language = 'en' | 'np';

export const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.generateProof': 'Generate Proof',
    'nav.verify': 'Verify',
    'nav.help': 'Help',
    'nav.accountSettings': 'Account Settings',
    
    // Welcome Section
    'welcome.title': 'Welcome to Veridity',
    'welcome.subtitle': 'Privacy-first digital identity platform',
    'welcome.description': 'Prove your identity attributes securely without revealing sensitive personal data. Generate zero-knowledge proofs for age, citizenship, education, and more.',
    'welcome.generateProof': 'Generate New Proof',
    'welcome.verifyProof': 'Verify Proof',
    
    // Stats
    'stats.proofsGenerated': 'Proofs Generated',
    'stats.verifications': 'Verifications',
    'stats.trustedOrgs': 'Trusted Orgs',
    'stats.privacyProtected': 'Privacy Protected',
    
    // Proof Types
    'proof.age.title': 'Age Verification',
    'proof.age.description': 'Prove you\'re over 18, 21, or specific age requirements',
    'proof.citizenship.title': 'Citizenship',
    'proof.citizenship.description': 'Verify Nepali citizenship status privately',
    'proof.education.title': 'Education',
    'proof.education.description': 'Verify degree and qualification credentials',
    'proof.income.title': 'Income',
    'proof.income.description': 'Prove income level or range',
    'proof.address.title': 'Address',
    'proof.address.description': 'Prove residence in specific location',
    
    // Forms
    'form.proofType': 'Proof Type',
    'form.dateOfBirth': 'Date of Birth',
    'form.minimumAge': 'Minimum Age Required',
    'form.organization': 'Verifying Organization',
    'form.proofCode': 'Proof Code or QR Scan',
    'form.generate': 'Generate Proof',
    'form.verify': 'Verify Proof',
    
    // Messages
    'message.dataStaysLocal': 'Your data remains on your device',
    'message.proofGenerated': 'Proof Generated Successfully!',
    'message.proofVerified': 'Verification Successful',
    'message.proofFailed': 'Verification Failed',
    'message.loading': 'Generating Zero-Knowledge Proof',
    'message.pleaseWait': 'Please wait while we create your privacy-preserving proof...',
    
    // Security
    'security.title': 'Security Status',
    'security.biometric': 'Biometric Lock',
    'security.encryption': 'Encryption',
    'security.offline': 'Offline Mode',
    'security.allSecure': 'All data encrypted and secure',
    
    // Help
    'help.zkp': 'How ZKP Works',
    'help.userGuide': 'User Guide',
    'help.support': 'Support',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.viewAll': 'View All',
  },
  np: {
    // Navigation
    'nav.dashboard': 'ड्यासबोर्ड',
    'nav.generateProof': 'प्रमाण उत्पन्न गर्नुहोस्',
    'nav.verify': 'प्रमाणित गर्नुहोस्',
    'nav.help': 'सहायता',
    'nav.accountSettings': 'खाता सेटिङहरू',
    
    // Welcome Section
    'welcome.title': 'वेरिडिटीमा स्वागत छ',
    'welcome.subtitle': 'प्राइभेसी-केन्द्रित डिजिटल पहिचान प्लेटफर्म',
    'welcome.description': 'संवेदनशील व्यक्तिगत डेटा प्रकट नगरी तपाईंको पहिचान विशेषताहरू सुरक्षित रूपमा प्रमाणित गर्नुहोस्। उमेर, नागरिकता, शिक्षा, र थप कुराहरूका लागि जेरो-नॉलेज प्रूफहरू उत्पन्न गर्नुहोस्।',
    'welcome.generateProof': 'नयाँ प्रमाण उत्पन्न गर्नुहोस्',
    'welcome.verifyProof': 'प्रमाण प्रमाणित गर्नुहोस्',
    
    // Stats
    'stats.proofsGenerated': 'प्रमाणहरू उत्पन्न',
    'stats.verifications': 'प्रमाणीकरणहरू',
    'stats.trustedOrgs': 'विश्वसनीय संस्थाहरू',
    'stats.privacyProtected': 'गोपनीयता सुरक्षित',
    
    // Proof Types
    'proof.age.title': 'उमेर प्रमाणीकरण',
    'proof.age.description': 'तपाईं १८, २१, वा विशिष्ट उमेरका आवश्यकताहरू पूरा गर्ने प्रमाण',
    'proof.citizenship.title': 'नागरिकता',
    'proof.citizenship.description': 'नेपाली नागरिकता स्थिति निजी रूपमा प्रमाणित गर्नुहोस्',
    'proof.education.title': 'शिक्षा',
    'proof.education.description': 'डिग्री र योग्यता प्रमाणपत्रहरू प्रमाणित गर्नुहोस्',
    'proof.income.title': 'आय',
    'proof.income.description': 'आय स्तर वा दायरा प्रमाण',
    'proof.address.title': 'ठेगाना',
    'proof.address.description': 'विशिष्ट स्थानमा निवास प्रमाण',
    
    // Forms
    'form.proofType': 'प्रमाण प्रकार',
    'form.dateOfBirth': 'जन्म मिति',
    'form.minimumAge': 'न्यूनतम आवश्यक उमेर',
    'form.organization': 'प्रमाणीकरण संस्था',
    'form.proofCode': 'प्रमाण कोड वा QR स्क्यान',
    'form.generate': 'प्रमाण उत्पन्न गर्नुहोस्',
    'form.verify': 'प्रमाणित गर्नुहोस्',
    
    // Messages
    'message.dataStaysLocal': 'तपाईंको डेटा तपाईंको उपकरणमा रहन्छ',
    'message.proofGenerated': 'प्रमाण सफलतापूर्वक उत्पन्न भयो!',
    'message.proofVerified': 'प्रमाणीकरण सफल',
    'message.proofFailed': 'प्रमाणीकरण असफल',
    'message.loading': 'जेरो-नॉलेज प्रूफ उत्पन्न गर्दै',
    'message.pleaseWait': 'कृपया पर्खनुहोस् जब हामी तपाईंको गोपनीयता-संरक्षण प्रूफ सिर्जना गर्छौं...',
    
    // Security
    'security.title': 'सुरक्षा स्थिति',
    'security.biometric': 'बायोमेट्रिक लक',
    'security.encryption': 'एन्क्रिप्शन',
    'security.offline': 'अफलाइन मोड',
    'security.allSecure': 'सबै डेटा एन्क्रिप्ट र सुरक्षित',
    
    // Help
    'help.zkp': 'ZKP कसरी काम गर्छ',
    'help.userGuide': 'प्रयोगकर्ता गाइड',
    'help.support': 'सहायता',
    
    // Common
    'common.loading': 'लोड हुँदै...',
    'common.error': 'त्रुटि',
    'common.success': 'सफल',
    'common.cancel': 'रद्द गर्नुहोस्',
    'common.close': 'बन्द गर्नुहोस्',
    'common.save': 'सेभ गर्नुहोस्',
    'common.viewAll': 'सबै हेर्नुहोस्',
  }
};

export function useTranslation(language: Language) {
  return {
    t: (key: string): string => {
      const keys = key.split('.');
      let value: any = translations[language];
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return value || key;
    },
    language
  };
}
