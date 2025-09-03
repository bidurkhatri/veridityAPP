import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useAnimation } from "framer-motion";

// Enhanced loading animation for proof generation
export function ProofGenerationAnimation({ isGenerating, onComplete }: { 
  isGenerating: boolean; 
  onComplete: () => void;
}) {
  const [stage, setStage] = useState(0);
  const stages = [
    "Preparing cryptographic keys...",
    "Generating zero-knowledge proof...",
    "Securing your private data...",
    "Finalizing verification...",
    "Proof ready!"
  ];

  useEffect(() => {
    if (!isGenerating) return;
    
    const interval = setInterval(() => {
      setStage(prev => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return prev;
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isGenerating, onComplete]);

  if (!isGenerating) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex items-center justify-center"
    >
      <div className="text-center space-y-6">
        <motion.div
          className="w-24 h-24 mx-auto relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <motion.div
            className="absolute inset-4 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <span className="text-white text-2xl">🔐</span>
          </motion.div>
        </motion.div>
        
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-2"
        >
          <h3 className="text-xl font-bold">Generating Secure Proof</h3>
          <p className="text-muted-foreground">{stages[stage]}</p>
        </motion.div>
        
        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: "0%" }}
            animate={{ width: `${((stage + 1) / stages.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Success animation for completed actions
export function SuccessAnimation({ show, message, onComplete }: {
  show: boolean;
  message: string;
  onComplete: () => void;
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 bg-success/10 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            className="bg-background border border-success/20 rounded-2xl p-8 text-center space-y-4 shadow-2xl"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-success to-emerald-500 rounded-full mx-auto flex items-center justify-center"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-white text-2xl"
              >
                ✓
              </motion.span>
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-xl font-bold text-success"
            >
              Success!
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-muted-foreground"
            >
              {message}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Animated card entrance
export function AnimatedCard({ children, delay = 0, className = "" }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Floating action button with pulse
export function FloatingActionButton({ onClick, icon, label }: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className="fixed bottom-24 right-6 bg-gradient-to-r from-primary to-primary-600 text-white p-4 rounded-full shadow-lg z-40"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{ 
        boxShadow: isHovered 
          ? "0 20px 40px rgba(0,0,0,0.15)" 
          : "0 10px 20px rgba(0,0,0,0.1)" 
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      aria-label={label}
    >
      <motion.div
        animate={{ rotate: isHovered ? 15 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>
      
      {/* Pulse effect */}
      <motion.div
        className="absolute inset-0 bg-primary rounded-full"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.7, 0, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.button>
  );
}

// Page transition wrapper
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

// Staggered list animation
export function StaggeredList({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

export function StaggeredListItem({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {children}
    </motion.div>
  );
}

// Haptic feedback simulation
export function useHapticFeedback() {
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [30],
        heavy: [50]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  return { triggerHaptic };
}