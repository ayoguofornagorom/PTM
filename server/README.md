# TaskDuty Server - Authentication & Authorization

This server implements authentication, authorization, and user-scoped task data for the React client and Postman.

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
`POST http://localhost:7000/api/auth/register`

```json
{
  "name": "User One",
  "email": "user1@example.com",
  "password": "password123"
}
```

### Login
`POST http://localhost:7000/api/auth/login`

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

## Connect the live client

The client uses `http://localhost:3000/api` only during local Vite development. For a deployed client, set the build-time environment variable `VITE_API_BASE_URL` to the deployed backend URL including `/api` (for example, `https://your-api-host.example/api`) in the frontend hosting settings, then rebuild/redeploy the client. The backend must also be publicly reachable and configured with its production MongoDB URI and JWT secret.

To test a Postman-issued token on the deployed client, open the browser console on the client site's own origin and run:

```
localStorage.setItem("ptm_token", "paste-the-token-value-here");
```

Paste only the JWT value, without the `Bearer ` prefix. Use a token for the same user who created the tasks; task lists are scoped to the authenticated user. Tokens expire after 12 hours. Do not share or commit tokens.
