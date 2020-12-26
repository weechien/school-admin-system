import { Model, Sequelize } from 'sequelize/types'
import {
  rawSqlQueryWorkload,
  sequelizeQueryWorkload,
  _parseSqlWorkload,
  _parseSequelizeWorkload,
} from './workload.util'
import { Aliases } from '../const/workload.const'
import { sequelizeQueryRegister } from './register.util'
import { TableNames } from '../const/tableNames.const'
import { createDb } from '../config/database'

const { TEACHER_NAME, SUBJECT_CODE, SUBJECT_NAME, NUM_OF_CLASSES } = Aliases
const { SUBJECT_CLASS, SUBJECT } = TableNames

describe('_parseSqlWorkload function', () => {
  it("should parse the result from raw sql queries to the workload's required format", () => {
    const get = jest.fn(
      (arg: string) =>
        (({
          [TEACHER_NAME]: 'Teacher 1',
          [SUBJECT_CODE]: 'ENG',
          [SUBJECT_NAME]: 'English',
          [NUM_OF_CLASSES]: 1,
        } as Record<string, string | number>)[arg])
    ) as jest.Mocked<Model['get']>

    const input = [{ get }] as Model[]
    const workload = _parseSqlWorkload(input)

    expect(workload).toEqual({
      'Teacher 1': [
        {
          subjectCode: 'ENG',
          subjectName: 'English',
          numberOfClasses: 1,
        },
      ],
    })
  })
})

describe('rawSqlQueryWorkload function', () => {
  let sequelize: Sequelize

  beforeAll(async () => {
    sequelize = await createDb('test_db')
    await sequelize.authenticate()
  })

  beforeEach(async () => {
    await sequelize.sync({ force: true })
  })

  afterAll(async () => {
    await sequelize.close()
    await new Promise(res => setTimeout(res, 500)) // avoid jest open handle error
  })

  it('should use raw sql query to get teachers, subjects and classes', async () => {
    const inputBody = {
      teacher: {
        name: 'Teacher 1',
        email: 'teacher1@gmail.com',
      },
      students: [
        {
          name: 'Student 1',
          email: 'student1@gmail.com',
        },
        {
          name: 'Student 2',
          email: 'student2@gmail.com',
        },
      ],
      subject: {
        subjectCode: 'ENG',
        name: 'English',
      },
      class: {
        classCode: 'P1-1',
        name: 'P1 Integrity',
      },
    }
    await sequelizeQueryRegister(inputBody)
    const res = await rawSqlQueryWorkload()

    expect(res).toEqual({
      'Teacher 1': [
        {
          subjectCode: 'ENG',
          subjectName: 'English',
          numberOfClasses: 1,
        },
      ],
    })
  })
})

describe('_parseSequelizeWorkload function', () => {
  it("should parse the result from sequelize queries to the workload's required format", () => {
    const getTeacher = jest.fn(
      (arg: string) =>
        (({
          [TEACHER_NAME]: 'Teacher 1',
        } as Record<string, string | number>)[arg])
    ) as jest.Mocked<Model['get']>

    const getSubject = jest.fn(
      (arg: string) =>
        (({
          [SUBJECT_CODE]: 'ENG',
          [SUBJECT_NAME]: 'English',
        } as Record<string, string | number>)[arg])
    ) as jest.Mocked<Model['get']>

    const input = [
      {
        get: getTeacher,
        [SUBJECT_CLASS]: [
          {
            [SUBJECT]: {
              get: getSubject,
            },
          },
        ],
      },
    ] as unknown

    const workload = _parseSequelizeWorkload(input as Model[])

    expect(workload).toEqual({
      'Teacher 1': [
        {
          subjectCode: 'ENG',
          subjectName: 'English',
          numberOfClasses: 1,
        },
      ],
    })
  })
})

describe('sequelizeQueryWorkload function', () => {
  let sequelize: Sequelize

  beforeAll(async () => {
    sequelize = await createDb('test_db')
    await sequelize.authenticate()
  })

  beforeEach(async () => {
    await sequelize.sync({ force: true })
  })

  afterAll(async () => {
    await sequelize.close()
    await new Promise(res => setTimeout(res, 500)) // avoid jest open handle error
  })

  it('should use raw sql query to get teachers, subjects and classes', async () => {
    const inputBody = {
      teacher: {
        name: 'Teacher 1',
        email: 'teacher1@gmail.com',
      },
      students: [
        {
          name: 'Student 1',
          email: 'student1@gmail.com',
        },
        {
          name: 'Student 2',
          email: 'student2@gmail.com',
        },
      ],
      subject: {
        subjectCode: 'ENG',
        name: 'English',
      },
      class: {
        classCode: 'P1-1',
        name: 'P1 Integrity',
      },
    }
    await sequelizeQueryRegister(inputBody)
    const res = await sequelizeQueryWorkload()

    expect(res).toEqual({
      'Teacher 1': [
        {
          subjectCode: 'ENG',
          subjectName: 'English',
          numberOfClasses: 1,
        },
      ],
    })
  })
})
