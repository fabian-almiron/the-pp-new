"use client"

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Shield } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

type StrengthLevel = 0 | 1 | 2 | 3 | 4;

interface StrengthResult {
  score: StrengthLevel;
  feedback: {
    warning: string;
    suggestions: string[];
  };
  crackTimeDisplay: string;
}

export function PasswordStrengthMeter({ 
  password, 
  email = '',
  firstName = '',
  lastName = '' 
}: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState<StrengthResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Don't calculate if password is too short
    if (password.length < 4) {
      setStrength(null);
      return;
    }

    setIsLoading(true);

    // Dynamic import to reduce bundle size (zxcvbn is ~800KB)
    import('zxcvbn').then((zxcvbnModule) => {
      const zxcvbn = zxcvbnModule.default;
      
      // Check password strength with user inputs to catch common patterns
      const userInputs = [email, firstName, lastName, 'pipedpeony', 'piped', 'peony']
        .filter(Boolean)
        .map(s => s.toLowerCase());
      
      const result = zxcvbn(password, userInputs);
      
      setStrength({
        score: result.score as StrengthLevel,
        feedback: {
          warning: result.feedback.warning || '',
          suggestions: result.feedback.suggestions || [],
        },
        crackTimeDisplay: result.crack_times_display.offline_slow_hashing_1e4_per_second,
      });
      
      setIsLoading(false);
    });
  }, [password, email, firstName, lastName]);

  if (!password || password.length < 4) {
    return null;
  }

  if (isLoading || !strength) {
    return (
      <div className="mt-2 text-xs text-gray-500">
        Checking password strength...
      </div>
    );
  }

  const getStrengthConfig = (score: StrengthLevel) => {
    const configs = {
      0: {
        label: 'Very Weak',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <AlertCircle className="h-4 w-4" />,
        width: '20%',
      },
      1: {
        label: 'Weak',
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: <AlertCircle className="h-4 w-4" />,
        width: '40%',
      },
      2: {
        label: 'Fair',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: <Shield className="h-4 w-4" />,
        width: '60%',
      },
      3: {
        label: 'Good',
        color: 'bg-lime-500',
        textColor: 'text-lime-700',
        bgColor: 'bg-lime-50',
        borderColor: 'border-lime-200',
        icon: <CheckCircle className="h-4 w-4" />,
        width: '80%',
      },
      4: {
        label: 'Strong',
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <CheckCircle className="h-4 w-4" />,
        width: '100%',
      },
    };
    return configs[score];
  };

  const config = getStrengthConfig(strength.score);

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${config.color} transition-all duration-300 ease-out`}
            style={{ width: config.width }}
          />
        </div>
      </div>

      {/* Strength Label */}
      <div className="flex items-center gap-2">
        <span className={config.textColor}>
          {config.icon}
        </span>
        <span className={`text-xs font-medium ${config.textColor}`}>
          Password Strength: {config.label}
        </span>
      </div>

      {/* Warning & Suggestions */}
      {(strength.feedback.warning || strength.feedback.suggestions.length > 0) && strength.score < 3 && (
        <div className={`${config.bgColor} ${config.borderColor} border rounded-md p-3 text-xs`}>
          {strength.feedback.warning && (
            <p className={`${config.textColor} font-medium mb-1`}>
              ⚠️ {strength.feedback.warning}
            </p>
          )}
          {strength.feedback.suggestions.length > 0 && (
            <ul className={`${config.textColor} space-y-1 mt-2`}>
              {strength.feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span>•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Security Notice for Weak Passwords */}
      {strength.score < 2 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs">
          <p className="text-amber-800 font-medium mb-1">
            🔒 Security Notice
          </p>
          <p className="text-amber-700">
            This password may be rejected due to security concerns. Please use a stronger password with a mix of uppercase, lowercase, numbers, and symbols.
          </p>
        </div>
      )}

      {/* Success Message for Strong Passwords */}
      {strength.score >= 3 && (
        <div className="flex items-center gap-2 text-xs text-green-700">
          <CheckCircle className="h-4 w-4" />
          <span>Great password! Your account will be secure.</span>
        </div>
      )}
    </div>
  );
}
