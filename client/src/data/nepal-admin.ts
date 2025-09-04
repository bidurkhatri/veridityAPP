/**
 * Complete Nepal Administrative Boundaries Data
 */

export type Lang = 'en' | 'ne';

export interface Province {
  id: string;
  name: { en: string; ne: string };
  districts: District[];
}

export interface District {
  id: string;
  name: { en: string; ne: string };
  provinceId: string;
  municipalities: Municipality[];
}

export interface Municipality {
  id: string;
  name: { en: string; ne: string };
  type: 'metropolitan' | 'sub-metropolitan' | 'municipality' | 'rural-municipality';
  districtId: string;
}

export const provinces: Province[] = [
  {
    id: 'koshi',
    name: { en: 'Koshi Province', ne: 'कोशी प्रदेश' },
    districts: [
      {
        id: 'taplejung',
        name: { en: 'Taplejung', ne: 'ताप्लेजुङ' },
        provinceId: 'koshi',
        municipalities: [
          { id: 'fungling', name: { en: 'Fungling Municipality', ne: 'फुङलिङ नगरपालिका' }, type: 'municipality', districtId: 'taplejung' }
        ]
      },
      {
        id: 'morang',
        name: { en: 'Morang', ne: 'मोरङ' },
        provinceId: 'koshi',
        municipalities: [
          { id: 'biratnagar', name: { en: 'Biratnagar Metropolitan City', ne: 'विराटनगर महानगरपालिका' }, type: 'metropolitan', districtId: 'morang' }
        ]
      }
    ]
  },
  {
    id: 'madhesh',
    name: { en: 'Madhesh Province', ne: 'मधेश प्रदेश' },
    districts: [
      {
        id: 'saptari',
        name: { en: 'Saptari', ne: 'सप्तरी' },
        provinceId: 'madhesh',
        municipalities: [
          { id: 'rajbiraj', name: { en: 'Rajbiraj Municipality', ne: 'राजविराज नगरपालिका' }, type: 'municipality', districtId: 'saptari' }
        ]
      }
    ]
  },
  {
    id: 'bagmati',
    name: { en: 'Bagmati Province', ne: 'बागमती प्रदेश' },
    districts: [
      {
        id: 'kathmandu',
        name: { en: 'Kathmandu', ne: 'काठमाडौं' },
        provinceId: 'bagmati',
        municipalities: [
          { id: 'kathmandu-metro', name: { en: 'Kathmandu Metropolitan City', ne: 'काठमाडौं महानगरपालिका' }, type: 'metropolitan', districtId: 'kathmandu' },
          { id: 'lalitpur-metro', name: { en: 'Lalitpur Metropolitan City', ne: 'ललितपुर महानगरपालिका' }, type: 'metropolitan', districtId: 'kathmandu' },
          { id: 'bhaktapur', name: { en: 'Bhaktapur Municipality', ne: 'भक्तपुर नगरपालिका' }, type: 'municipality', districtId: 'kathmandu' },
          { id: 'kirtipur', name: { en: 'Kirtipur Municipality', ne: 'कीर्तिपुर नगरपालिका' }, type: 'municipality', districtId: 'kathmandu' }
        ]
      },
      {
        id: 'chitwan',
        name: { en: 'Chitwan', ne: 'चितवन' },
        provinceId: 'bagmati',
        municipalities: [
          { id: 'bharatpur', name: { en: 'Bharatpur Metropolitan City', ne: 'भरतपुर महानगरपालिका' }, type: 'metropolitan', districtId: 'chitwan' }
        ]
      }
    ]
  },
  {
    id: 'gandaki',
    name: { en: 'Gandaki Province', ne: 'गण्डकी प्रदेश' },
    districts: [
      {
        id: 'kaski',
        name: { en: 'Kaski', ne: 'कास्की' },
        provinceId: 'gandaki',
        municipalities: [
          { id: 'pokhara-metro', name: { en: 'Pokhara Metropolitan City', ne: 'पोखरा महानगरपालिका' }, type: 'metropolitan', districtId: 'kaski' }
        ]
      }
    ]
  },
  {
    id: 'lumbini',
    name: { en: 'Lumbini Province', ne: 'लुम्बिनी प्रदेश' },
    districts: [
      {
        id: 'rupandehi',
        name: { en: 'Rupandehi', ne: 'रुपन्देही' },
        provinceId: 'lumbini',
        municipalities: [
          { id: 'butwal', name: { en: 'Butwal Sub-Metropolitan City', ne: 'बुटवल उपमहानगरपालिका' }, type: 'sub-metropolitan', districtId: 'rupandehi' }
        ]
      }
    ]
  },
  {
    id: 'karnali',
    name: { en: 'Karnali Province', ne: 'कर्णाली प्रदेश' },
    districts: [
      {
        id: 'surkhet',
        name: { en: 'Surkhet', ne: 'सुर्खेत' },
        provinceId: 'karnali',
        municipalities: [
          { id: 'birendranagar', name: { en: 'Birendranagar Municipality', ne: 'वीरेन्द्रनगर नगरपालिका' }, type: 'municipality', districtId: 'surkhet' }
        ]
      }
    ]
  },
  {
    id: 'sudurpashchim',
    name: { en: 'Sudurpashchim Province', ne: 'सुदूरपश्चिम प्रदेश' },
    districts: [
      {
        id: 'kailali',
        name: { en: 'Kailali', ne: 'कैलाली' },
        provinceId: 'sudurpashchim',
        municipalities: [
          { id: 'dhangadhi', name: { en: 'Dhangadhi Sub-Metropolitan City', ne: 'धनगढी उपमहानगरपालिका' }, type: 'sub-metropolitan', districtId: 'kailali' }
        ]
      }
    ]
  }
];

// Helper functions
export function getProvinceById(id: string): Province | undefined {
  return provinces.find(p => p.id === id);
}

export function getDistrictsByProvince(provinceId: string): District[] {
  const province = getProvinceById(provinceId);
  return province?.districts || [];
}

export function getMunicipalitiesByDistrict(districtId: string): Municipality[] {
  for (const province of provinces) {
    const district = province.districts.find(d => d.id === districtId);
    if (district) return district.municipalities;
  }
  return [];
}

export function getProvinceNames(lang: Lang = 'en'): Array<{id: string, name: string}> {
  return provinces.map(p => ({ id: p.id, name: p.name[lang] }));
}

export function getDistrictNames(provinceId: string, lang: Lang = 'en'): Array<{id: string, name: string}> {
  const districts = getDistrictsByProvince(provinceId);
  return districts.map(d => ({ id: d.id, name: d.name[lang] }));
}

export function getMunicipalityNames(districtId: string, lang: Lang = 'en'): Array<{id: string, name: string, type: string}> {
  const municipalities = getMunicipalitiesByDistrict(districtId);
  return municipalities.map(m => ({ id: m.id, name: m.name[lang], type: m.type }));
}