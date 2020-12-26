import Express from 'express'
import { registerHandler } from '../controllers/register.controller'

export const registerRouter = Express.Router()

registerRouter.route('/').post(registerHandler)
