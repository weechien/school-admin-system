import { Model, Sequelize } from 'sequelize/types'
import ErrorBase from '../errors/errorBase.error'
import { createDb } from '../config/database'
import {
  _getModels,
  _buildFkIds,
  _checkInputBody,
  _fetchIdFromUid,
  _mergeFkIds,
  _mapUidFilters,
  _upsertModels,
  sequelizeQueryRegister,
} from './register.util'
import { TableUidKey } from '../const/tableUid.const'
import { ForeignKeys } from '../const/foreignKeys.const'

describe('_getModels function', () => {
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

  it('should return a list of objects belonging to a model', async () => {
    const setupInput = { email: 'teacher1@gmail.com', name: 'Teacher 1' }

    const { Teacher } = sequelize.models

    await Teacher.create(setupInput)
    const teachers = await _getModels(Teacher, {
      attributes: ['id', 'email', 'name'],
    })

    expect(teachers).toHaveLength(1)
    expect(teachers[0].toJSON()).toEqual({
      id: 1,
      email: 'teacher1@gmail.com',
      name: 'Teacher 1',
    })
  })
})

describe('_checkInputBody function', () => {
  it('should make sure input fields are not empty', () => {
    const input = {
      class: {
        classCode: 'P1-1',
        name: 'P1 Integrity',
      },
      students: [
        {
          email: 'student1@gmail.com',
          name: 'Student 1',
        },
        {
          email: 'student2@gmail.com',
          name: 'Student 2',
        },
      ],
      subject: {
        subjectCode: 'ENG',
        name: 'English',
      },
      teacher: {
        email: 'teacher1@gmail.com',
        name: 'Teacher 1',
      },
    }
    const output = {
      classBody: {
        classCode: 'P1-1',
        name: 'P1 Integrity',
      },
      studentsBody: [
        {
          email: 'student1@gmail.com',
          name: 'Student 1',
        },
        {
          email: 'student2@gmail.com',
          name: 'Student 2',
        },
      ],
      subjectBody: {
        subjectCode: 'ENG',
        name: 'English',
      },
      teacherBody: {
        email: 'teacher1@gmail.com',
        name: 'Teacher 1',
      },
    }
    expect(_checkInputBody(input)).toEqual(output)
  })

  it('should throw an error on empty/partial input fields', () => {
    const input = {
      class: {
        classCode: 'P1-1',
        name: 'P1 Integrity',
      },
    }

    expect.assertions(2)
    try {
      _checkInputBody(input)
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorBase)
      expect(e).toHaveProperty('message', 'All input fields are mandatory.')
    }
  })

  it('should throw an error on duplicate uids', () => {
    const input = {
      class: {
        classCode: 'P1-1',
        name: 'P1 Integrity',
      },
      students: [
        {
          email: 'student@gmail.com',
          name: 'Student 1',
        },
        {
          email: 'student@gmail.com',
          name: 'Student 2',
        },
      ],
      subject: {
        subjectCode: 'ENG',
        name: 'English',
      },
      teacher: {
        email: 'teacher1@gmail.com',
        name: 'Teacher 1',
      },
    }

    expect.assertions(2)
    try {
      _checkInputBody(input)
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorBase)
      expect(e).toHaveProperty('message', 'Duplicate students email found')
    }
  })
})

describe('_upsertModels function', () => {
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

  it('should update or insert a Class object', async () => {
    const input = {
      classCode: 'P1-1',
      name: 'P1 Integrity',
    }
    const output = [
      {
        id: 1,
        classCode: 'P1-1',
        name: 'P1 Integrity',
      },
    ]

    const { Class } = sequelize.models
    const objects = await _upsertModels(Class, input, ['name'])

    expect(objects).toHaveLength(1)
    expect(objects[0]).toMatchObject(output[0])
  })

  it('should update or insert multiple Student objects', async () => {
    const input = [
      {
        name: 'Student 1',
        email: 'student1@gmail.com',
      },
      {
        name: 'Student 2',
        email: 'student2@gmail.com',
      },
    ]
    const output = [
      {
        id: 1,
        name: 'Student 1',
        email: 'student1@gmail.com',
      },
      {
        id: 2,
        name: 'Student 2',
        email: 'student2@gmail.com',
      },
    ]

    const { Student } = sequelize.models
    const objects = await _upsertModels(Student, input, ['name'])

    expect(objects).toHaveLength(2)
    expect(objects[0]).toMatchObject(output[0])
    expect(objects[1]).toMatchObject(output[1])
  })

  it('should update or insert a Subject object', async () => {
    const input = {
      subjectCode: 'ENG',
      name: 'English',
    }
    const output = [
      {
        id: 1,
        subjectCode: 'ENG',
        name: 'English',
      },
    ]

    const { Subject } = sequelize.models
    const objects = await _upsertModels(Subject, input, ['name'])

    expect(objects).toHaveLength(1)
    expect(objects[0]).toMatchObject(output[0])
  })

  it('should update or insert a Teacher object', async () => {
    const input = {
      name: 'Teacher 1',
      email: 'teacher1@gmail.com',
    }
    const output = [
      {
        id: 1,
        name: 'Teacher 1',
        email: 'teacher1@gmail.com',
      },
    ]

    const { Teacher } = sequelize.models
    const objects = await _upsertModels(Teacher, input, ['name'])

    expect(objects).toHaveLength(1)
    expect(objects[0]).toMatchObject(output[0])
  })
})

describe('_mapUidFilters function', () => {
  it('should return a list of objects specifying their uid filters', () => {
    const testKey = 'testKey'

    const get = (val: string) =>
      jest.fn(
        (arg: string) => (({ [testKey]: val } as Record<string, string>)[arg])
      ) as jest.Mocked<Model['get']>

    const input = [{ get: get('val1') }, { get: get('val2') }] as Model[]

    expect(_mapUidFilters(input, testKey)).toEqual([
      { testKey: 'val1' },
      { testKey: 'val2' },
    ])
  })
})

describe('_fetchIdFromUid function', () => {
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

  it('should get object ids using their unique ids', async () => {
    const uid = 'email'
    const setupInput = { [uid]: 'teacher1@gmail.com', name: 'Teacher 1' }
    const input = [
      {
        [uid]: 'teacher1@gmail.com',
      },
    ]

    const { Teacher } = sequelize.models
    await Teacher.create(setupInput)

    const retVal = await _fetchIdFromUid(Teacher, input)
    expect(retVal).toEqual([1])
    expect(uid).toEqual(TableUidKey.TEACHER_UID_KEY)
  })
})

describe('_buildFkIds function', () => {
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

  it('should return a list of objects containing foreign keys and its ids', async () => {
    const uid = 'email'
    const fkey = 'teacherId'
    const setupInput = { [uid]: 'teacher1@gmail.com', name: 'Teacher 1' }

    const { Teacher } = sequelize.models
    const teachers = await Teacher.create(setupInput)
    const retVal = await _buildFkIds(Teacher, [teachers], uid, fkey)

    expect(retVal).toEqual([{ [fkey]: 1 }])
    expect(uid).toEqual(TableUidKey.TEACHER_UID_KEY)
    expect(fkey).toEqual(ForeignKeys.TEACHER_FK)
  })
})

describe('_mergeFkIds function', () => {
  it('should merge 2 equal-size array of objects into 1 equal-size array of object', () => {
    const input1 = [{ classId: 1 }, { classId: 2 }]
    const input2 = [{ subjectId: 1 }, { subjectId: 2 }]

    const output = [
      { classId: 1, subjectId: 1 },
      { classId: 1, subjectId: 2 },
      { classId: 2, subjectId: 1 },
      { classId: 2, subjectId: 2 },
    ]

    expect(_mergeFkIds(input1, input2)).toEqual(output)
  })
})

describe('sequelizeQueryRegister function', () => {
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

  it('should create/update records for class, student, subject, teacher and their relationships', async () => {
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

    const res = await sequelizeQueryRegister(inputBody)
    expect(res).toBeUndefined()
  })
})
