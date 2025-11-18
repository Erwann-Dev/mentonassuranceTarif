/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { throttle } from '#start/limiter'
const EmailsController = () => import('#controllers/emails_controller')

router.get('/', async () => 'It works! Developed by Erwann Lanteri--Enée, 2025').use(throttle)
router.post('/moto/email', [EmailsController, 'send']).use(throttle)
router.post('/habitation/email', [EmailsController, 'sendHabitation']).use(throttle)

router.get('*', async ({ response }) => {
  const indexPath = join(app.publicPath(), 'index.html')

  if (!existsSync(indexPath)) {
    return response.status(404).send('Not Found')
  }

  const html = await readFile(indexPath, 'utf-8')
  return response.type('text/html').send(html)
})
