# Week 07 Final Project Status

Audit date: 2026-08-12

Starting revision: `ac38debb93863012bd4092fe1385821979b974f5`

Published service: `https://campus-connect-ckpe.onrender.com`

The starting revision was synchronized with `origin/main` before this final
audit (`0` commits ahead and `0` behind). The final audit updates must still be
committed, pushed, and allowed to redeploy before recording.

## Rubric status

| Criterion | Status | Evidence / remaining action |
| --- | --- | --- |
| Deployment (15) | Functionally verified | On 2026-08-12, `/`, `/api-docs/`, and `/swagger.json` returned `200` over HTTPS. No real `.env` file or credentials are tracked. Push the final audit updates and wait for Render before recording. |
| OAuth (15) | Complete; interactive video check required | GitHub OAuth redirects to the published callback. Sessions are persistent in MongoDB. All collection writes are protected; Users and Registrations also have protected reads. Logged-out `/users` and `/registrations` return `401`. Complete login, authenticated access, logout, and a post-logout `401` on video. |
| Endpoints and documentation (35) | Complete | Swagger is executable at `/api-docs/`, validates successfully, and has 26 operations. Users, Events, Venues, and Registrations each have GET all, GET one, POST, PUT, and DELETE. The Event collection has more than seven stored fields. Demonstrate database changes at the published URL. |
| Testing (15) | Complete | All 70 tests pass. The suite contains separate GET-all and GET-by-ID tests for all four collections. Health, Swagger, auth status, protection, authorization, validation, and safe-500 behaviors are also tested. |
| Data validation (10) | Complete | Joi validates POST and PUT bodies for all four collections. Eight route-level cases prove that invalid POST/PUT requests return `400`, one pair per collection. |
| Error handling (10) | Complete | Every CRUD controller action uses `try/catch` and forwards failures to the centralized handler. Invalid input returns `400`; unexpected failures return a safe `500` without a production stack trace. |
| Individual contribution (20) | Complete for Alejandro | Two repository-backed Week 07 contributions are documented in `CONTRIBUTIONS.md` and prepared in `CANVAS_SUBMISSION.md`. Other team members must replace their pending entries with their own truthful work. |

## Final verification results

- Local branch synchronized with `origin/main` before the audit: `0` ahead,
  `0` behind.
- Swagger/OpenAPI validation: 14 paths and 26 operations.
- CRUD documentation: five operations for each of four collections.
- Automated tests: 70 passed, 0 failed.
- GET/GetAll test coverage: eight separately named route tests.
- Validation coverage: POST and PUT rejection tests for all four collections.
- Production dependency audit: zero known vulnerabilities.
- Mongoose updated to `9.9.2`; vulnerable transitive `js-yaml` updated to
  `4.3.1`.

Published checks completed on 2026-08-12:

- Health endpoint: `200`
- Swagger UI: `200`
- Swagger JSON: `200`, host `campus-connect-ckpe.onrender.com`, HTTPS
- Authentication status while logged out: `200` with
  `authenticated: false`
- GitHub OAuth start: `302` to GitHub with the published callback URL
- Public reads: Events and Venues return `200`
- Protected reads while logged out: Users and Registrations return `401`

## External steps still required

1. Commit and push the final audit changes, then wait for Render's automatic
   deployment to finish.
2. Confirm the GitHub OAuth App callback URL is exactly
   `https://campus-connect-ckpe.onrender.com/auth/github/callback`.
3. Log in through `/auth/github` and confirm `/auth/status` reports
   `authenticated: true` and `role: admin` for the demonstration account.
4. Record the 5–8 minute rubric demonstration using the published URL. Show
   authentication, all four CRUD collections, database mutations, invalid
   POST/PUT requests, error handling, and the passing tests.
5. Upload the video as public or unlisted, replace the placeholder in
   `CANVAS_SUBMISSION.md`, and test all three submission links in an incognito
   window.
