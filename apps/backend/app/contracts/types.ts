export type PermitType = 'AM' | 'A1' | 'A2' | 'A' | 'B'

export interface ClaimItem {
  type:
    | 'MATERIAL_RESPONSIBLE'
    | 'MATERIAL_NON_RESPONSIBLE'
    | 'BODILY_RESPONSIBLE'
    | 'BODILY_NON_RESPONSIBLE'
    | 'THEFT'
    | 'FIRE'
    | 'GLASS'
    | 'OTHER'
  lossDate: string
}

export interface Declarations {
  convictions3y: boolean
  insurerCancellation3y: boolean
  licenseSuspension5y: boolean
}

export interface VehicleForm {
  make: string
  model: string
  cc: number
  firstRegistrationDate: string
}

export interface IdentityForm {
  garagePostalCode: string
  lastName: string
  phone: string
  email: string
  age: number
  bonusMalus: number
}

export interface DriverForm {
  permitType: PermitType
  permitDate: string
  insuredMonthsLast48: number
}

export interface DerivedValues {
  permitSeniorityMonths: number
  vehicleAgeYears: number
  claimsRecencyMonths: number[]
}

export interface EmailRequest {
  quoteId: string
  locale: string
  vehicle: VehicleForm
  identity: IdentityForm
  driver: DriverForm
  declarations: Declarations
  claims: ClaimItem[]
  derived: DerivedValues
  consents: { privacy: boolean; marketing: boolean }
}

export type HousingType = 'MAISON' | 'APPARTEMENT'

export interface HabitationQuoteRequest {
  quoteId: string
  locale: string
  phone: string
  housingType: HousingType
  rooms: number
  floor: string
  area: number
  address: string
  hasDependency: boolean
  capital: number
  hasVeranda: boolean
  hasFireplace: boolean
  schoolInsurance: boolean
  childrenCount?: number
  email: string
}
