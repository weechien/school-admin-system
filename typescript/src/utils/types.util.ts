import { Request } from 'express'
import { Sequelize } from 'sequelize/types'

export type SeqRequest = Request & { sequelize: Sequelize }
