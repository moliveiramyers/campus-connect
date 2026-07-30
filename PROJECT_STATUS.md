# Project Status Audit

Audit date: 2026-07-30

Reviewed baseline: `main` at `ab87327`

Implementation branch: `feat/events-swagger-w05`

## Week 05 rubric

| Requirement | Status | Evidence / remaining action |
| --- | --- | --- |
| Two MongoDB collections with GET, POST, PUT, DELETE | Implemented in branch | Users and Events expose ten documented operations. |
| Request validation | Implemented in branch | Joi schemas reject unknown or invalid fields; IDs and event date order are validated. |
| Error handling and correct status codes | Implemented in branch | Each controller uses `try/catch`; centralized middleware returns 400, 404, 409, or 500 responses. |
| Swagger at `/api-docs` | Implemented and tested locally | `swagger.json` validates as OpenAPI 3.0.3 and Swagger UI serves all ten operations. |
| Published Render URL | Code is deploy-ready; external action pending | Sync `render.yaml`, set the secret `MONGODB_URI`, deploy, and execute CRUD from the public `/api-docs`. |
| Two contributions per team member | Alejandro documented; others pending | See `CONTRIBUTIONS.md`; every other member must record their own verified work. |
| 5–8 minute YouTube video | External action pending | Record only after the Render deployment and database mutations are verified. |

## Full proposal scope

| Area | Current state | Still needed after Week 05 |
| --- | --- | --- |
| Users | CRUD, local password hashing, validation, and error handling are present. | OAuth login/session flow and role-based authorization. |
| Events | CRUD, model, validation, filters, Swagger, and route tests are present in this branch. | Organizer/admin authorization and optional business-rule tests. |
| Venues | Not present in the reviewed repository. | Model, validation, CRUD, Swagger, and tests assigned to its team owner. |
| Registrations | Not present in the reviewed repository. | Model, relationships, CRUD, ownership rules, Swagger, and tests. |
| Feedback | Not present; proposal marks it as stretch scope. | Add only after required collections and authentication are stable. |
| Authentication | Not present. | OAuth 2.0 provider, sessions, `/auth/status`, logout, and protected routes. |
| Testing | Route tests cover both current CRUD collections with mocked model methods. | Add database-backed integration tests and the proposal's remaining GET/unit tests. |
| Deployment | Render Blueprint and health endpoint are ready. | Publish from the shared team account, configure secrets, and verify the live database. |

## Baseline findings corrected in this branch

- The baseline contained only the Users collection and no Swagger UI.
- `npm test` intentionally exited with an error.
- User updates required every creation field and could store a submitted password
  as an unmodeled plain field instead of updating its hash.
- Duplicate-key and Mongoose validation errors could become 500 responses in
  development.
- The documented proposal used `MONGODB_URI`, while the code only read
  `MONGO_URI`.
- There was no `.env.example`, Render configuration, meaningful README, or
  individual-contribution record.

## Pre-submission checklist

- Merge this branch only after a teammate reviews it and checks for new parallel
  branches.
- Set `MONGODB_URI` in Render; never commit its value.
- Use the public Swagger UI to create, read, update, and delete both a User and
  an Event, confirming the MongoDB Atlas records change.
- Confirm invalid bodies and invalid ObjectIds return 400, missing records
  return 404, and unexpected errors return 500.
- Have every team member add two truthful contributions.
- Record the 5–8 minute video at the published URL and submit the GitHub,
  Render, and YouTube links.
