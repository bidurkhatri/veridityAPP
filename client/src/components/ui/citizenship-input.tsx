import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, HelpCircle } from "lucide-react";

interface CitizenshipInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
  showValidation?: boolean;
}

// Nepal citizenship number format: XX-XX-XX-XXXXX
// First 2 digits: District code (01-77)
// Next 2 digits: VDC/Municipality code  
// Next 2 digits: Ward number
// Last 5 digits: Individual number

const DISTRICT_CODES = {
  '01': 'Taplejung', '02': 'Panchthar', '03': 'Ilam', '04': 'Jhapa',
  '05': 'Morang', '06': 'Sunsari', '07': 'Dhankuta', '08': 'Terhathum',
  '09': 'Sankhuwasabha', '10': 'Bhojpur', '11': 'Solukhumbu', '12': 'Okhaldhunga',
  '13': 'Khotang', '14': 'Udayapur', '15': 'Saptari', '16': 'Siraha',
  '17': 'Dhanusa', '18': 'Mahottari', '19': 'Sarlahi', '20': 'Sindhuli',
  '21': 'Ramechhap', '22': 'Dolakha', '23': 'Sindhupalchowk', '24': 'Kavrepalanchowk',
  '25': 'Lalitpur', '26': 'Bhaktapur', '27': 'Kathmandu', '28': 'Nuwakot',
  '29': 'Rasuwa', '30': 'Dhading', '31': 'Makwanpur', '32': 'Rautahat',
  '33': 'Bara', '34': 'Parsa', '35': 'Chitwan', '36': 'Gorkha',
  '37': 'Lamjung', '38': 'Tanahu', '39': 'Syangja', '40': 'Kaski',
  '41': 'Manang', '42': 'Mustang', '43': 'Myagdi', '44': 'Parbat',
  '45': 'Baglung', '46': 'Gulmi', '47': 'Palpa', '48': 'Nawalparasi',
  '49': 'Rupandehi', '50': 'Kapilbastu', '51': 'Arghakhanchi', '52': 'Pyuthan',
  '53': 'Rolpa', '54': 'Rukum', '55': 'Salyan', '56': 'Dang',
  '57': 'Banke', '58': 'Bardiya', '59': 'Surkhet', '60': 'Dailekh',
  '61': 'Jajarkot', '62': 'Dolpa', '63': 'Jumla', '64': 'Kalikot',
  '65': 'Mugu', '66': 'Humla', '67': 'Bajura', '68': 'Bajhang',
  '69': 'Achham', '70': 'Doti', '71': 'Kailali', '72': 'Kanchanpur',
  '73': 'Dadeldhura', '74': 'Baitadi', '75': 'Darchula'
};

export function CitizenshipInput({
  value,
  onChange,
  className,
  error,
  disabled = false,
  showValidation = true,
}: CitizenshipInputProps) {
  const [formattedValue, setFormattedValue] = React.useState(value);
  const [validationState, setValidationState] = React.useState<{
    isValid: boolean;
    message: string;
    district?: string;
  }>({ isValid: false, message: "" });

  const formatCitizenshipNumber = (input: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, "");
    
    // Format as XX-XX-XX-XXXXX (max 13 digits)
    const limited = digits.slice(0, 13);
    
    if (limited.length >= 11) {
      return limited.slice(0, 2) + "-" + limited.slice(2, 4) + "-" + 
             limited.slice(4, 6) + "-" + limited.slice(6, 11);
    } else if (limited.length >= 6) {
      return limited.slice(0, 2) + "-" + limited.slice(2, 4) + "-" + 
             limited.slice(4, 6) + "-" + limited.slice(6);
    } else if (limited.length >= 4) {
      return limited.slice(0, 2) + "-" + limited.slice(2, 4) + "-" + limited.slice(4);
    } else if (limited.length >= 2) {
      return limited.slice(0, 2) + "-" + limited.slice(2);
    }
    return limited;
  };

  const validateCitizenshipNumber = (citizenshipNo: string): {
    isValid: boolean;
    message: string;
    district?: string;
  } => {
    const cleaned = citizenshipNo.replace(/\D/g, "");
    
    if (cleaned.length === 0) {
      return { isValid: false, message: "" };
    }
    
    if (cleaned.length < 13) {
      return { isValid: false, message: "Enter all 13 digits" };
    }

    const districtCode = cleaned.slice(0, 2);
    const vdcCode = cleaned.slice(2, 4);
    const wardNo = cleaned.slice(4, 6);
    const individualNo = cleaned.slice(6, 13);

    // Validate district code
    const districtName = DISTRICT_CODES[districtCode as keyof typeof DISTRICT_CODES];
    if (!districtName) {
      return { isValid: false, message: "Invalid district" };
    }

    // Basic validation for other parts
    const vdcNum = parseInt(vdcCode);
    const wardNum = parseInt(wardNo);
    
    if (vdcNum < 1 || vdcNum > 99) {
      return { isValid: false, message: "Invalid VDC/Municipality code" };
    }
    
    if (wardNum < 1 || wardNum > 35) {
      return { isValid: false, message: "Invalid ward number (1-35)" };
    }

    // Simple checksum validation (mock - real implementation would use actual algorithm)
    const checksum = cleaned.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    if (checksum % 11 === 0) {
      return { 
        isValid: true, 
        message: `Valid • ${districtName} District`,
        district: districtName 
      };
    }

    return { isValid: true, message: `Valid • ${districtName} District`, district: districtName };
  };

  React.useEffect(() => {
    if (showValidation) {
      const validation = validateCitizenshipNumber(formattedValue);
      setValidationState(validation);
    }
  }, [formattedValue, showValidation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatCitizenshipNumber(rawValue);
    setFormattedValue(formatted);
    onChange(formatted);
  };

  const displayError = error || (!validationState.isValid && validationState.message);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Input
          type="text"
          value={formattedValue}
          onChange={handleChange}
          placeholder="XX-XX-XX-XXXXX"
          className={cn(
            "font-mono tracking-wide",
            displayError && "border-danger-border focus:border-danger-border focus:ring-danger-500",
            validationState.isValid && "border-success-border focus:border-success-border"
          )}
          disabled={disabled}
          maxLength={16} // Including dashes
          data-testid="citizenship-input"
        />
        
        {showValidation && formattedValue && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validationState.isValid ? (
              <CheckCircle className="h-4 w-4 text-success-text" data-testid="citizenship-valid-icon" />
            ) : validationState.message ? (
              <AlertCircle className="h-4 w-4 text-danger-text" data-testid="citizenship-invalid-icon" />
            ) : null}
          </div>
        )}
      </div>

      {/* Validation feedback */}
      {showValidation && validationState.message && (
        <div className={cn(
          "flex items-center gap-2 text-sm",
          validationState.isValid ? "text-success-text" : "text-danger-text"
        )}>
          {validationState.isValid ? (
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          <span data-testid="citizenship-validation-message">
            {validationState.message}
          </span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-danger-text">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span data-testid="citizenship-error">{error}</span>
        </div>
      )}

      {/* Help text */}
      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <HelpCircle className="h-3 w-3 flex-shrink-0" />
        <span>
          Format: District-VDC-Ward-Individual (XX-XX-XX-XXXXX)
        </span>
      </div>
    </div>
  );
}