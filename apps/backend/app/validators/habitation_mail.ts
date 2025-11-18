import vine from '@vinejs/vine'

const FLOORS = ['RDC', ...Array.from({ length: 25 }, (_, idx) => `${idx + 1}`)] as const

export const HabitationRequestValidator = vine.compile(
  vine.object({
    quoteId: vine.string(),
    locale: vine.string(),
    phone: vine.string(),
    housingType: vine.enum(['MAISON', 'APPARTEMENT'] as const),
    rooms: vine.number().min(1),
    floor: vine.enum(FLOORS),
    area: vine.number().min(1),
    address: vine.string(),
    hasDependency: vine.boolean(),
    capital: vine.number().min(1000),
    hasVeranda: vine.boolean(),
    hasFireplace: vine.boolean(),
    schoolInsurance: vine.boolean(),
    childrenCount: vine.number().min(1).optional(),
    email: vine.string().email(),
  })
)
