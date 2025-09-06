import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Shield, X } from "lucide-react";

interface WhyWeAskProps {
  title: string;
  explanation: string;
  benefits?: string[];
  privacyNote?: string;
  className?: string;
  inline?: boolean;
}

export function WhyWeAsk({ 
  title, 
  explanation, 
  benefits = [], 
  privacyNote,
  className,
  inline = false 
}: WhyWeAskProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (inline) {
    return (
      <div className={cn("", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-text-tertiary hover:text-primary p-1 h-auto"
          data-testid="why-we-ask-toggle"
        >
          <HelpCircle className="h-3 w-3 mr-1" />
          <span className="text-xs">Why we ask this?</span>
        </Button>

        {isOpen && (
          <Card className="mt-2 border-border-subtle">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-medium text-text-primary">
                  {title}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-0 h-auto"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-xs text-text-secondary leading-relaxed">
                {explanation}
              </p>

              {benefits.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-text-primary">Benefits:</p>
                  <ul className="space-y-0.5">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="text-xs text-text-secondary flex items-start gap-1">
                        <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {privacyNote && (
                <div className="flex items-start gap-2 mt-2 p-2 bg-success-bg/20 rounded border border-success-border">
                  <Shield className="h-3 w-3 text-success-text flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-success-text">
                    {privacyNote}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-text-primary">{title}</h3>
        </div>
        
        <p className="text-sm text-text-secondary leading-relaxed">
          {explanation}
        </p>

        {benefits.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text-primary">This helps us:</h4>
            <ul className="space-y-1">
              {benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {privacyNote && (
          <div className="flex items-start gap-3 p-3 bg-success-bg/20 rounded-lg border border-success-border">
            <Shield className="h-4 w-4 text-success-text flex-shrink-0 mt-0.5" />
            <p className="text-sm text-success-text">
              <strong>Privacy Note:</strong> {privacyNote}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Pre-configured explanations for common fields
export const commonExplanations = {
  age: {
    title: "Why we need your age",
    explanation: "Age verification is required for many services and compliance with local regulations.",
    benefits: [
      "Ensure you meet minimum age requirements",
      "Comply with privacy laws (COPPA, GDPR)",
      "Provide age-appropriate content and services"
    ],
    privacyNote: "Only proof of age range is shared, never your exact age or birthday."
  },
  
  citizenship: {
    title: "Why we need citizenship information",
    explanation: "Citizenship verification helps ensure compliance with local laws and eligibility for specific services.",
    benefits: [
      "Verify eligibility for government services",
      "Comply with know-your-customer (KYC) requirements",
      "Ensure access to region-specific features"
    ],
    privacyNote: "Only citizenship status is verified, not your ID number or personal details."
  },
  
  income: {
    title: "Why we ask about income",
    explanation: "Income verification helps determine eligibility for financial services and government programs.",
    benefits: [
      "Qualify for appropriate financial products",
      "Access income-based government services",
      "Ensure responsible lending practices"
    ],
    privacyNote: "Only income range brackets are verified, never exact amounts or financial details."
  },
  
  education: {
    title: "Why we verify education",
    explanation: "Education credentials help verify qualifications for employment and professional services.",
    benefits: [
      "Verify professional qualifications",
      "Access education-specific services",
      "Streamline hiring and credentialing processes"
    ],
    privacyNote: "Only degree level and field are verified, not transcripts or specific institutions."
  },
  
  address: {
    title: "Why we need address information",
    explanation: "Address verification helps establish residency and comply with geographic restrictions.",
    benefits: [
      "Verify local residency for services",
      "Comply with geographic regulations",
      "Ensure appropriate service delivery"
    ],
    privacyNote: "Only geographic region is verified, never your exact address or location."
  },
};