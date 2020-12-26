import { sequelize } from '../config/database'
import request from 'supertest'
import app from '../app'

describe('registerHandler function', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true })
  })

  afterAll(async () => {
    await new Promise(res => setTimeout(res, 500)) // avoid jest open handle error
  })

  it('calls POST /api/register with all input fields and get 204', async () => {
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

    await request(app)
      .post('/api/register')
      .type('json')
      .send(inputBody)
      .expect(204)
  })

  it('calls POST /api/register with partial input fields and get 400', async () => {
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
    }

    await request(app)
      .post('/api/register')
      .type('json')
      .send(inputBody)
      .expect(400)
  })

  it('calls POST /api/register with no input fields and get 400', async () => {
    const inputBody = {}

    await request(app)
      .post('/api/register')
      .type('json')
      .send(inputBody)
      .expect(400)
  })

  it('calls POST /api/register with multiple times with different input fields and get 204 and updated data', async () => {
    const inputBody1 = {
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

    const inputBody2 = {
      teacher: {
        name: 'Updated Teacher 1',
        email: 'teacher1@gmail.com',
      },
      students: [
        {
          name: 'Updated Student 1',
          email: 'student1@gmail.com',
        },
        {
          name: 'Updated Student 2',
          email: 'student2@gmail.com',
        },
      ],
      subject: {
        subjectCode: 'ENG',
        name: 'Updated English',
      },
      class: {
        classCode: 'P1-1',
        name: 'Updated P1 Integrity',
      },
    }

    await request(app)
      .post('/api/register')
      .type('json')
      .send(inputBody1)
      .expect(204)

    const getRes1 = await request(app).get('/api/reports/workload').expect(200)

    expect(getRes1.body).toEqual({
      'Teacher 1': [
        {
          subjectCode: 'ENG',
          subjectName: 'English',
          numberOfClasses: 1,
        },
      ],
    })

    await request(app)
      .post('/api/register')
      .type('json')
      .send(inputBody2)
      .expect(204)

    const getRes2 = await request(app).get('/api/reports/workload').expect(200)

    expect(getRes2.body).toEqual({
      'Updated Teacher 1': [
        {
          subjectCode: 'ENG',
          subjectName: 'Updated English',
          numberOfClasses: 1,
        },
      ],
    })
  })

  it('calls POST /api/register with invalid input fields and get 400', async () => {
    const inputBody = {
      teacher: {
        name: 'Teacher 1',
        email: 'not email',
      },
      students: [
        {
          name: 'Student 1',
          email: 'not email',
        },
        {
          name: 'Student 2',
          email: 'not email',
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

    await request(app)
      .post('/api/register')
      .type('json')
      .send(inputBody)
      .expect(400)
  })

  it('calls POST /api/register with non-unique input fields and get 400', async () => {
    const inputBody = {
      teacher: {
        name: 'Teacher 1',
        email: 'teacher1@gmail.com',
      },
      students: [
        {
          name: 'Student 1',
          email: 'student@gmail.com',
        },
        {
          name: 'Student 2',
          email: 'student@gmail.com',
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

    await request(app)
      .post('/api/register')
      .type('json')
      .send(inputBody)
      .expect(400)
  })
})
