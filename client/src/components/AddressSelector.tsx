/**
 * Fixed cascading address selector with proper portal positioning
 */

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getProvinceNames, getDistrictNames, getMunicipalityNames, type Lang } from '@/data/nepal-admin';

interface AddressSelectorProps {
  language?: Lang;
  onAddressChange?: (address: {
    province?: string;
    district?: string;
    municipality?: string;
  }) => void;
  defaultValues?: {
    province?: string;
    district?: string;
    municipality?: string;
  };
}

export function AddressSelector({ 
  language = 'en', 
  onAddressChange,
  defaultValues = {} 
}: AddressSelectorProps) {
  const [selectedProvince, setSelectedProvince] = useState(defaultValues.province || '');
  const [selectedDistrict, setSelectedDistrict] = useState(defaultValues.district || '');
  const [selectedMunicipality, setSelectedMunicipality] = useState(defaultValues.municipality || '');

  const provinces = getProvinceNames(language);
  const districts = selectedProvince ? getDistrictNames(selectedProvince, language) : [];
  const municipalities = selectedDistrict ? getMunicipalityNames(selectedDistrict, language) : [];

  // Reset dependent fields when parent changes
  useEffect(() => {
    if (selectedProvince !== defaultValues.province) {
      setSelectedDistrict('');
      setSelectedMunicipality('');
    }
  }, [selectedProvince, defaultValues.province]);

  useEffect(() => {
    if (selectedDistrict !== defaultValues.district) {
      setSelectedMunicipality('');
    }
  }, [selectedDistrict, defaultValues.district]);

  // Notify parent of changes
  useEffect(() => {
    onAddressChange?.({
      province: selectedProvince || undefined,
      district: selectedDistrict || undefined,
      municipality: selectedMunicipality || undefined,
    });
  }, [selectedProvince, selectedDistrict, selectedMunicipality, onAddressChange]);

  const labels = {
    en: {
      province: 'Province',
      district: 'District',
      municipality: 'Municipality/VDC',
      selectProvince: 'Select province',
      selectDistrict: 'Select district',
      selectMunicipality: 'Select municipality'
    },
    ne: {
      province: 'प्रदेश',
      district: 'जिल्ला',
      municipality: 'नगरपालिका/गाविस',
      selectProvince: 'प्रदेश छान्नुहोस्',
      selectDistrict: 'जिल्ला छान्नुहोस्',
      selectMunicipality: 'नगरपालिका छान्नुहोस्'
    }
  };

  const t = labels[language];

  return (
    <div className="space-y-4">
      {/* Province Selector */}
      <div className="space-y-2">
        <Label htmlFor="province" className="text-sm font-medium">
          {t.province}
        </Label>
        <Select
          value={selectedProvince}
          onValueChange={setSelectedProvince}
        >
          <SelectTrigger 
            id="province"
            className="w-full"
            data-testid="province-select"
          >
            <SelectValue placeholder={t.selectProvince} />
          </SelectTrigger>
          <SelectContent 
            position="popper"
            sideOffset={8}
            avoidCollisions
            className="z-[1000] max-h-[280px] overflow-auto"
          >
            {provinces.map((province) => (
              <SelectItem 
                key={province.id} 
                value={province.id}
                data-testid={`province-${province.id}`}
              >
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District Selector */}
      <div className="space-y-2">
        <Label htmlFor="district" className="text-sm font-medium">
          {t.district}
        </Label>
        <Select
          value={selectedDistrict}
          onValueChange={setSelectedDistrict}
          disabled={!selectedProvince}
        >
          <SelectTrigger 
            id="district"
            className="w-full"
            data-testid="district-select"
          >
            <SelectValue placeholder={selectedProvince ? t.selectDistrict : t.selectProvince + ' first'} />
          </SelectTrigger>
          <SelectContent 
            position="popper"
            sideOffset={8}
            avoidCollisions
            className="z-[1000] max-h-[280px] overflow-auto"
          >
            {districts.map((district) => (
              <SelectItem 
                key={district.id} 
                value={district.id}
                data-testid={`district-${district.id}`}
              >
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Municipality Selector */}
      <div className="space-y-2">
        <Label htmlFor="municipality" className="text-sm font-medium">
          {t.municipality}
        </Label>
        <Select
          value={selectedMunicipality}
          onValueChange={setSelectedMunicipality}
          disabled={!selectedDistrict}
        >
          <SelectTrigger 
            id="municipality"
            className="w-full"
            data-testid="municipality-select"
          >
            <SelectValue placeholder={selectedDistrict ? t.selectMunicipality : t.selectDistrict + ' first'} />
          </SelectTrigger>
          <SelectContent 
            position="popper"
            sideOffset={8}
            avoidCollisions
            className="z-[1000] max-h-[280px] overflow-auto"
          >
            {municipalities.map((municipality) => (
              <SelectItem 
                key={municipality.id} 
                value={municipality.id}
                data-testid={`municipality-${municipality.id}`}
              >
                {municipality.name}
                <span className="text-xs text-text-tertiary ml-2">
                  ({municipality.type.replace('-', ' ')})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}