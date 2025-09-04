/**
 * Nepal Cultural Theme Component with Festival-Aware UI
 * Adapts colors, imagery, and messaging based on Nepali festivals and culture
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { nepalCulturalColors } from '@/lib/i18n/nepali-translations';

interface NepaliFestival {
  name: string;
  nameNepali: string;
  startDate: Date;
  endDate: Date;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  greeting: string;
  greetingNepali: string;
  emoji: string;
}

interface ProvinceInfo {
  name: string;
  nameNepali: string;
  capital: string;
  capitalNepali: string;
  colors: string[];
  culturalElements: string[];
}

export function NepalCulturalTheme() {
  const { t, language } = useTranslation();
  const [currentFestival, setCurrentFestival] = useState<NepaliFestival | null>(null);
  const [userProvince, setUserProvince] = useState<ProvinceInfo | null>(null);
  const [showCulturalCard, setShowCulturalCard] = useState(false);

  // Nepal's major festivals with approximate dates
  const nepaliFestivals: NepaliFestival[] = [
    {
      name: 'Dashain',
      nameNepali: 'दशैं',
      startDate: new Date(2024, 9, 15), // October 15 (approximate)
      endDate: new Date(2024, 9, 25),   // October 25
      colors: nepalCulturalColors.dashain,
      greeting: 'Happy Dashain!',
      greetingNepali: 'दशैंको शुभकामना!',
      emoji: '🎭'
    },
    {
      name: 'Tihar',
      nameNepali: 'तिहार',
      startDate: new Date(2024, 10, 1), // November 1 (approximate)
      endDate: new Date(2024, 10, 5),   // November 5
      colors: nepalCulturalColors.tihar,
      greeting: 'Happy Tihar!',
      greetingNepali: 'तिहारको शुभकामना!',
      emoji: '🪔'
    },
    {
      name: 'Holi',
      nameNepali: 'होली',
      startDate: new Date(2024, 2, 25), // March 25 (approximate)
      endDate: new Date(2024, 2, 26),   // March 26
      colors: nepalCulturalColors.holi,
      greeting: 'Happy Holi!',
      greetingNepali: 'होलीको शुभकामना!',
      emoji: '🌈'
    }
  ];

  // Nepal's 7 provinces with cultural info
  const provinces: ProvinceInfo[] = [
    {
      name: 'Province 1',
      nameNepali: 'प्रदेश नं. १',
      capital: 'Biratnagar',
      capitalNepali: 'विराटनगर',
      colors: ['#1E40AF', '#DC2626'],
      culturalElements: ['Tea Gardens', 'Koshi River', 'Mount Everest View']
    },
    {
      name: 'Madhesh Pradesh',
      nameNepali: 'मधेस प्रदेश',
      capital: 'Janakpur',
      capitalNepali: 'जनकपुर',
      colors: ['#DC2626', '#FBBF24'],
      culturalElements: ['Birthplace of Sita', 'Terai Plains', 'Mithila Culture']
    },
    {
      name: 'Bagmati Pradesh',
      nameNepali: 'बागमती प्रदेश',
      capital: 'Kathmandu',
      capitalNepali: 'काठमाडौं',
      colors: ['#7C3AED', '#DC2626'],
      culturalElements: ['Valley Culture', 'UNESCO Heritage', 'Newar Traditions']
    },
    {
      name: 'Gandaki Pradesh',
      nameNepali: 'गण्डकी प्रदेश',
      capital: 'Pokhara',
      capitalNepali: 'पोखरा',
      colors: ['#059669', '#0EA5E9'],
      culturalElements: ['Mountain Views', 'Adventure Tourism', 'Gurung Culture']
    },
    {
      name: 'Lumbini Pradesh',
      nameNepali: 'लुम्बिनी प्रदेश',
      capital: 'Butwal',
      capitalNepali: 'बुटवल',
      colors: ['#F59E0B', '#8B5CF6'],
      culturalElements: ['Birthplace of Buddha', 'Religious Tourism', 'Tharu Culture']
    },
    {
      name: 'Karnali Pradesh',
      nameNepali: 'कर्णाली प्रदेश',
      capital: 'Surkhet',
      capitalNepali: 'सुर्खेत',
      colors: ['#10B981', '#F59E0B'],
      culturalElements: ['Remote Mountains', 'Traditional Lifestyle', 'Pristine Nature']
    },
    {
      name: 'Sudurpashchim Pradesh',
      nameNepali: 'सुदूरपश्चिम प्रदेश',
      capital: 'Godawari',
      capitalNepali: 'गोदावरी',
      colors: ['#DC2626', '#10B981'],
      culturalElements: ['Far West Culture', 'Mahakali River', 'Traditional Arts']
    }
  ];

  useEffect(() => {
    checkCurrentFestival();
    loadUserLocation();
    
    // Update festival check daily
    const festivalInterval = setInterval(checkCurrentFestival, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(festivalInterval);
  }, []);

  const checkCurrentFestival = () => {
    const now = new Date();
    const activeFestival = nepaliFestivals.find(festival => 
      now >= festival.startDate && now <= festival.endDate
    );
    
    if (activeFestival !== currentFestival) {
      setCurrentFestival(activeFestival);
      if (activeFestival) {
        setShowCulturalCard(true);
        // Apply festival theme to document
        applyFestivalTheme(activeFestival);
      } else {
        // Reset to default theme
        resetToDefaultTheme();
      }
    }
  };

  const loadUserLocation = () => {
    // Try to determine user's province (could be from localStorage, geolocation, or user setting)
    const savedProvince = localStorage.getItem('user-province');
    if (savedProvince) {
      const province = provinces.find(p => p.name === savedProvince);
      setUserProvince(province || null);
    }
  };

  const applyFestivalTheme = (festival: NepaliFestival) => {
    // Update CSS custom properties for festival colors
    document.documentElement.style.setProperty('--festival-primary', festival.colors.primary);
    document.documentElement.style.setProperty('--festival-secondary', festival.colors.secondary);
    document.documentElement.style.setProperty('--festival-accent', festival.colors.accent);
    
    // Add festival class to body
    document.body.classList.add('festival-theme');
    document.body.setAttribute('data-festival', festival.name.toLowerCase());
  };

  const resetToDefaultTheme = () => {
    document.body.classList.remove('festival-theme');
    document.body.removeAttribute('data-festival');
  };

  const selectProvince = (province: ProvinceInfo) => {
    setUserProvince(province);
    localStorage.setItem('user-province', province.name);
  };

  const getNepaliDate = () => {
    // Simplified Nepali date conversion (would need proper BS calendar conversion)
    const today = new Date();
    const months = [
      'बैशाख', 'जेठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
      'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
    ];
    
    // This is a mock conversion - in production, use proper BS calendar library
    const nepaliYear = today.getFullYear() + 57; // Approximate
    const nepaliMonth = months[today.getMonth()];
    const nepaliDay = today.getDate();
    
    return `${nepaliYear} ${nepaliMonth} ${nepaliDay}`;
  };

  return (
    <>
      {/* Festival Celebration Card */}
      {currentFestival && showCulturalCard && (
        <Card 
          className="mb-6 overflow-hidden relative"
          style={{
            background: `linear-gradient(135deg, ${currentFestival.colors.primary}20 0%, ${currentFestival.colors.secondary}20 100%)`,
            borderColor: currentFestival.colors.primary
          }}
        >
          <div className="p-4 relative">
            <button
              onClick={() => setShowCulturalCard(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            
            <div className="flex items-center gap-4">
              <div className="text-4xl">{currentFestival.emoji}</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">
                  {language === 'np' ? currentFestival.greetingNepali : currentFestival.greeting}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {language === 'np' 
                    ? `${currentFestival.nameNepali} को शुभ अवसरमा Veridity परिवारको तर्फबाट हार्दिक शुभकामना!`
                    : `Warm wishes from the Veridity family on the auspicious occasion of ${currentFestival.name}!`
                  }
                </p>
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ borderColor: currentFestival.colors.primary, color: currentFestival.colors.primary }}
              >
                {language === 'np' ? 'विशेष पर्व' : 'Special Festival'}
              </Badge>
              <span className="text-xs text-gray-500">
                {language === 'np' ? getNepaliDate() : currentFestival.endDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Province Selection Card */}
      {!userProvince && (
        <Card className="mb-6 p-4 border-dashed border-2 border-blue-200">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            🏔️ {language === 'np' ? 'तपाईंको प्रदेश छान्नुहोस्' : 'Select Your Province'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {language === 'np' 
              ? 'स्थानीय सेवाहरू र सांस्कृतिक सामग्रीहरूको लागि तपाईंको प्रदेश चयन गर्नुहोस्।'
              : 'Choose your province for localized services and cultural content.'
            }
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {provinces.map((province, index) => (
              <Button
                key={province.name}
                variant="outline"
                size="sm"
                className="justify-start h-auto py-2 px-3"
                onClick={() => selectProvince(province)}
              >
                <div className="text-left">
                  <div className="font-medium text-sm">
                    {language === 'np' ? province.nameNepali : province.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {language === 'np' ? province.capitalNepali : province.capital}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Province-Specific Information */}
      {userProvince && (
        <Card className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 rounded" style={{
                background: `linear-gradient(90deg, ${userProvince.colors[0]} 50%, ${userProvince.colors[1]} 50%)`
              }}></div>
              <div>
                <h4 className="font-medium">
                  {language === 'np' ? userProvince.nameNepali : userProvince.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {language === 'np' ? userProvince.capitalNepali : userProvince.capital}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUserProvince(null)}
              className="text-gray-500"
            >
              {language === 'np' ? 'परिवर्तन' : 'Change'}
            </Button>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {userProvince.culturalElements.map((element, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {element}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Cultural Calendar Widget */}
      <div className="text-center py-2 text-sm text-gray-500 border-t">
        <div className="flex items-center justify-center gap-4">
          <span>🗓️ {language === 'np' ? getNepaliDate() : new Date().toLocaleDateString()}</span>
          {currentFestival && (
            <span style={{ color: currentFestival.colors.primary }}>
              {currentFestival.emoji} {language === 'np' ? currentFestival.nameNepali : currentFestival.name}
            </span>
          )}
        </div>
      </div>

      {/* Cultural CSS Styles */}
      <style jsx global>{`
        .festival-theme .primary-button {
          background: var(--festival-primary, #3B82F6) !important;
        }
        
        .festival-theme .accent-color {
          color: var(--festival-accent, #8B5CF6) !important;
        }
        
        .festival-theme[data-festival="dashain"] {
          --primary-color: ${nepalCulturalColors.dashain.primary};
        }
        
        .festival-theme[data-festival="tihar"] {
          --primary-color: ${nepalCulturalColors.tihar.primary};
        }
        
        .festival-theme[data-festival="holi"] {
          --primary-color: ${nepalCulturalColors.holi.primary};
        }

        /* Nepali typography enhancements */
        [lang="np"] {
          font-family: 'Noto Sans Devanagari', sans-serif;
          line-height: 1.6;
        }
        
        /* Cultural animations */
        .festival-theme .celebration-pulse {
          animation: celebrationPulse 2s infinite;
        }
        
        @keyframes celebrationPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* Province-specific styling could be added here */
        .bagmati-theme { --region-accent: #7C3AED; }
        .gandaki-theme { --region-accent: #059669; }
        /* ... other provinces */
      `}</style>
    </>
  );
}