# TaskDuty Server - Authentication & Authorization

This server implements the backend requirement for authentication, authorization, and user-scoped task data. The React client is intentionally **not connected to these API routes**; Postman can be used to test the API independently.

## Packages used

Installed with `npm install`:

- `express` - creates the HTTP API and routes.
- `mongoose` - connects to MongoDB and defines User/Task models.
- `bcryptjs` - securely hashes and verifies passwords.
- `jsonwebtoken` - creates and verifies JWT authentication tokens.
- `dotenv` - loads `MONGO_URI`, `JWT_SECRET`, and `PORT` from `.env`.
- `cors` - enables cross-origin requests if the API is later connected to the frontend.

## Install

From the `server` folder:

```bash
npm install
```

This installs the dependencies already listed in `package.json`.

## Environment setup

Copy `.env.example` to `.env` and provide your own values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Do not commit the real `.env` file. It is ignored by `.gitignore`.

## Run

Development:

```bash
npm run dev
```

Normal start:

```bash
npm start
```

## API tested with Postman

### Register
`POST http://localhost:5000/api/auth/register`

```json
{
  "name": "User One",
  "email": "user1@example.com",
  "password": "password123"
}
```

### Login
`POST http://localhost:5000/api/auth/login`

```json
{
  "email": "user1@example.com",
  "password": "password123"
}
```

Copy the returned JWT and send it on protected requests as:

```text
Authorization: Bearer YOUR_TOKEN
```

### User-scoped task endpoints

- `GET /api/tasks` - list only the authenticated user's tasks.
- `GET /api/tasks/:id` - get one task owned by the authenticated user.
- `POST /api/tasks` - create a task owned by the authenticated user.
- `PATCH /api/tasks/:id` - update a task owned by the authenticated user.
- `DELETE /api/tasks/:id` - delete a task owned by the authenticated user.

The server does not accept a user id from the task body. It gets the user id from the verified JWT and includes that id in task queries. This is the authorization/user-scoping rule.
