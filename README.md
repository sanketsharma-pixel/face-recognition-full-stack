# Face Recognition Full Stack

Simple face recognition demo (React frontend + Express/Postgres backend). This README explains how to install, run, and test the project so everyone can run it on their machine.

## Prerequisites

- Node.js (v12+) and npm
- PostgreSQL (for the backend)
- (Optional) Clarifai API key if you want the live Clarifai predictions (the tests mock Clarifai)

## Repository layout (important files)

- [README.md](README.md)
- [package.json](package.json) — frontend package configuration
- [src/App.js](src/App.js) — main React app (contains [`calculateFaceLocation`](src/App.js) and [`onButtonSubmit`](src/App.js))
- [src/App.test.js](src/App.test.js) — test suite
- [face-api/server.js](face-api/server.js) — backend server entry
- [face-api/package.json](face-api/package.json) — backend package configuration
- [face-api/controllers/image.js](face-api/controllers/image.js) — [`handleImage`](face-api/controllers/image.js)
- [face-api/controllers/register.js](face-api/controllers/register.js) — [`handleRegister`](face-api/controllers/register.js)
- [face-api/controllers/signin.js](face-api/controllers/signin.js) — [`handleSignin`](face-api/controllers/signin.js)

## Setup — install dependencies

From project root:

1. Install frontend dependencies:
   ```sh
   npm install
   ```
2. Install backend dependencies:
   ```sh
   cd face-api
   npm install
   ```

## Setup — environment variables

1. Create a PostgreSQL database and user for the project.
2. Copy `.env.example` to `.env` in the `face-api` folder and update with your database credentials.

## Running the project

1. Start the PostgreSQL service.
2. Run database migrations (in the `face-api` folder):
   ```sh
   npm run migrate
   ```
3. Seed the database (in the `face-api` folder):
   ```sh
   npm run seed
   ```
4. Start the backend server (in the `face-api` folder):
   ```sh
   npm start
   ```
5. In a new terminal, start the React app:
   ```sh
   npm start
   ```

## Running tests

1. Frontend tests:
   ```sh
   npm test
   ```
2. Backend tests (in the `face-api` folder):
   ```sh
   npm test
   ```

## Troubleshooting

- If you encounter issues, ensure that all services (Node, PostgreSQL) are running and that environment variables are correctly set.
- Check the browser console and terminal for error messages.
- For database issues, ensure the correct database is selected in your PostgreSQL client.

## Deployment

For deploying the app, you can use services like Heroku, AWS, or DigitalOcean. Ensure that you configure environment variables and database connections according to the hosting provider's guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
