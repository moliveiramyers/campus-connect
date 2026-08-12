# Week 06 Project Status

Audit date: 2026-08-11

Audited commit:
`0f3b1b81c0d2e7af8f4940dbb9106643fcf80bfd`

Published service:
`https://campus-connect-ckpe.onrender.com`

## Rubric status

| Requirement | Status | Evidence / external action |
| --- | --- | --- |
| Deployment | Verified live | `/` returns `200`; `/api-docs/` and `/swagger.json` are public over HTTPS. The deployed Swagger host is `campus-connect-ckpe.onrender.com`. |
| Four CRUD collections | Complete | Users, Events, Venues, and Registrations each expose GET all, GET one, POST, PUT, and DELETE in the published Swagger document. |
| Swagger at `/api-docs` | Complete | The deployed Swagger 2.0 document validates and contains 26 operations: five for each collection and six authentication operations. |
| POST/PUT validation | Complete | Joi schemas validate create and update bodies for all four collections. Invalid authenticated requests are covered by automated `400` response tests. |
| OAuth | Ready for video verification | The live `/auth/github` route returns a `302` redirect to GitHub, and callback, status, logout, persistent sessions, and `401` protection are implemented. Complete the interactive GitHub login/logout on video. |
| Protected routes | Complete | Every collection write route requires a session. Users and Events/Venues enforce admin/self rules as applicable; Registrations enforce admin/owner rules. Live unauthenticated POST, PUT, and DELETE probes return `401`. |
| GET tests | Complete | Separate GET-all and GET-by-ID tests exist for all four collections. The full 61-test suite passes locally. |
| Individual contribution | Complete for Alejandro | Two Week 06 contributions are documented in `CONTRIBUTIONS.md`. |
| Sensitive configuration | Complete | `.env` is ignored and has never been tracked. A 29-commit history scan found no real database, OAuth, or session secrets; `.env.example` contains placeholders only. |
| CI | Complete | GitHub Actions passed on the audited commit. |
| Video and submission | External action pending | Record the 5-8 minute published-site demonstration, upload it to YouTube, replace the placeholder in `CANVAS_SUBMISSION.md`, and submit all three links in Canvas. |

## Verification result

`npm run check` passes:

- Swagger/OpenAPI validation: 26 operations
- Automated tests: 61 passed, 0 failed
- GET route coverage: 8 distinct tests across 4 collections
- Protected-route behavior: all 12 collection POST/PUT/DELETE probes return
  `401` without an authenticated session
- Production dependency audit: 0 known vulnerabilities

Published checks completed on 2026-08-11:

- Health endpoint: `200`
- Swagger JSON: `200`, HTTPS host, 14 paths and 26 operations
- Swagger UI: public at `/api-docs/`
- GitHub OAuth start: `302` to GitHub
- Authentication status while logged out: `200` with `authenticated: false`
- Public reads: Events and Venues return `200`
- Protected reads: Users and Registrations return `401` while logged out
- Invalid public Event filter: `400`

## Before recording

1. Confirm the GitHub OAuth App callback URL is
   `https://campus-connect-ckpe.onrender.com/auth/github/callback`.
2. Confirm the Render environment contains `GITHUB_CLIENT_ID`,
   `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, `MONGODB_URI`, and
   `SESSION_SECRET` without displaying their values in the recording.
3. Ensure the GitHub-linked demonstration user has the `admin` role in MongoDB;
   new OAuth users receive the default `user` role and cannot perform admin
   CRUD operations.
4. Log in through `/auth/github` and verify `/auth/status` reports
   `authenticated: true`.
5. Use the published `/api-docs/` to demonstrate CRUD for all four collections,
   including visible database changes and correct status codes.
6. Demonstrate invalid POST and PUT bodies returning `400` and unauthenticated
   protected writes returning `401`.
7. Run or show `npm test`, highlighting all eight GET/GetAll tests.
8. Record a 5-8 minute video, upload it to YouTube as public or unlisted, and
   verify all three submission links in an incognito window.
