import Express from 'express'
import { healthcheckHandler } from '../controllers/healthcheck.controller'

export const healthcheckRouter = Express.Router()

healthcheckRouter.route('/').get(healthcheckHandler)
