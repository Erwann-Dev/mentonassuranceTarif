import vine from '@vinejs/vine'

export const EmailRequestValidator = vine.compile(
  vine.object({
    quoteId: vine.string(),
    locale: vine.string(),
    vehicle: vine.object({
      make: vine.string(),
      model: vine.string(),
      cc: vine.number(),
      firstRegistrationDate: vine.string(), // Should be validated as ISO if needed
    }),
    identity: vine.object({
      garagePostalCode: vine.string(),
      lastName: vine.string(),
      phone: vine.string(),
      email: vine.string().email(),
      birthDate: vine.string(),
      bonusMalus: vine.number(),
    }),
    driver: vine.object({
      permitType: vine.enum(['AM', 'A1', 'A2', 'A', 'B']),
      permitDate: vine.string(),
      insuredMonthsLast48: vine.number(),
    }),
    declarations: vine.object({
      convictions3y: vine.boolean(),
      convictionDate: vine.string().optional(),
      insurerCancellation3y: vine.boolean(),
      insurerCancellationDate: vine.string().optional(),
      insurerCancellationReason: vine.enum(['NON_PAYMENT', 'RISK_AGGRAVATION', 'CLAIMS_FREQUENCY', 'OTHER']).optional(),
      licenseSuspension5y: vine.boolean(),
      licenseSuspensionDate: vine.string().optional(),
      licenseSuspensionReason: vine.enum(['DRUG', 'ALCOHOL', 'SPEEDING', 'OTHER']).optional(),
    }),
    claims: vine.array(
      vine.object({
        type: vine.enum([
          'MATERIAL_RESPONSIBLE',
          'MATERIAL_NON_RESPONSIBLE',
          'BODILY_RESPONSIBLE',
          'BODILY_NON_RESPONSIBLE',
          'THEFT',
          'FIRE',
          'GLASS',
          'OTHER',
        ]),
        lossDate: vine.string(),
      })
    ),
    derived: vine.object({
      permitSeniorityMonths: vine.number(),
      vehicleAgeYears: vine.number(),
      claimsRecencyMonths: vine.array(vine.number()),
    }),
    consents: vine.object({
      privacy: vine.boolean(),
      marketing: vine.boolean(),
    }),
  })
)
