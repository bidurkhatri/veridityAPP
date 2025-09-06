// Content Standards for Veridity - Hemingway Grade ≤ 6

export const contentStandards = {
  // Privacy content - short, punchy lines
  privacy: {
    main: "Your data stays private. Only proof is shared.",
    zkExplanation: "Zero-knowledge proofs verify without revealing personal details.",
    localProcessing: "All verification happens on your device.",
    noDataSharing: "We never see your personal information.",
    learnMoreLink: "How does zero-knowledge work?"
  },

  // Normalized labels - Title Case for headers, Sentence case for body/buttons
  labels: {
    // Headers (Title Case)
    pageHeaders: {
      dashboard: "Dashboard",
      generateProof: "Generate Proof", 
      proofHistory: "Proof History",
      settings: "Settings",
      organization: "Organization",
      adminPanel: "Admin Panel"
    },
    
    // Section headers (Title Case)
    sectionHeaders: {
      recentActivity: "Recent Activity",
      securitySettings: "Security Settings",
      privacyControls: "Privacy Controls",
      accountRecovery: "Account Recovery",
      apiKeys: "API Keys",
      accessControl: "Access Control"
    },

    // Form labels (Sentence case)
    formLabels: {
      dateOfBirth: "Date of birth",
      citizenshipNumber: "Citizenship number", 
      monthlyIncome: "Monthly income",
      educationLevel: "Education level",
      apiKeyName: "API key name",
      recoveryPhrase: "Recovery phrase"
    },

    // Buttons (Sentence case)
    buttons: {
      generateProof: "Generate proof",
      scanCode: "Scan QR code",
      viewHistory: "View history",
      downloadProof: "Download proof",
      shareProof: "Share proof",
      saveSettings: "Save settings",
      createKey: "Create API key",
      backupAccount: "Backup account",
      continueSetup: "Continue setup",
      completeVerification: "Complete verification",
      learnMore: "Learn more",
      getStarted: "Get started",
      tryAgain: "Try again"
    },

    // Status messages (Sentence case) 
    status: {
      verificationComplete: "Verification complete",
      proofGenerated: "Proof generated successfully",
      backupCreated: "Backup created",
      settingsSaved: "Settings saved",
      keyCreated: "API key created",
      errorOccurred: "An error occurred",
      tryingAgain: "Trying again..."
    },

    // Help text (Sentence case, simple language)
    help: {
      ageVerification: "Prove you meet age requirements without sharing your birthday.",
      citizenshipProof: "Verify citizenship status without revealing your ID number.",
      incomeVerification: "Show income level without sharing exact amounts.",
      educationProof: "Verify education level without sharing transcripts.",
      apiKeyUsage: "Use this key to access Veridity services from your app.",
      recoveryPhrase: "Save this phrase to recover your account if you lose access."
    }
  }
};

// Simple language validator for Hemingway grade ≤ 6
export function validateReadabilityGrade(text: string): { grade: number; suggestions: string[] } {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const syllables = countSyllables(text);
  
  // Simplified Hemingway formula
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  const grade = Math.round(
    0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59
  );

  const suggestions: string[] = [];
  
  if (avgSentenceLength > 14) {
    suggestions.push("Use shorter sentences (under 14 words)");
  }
  
  if (avgSyllablesPerWord > 1.5) {
    suggestions.push("Use simpler words (fewer syllables)");
  }
  
  if (grade > 6) {
    suggestions.push("Break complex ideas into smaller parts");
    suggestions.push("Remove unnecessary words");
    suggestions.push("Use active voice instead of passive");
  }

  return { grade, suggestions };
}

function countSyllables(text: string): number {
  return text
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/[aeiouy]+/g, 'a')
    .replace(/a$/, '')
    .length || 1;
}

// Content review helper
export function reviewContent(content: Record<string, string>) {
  const results: Array<{ key: string; grade: number; suggestions: string[] }> = [];
  
  Object.entries(content).forEach(([key, text]) => {
    const analysis = validateReadabilityGrade(text);
    if (analysis.grade > 6 || analysis.suggestions.length > 0) {
      results.push({ key, ...analysis });
    }
  });
  
  return results;
}