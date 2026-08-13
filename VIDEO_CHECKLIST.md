# Week 07 Final Video Checklist (target: 7–7.5 minutes)

Keep the finished recording between 5:00 and 8:00. Demonstrate the published
Render application—not localhost—and keep `.env`, cookies, session IDs,
database credentials, and Render secret values off screen.

Before recording, log in once to confirm that `/auth/status` reports the
demonstration account with `role: admin`. Prepare the IDs and request bodies in
a private note so the CRUD section stays fast.

## 0:00–0:35 — Deployment and secret hygiene

- Open `https://campus-connect-ckpe.onrender.com` and show the health JSON.
- Open the public GitHub repository and briefly show `.gitignore` and
  `.env.example`; do not expose Render or local secret values.
- State that this is the published service, not localhost.

## 0:35–1:05 — Swagger and four collections

- Open `https://campus-connect-ckpe.onrender.com/api-docs/`.
- Point out Users, Events, Venues, and Registrations.
- Show that every collection has GET, POST, PUT, and DELETE operations.
- Briefly open `/swagger.json` to prove the executable contract is published.

## 1:05–1:50 — OAuth and protected routes

- While logged out, execute a protected request and show `401`.
- Open `/auth/github`, complete GitHub OAuth, and return to `/api-docs/`.
- Execute `/auth/status`; show `authenticated: true` and the admin role.
- State that every collection write is protected. Users and Registrations also
  enforce protected reads and owner/admin rules.

## 1:50–5:30 — CRUD and visible database changes

Create temporary records in this dependency order: User, Venue, Event,
Registration. Use the returned IDs in subsequent requests.

For each collection, visibly execute:

1. POST and show `201`.
2. GET all and GET by ID and show `200`.
3. PUT and show `200`; immediately GET by ID to prove the stored value changed.
4. DELETE and show `200`.

Delete in reverse dependency order: Registration, Event, Venue, User. Venue
and User deletion are soft deletes, so their records become inactive.

Expected success codes:

- GET: `200`
- POST: `201`
- PUT: `200`
- DELETE: `200`

## 5:30–6:20 — Validation and error handling

- Show the eight named automated validation cases: invalid POST and PUT for
  Users, Events, Venues, and Registrations, all returning `400`.
- Execute at least one invalid POST and one invalid PUT in published Swagger.
- Briefly show a CRUD controller's `try/catch` and the centralized error
  handler. Mention documented `400`, `404`, `409`, and safe `500` responses.

Useful invalid values include an invalid email, Event/Venue capacity `0`, a
malformed ObjectId, an unsupported Registration status, or an empty PUT body.

## 6:20–7:10 — Automated tests

- Run `npm test` and show `70` passed and `0` failed.
- Highlight the eight separately named GET tests:
  - GET all Users and GET one User
  - GET all Events and GET one Event
  - GET all Venues and GET one Venue
  - GET all Registrations and GET one Registration
- Point out the protection, validation, and safe-500 tests.

## 7:10–7:40 — Contributions and close

- Show `CONTRIBUTIONS.md` and state Alejandro's two Week 07 contributions.
- Show or read the GitHub and Render links.
- Stop before 8:00, upload to YouTube as public or unlisted, and verify the
  GitHub, Render, and YouTube links in an incognito window.
