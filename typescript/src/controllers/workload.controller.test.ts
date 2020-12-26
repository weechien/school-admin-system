import { sequelize } from '../config/database'
import request from 'supertest'
import app from '../app'

describe('workloadHandler function', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true })
  })

  afterAll(async () => {
    await new Promise(res => setTimeout(res, 500)) // avoid jest open handle error
  })

  it('calls GET /api/reports/workload to a populated database and get 200 with response body', async () => {
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

    await request(app).post('/api/register').type('json').send(inputBody)
    const res = await request(app).get('/api/reports/workload').expect(200)

    expect(res.body).toEqual({
      'Teacher 1': [
        {
          subjectCode: 'ENG',
          subjectName: 'English',
          numberOfClasses: 1,
        },
      ],
    })
  })

  it('calls GET /api/reports/workload to an empty database and get 200 with empty response body', async () => {
    const res = await request(app).get('/api/reports/workload').expect(200)

    expect(res.body).toEqual({})
  })
})
