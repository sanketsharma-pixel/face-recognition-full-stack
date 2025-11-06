const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const knex = require('knex');
const { handleProfileGet } = require('./profile');

const app = express();
app.use(bodyParser.json());

const database = knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
});

app.get('/profile/:id', (req, res) => handleProfileGet(req, res, database));

beforeAll(async () => {
  await database.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('email').unique();
    table.integer('entries').defaultTo(0);
    table.timestamp('joined').defaultTo(database.fn.now());
  });
});

afterAll(async () => {
  await database.schema.dropTable('users');
  await database.destroy();
});

describe('GET /profile/:id', () => {
  it('should return a user on successful get', async () => {
    await database('users').insert({
      name: 'Test User',
      email: 'test@example.com',
    });

    const response = await request(app)
      .get('/profile/1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should handle errors', async () => {
    const response = await request(app)
      .get('/profile/999');

    expect(response.status).toBe(400);
    expect(response.body).toBe('not found');
  });
});
