import Express from 'express'

import { healthcheckRouter } from './routes/healthcheck.route'
import { registerRouter } from './routes/register.route'
import { workloadRouter } from './routes/workload.route'

export const router = Express.Router()

router.use('/healthcheck', healthcheckRouter)
router.use('/register', registerRouter)
router.use('/reports/workload', workloadRouter)
