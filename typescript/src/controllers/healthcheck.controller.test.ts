import app from '../app'
import request from 'supertest'

describe('healthcheckHandler function', () => {
  afterAll(async () => {
    await new Promise(res => setTimeout(res, 500)) // avoid jest open handle error
  })

  it('should check if the server is up and return 200', async () => {
    await request(app).get('/api/healthcheck').expect(200)
  })
})
