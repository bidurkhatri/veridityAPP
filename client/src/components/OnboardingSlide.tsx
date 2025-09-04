import { Card, CardContent } from "@/components/ui/card";
import onboardingImage from "@assets/generated_images/Data_privacy_illustration_0a17e3a9.png";
import zkProofImage from "@assets/generated_images/Zero-knowledge_proof_concept_f0a963d2.png";

interface OnboardingSlideProps {
  step: number;
  title: string;
  description: string;
  maxSteps: number;
}

export function OnboardingSlide({ step, title, description, maxSteps }: OnboardingSlideProps) {
  const getImage = () => {
    switch (step) {
      case 1:
        return onboardingImage;
      case 2:
        return zkProofImage;
      default:
        return onboardingImage;
    }
  };

  return (
    <Card className="bg-surface shadow-elev1 rounded-card border max-w-md mx-auto">
      <CardContent className="p-8 text-center space-y-6">
        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2 mb-4">
          {Array.from({ length: maxSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i + 1 <= step ? 'bg-brand-primary' : 'bg-surfaceAlt'
              }`}
            />
          ))}
        </div>

        {/* Illustration */}
        <div className="flex justify-center">
          <img 
            src={getImage()} 
            alt={`Step ${step} illustration`}
            className="w-48 h-36 object-cover rounded-lg shadow-elev1"
          />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-text-primary">
            {title}
          </h2>
          <p className="text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>

        {/* Step indicator */}
        <div className="text-sm text-text-muted">
          Step {step} of {maxSteps}
        </div>
      </CardContent>
    </Card>
  );
}