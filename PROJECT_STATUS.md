# Week 06 Project Status

Audit date: 2026-08-05

Published service to redeploy:
`https://campus-connect-ckpe.onrender.com`

## Rubric status

| Requirement | Local status | Evidence / external action |
| --- | --- | --- |
| Four CRUD collections | Complete | Users, Events, Venues, and Registrations each expose GET all, GET one, POST, PUT, and DELETE. |
| Swagger at `/api-docs` | Complete | `swagger.json` validates and contains 24 operations; protected operations declare GitHub OAuth. Redeploy before recording. |
| POST/PUT validation | Complete | Joi schemas validate create and update bodies for all four collections. |
| OAuth | Complete in code | GitHub login, callback, status, logout, persistent production sessions, and `401` protection are implemented. Configure the GitHub OAuth App and Render secrets. |
| Protected collections | Complete | Venue and Registration POST/PUT/DELETE routes require authentication. |
| GET tests | Complete | Separate GET-all and GET-by-ID tests exist for all four collections; all local checks pass. |
| Individual contribution | Complete for Alejandro | Two Week 06 contributions are documented in `CONTRIBUTIONS.md`. |
| Video and submission | External action pending | Record after pushing and redeploying; submit GitHub, Render, and YouTube links in Canvas. |

## Verification result

`npm run check` passes:

- Swagger/OpenAPI validation: 24 operations
- Automated tests: 15 passed, 0 failed
- GET route coverage: 8 distinct tests across 4 collections
- Protected-route behavior: Venue and Registration POST/PUT return `401`
  without an OAuth session

## Before recording

1. Push the completed branch to the shared GitHub repository.
2. In GitHub, create or update the OAuth App callback URL to
   `https://campus-connect-ckpe.onrender.com/auth/github/callback`.
3. In Render, configure `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`,
   `GITHUB_CALLBACK_URL`, `MONGODB_URI`, and `SESSION_SECRET`.
4. Redeploy and log in through `/auth/github`.
5. Use the published `/api-docs` to demonstrate CRUD for all four collections,
   including visible database changes and correct status codes.
6. Demonstrate invalid POST and PUT bodies returning `400` and unauthenticated
   protected writes returning `401`.
7. Run or show `npm test`, highlighting all eight GET/GetAll tests.
8. Record a 5–8 minute video and verify all three submission links are public.
