import mail from '@adonisjs/mail/services/main'
import type { EmailRequest, HabitationQuoteRequest } from '../contracts/types.ts'
import app from '@adonisjs/core/services/app'

export class MaillerService {
  public async sendEmail(payload: EmailRequest): Promise<{ id?: string }> {
    const to = process.env.MAIL_TO!
    const from = process.env.SMTP_USERNAME!
    const subject = `Devis Moto – ${payload.vehicle.make} ${payload.vehicle.model} ${payload.vehicle.cc} – ${payload.quoteId}`

    const logoPath = app.makePath('public', 'logo_mentonnaise_assurances.png')

    // Envoyer l'email interne (équipe) via Edge
    console.log('Sending internal email...')
    try {
      const result = await mail.send((message) => {
        message.to(to).from(from).subject(subject)
        message.htmlView('internal_mail', this.buildInternalViewModel(payload))
        message.embed(logoPath, 'logo')
      })
      console.log(result)
    } catch (err) {
      console.error('Failed sending internal email', err)
      throw err
    }

    // Envoyer l'email de confirmation au client
    if (payload.identity.email) {
      console.log('Sending confirmation email to customer...')
      const customerSubject = 'Confirmation de votre demande de devis - Mentonnaise d\'assurances'

      try {
        await mail.send((message) => {
          message
            .to(payload.identity.email)
            .from(from)
            .subject(customerSubject)
            .htmlView('customer_mail', this.buildCustomerViewModel(payload))
            .embed(logoPath, 'logo')
        })
        console.log('Customer confirmation email sent')
      } catch (err) {
        console.error('Failed sending customer confirmation email', err)
        throw err
      }
    }

    return { id: payload.quoteId }
  }

  public async sendHabitationEmail(payload: HabitationQuoteRequest): Promise<{ id?: string }> {
    const to = process.env.MAIL_TO!
    const from = process.env.SMTP_USERNAME!
    const housingLabel = payload.housingType === 'MAISON' ? 'Maison' : 'Appartement'
    const subject = `Devis Habitation – ${housingLabel} – ${payload.quoteId}`

    const logoPath = app.makePath('public', 'logo_mentonnaise_assurances.png')

    console.log('Sending habitation internal email...')
    try {
      await mail.send((message) => {
        message.to(to).from(from).subject(subject)
        message.htmlView('habitation_internal_mail', this.buildHabitationInternalViewModel(payload))
        message.embed(logoPath, 'logo')
      })
    } catch (err) {
      console.error('Failed sending habitation internal email', err)
      throw err
    }

    if (payload.email) {
      console.log('Sending habitation confirmation email to customer...')
      const customerSubject = 'Confirmation de votre demande de devis habitation - Mentonnaise d\'assurances'

      try {
        await mail.send((message) => {
          message
            .to(payload.email)
            .from(from)
            .subject(customerSubject)
            .htmlView('habitation_customer_mail', this.buildHabitationCustomerViewModel(payload))
            .embed(logoPath, 'logo')
        })
        console.log('Habitation customer confirmation email sent')
      } catch (err) {
        console.error('Failed sending habitation customer confirmation email', err)
        throw err
      }
    }

    return { id: payload.quoteId }
  }

  private buildInternalViewModel(p: EmailRequest) {
    const CLAIM_LABELS: Record<string, string> = {
      MATERIAL_RESPONSIBLE: 'Matériel - Responsable',
      MATERIAL_NON_RESPONSIBLE: 'Matériel - Non responsable',
      BODILY_RESPONSIBLE: 'Corporel - Responsable',
      BODILY_NON_RESPONSIBLE: 'Corporel - Non responsable',
      THEFT: 'Vol',
      FIRE: 'Incendie',
      GLASS: 'Bris de glace',
      OTHER: 'Autres',
    }

    const CANCELLATION_REASON_LABELS: Record<string, string> = {
      NON_PAYMENT: 'Non-paiement',
      RISK_AGGRAVATION: 'Aggravation du risque',
      CLAIMS_FREQUENCY: 'Fréquence de sinistres',
      OTHER: 'Autre',
    }

    const SUSPENSION_REASON_LABELS: Record<string, string> = {
      DRUG: 'Stupéfiant',
      ALCOHOL: 'Alcoolémie',
      SPEEDING: 'Excès de vitesse',
      OTHER: 'Autre',
    }

    const formatFrDate = (iso?: string) => {
      if (!iso) return ''
      const d = new Date(iso)
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    }

    const now = new Date()
    const formatFrTime = () => {
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      return `${hh}:${mm}`
    }

    const declarationsUi = {
      convictions: {
        bg: p.declarations.convictions3y ? '#fee2e2' : '#d1fae5',
        color: p.declarations.convictions3y ? '#991b1b' : '#065f46',
        text: p.declarations.convictions3y ? 'Oui' : 'Non',
        date: p.declarations.convictionDate ? formatFrDate(p.declarations.convictionDate) : undefined,
      },
      cancellation: {
        bg: p.declarations.insurerCancellation3y ? '#fee2e2' : '#d1fae5',
        color: p.declarations.insurerCancellation3y ? '#991b1b' : '#065f46',
        text: p.declarations.insurerCancellation3y ? 'Oui' : 'Non',
        date: p.declarations.insurerCancellationDate ? formatFrDate(p.declarations.insurerCancellationDate) : undefined,
        reason: p.declarations.insurerCancellationReason ? CANCELLATION_REASON_LABELS[p.declarations.insurerCancellationReason] : undefined,
      },
      suspension: {
        bg: p.declarations.licenseSuspension5y ? '#fee2e2' : '#d1fae5',
        color: p.declarations.licenseSuspension5y ? '#991b1b' : '#065f46',
        text: p.declarations.licenseSuspension5y ? 'Oui' : 'Non',
        date: p.declarations.licenseSuspensionDate ? formatFrDate(p.declarations.licenseSuspensionDate) : undefined,
        reason: p.declarations.licenseSuspensionReason ? SUSPENSION_REASON_LABELS[p.declarations.licenseSuspensionReason] : undefined,
      },
    }

    const claims = p.claims.map((c) => ({
      typeLabel: (CLAIM_LABELS as Record<string, string>)[c.type] ?? c.type,
      lossDate: formatFrDate(c.lossDate),
    }))

    return {
      quoteId: p.quoteId,
      vehicle: {
        ...p.vehicle,
        firstRegistrationDate: formatFrDate(p.vehicle.firstRegistrationDate),
      },
      identity: {
        ...p.identity,
        birthDateFormatted: formatFrDate(p.identity.birthDate),
      },
      driver: { ...p.driver, permitDate: formatFrDate(p.driver.permitDate) },
      declarations: p.declarations,
      derived: p.derived,
      declarationsUi,
      claims,
      receivedDate: formatFrDate(now.toISOString()),
      receivedTime: formatFrTime(),
      currentYear: now.getFullYear(),
    }
  }

  private buildCustomerViewModel(p: EmailRequest) {
    return {
      vehicle: p.vehicle,
      quoteId: p.quoteId,
      currentYear: new Date().getFullYear(),
    }
  }

  private buildHabitationInternalViewModel(p: HabitationQuoteRequest) {
    const now = new Date()
    const boolLabel = (value: boolean) => (value ? 'Oui' : 'Non')
    const currency = (value: number) =>
      new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
    const formatFrDate = (t: Date) => {
      const dd = String(t.getDate()).padStart(2, '0')
      const mm = String(t.getMonth() + 1).padStart(2, '0')
      const yyyy = t.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    }
    const formatFrTime = (t: Date) => {
      const hh = String(t.getHours()).padStart(2, '0')
      const mm = String(t.getMinutes()).padStart(2, '0')
      return `${hh}:${mm}`
    }
    return {
      quoteId: p.quoteId,
      housingLabel: p.housingType === 'MAISON' ? 'Maison' : 'Appartement',
      housingLabelLower: p.housingType === 'MAISON' ? 'maison' : 'appartement',
      phone: p.phone,
      rooms: p.rooms,
      floor: p.floor,
      area: p.area,
      address: p.address,
      hasDependencyLabel: boolLabel(p.hasDependency),
      capitalFormatted: currency(p.capital),
      hasVerandaLabel: boolLabel(p.hasVeranda),
      hasFireplaceLabel: boolLabel(p.hasFireplace),
      schoolInsuranceLabel: p.schoolInsurance
        ? `Oui${typeof p.childrenCount === 'number' ? ` (${p.childrenCount} enfant${p.childrenCount > 1 ? 's' : ''})` : ''}`
        : 'Non',
      email: p.email,
      receivedDate: formatFrDate(now),
      receivedTime: formatFrTime(now),
      currentYear: now.getFullYear(),
    }
  }

  private buildHabitationCustomerViewModel(p: HabitationQuoteRequest) {
    const currency = (value: number) =>
      new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
    return {
      quoteId: p.quoteId,
      housingLabel: p.housingType === 'MAISON' ? 'Maison' : 'Appartement',
      housingLabelLower: p.housingType === 'MAISON' ? 'maison' : 'appartement',
      capitalFormatted: currency(p.capital),
      currentYear: new Date().getFullYear(),
    }
  }
}
