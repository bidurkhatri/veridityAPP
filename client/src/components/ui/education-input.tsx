import * as React from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";

interface EducationInputProps {
  level: string;
  institution: string;
  onLevelChange: (level: string) => void;
  onInstitutionChange: (institution: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
}

const EDUCATION_LEVELS = [
  { value: 'primary', label: 'Primary Education (Class 1-5)', priority: 1 },
  { value: 'lower-secondary', label: 'Lower Secondary (Class 6-8)', priority: 2 },
  { value: 'secondary', label: 'Secondary (Class 9-10)', priority: 3 },
  { value: 'higher-secondary', label: 'Higher Secondary (+2)', priority: 4 },
  { value: 'bachelor', label: 'Bachelor\'s Degree', priority: 5 },
  { value: 'master', label: 'Master\'s Degree', priority: 6 },
  { value: 'doctorate', label: 'Doctorate/PhD', priority: 7 },
  { value: 'diploma', label: 'Diploma/Certificate', priority: 4 },
  { value: 'technical', label: 'Technical/Vocational', priority: 4 },
];

const NEPAL_INSTITUTIONS = [
  // Universities
  'Tribhuvan University',
  'Kathmandu University', 
  'Pokhara University',
  'Purbanchal University',
  'Mid-Western University',
  'Far-Western University',
  'Nepal Open University',
  'Agriculture and Forestry University',
  'National Academy of Medical Sciences',
  'Lumbini Buddhist University',
  'Gandaki University',
  'Rajarshi Janak University',
  
  // Colleges (Popular ones)
  'Tri-Chandra College',
  'Amrit Campus',
  'Padma Kanya Campus',
  'Ratna Rajyalaxmi Campus',
  'Nepal Commerce Campus',
  'Shanker Dev Campus',
  'Birendra Multiple Campus',
  'Mahendra Multiple Campus',
  'Prithvi Narayan Campus',
  'Dharan Multiple Campus',
  'Thakur Ram Multiple Campus',
  'Butwal Multiple Campus',
  
  // Professional Institutions
  'Institute of Engineering (IOE)',
  'Institute of Medicine (IOM)',
  'Institute of Forestry (IOF)',
  'Institute of Agriculture and Animal Sciences (IAAS)',
  'Pulchowk Campus',
  'Paschimanchal Campus',
  'NIST College',
  'Nepal Law Campus',
  'Central Department of Management',
  'Central Department of Economics',
];

export function EducationInput({
  level,
  institution,
  onLevelChange,
  onInstitutionChange,
  className,
  error,
  disabled = false,
}: EducationInputProps) {
  const [institutionSuggestions, setInstitutionSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [institutionInput, setInstitutionInput] = React.useState(institution);

  React.useEffect(() => {
    setInstitutionInput(institution);
  }, [institution]);

  const handleInstitutionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInstitutionInput(value);
    onInstitutionChange(value);

    // Filter suggestions based on input
    if (value.length > 1) {
      const filtered = NEPAL_INSTITUTIONS.filter(inst =>
        inst.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setInstitutionSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInstitutionInput(suggestion);
    onInstitutionChange(suggestion);
    setShowSuggestions(false);
  };

  const selectedLevel = EDUCATION_LEVELS.find(edu => edu.value === level);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Education Level Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Education Level
        </label>
        <Select
          value={level}
          onValueChange={onLevelChange}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn(error && "border-danger-border focus:border-danger-border")}
            data-testid="education-level-select"
          >
            <SelectValue placeholder="Select your highest education level" />
          </SelectTrigger>
          <SelectContent>
            {EDUCATION_LEVELS.map((edu) => (
              <SelectItem 
                key={edu.value} 
                value={edu.value}
                data-testid={`education-level-${edu.value}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{edu.label}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    Level {edu.priority}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedLevel && (
          <div className="text-xs text-text-tertiary">
            Selected: {selectedLevel.label}
          </div>
        )}
      </div>

      {/* Institution Input with Autocomplete */}
      <div className="space-y-2 relative">
        <label className="text-sm font-medium text-text-primary">
          Institution Name
        </label>
        <Input
          type="text"
          value={institutionInput}
          onChange={handleInstitutionInputChange}
          onFocus={() => {
            if (institutionSuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // Delay hiding suggestions to allow clicks
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder="Start typing your school/college/university name..."
          className={cn(error && "border-danger-border focus:border-danger-border")}
          disabled={disabled}
          data-testid="institution-input"
        />

        {/* Autocomplete Suggestions */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 z-50 bg-surface border border-border-default rounded-md shadow-lg max-h-48 overflow-y-auto">
            {institutionSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-surface-secondary focus:bg-surface-secondary focus:outline-none text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
                data-testid={`institution-suggestion-${index}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
        <div className="text-xs text-text-tertiary">
          Common Nepal institutions will appear as suggestions
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-danger-text" data-testid="education-error">
          {error}
        </div>
      )}

      {/* Education Progress Indicator */}
      {level && (
        <div className="mt-4 p-3 bg-surface-secondary/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-text-primary">Education Progress</span>
            <Badge className="bg-primary text-primary-foreground">
              Level {selectedLevel?.priority || 1}
            </Badge>
          </div>
          <div className="mt-2">
            <div className="w-full bg-surface-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((selectedLevel?.priority || 1) / 7) * 100}%`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-text-tertiary mt-1">
              <span>Primary</span>
              <span>Doctorate</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}