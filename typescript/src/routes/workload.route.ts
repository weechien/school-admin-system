import Express from 'express'
import { workloadHandler } from '../controllers/workload.controller'

export const workloadRouter = Express.Router()

workloadRouter.route('/').get(workloadHandler)
