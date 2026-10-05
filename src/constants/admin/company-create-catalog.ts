/** Catalogue values for company onboarding — replace with API-backed catalogues when endpoints exist. */

type StateCatalogEntry = Readonly<{ code: string; label: string }>;

/** ISO-style subdivision codes used in platform billing/location payloads. */
const indianStatesAndTerritories: readonly StateCatalogEntry[] = [
  { code: 'AN', label: 'Andaman and Nicobar Islands' },
  { code: 'AP', label: 'Andhra Pradesh' },
  { code: 'AR', label: 'Arunachal Pradesh' },
  { code: 'AS', label: 'Assam' },
  { code: 'BR', label: 'Bihar' },
  { code: 'CH', label: 'Chandigarh' },
  { code: 'CG', label: 'Chhattisgarh' },
  { code: 'DH', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { code: 'DL', label: 'Delhi' },
  { code: 'GA', label: 'Goa' },
  { code: 'GJ', label: 'Gujarat' },
  { code: 'HR', label: 'Haryana' },
  { code: 'HP', label: 'Himachal Pradesh' },
  { code: 'JK', label: 'Jammu and Kashmir' },
  { code: 'JH', label: 'Jharkhand' },
  { code: 'KA', label: 'Karnataka' },
  { code: 'KL', label: 'Kerala' },
  { code: 'LA', label: 'Ladakh' },
  { code: 'LD', label: 'Lakshadweep' },
  { code: 'MP', label: 'Madhya Pradesh' },
  { code: 'MH', label: 'Maharashtra' },
  { code: 'MN', label: 'Manipur' },
  { code: 'ML', label: 'Meghalaya' },
  { code: 'MZ', label: 'Mizoram' },
  { code: 'NL', label: 'Nagaland' },
  { code: 'OD', label: 'Odisha' },
  { code: 'PY', label: 'Puducherry' },
  { code: 'PB', label: 'Punjab' },
  { code: 'RJ', label: 'Rajasthan' },
  { code: 'SK', label: 'Sikkim' },
  { code: 'TN', label: 'Tamil Nadu' },
  { code: 'TG', label: 'Telangana' },
  { code: 'TR', label: 'Tripura' },
  { code: 'UP', label: 'Uttar Pradesh' },
  { code: 'UK', label: 'Uttarakhand' },
  { code: 'WB', label: 'West Bengal' },
];

const usStatesAndTerritories: readonly StateCatalogEntry[] = [
  { code: 'AL', label: 'Alabama' },
  { code: 'AK', label: 'Alaska' },
  { code: 'AZ', label: 'Arizona' },
  { code: 'AR', label: 'Arkansas' },
  { code: 'CA', label: 'California' },
  { code: 'CO', label: 'Colorado' },
  { code: 'CT', label: 'Connecticut' },
  { code: 'DE', label: 'Delaware' },
  { code: 'DC', label: 'District of Columbia' },
  { code: 'FL', label: 'Florida' },
  { code: 'GA', label: 'Georgia' },
  { code: 'HI', label: 'Hawaii' },
  { code: 'ID', label: 'Idaho' },
  { code: 'IL', label: 'Illinois' },
  { code: 'IN', label: 'Indiana' },
  { code: 'IA', label: 'Iowa' },
  { code: 'KS', label: 'Kansas' },
  { code: 'KY', label: 'Kentucky' },
  { code: 'LA', label: 'Louisiana' },
  { code: 'ME', label: 'Maine' },
  { code: 'MD', label: 'Maryland' },
  { code: 'MA', label: 'Massachusetts' },
  { code: 'MI', label: 'Michigan' },
  { code: 'MN', label: 'Minnesota' },
  { code: 'MS', label: 'Mississippi' },
  { code: 'MO', label: 'Missouri' },
  { code: 'MT', label: 'Montana' },
  { code: 'NE', label: 'Nebraska' },
  { code: 'NV', label: 'Nevada' },
  { code: 'NH', label: 'New Hampshire' },
  { code: 'NJ', label: 'New Jersey' },
  { code: 'NM', label: 'New Mexico' },
  { code: 'NY', label: 'New York' },
  { code: 'NC', label: 'North Carolina' },
  { code: 'ND', label: 'North Dakota' },
  { code: 'OH', label: 'Ohio' },
  { code: 'OK', label: 'Oklahoma' },
  { code: 'OR', label: 'Oregon' },
  { code: 'PA', label: 'Pennsylvania' },
  { code: 'RI', label: 'Rhode Island' },
  { code: 'SC', label: 'South Carolina' },
  { code: 'SD', label: 'South Dakota' },
  { code: 'TN', label: 'Tennessee' },
  { code: 'TX', label: 'Texas' },
  { code: 'UT', label: 'Utah' },
  { code: 'VT', label: 'Vermont' },
  { code: 'VA', label: 'Virginia' },
  { code: 'WA', label: 'Washington' },
  { code: 'WV', label: 'West Virginia' },
  { code: 'WI', label: 'Wisconsin' },
  { code: 'WY', label: 'Wyoming' },
  { code: 'AS', label: 'American Samoa' },
  { code: 'GU', label: 'Guam' },
  { code: 'MP', label: 'Northern Mariana Islands' },
  { code: 'PR', label: 'Puerto Rico' },
  { code: 'VI', label: 'U.S. Virgin Islands' },
];

const gbConstituentCountries: readonly StateCatalogEntry[] = [
  { code: 'ENG', label: 'England' },
  { code: 'SCT', label: 'Scotland' },
  { code: 'WLS', label: 'Wales' },
  { code: 'NIR', label: 'Northern Ireland' },
];

const aeEmirates: readonly StateCatalogEntry[] = [
  { code: 'DXB', label: 'Dubai' },
  { code: 'AUH', label: 'Abu Dhabi' },
  { code: 'SHJ', label: 'Sharjah' },
  { code: 'AJM', label: 'Ajman' },
  { code: 'RAK', label: 'Ras Al Khaimah' },
  { code: 'UAQ', label: 'Umm Al Quwain' },
  { code: 'FUJ', label: 'Fujairah' },
];

const caProvincesAndTerritories: readonly StateCatalogEntry[] = [
  { code: 'AB', label: 'Alberta' },
  { code: 'BC', label: 'British Columbia' },
  { code: 'MB', label: 'Manitoba' },
  { code: 'NB', label: 'New Brunswick' },
  { code: 'NL', label: 'Newfoundland and Labrador' },
  { code: 'NS', label: 'Nova Scotia' },
  { code: 'NT', label: 'Northwest Territories' },
  { code: 'NU', label: 'Nunavut' },
  { code: 'ON', label: 'Ontario' },
  { code: 'PE', label: 'Prince Edward Island' },
  { code: 'QC', label: 'Quebec' },
  { code: 'SK', label: 'Saskatchewan' },
  { code: 'YT', label: 'Yukon' },
];

const auStatesAndTerritories: readonly StateCatalogEntry[] = [
  { code: 'ACT', label: 'Australian Capital Territory' },
  { code: 'NSW', label: 'New South Wales' },
  { code: 'NT', label: 'Northern Territory' },
  { code: 'QLD', label: 'Queensland' },
  { code: 'SA', label: 'South Australia' },
  { code: 'TAS', label: 'Tasmania' },
  { code: 'VIC', label: 'Victoria' },
  { code: 'WA', label: 'Western Australia' },
];

export type CompanyVerticalOption = Readonly<{
  code: string;
  label: string;
}>;

/** Backend `VerticalCode` enum — keep in sync with platform seed/OpenAPI. */
export const companyVerticalApiCodes = [
  'RESTAURANT',
  'HOTEL',
  'CLOUD_KITCHEN',
  'CLUB',
  'PUB',
  'CAFE',
  'CATERING',
  'SUPERMARKET',
  'BANQUET',
] as const;

export type CompanyVerticalApiCode = (typeof companyVerticalApiCodes)[number];

export const companyVerticalCatalog: readonly CompanyVerticalOption[] = [
  { code: 'RESTAURANT', label: 'Restaurant' },
  { code: 'HOTEL', label: 'Hotel' },
  { code: 'PUB', label: 'Pub / Bar' },
  { code: 'CLUB', label: 'Club' },
  { code: 'CLOUD_KITCHEN', label: 'Cloud kitchen' },
  { code: 'CAFE', label: 'Cafe' },
  { code: 'CATERING', label: 'Catering' },
  { code: 'SUPERMARKET', label: 'Supermarket' },
  { code: 'BANQUET', label: 'Banquet' },
] as const;

const legacyVerticalCodeToApi: Readonly<Record<string, CompanyVerticalApiCode>> = {
  restaurant: 'RESTAURANT',
  hotel: 'HOTEL',
  pub_bar: 'PUB',
  pub: 'PUB',
  club: 'CLUB',
  cloud_kitchen: 'CLOUD_KITCHEN',
  cafe: 'CAFE',
  catering: 'CATERING',
  supermarket: 'SUPERMARKET',
  banquet: 'BANQUET',
};

/** Maps wizard/catalog values to backend `vertical_codes` entries. */
export function normalizeVerticalCodeForApi(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) return '';
  const legacy = legacyVerticalCodeToApi[trimmed.toLowerCase()];
  if (legacy) return legacy;
  return trimmed.toUpperCase();
}

export type CompanyCountryOption = Readonly<{
  code: string;
  label: string;
}>;

export const companyCountryCatalog: readonly CompanyCountryOption[] = [
  { code: 'IN', label: 'India' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
] as const;

export type CompanyStateOption = Readonly<{
  code: string;
  label: string;
}>;

export function getCompanyStatesForCountry(countryCode: string): readonly CompanyStateOption[] {
  switch (countryCode.trim().toUpperCase()) {
    case 'IN':
      return indianStatesAndTerritories;
    case 'US':
      return usStatesAndTerritories;
    case 'GB':
      return gbConstituentCountries;
    case 'AE':
      return aeEmirates;
    case 'CA':
      return caProvincesAndTerritories;
    case 'AU':
      return auStatesAndTerritories;
    default:
      return [];
  }
}

export const companyTaxRegistrationStatuses = [
  'registered',
  'unregistered',
  'composition',
  'exempt',
] as const;

export const companySubscriptionAssignmentModes = ['inherit', 'dedicated', 'none'] as const;

export const companyActivationModes = ['immediate', 'trial'] as const;

export const companyBillingAccountSources = ['organization', 'company'] as const;

const defaultTimezoneByCountryCode: Record<string, string> = {
  IN: 'Asia/Kolkata',
  US: 'America/New_York',
  GB: 'Europe/London',
  AE: 'Asia/Dubai',
  CA: 'America/Toronto',
  AU: 'Australia/Sydney',
};

export function defaultTimezoneForCountry(countryCode: string): string {
  return defaultTimezoneByCountryCode[countryCode.trim().toUpperCase()] ?? '';
}

const timezoneLabelByIana: Record<string, string> = {
  'Asia/Kolkata': '(GMT+05:30) IST',
  'America/New_York': '(GMT-05:00) EST',
  UTC: '(GMT+00:00) UTC',
};

export const companyTimezoneOptions = Object.entries(timezoneLabelByIana).map(([iana, label]) => ({
  iana,
  label,
}));

export function ianaFromTimezoneLabel(label: string): string {
  const trimmed = label.trim();
  const entry = companyTimezoneOptions.find((item) => item.label === trimmed);
  return entry?.iana ?? trimmed;
}

/** GSTIN state prefix (first two digits) for India — CBIC state/UT codes. */
const gstinStatePrefixByCode: Readonly<Record<string, string>> = {
  JK: '01',
  HP: '02',
  PB: '03',
  CH: '04',
  UK: '05',
  HR: '06',
  DL: '07',
  RJ: '08',
  UP: '09',
  BR: '10',
  SK: '11',
  AR: '12',
  NL: '13',
  MN: '14',
  MZ: '15',
  TR: '16',
  ML: '17',
  AS: '18',
  WB: '19',
  JH: '20',
  OD: '21',
  CG: '22',
  MP: '23',
  GJ: '24',
  DH: '26',
  MH: '27',
  KA: '29',
  GA: '30',
  LD: '31',
  KL: '32',
  TN: '33',
  PY: '34',
  AN: '35',
  TG: '36',
  AP: '37',
  LA: '01',
};

/** GSTIN state prefix (first two digits) for India. */
export function expectedGstinStatePrefix(stateCode: string): string | null {
  return gstinStatePrefixByCode[stateCode.trim().toUpperCase()] ?? null;
}
