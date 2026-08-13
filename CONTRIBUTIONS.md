# Week 07 Individual Contributions

Each team member must document at least two truthful personal contributions
toward the final week's deliverables. Team members should replace only their
own pending cells before submitting.

| Team member | Contribution 1 | Contribution 2 |
| --- | --- | --- |
| Alejandro Eliseo Valladares Crisanto | Completed the final rubric audit and deployment/video guidance, verifying the four CRUD collections, published Swagger, OAuth protection, validation, error handling, tests, and secret hygiene. | Implemented verified GitHub administrator promotion using a numeric provider-ID allowlist, connected the setting to Passport, Render, and environment configuration, and added automated promotion and authorization tests. |
| Abel Chiwandire | Pending team member confirmation. | Pending team member confirmation. |
| Carlos Enrique Guardado Cruz | Pending team member confirmation. | Pending team member confirmation. |
| Corbin Gerhard / Francis Van Scheltema | Pending team member confirmation. | Pending team member confirmation. |
| Lucky Ayei Inyang Eni | Pending team member confirmation. | Pending team member confirmation. |
| Marjorie William Oliveira Myers | Pending team member confirmation. | Pending team member confirmation. |

## Alejandro's verification evidence

- Final audit and demonstration guidance: commits `175fba0` and the Week 07
  updates in `PROJECT_STATUS.md`, `VIDEO_CHECKLIST.md`, and
  `CANVAS_SUBMISSION.md`.
- Verified GitHub administrator promotion: commit `2665eab`,
  `src/config/githubAdmins.js`, `src/config/passport.js`, `.env.example`,
  `render.yaml`, and `test/app.test.js`.
- Final validation hardening: route-level tests prove that invalid POST and PUT
  requests return `400` for Users, Events, Venues, and Registrations.

These statements are based on the repository history and project files. Every
other team member should enter only work they personally completed.
