/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'

export const throttle = limiter.define('api', (ctx) => {
  return limiter.allowRequests(100).every('1 minute').usingKey(`ip_${ctx.request.ip()}`).blockFor('10 mins')
})
