import type { EmailRequest, HabitationQuoteRequest } from '../contracts/types.ts'

export class NtfyService {
  public async sendNotification(
    payload: EmailRequest
  ) {
    const url = `https://ntfy.sh/${process.env.NTFY_CHANNEL}`
    const response = await fetch(url, {
      method: 'POST',
      body: this.renderMessage(payload),
      headers: {
        'Title': 'Nouvelle demande de devis Moto',
        'Tags': 'info',
        'Priority': 'urgent',
      },
    })
    return response.ok
  }

  public async sendHabitationNotification(payload: HabitationQuoteRequest) {
    const url = `https://ntfy.sh/${process.env.NTFY_CHANNEL}`
    const response = await fetch(url, {
      method: 'POST',
      body: this.renderHabitationMessage(payload),
      headers: {
        'Title': 'Nouvelle demande de devis Habitation',
        'Tags': 'house',
        'Priority': 'high',
      },
    })
    return response.ok
  }

  private renderMessage(payload: EmailRequest) {
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

    const formatFrDate = (iso?: string) => {
      if (!iso) return ''
      const d = new Date(iso)
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    }


    return `
      Demande de Devis Moto

      Véhicule :
        Marque: ${payload.vehicle.make}
        Modèle: ${payload.vehicle.model}
        Cylindrée: ${payload.vehicle.cc} cc
        1ère mise en circulation: ${formatFrDate(payload.vehicle.firstRegistrationDate)}

      Conducteur :
        Permis: ${payload.driver.permitType}
        Date d'obtention: ${formatFrDate(payload.driver.permitDate)}
        Mois assurés (48 mois): ${payload.driver.insuredMonthsLast48}

      Déclarations :
        Condamnations 3 ans: ${payload.declarations.convictions3y ? 'oui' : 'non'}
        Résiliation assureur 3 ans: ${payload.declarations.insurerCancellation3y ? 'oui' : 'non'}
        Suspension/annulation permis 5 ans: ${payload.declarations.licenseSuspension5y ? 'oui' : 'non'}

      ${payload.claims.length > 0 ? `Sinistres:\n${payload.claims.map((c) => `  - ${CLAIM_LABELS[c.type] ?? c.type} — ${formatFrDate(c.lossDate)}`).join('\n')}` : ''}

      Dérivés :
        Ancienneté permis (mois): ${payload.derived.permitSeniorityMonths}
        Âge véhicule (ans): ${payload.derived.vehicleAgeYears}
        
        Consulter les mails pour plus de détails.
      `.trim()
  }

  private renderHabitationMessage(payload: HabitationQuoteRequest) {
    return `
      Demande de Devis Habitation

      Logement :
        Type: ${payload.housingType === 'MAISON' ? 'Maison' : 'Appartement'}
        Pièces: ${payload.rooms}
        Étage: ${payload.floor}
        Superficie: ${payload.area} m²
        Adresse: ${payload.address}

      Options :
        Dépendance / garage: ${payload.hasDependency ? 'oui' : 'non'}
        Véranda: ${payload.hasVeranda ? 'oui' : 'non'}
        Cheminée / insert / poêle: ${payload.hasFireplace ? 'oui' : 'non'}
        Assurance scolaire: ${payload.schoolInsurance ? `oui (${payload.childrenCount ?? 0} enfant(s))` : 'non'}
        Capital mobilier: ${payload.capital} €

      Contact :
        Téléphone: ${payload.phone}
        Email: ${payload.email}

      Consulter la boîte mail pour le détail complet.
    `.trim()
  }
}
