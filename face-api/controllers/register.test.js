const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const knex = require('knex');
const { handleRegister } = require('./register');

const app = express();
app.use(bodyParser.json());

const database = knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
});

app.post('/register', (req, res) => handleRegister(req, res, database, { hashSync: () => 'hash' }));

beforeAll(async () => {
  await database.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('email').unique();
    table.integer('entries').defaultTo(0);
    table.timestamp('joined').defaultTo(database.fn.now());
  });
  await database.schema.createTable('login', (table) => {
    table.increments('id').primary();
    table.string('hash');
    table.string('email').unique();
  });
});

afterAll(async () => {
  await database.schema.dropTable('users');
  await database.schema.dropTable('login');
  await database.destroy();
});

describe('POST /register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should handle errors', async () => {
    const response = await request(app)
      .post('/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(400);
    expect(response.body).toBe('unable to register');
  });
});
