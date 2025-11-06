const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const knex = require('knex');
const { handleSignin } = require('./signin');

const app = express();
app.use(bodyParser.json());

const database = knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
});

app.post('/signin', (req, res) => handleSignin(req, res, database, { compareSync: () => true }));

beforeAll(async () => {
  await database.schema.createTable('login', (table) => {
    table.increments('id').primary();
    table.string('hash');
    table.string('email').unique();
  });
  await database.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('email').unique();
    table.integer('entries').defaultTo(0);
    table.timestamp('joined').defaultTo(database.fn.now());
  });
});

afterAll(async () => {
  await database.schema.dropTable('login');
  await database.schema.dropTable('users');
  await database.destroy();
});

describe('POST /signin', () => {
  it('should return a user on successful signin', async () => {
    await database('users').insert({
      name: 'Test User',
      email: 'test@example.com',
    });
    await database('login').insert({
      email: 'test@example.com',
      hash: 'password',
    });

    const response = await request(app)
      .post('/signin')
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should handle errors', async () => {
    const response = await request(app)
      .post('/signin')
      .send({ email: 'wrong@example.com', password: 'password' });

    expect(response.status).toBe(400);
    expect(response.body).toBe('Wrong Credentials');
  });
});
