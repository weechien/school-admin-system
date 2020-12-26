import { RequestHandler } from 'express'
import { sequelizeQueryRegister } from '../utils/register.util'
import { asyncHandler } from '../middlewares/async.middleware'
import { Transaction } from 'sequelize'
import { SeqRequest } from '../utils/types.util'

export interface RegisterBody {
  class?: {
    classCode: string
    name: string
  }
  students?: {
    name: string
    email: string
  }[]
  subject?: {
    subjectCode: string
    name: string
  }
  teacher?: {
    name: string
    email: string
  }
}

/**
 * Create or update records for class, student, subject and teacher
 * @route POST /api/register
 */
export const registerHandler: RequestHandler = asyncHandler(
  async (req: SeqRequest, res) => {
    let transaction: Transaction

    try {
      transaction = await req.sequelize.transaction()

      await sequelizeQueryRegister(req.body as RegisterBody, transaction)

      return res.sendStatus(204)
    } catch (e) {
      if (transaction) await transaction.rollback()
      throw e
    }
  }
)
