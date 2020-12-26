import Express from 'express'
import compression from 'compression'
import cors from 'cors'
import bodyParser from 'body-parser'
import { router } from './router'
import { globalErrorHandler } from './middlewares/globalErrorHandler.middleware'
import { sequelize } from './config/database'
import { SeqRequest } from './utils/types.util'
;(async () => {
  await sequelize.authenticate()
  await sequelize.sync({ force: true })
})()

const app = Express()

app.use((req: SeqRequest, res, next) => {
  req.sequelize = sequelize
  next()
})

app.use(compression())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/api', router)
app.use(globalErrorHandler)

export default app
