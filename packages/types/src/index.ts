export type PermitType = 'AM' | 'A1' | 'A2' | 'A' | 'B';

export interface ClaimItem {
  type:
    | 'MATERIAL_RESPONSIBLE'
    | 'MATERIAL_NON_RESPONSIBLE'
    | 'BODILY_RESPONSIBLE'
    | 'BODILY_NON_RESPONSIBLE'
    | 'THEFT'
    | 'FIRE'
    | 'GLASS'
    | 'OTHER';
  lossDate: string; // ISO 8601 YYYY-MM-DD
}

export type InsurerCancellationReason = 'NON_PAYMENT' | 'RISK_AGGRAVATION' | 'CLAIMS_FREQUENCY' | 'OTHER';
export type LicenseSuspensionReason = 'DRUG' | 'ALCOHOL' | 'SPEEDING' | 'OTHER';

export interface Declarations {
  convictions3y: boolean;
  convictionDate?: string; // ISO 8601 YYYY-MM-DD
  insurerCancellation3y: boolean;
  insurerCancellationDate?: string; // ISO 8601 YYYY-MM-DD
  insurerCancellationReason?: InsurerCancellationReason;
  licenseSuspension5y: boolean;
  licenseSuspensionDate?: string; // ISO 8601 YYYY-MM-DD
  licenseSuspensionReason?: LicenseSuspensionReason;
}

export interface VehicleForm {
  make: string;
  model: string;
  cc: number;
  firstRegistrationDate: string; // ISO 8601
}

export interface IdentityForm {
  garagePostalCode: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string; // ISO 8601 YYYY-MM-DD
  bonusMalus: number; // 0.50..3.50
}

export interface DriverForm {
  permitType: PermitType;
  permitDate: string; // ISO 8601
  insuredMonthsLast48: number; // 0..48
}

export interface DerivedValues {
  permitSeniorityMonths: number;
  vehicleAgeYears: number;
  claimsRecencyMonths: number[];
}

export interface FormState {
  quoteId: string;
  locale: string;
  vehicle: VehicleForm;
  identity: IdentityForm;
  driver: DriverForm;
  declarations: Declarations;
  claims: ClaimItem[];
  derived: DerivedValues;
  consents: { privacy: boolean; marketing: boolean };
}

export interface EmailQuoteRequest extends Omit<FormState, 'identity'> {
  identity: Omit<IdentityForm, 'email'> & { email: string };
}

export interface EmailQuoteResponse {
  quoteId: string;
  status: 'EMAIL_SENT' | 'DECLINED' | 'ERROR';
  providerId?: string;
  declineReason?: string;
}

export type HousingType = 'MAISON' | 'APPARTEMENT';

export interface HabitationQuoteRequest {
  quoteId: string;
  locale: string;
  phone: string;
  housingType: HousingType;
  rooms: number;
  floor: string;
  area: number;
  address: string;
  hasDependency: boolean;
  capital: number;
  hasVeranda: boolean;
  hasFireplace: boolean;
  schoolInsurance: boolean;
  childrenCount?: number;
  email: string;
}

export interface HabitationQuoteResponse {
  quoteId: string;
  status: 'EMAIL_SENT' | 'ERROR';
  providerId?: string;
}
