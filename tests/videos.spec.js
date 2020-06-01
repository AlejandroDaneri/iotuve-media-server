import 'jest'
// TODO: revisar que no se llama al mock de firebase aunque lo importe
process.env.NODE_ENV = 'test'

const app = require('../app')
const supertest = require('supertest')
const request = supertest(app)
const knex = require('../db/knex')

beforeEach(() =>
  knex.migrate
    .forceFreeMigrationsLock()
    .then(() => knex.migrate.rollback())
    .then(() => knex.migrate.latest())
    .then(() => knex.seed.run())
)

it('should create a new video when payload is fine', done => {
  const obj = {
    video_id: '1234',
    name: 'salchicha',
    date_created: '2020-05-09T19:00:31.362Z',
    type: 'video/mp4',
    size: 3420480
  }
  request
    .post('/videos')
    .send(obj)
    .then(res => {
      expect(res.statusCode).toEqual(201)
      var resp = res.body
      expect(resp).toMatchObject(obj)
      done()
    })
})
it('should not create a new video when payload is wrong', done => {
  const obj = {
    name: 'salchicha',
    date_created: '2020-05-09T19:00:31.362Z',
    type: 'video/mp4',
    size: 3420480
  }
  request
    .post('/videos')
    .send(obj)
    .then(res => {
      expect(res.statusCode).toEqual(400)
      expect(res.body).toMatchObject({ error: 'Payload is malformed' })
      done()
    })
})

it('should not create a new video when video_id is duplicated', done => {
  const obj = {
    video_id: '120',
    name: 'salchicha',
    date_created: '2020-05-09T19:00:31.362Z',
    type: 'video/mp4',
    size: 3420480
  }
  request
    .post('/videos')
    .send(obj)
    .then(res => {
      expect(res.statusCode).toEqual(409)
      expect(res.body).toMatchObject({ error: 'Duplicated' })
      done()
    })
})

it('should get all videos when gets /videos', () => {
  const expected = [
    {
      id: 1,
      video_id: '120',
      name: 'salchicha',
      date_created: '2020-05-09T19:00:31.362Z',
      type: 'video/mp4',
      size: 3420480,
      url: 'http://algo.com',
      thumb: 'http://algo.com'
    },
    {
      id: 2,
      video_id: '112',
      name: 'doberman',
      date_created: '2020-05-09T19:00:31.362Z',
      type: 'video/mp4',
      size: 3420480,
      url: 'http://algo2.com',
      thumb: 'http://algo3.com'
    },
    {
      id: 3,
      video_id: '125',
      name: 'ovejero',
      date_created: '2020-05-09T19:00:31.362Z',
      type: 'video/mp4',
      size: 3420480,
      url: 'http://algo23.com',
      thumb: 'http://alg3o.com'
    }
  ]
  request.get('/videos').then(res => {
    expect(res.statusCode).toEqual(200)
    expect(res.body).toStrictEqual({ videos: expected })
  })
})

it('should get specific video when gets /videos/id', done => {
  const expected = {
    video_id: '120',
    name: 'salchicha',
    date_created: '2020-05-09T19:00:31.362Z',
    type: 'video/mp4',
    size: 3420480,
    url: 'http://algo.com',
    thumb: 'http://algo.com'
  }
  request.get('/videos/120').then(res => {
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject(expected)
    done()
  })
})

it('should return not found when gets /videos/id when video not exists', done => {
  request.get('/videos/12320').then(res => {
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: 'Video not found' })
    done()
  })
})

it('should get specific video when gets /videos?id', done => {
  const expected = [
    {
      video_id: '120',
      name: 'salchicha',
      date_created: '2020-05-09T19:00:31.362Z',
      type: 'video/mp4',
      size: 3420480,
      url: 'http://algo.com',
      thumb: 'http://algo.com'
    }
  ]
  request.get('/videos?id=120').then(res => {
    expect(res.statusCode).toEqual(200)
    expect(res.body).toMatchObject({ videos: expected })
    done()
  })
})

it('should delete video when ID exists', done => {
  // revisar done
  const obj = {
    video_id: '5000',
    name: 'salchicha',
    date_created: '2020-05-09T19:00:31.362Z',
    type: 'video/mp4',
    size: 3420480
  }
  request
    .post('/videos')
    .send(obj)
    .then(() => {
      request.delete('/videos/5000').then(res => {
        expect(res.statusCode).toEqual(200)
        expect(res.body).toStrictEqual('Successfully deleted video 5000')
        done()
      })
    })
})

it('should not delete any video when ID not exists', done => {
  // revisar done
  request.delete('/videos/32154').then(res => {
    expect(res.statusCode).toEqual(404)
    expect(res.body).toMatchObject({ error: 'Video not found' })
    done()
  })
})

afterAll(async function (done) {
  await knex.destroy()
  app.close(done)
})
