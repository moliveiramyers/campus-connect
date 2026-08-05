# CampusConnect API

CampusConnect is a Node.js, Express, and MongoDB REST API for campus users,
events, venues, and event registrations. It implements the four-collection
CSE 341 Week 06 deliverable with validation, centralized errors, GitHub OAuth,
protected writes, automated GET tests, and executable Swagger documentation.

## Implemented collections

| Collection | Base route | Operations | POST/PUT validation | Protected writes |
| --- | --- | --- | --- | --- |
| Users | `/users` | GET all, GET one, POST, PUT, DELETE | Joi | No |
| Events | `/events` | GET all, GET one, POST, PUT, DELETE | Joi | No |
| Venues | `/venues` | GET all, GET one, POST, PUT, DELETE | Joi | GitHub OAuth |
| Registrations | `/registrations` | GET all, GET one, POST, PUT, DELETE | Joi | GitHub OAuth |

Venue and registration POST, PUT, and DELETE routes return `401` unless the
request has an authenticated GitHub session. Invalid bodies and IDs return
`400`; missing records return `404`; duplicate records return `409`; unexpected
errors return a safe `500` response.

## Local setup

Requirements:

- Node.js 20 or newer
- A MongoDB Atlas database
- A GitHub OAuth App

Install dependencies and create the environment file:

```bash
npm install
cp .env.example .env
```

Set the values in `.env`, then start the application:

```bash
npm run dev
```

The API starts at `http://localhost:8080`. Swagger UI is available at
`http://localhost:8080/api-docs` and the raw contract at `/swagger.json`.

## GitHub OAuth setup

Create an OAuth App under GitHub **Settings > Developer settings > OAuth Apps**.
For local development, use this authorization callback URL:

```text
http://localhost:8080/auth/github/callback
```

Set its client ID and secret as `GITHUB_CLIENT_ID` and
`GITHUB_CLIENT_SECRET`. Also set a long random `SESSION_SECRET`. For Render,
register the published callback URL as:

```text
https://YOUR-SERVICE.onrender.com/auth/github/callback
```

Then set that exact value as `GITHUB_CALLBACK_URL` in Render. Open
`/auth/github` in the browser to log in. A successful login returns to
`/api-docs`; Swagger requests on the same site use the session cookie. Use
`/auth/status` to verify the session and `/auth/logout` to end it.

## Automated checks

```bash
npm run check
```

This validates `swagger.json` and runs isolated HTTP tests without connecting
to the production database. The test suite includes separate GET-all and
GET-by-ID tests for each of the four collections, protected-route checks, and
validation/error-response checks.

## Render deployment

`render.yaml` defines the Node service, health check, MongoDB setting, session
secret, and GitHub OAuth settings. In the Render dashboard, provide these
secrets and redeploy:

- `MONGODB_URI`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL` (recommended when the OAuth callback is registered)

After deployment, verify `/`, `/api-docs`, `/swagger.json`, `/auth/github`, and
all four collections from the published site. Never commit `.env`, database
credentials, OAuth secrets, or session secrets.

The current team service is:
`https://campus-connect-ckpe.onrender.com/api-docs`.

The GitHub push, Render redeployment, database demonstration, and 5–8 minute
YouTube recording are external submission steps.
