// Content Microcopy Utility - Brief Requirements
// Replace long privacy paragraphs, normalize case rules, unify status language

export const microcopy = {
  // Short, scannable privacy texts
  privacy: {
    short: "Your data stays on your device. We only verify the proof, not the data itself.",
    zkProof: "Zero-knowledge proof: We verify claims without seeing your information.",
    dataRetention: "Proofs auto-delete after the time you choose. We don't store personal data.",
    biometric: "Biometric data never leaves your device. Only verification results are shared."
  },

  // Normalized status language
  status: {
    verified: "Verified",
    pending: "Pending", 
    failed: "Failed",
    expired: "Expired",
    processing: "Processing",
    ready: "Ready"
  },

  // Unified case rules - Sentence case for UI, Title Case for headings
  buttons: {
    // Use sentence case for buttons
    generateProof: "Generate proof",
    shareProof: "Share proof", 
    downloadProof: "Download proof",
    copyLink: "Copy link",
    tryAgain: "Try again",
    getStarted: "Get started",
    learnMore: "Learn more",
    signIn: "Sign in",
    signOut: "Sign out"
  },

  headings: {
    // Use Title Case for page headings
    dashboard: "Dashboard",
    proofGeneration: "Proof Generation", 
    proofHistory: "Proof History",
    settings: "Settings",
    privacySettings: "Privacy Settings",
    walletBackup: "Wallet Backup"
  },

  // Error messages - Clear and actionable
  errors: {
    network: "Connection issue. Please check your internet and try again.",
    validation: "Please check the highlighted fields and try again.",
    biometric: "Biometric authentication failed. Try again or use an alternative method.",
    expired: "This proof has expired. Generate a new one to continue.",
    invalidProof: "This proof could not be verified. Please generate a new one."
  },

  // Success messages - Brief and encouraging
  success: {
    proofGenerated: "Proof generated successfully!",
    proofShared: "Proof shared successfully!",
    settingsSaved: "Settings saved",
    linkCopied: "Link copied to clipboard",
    backupCreated: "Backup created successfully"
  },

  // Helper text - Contextual and brief
  helpers: {
    citizenship: "Enter your citizenship number as shown on your ID",
    dateOfBirth: "Enter date in YYYY-MM-DD format",
    phone: "Enter your mobile number with country code",
    backup: "Create a backup to secure your proofs across devices"
  }
};

// Helper function to get microcopy by key path
export function getMicrocopy(path: string): string {
  const keys = path.split('.');
  let current: any = microcopy;
  
  for (const key of keys) {
    current = current[key];
    if (!current) return path; // Return the path if not found
  }
  
  return typeof current === 'string' ? current : path;
}

// Status formatting utility
export function formatStatus(status: string): string {
  return microcopy.status[status as keyof typeof microcopy.status] || status;
}

// Button text utility 
export function getButtonText(action: string): string {
  return microcopy.buttons[action as keyof typeof microcopy.buttons] || action;
}