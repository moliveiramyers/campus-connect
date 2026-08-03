# Week 05 Project Status Audit

Audit date: 2026-08-03

Reviewed baseline: `origin/main` at `9afbe05`

Implementation branch: `fix/week05-rubric-compliance`

Published service: `https://campus-connect-ckpe.onrender.com`

## Rubric status

| Requirement | Status | Evidence / remaining action |
| --- | --- | --- |
| Public deployment | Published; branch redeploy required | Render responds successfully at `/`, `/api-docs`, `/users`, `/events`, and `/venues`. Merge and redeploy this branch so Swagger executes against Render instead of localhost. |
| Two CRUD collections | Complete | Users and Events implement GET all, GET by ID, POST, PUT, and DELETE. Venues provides an additional complete CRUD collection. |
| Swagger documentation | Complete in branch | `swagger.json` validates and documents 15 operations with bodies, filters, and status responses. `/api-docs` loads `/swagger.json` dynamically from the current host. |
| Error handling | Complete in branch | All Users, Events, and Venues controllers use `try/catch`; centralized middleware returns 400, 404, 409, or safe 500 responses. |
| Validation | Complete in branch | Joi validates POST and PUT bodies, MongoDB ObjectIds, event dates, enums, URLs, and required fields. |
| Individual contribution | Alejandro complete | Two verified Week 05 contributions are recorded in `CONTRIBUTIONS.md`. Other members must record only their own work. |
| Video | External action pending | Record the required 5-8 minute video after the branch is merged and the public CRUD operations are verified. |

## Pull request review

- PR #3, `Contribution documentation`, is open, mergeable, and requests
  Alejandro's review.
- Its changes are valid: Abel documents two contributions, moves user creation
  to `POST /users`, and applies the update schema to `PUT /users/:id`.
- Its failed CI check is not caused by those changes. The base branch changed
  `GET /` to plain text while the existing test expects the API documentation
  link in the health response.
- This branch restores that response and also includes the same compatible
  Users route corrections, so it remains safe if PR #3 is merged first.

## Corrections in this branch

- Restored a JSON health response with links to `/api-docs` and
  `/swagger.json`.
- Added a public `/swagger.json` route and made Swagger UI use the current
  request host and protocol.
- Corrected user creation to `POST /users` and user updates to use the partial
  update schema.
- Completed Events Swagger definitions, parameters, request bodies, tags, and
  error responses.
- Added documented error responses for Users and Venues.
- Added explicit `try/catch` handling to every Venues controller.
- Made MongoDB configuration accept the proposal's `MONGODB_URI` name while
  preserving `MONGO_URI` compatibility.
- Added Venue CRUD route tests and corrected the existing health and Users test
  regressions.
- Removed a duplicate production `nodemon` dependency and patched the reported
  transitive npm vulnerability.

## Pre-submission checklist

- Review and merge PR #3 or coordinate its duplicated Users route changes.
- Review and merge this branch, then wait for Render to redeploy.
- Confirm the public `/swagger.json` reports the Render host with HTTPS.
- From the public Swagger UI, create, read, update, and delete records in two
  collections and confirm the MongoDB Atlas records change.
- Confirm invalid bodies and ObjectIds return 400, missing records return 404,
  and unexpected failures return 500.
- Have each team member document two truthful contributions.
- Record the 5-8 minute video and submit the GitHub, Render, and YouTube links.
