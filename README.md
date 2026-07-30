# CampusConnect API

CampusConnect is a Node.js, Express, and MongoDB REST API for campus users and
events. The Week 05 deliverable includes two complete CRUD collections,
request validation, centralized error handling, and executable Swagger
documentation.

## Implemented

- Users: `GET`, `POST`, `PUT`, and `DELETE`
- Events: `GET`, `POST`, `PUT`, and `DELETE`
- Joi request validation and MongoDB ObjectId validation
- Consistent `400`, `404`, `409`, and `500` error responses
- Swagger UI at `/api-docs` and the raw OpenAPI document at `/swagger.json`
- Automated HTTP route tests and OpenAPI validation
- Render Blueprint configuration

## Local setup

Requirements:

- Node.js 20 or newer
- A MongoDB Atlas database

Install dependencies and create the local environment file:

```bash
npm install
cp .env.example .env
```

Set `MONGODB_URI` in `.env`, then run:

```bash
npm run dev
```

The API starts on `http://localhost:8080` by default. Open
`http://localhost:8080/api-docs` to execute requests from Swagger UI.

## Routes

| Method | Route | Description |
| --- | --- | --- |
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get one user |
| POST | `/users` | Create a user |
| PUT | `/users/:id` | Update one or more user fields |
| DELETE | `/users/:id` | Delete a user |
| GET | `/events` | Get events, with optional filters |
| GET | `/events/:id` | Get one event |
| POST | `/events` | Create an event |
| PUT | `/events/:id` | Update one or more event fields |
| DELETE | `/events/:id` | Delete an event |

The legacy `POST /users/register` route remains available for compatibility.
All graded operations are documented in `swagger.json`.

## Checks

```bash
npm run check
```

This validates the OpenAPI contract and runs route-level tests for both
collections without connecting to a production database.

## Render deployment

The included `render.yaml` defines the build command, start command, health
check, and required environment variable. Create or sync a Render Blueprint,
provide the secret `MONGODB_URI` value in the Render dashboard, deploy the
default branch, and verify:

- `https://YOUR-SERVICE.onrender.com/`
- `https://YOUR-SERVICE.onrender.com/api-docs`
- CRUD operations from the published Swagger UI

Never commit `.env` or database credentials. Render deployment and the required
5–8 minute YouTube video are external submission steps and cannot be completed
by the source code alone.
