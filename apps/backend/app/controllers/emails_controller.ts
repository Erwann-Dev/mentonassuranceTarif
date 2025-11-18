import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'
import { MaillerService } from '#services/mailler_service'
import { EmailRequestValidator } from '#validators/mail'
import { HabitationRequestValidator } from '#validators/habitation_mail'
import { NtfyService } from '#services/ntfy_service'

export default class EmailsController {
  public async send({ request, response }: HttpContext) {
    try {
      const payload = await EmailRequestValidator.validate(request.all())

      if (!payload?.identity?.email || !payload?.vehicle || !payload?.quoteId) {
        return response.badRequest({ error: 'Invalid payload' })
      }

      const mailer = new MaillerService()
      const result = await mailer.sendEmail(payload)
      const ntfy = new NtfyService()
      await ntfy.sendNotification(payload)
      return response.ok({ quoteId: payload.quoteId, status: 'EMAIL_SENT', providerId: result.id })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        console.warn('Email validation failed:', error.messages)
        return response.unprocessableEntity({ status: 'ERROR', errors: error.messages })
      }

      console.error('Email send error:', error)
      return response.internalServerError({ status: 'ERROR', message: error.message })
    }
  }

  public async sendHabitation({ request, response }: HttpContext) {
    try {
      const payload = await HabitationRequestValidator.validate(request.all())

      if (!payload?.email || !payload?.phone) {
        return response.badRequest({ error: 'Invalid payload' })
      }

      if (payload.schoolInsurance && typeof payload.childrenCount !== 'number') {
        return response.badRequest({ error: 'childrenCount_required' })
      }

      const mailer = new MaillerService()
      const result = await mailer.sendHabitationEmail(payload)
      const ntfy = new NtfyService()
      await ntfy.sendHabitationNotification(payload)

      return response.ok({ quoteId: payload.quoteId, status: 'EMAIL_SENT', providerId: result.id })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        console.warn('Habitation validation failed:', error.messages)
        return response.unprocessableEntity({ status: 'ERROR', errors: error.messages })
      }

      console.error('Habitation email send error:', error)
      return response.internalServerError({ status: 'ERROR', message: error.message })
    }
  }
}
