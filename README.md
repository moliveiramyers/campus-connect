# CampusConnect API

CampusConnect is a Node.js, Express, and MongoDB REST API for campus users,
events, venues, and event registrations. It provides CRUD-style endpoints for
four collections with validation, centralized error handling, Swagger
documentation, and session-based authentication.

## Implemented collections

| Collection | Base route | Operations | Validation | Protection |
| --- | --- | --- | --- | --- |
| Users | `/users` | GET all, GET one, POST, PUT, DELETE | Joi | Session-authenticated access; admins can manage all users, and users can access their own records |
| Events | `/events` | GET all, GET one, POST, PUT, DELETE | Joi | Session-authenticated admin writes; public reads |
| Venues | `/venues` | GET all, GET one, POST, PUT, DELETE | Joi | Session-authenticated admin writes; public reads |
| Registrations | `/registrations` | GET all, GET one, POST, PUT, DELETE | Joi | Session-authenticated access; owners can manage their own registrations, admins can manage all |

Protected operations require a valid authenticated session. Authentication can be established either by registering and logging in locally via /auth/register and /auth/login, or by signing in with GitHub OAuth at /auth/github. Once authenticated, protected routes use the session cookie rather than requiring GitHub credentials directly. Invalid bodies and IDs return `400`; missing records
return `404`; duplicate records return `409`; unexpected errors return a safe
`500` response.

## Local setup

Requirements:

- Node.js 20.19 or newer
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

GitHub administrator access is based only on the numeric provider ID returned
by the verified OAuth profile. The project administrator ID `230255671` is
allowlisted for the course deployment. Additional trusted IDs can be supplied
as a comma-separated `GITHUB_ADMIN_IDS` value. On the next GitHub login, an
allowlisted active account is promoted to the `admin` role and the change is
persisted. GitHub numeric IDs are public identifiers, not credentials.

## Automated checks

```bash
npm run check
```

This validates `swagger.json` and runs isolated HTTP tests without connecting
to the production database. The test suite includes separate GET-all and
GET-by-ID tests for each of the four collections, protected-route checks, and
route-level POST/PUT validation checks for every collection. As of the
2026-08-12 final audit, Swagger contains 26 operations and all 70 automated
tests pass.

## Render deployment

`render.yaml` defines the Node service, health check, MongoDB setting, session
secret, and GitHub OAuth settings. In the Render dashboard, provide these
secrets and redeploy:

- `MONGODB_URI`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL` (recommended when the OAuth callback is registered)
- `GITHUB_ADMIN_IDS` (non-secret, comma-separated trusted GitHub numeric IDs)

After deployment, verify `/`, `/api-docs`, `/swagger.json`, `/auth/github`, and
all four collections from the published site. Never commit `.env`, database
credentials, OAuth secrets, or session secrets.

The current team service is:
`https://campus-connect-ckpe.onrender.com/api-docs`.

The published health route, Swagger UI, Swagger JSON, OAuth redirect, public
reads, and unauthenticated route protection were verified on 2026-08-12. The
final audit changes must be pushed and redeployed before recording. The
interactive OAuth callback, database mutation demonstration, and 5–8 minute
YouTube recording remain external submission steps; see `PROJECT_STATUS.md`
and `VIDEO_CHECKLIST.md`.
