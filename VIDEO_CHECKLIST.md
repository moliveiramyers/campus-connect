# Week 06 Video Checklist (target: 6-7 minutes)

Keep the recording between 5:00 and 8:00. Use the published Render site--not
localhost--and keep `.env`, Render secret values, and database credentials off
screen.

Before recording, ensure the GitHub-linked demonstration account has the
`admin` role in MongoDB. A new GitHub OAuth account receives the default `user`
role and will receive `403` on Users, Events, and Venues admin operations.

## 0:00-0:40 -- Deployment and security

- Show `https://campus-connect-ckpe.onrender.com` returning the health JSON.
- Open the public `/api-docs/` route.
- Briefly show the public GitHub repository and `.env.example`/`.gitignore` to
  establish that real credentials are not committed. Do not open Render's
  secret-value screen.

## 0:40-1:20 -- Four collections and Swagger

- In Swagger UI, point out Users, Events, Venues, and Registrations.
- Point out GET, POST, PUT, and DELETE for all four collections.
- Open `/swagger.json` briefly to show that the executable document is present.

## 1:20-2:00 -- OAuth and protected routes

- While logged out, execute Venue POST or Registration POST and show `401`.
- Open `/auth/github`, complete GitHub login, and return to `/api-docs/`.
- Execute `/auth/status` and show `authenticated: true`.
- Explain that every collection write requires a session. Users, Events, and
  Venues require admin privileges for their write operations; Registrations
  allow owners or admins as documented.

## 2:00-4:40 -- CRUD and database changes

- Use prepared request bodies and IDs so this section stays fast.
- For each collection, demonstrate GET, POST, PUT, and DELETE with the proper
  status code. At minimum, expand every operation and execute enough requests
  to make the four complete CRUD sets unambiguous.
- Use this dependency order when creating records: User, Venue, Event, then
  Registration.
- After a POST and PUT, show the corresponding MongoDB Atlas document or run a
  GET-by-ID to prove the database value changed.
- Delete temporary demonstration records in reverse order: Registration,
  Event, Venue, then User.

Expected success codes:

- GET: `200`
- POST: `201`
- PUT: `200`
- DELETE: `200`

## 4:40-5:35 -- Data validation and errors

- Show invalid POST and PUT examples for both Week 06 collections (Venues and
  Registrations), each returning `400` after login.
- Useful invalid examples: Venue capacity `0`, missing required Venue fields,
  malformed Registration IDs, unsupported Registration status, or an empty
  PUT body.
- Briefly mention the documented `404`, `409`, and safe `500` responses.

## 5:35-6:20 -- Automated tests

- Run `npm test` and show all 61 tests passing.
- Highlight the eight separately named tests:
  - GET all Users and GET one User
  - GET all Events and GET one Event
  - GET all Venues and GET one Venue
  - GET all Registrations and GET one Registration
- Point out the OAuth `401` and validation tests.

## 6:20-6:50 -- Contributions and close

- Show `CONTRIBUTIONS.md` and state Alejandro's two Week 06 contributions.
- Show or read the GitHub and Render links.
- End the recording before 8:00, upload it to YouTube as public or unlisted,
  and test the link in an incognito window.
