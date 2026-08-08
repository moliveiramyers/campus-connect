import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import bcrypt from 'bcrypt';

import Event from '../src/models/events.js';
import Registration from '../src/models/registrations.js';
import User from '../src/models/users.js';
import Venue from '../src/models/venues.js';

import {
    createRegistrationSchema,
    createAdminRegistrationSchema,
    updateRegistrationSchema,
    updateAdminRegistrationSchema
} from '../src/validators/validateRegistrations.js';

import {
    createVenueSchema,
    updateVenueSchema
} from '../src/validators/validateVenue.js';

process.env.NODE_ENV = 'test';

const { default: app } = await import('../src/app.js');

const USER_ID = '66b4b7d9a2f1c3e4d5a6b7c8';
const ADMIN_ID = '66b4b7d9a2f1c3e4d5a6b7cf';
const OTHER_USER_ID = '66b4b7d9a2f1c3e4d5a6b7ce';
const EVENT_ID = '66b4b7d9a2f1c3e4d5a6b7c9';
const VENUE_ID = '66b4b7d9a2f1c3e4d5a6b7ca';
const REGISTRATION_ID = '66b4b7d9a2f1c3e4d5a6b7cb';

const TEST_PASSWORD = 'Campus123!';

const userFixture = {
    _id: USER_ID,
    id: USER_ID,
    name: 'Alex Student',
    email: 'alex.student@example.com',
    role: 'user',
    isActive: true,
    authMethods: [{ provider: 'local' }]
};

const adminFixture = {
    _id: ADMIN_ID,
    id: ADMIN_ID,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    isActive: true,
    authMethods: [{ provider: 'local' }]
};

const otherUserFixture = {
    _id: OTHER_USER_ID,
    id: OTHER_USER_ID,
    name: 'Other Student',
    email: 'other.student@example.com',
    role: 'user',
    isActive: true,
    authMethods: [{ provider: 'local' }]
};

const eventFixture = {
    _id: EVENT_ID,
    title: 'Campus Technology Fair',
    description:
        'Students present technology projects to the campus community.',
    category: 'Technology',
    startDate: '2026-08-15T15:00:00.000Z',
    endDate: '2026-08-15T18:00:00.000Z',
    venueId: VENUE_ID,
    organizerId: USER_ID,
    capacity: 150,
    status: 'published'
};

const venueFixture = {
    _id: VENUE_ID,
    name: 'Library Auditorium',
    venueType: 'in-person',
    building: 'Library Building',
    room: '205',
    address: 'Campus North',
    capacity: 150,
    accessibilityNotes: 'Wheelchair accessible.',
    isActive: true
};

const registrationFixture = {
    _id: REGISTRATION_ID,
    userId: USER_ID,
    eventId: EVENT_ID,
    status: 'registered',
    notes: 'Requires wheelchair seating.'
};

let server;
let baseUrl;

const originalFindById = User.findById.bind(User);
const authenticatedFixtures = new Map();

User.findById = async (id) => {
    const fixture = authenticatedFixtures.get(id.toString());

    if (fixture) {
        return fixture;
    }

    return originalFindById(id);
};

before(async () => {
    await new Promise((resolve) => {
        server = app.listen(0, '127.0.0.1', () => {
            const { port } = server.address();
            baseUrl = `http://127.0.0.1:${port}`;
            resolve();
        });
    });
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
});

const request = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
            ...(options.body
                ? { 'content-type': 'application/json' }
                : {}),
            ...options.headers
        }
    });

    const contentType = response.headers.get('content-type') || '';

    const body = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

    return { response, body };
};

const withStub = async (target, method, replacement, callback) => {
    const original = target[method];

    target[method] = replacement;

    try {
        return await callback();
    } finally {
        target[method] = original;
    }
};

const getSessionCookie = (setCookieHeader) => {
    assert.ok(
        setCookieHeader,
        'Authentication response did not contain a session cookie.'
    );

    return setCookieHeader.split(';')[0];
};

const loginAs = async (fixture) => {
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

    const authenticatedFixture = {
        ...fixture,
        authMethods: [
            {
                provider: 'local',
                passwordHash
            }
        ]
    };

    authenticatedFixtures.set(
        fixture.id.toString(),
        authenticatedFixture
    );

    return withStub(
        User,
        'findOne',
        () => ({
            select: async () => authenticatedFixture
        }),
        async () => {
            const result = await request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: fixture.email,
                    password: TEST_PASSWORD
                })
            });

            assert.equal(
                result.response.status,
                200,
                `Expected ${fixture.role} login to succeed.`
            );

            return getSessionCookie(
                result.response.headers.get('set-cookie')
            );
        }
    );
};

const getUserSession = () => loginAs(userFixture);
const getAdminSession = () => loginAs(adminFixture);

/* -------------------------------------------------------------------------- */
/* HEALTH / SWAGGER / AUTH                                                     */
/* -------------------------------------------------------------------------- */

test('health route and Swagger document are available', async () => {
    const health = await request('/');

    assert.equal(health.response.status, 200);
    assert.equal(health.body.documentation, '/api-docs');

    const swagger = await request('/swagger.json');

    assert.equal(swagger.response.status, 200);

    assert.ok(
        swagger.body.paths['/users']
        || swagger.body.paths['/users/']
    );

    assert.ok(
        swagger.body.paths['/events']
        || swagger.body.paths['/events/']
    );

    assert.ok(
        swagger.body.paths['/venues']
        || swagger.body.paths['/venues/']
    );

    assert.ok(
        swagger.body.paths['/registrations']
        || swagger.body.paths['/registrations/']
    );

    assert.ok(swagger.body.paths['/auth/github']);
    assert.ok(swagger.body.securityDefinitions.githubOAuth);

    assert.equal(swagger.body.host, new URL(baseUrl).host);
    assert.deepEqual(swagger.body.schemes, ['http']);

    const docs = await request('/api-docs/');

    assert.equal(docs.response.status, 200);
    assert.match(docs.body, /Swagger UI/);

    const swaggerInit = await request('/api-docs/swagger-ui-init.js');

    assert.equal(swaggerInit.response.status, 200);
    assert.match(swaggerInit.body, /\/swagger\.json/);
    assert.doesNotMatch(swaggerInit.body, /localhost:8080/);

    const authStatus = await request('/auth/status');

    assert.equal(authStatus.response.status, 200);
    assert.equal(authStatus.body.authenticated, false);

    const oauthUnavailable = await request('/auth/github');

    assert.equal(oauthUnavailable.response.status, 503);
});

/* -------------------------------------------------------------------------- */
/* AUTHENTICATION                                                               */
/* -------------------------------------------------------------------------- */

test('protected routes reject unauthenticated requests', async () => {
    const requests = [
        request('/users'),

        request(`/users/${USER_ID}`),

        request('/users', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New User',
                email: 'new.user@example.com',
                password: TEST_PASSWORD
            })
        }),

        request('/events', {
            method: 'POST',
            body: JSON.stringify(eventFixture)
        }),

        request(`/events/${EVENT_ID}`, {
            method: 'PUT',
            body: JSON.stringify({
                capacity: 200
            })
        }),

        request(`/events/${EVENT_ID}`, {
            method: 'DELETE'
        }),

        request('/venues', {
            method: 'POST',
            body: JSON.stringify({})
        }),

        request('/registrations', {
            method: 'POST',
            body: JSON.stringify({
                eventId: EVENT_ID
            })
        }),

        request('/registrations'),

        request(`/registrations/${REGISTRATION_ID}`, {
            method: 'PUT',
            body: JSON.stringify({
                status: 'attended'
            })
        }),

        request(`/registrations/${REGISTRATION_ID}`, {
            method: 'DELETE'
        })
    ];

    const results = await Promise.all(requests);

    results.forEach(({ response, body }) => {
        assert.equal(response.status, 401);
        assert.equal(body.status, 'fail');
    });
});

/* -------------------------------------------------------------------------- */
/* USERS                                                                       */
/* -------------------------------------------------------------------------- */

test('GET /users returns all users for an admin', async () => {
    const session = await getAdminSession();

    await withStub(
        User,
        'find',
        async () => [userFixture, adminFixture],
        async () => {
            const result = await request('/users', {
                headers: {
                    cookie: session
                }
            });

            assert.equal(result.response.status, 200);
            assert.equal(result.body.length, 2);
        }
    );
});

test('regular users cannot GET all users', async () => {
    const session = await getUserSession();

    const result = await request('/users', {
        headers: {
            cookie: session
        }
    });

    assert.equal(result.response.status, 403);
});

test('GET /users/:id allows a user to access their own profile', async () => {
    const session = await getUserSession();

    await withStub(
        User,
        'findById',
        async () => userFixture,
        async () => {
            const result = await request(`/users/${USER_ID}`, {
                headers: {
                    cookie: session
                }
            });

            assert.equal(result.response.status, 200);
            assert.equal(result.body._id, USER_ID);
        }
    );
});

test('GET /users/:id prevents a regular user from accessing another user', async () => {
    const session = await getUserSession();

    const result = await request(`/users/${OTHER_USER_ID}`, {
        headers: {
            cookie: session
        }
    });

    assert.equal(result.response.status, 403);
});

test('admin can GET any user by ID', async () => {
    const session = await getAdminSession();

    await withStub(
        User,
        'findById',
        async () => userFixture,
        async () => {
            const result = await request(`/users/${USER_ID}`, {
                headers: {
                    cookie: session
                }
            });

            assert.equal(result.response.status, 200);
            assert.equal(result.body._id, USER_ID);
        }
    );
});

test('admin can create a user', async () => {
    const session = await getAdminSession();

    await withStub(
        User,
        'create',
        async (payload) => ({
            _id: OTHER_USER_ID,
            id: OTHER_USER_ID,
            ...payload,
            authMethods: payload.authMethods.map(
                ({ provider }) => ({ provider })
            )
        }),
        async () => {
            const result = await request('/users', {
                method: 'POST',
                headers: {
                    cookie: session
                },
                body: JSON.stringify({
                    name: 'Other Student',
                    email: 'other.student@example.com',
                    password: TEST_PASSWORD,
                    role: 'user'
                })
            });

            assert.equal(result.response.status, 201);
        }
    );
});

test('regular users cannot create users', async () => {
    const session = await getUserSession();

    const result = await request('/users', {
        method: 'POST',
        headers: {
            cookie: session
        },
        body: JSON.stringify({
            name: 'Other Student',
            email: 'other.student@example.com',
            password: TEST_PASSWORD
        })
    });

    assert.equal(result.response.status, 403);
});

test('user can update their own profile', async () => {
    const session = await getUserSession();

    const user = {
        ...userFixture,
        authMethods: [...userFixture.authMethods],
        async save() {
            return this;
        }
    };

    await withStub(
        User,
        'findById',
        async () => user,
        async () => {
            const result = await request(`/users/${USER_ID}`, {
                method: 'PUT',
                headers: {
                    cookie: session
                },
                body: JSON.stringify({
                    name: 'Alex Updated'
                })
            });

            assert.equal(result.response.status, 200);
            assert.equal(result.body.name, 'Alex Updated');
        }
    );
});

test('admin can update another user', async () => {
    const session = await getAdminSession();

    const user = {
        ...userFixture,
        authMethods: [...userFixture.authMethods],
        async save() {
            return this;
        }
    };

    await withStub(
        User,
        'findById',
        async () => user,
        async () => {
            const result = await request(`/users/${USER_ID}`, {
                method: 'PUT',
                headers: {
                    cookie: session
                },
                body: JSON.stringify({
                    name: 'Admin Updated'
                })
            });

            assert.equal(result.response.status, 200);
            assert.equal(result.body.name, 'Admin Updated');
        }
    );
});

test('regular users cannot update another user', async () => {
    const session = await getUserSession();

    const result = await request(`/users/${OTHER_USER_ID}`, {
        method: 'PUT',
        headers: {
            cookie: session
        },
        body: JSON.stringify({
            name: 'Unauthorized Update'
        })
    });

    assert.equal(result.response.status, 403);
});

test('user can deactivate their own account', async () => {
    const session = await getUserSession();

    await withStub(
        User,
        'findOneAndUpdate',
        async () => ({
            ...userFixture,
            isActive: false
        }),
        async () => {
            const result = await request(`/users/${USER_ID}`, {
                method: 'DELETE',
                headers: {
                    cookie: session
                }
            });

            assert.equal(result.response.status, 200);
        }
    );
});

test('admin can deactivate another user', async () => {
    const session = await getAdminSession();

    await withStub(
        User,
        'findOneAndUpdate',
        async () => ({
            ...userFixture,
            isActive: false
        }),
        async () => {
            const result = await request(`/users/${USER_ID}`, {
                method: 'DELETE',
                headers: {
                    cookie: session
                }
            });

            assert.equal(result.response.status, 200);
        }
    );
});

test('regular users cannot deactivate another user', async () => {
    const session = await getUserSession();

    const result = await request(`/users/${OTHER_USER_ID}`, {
        method: 'DELETE',
        headers: {
            cookie: session
        }
    });

    assert.equal(result.response.status, 403);
});

/* -------------------------------------------------------------------------- */
/* EVENTS                                                                      */
/* -------------------------------------------------------------------------- */

test('GET /events returns all events', async () => {
    await withStub(
        Event,
        'find',
        () => ({
            sort: async () => [eventFixture]
        }),
        async () => {
            const result = await request('/events?status=published');

            assert.equal(result.response.status, 200);
            assert.equal(result.body.length, 1);
        }
    );
});

test('GET /events/:id returns one event', async () => {
    await withStub(
        Event,
        'findById',
        async () => eventFixture,
        async () => {
            const result = await request(`/events/${EVENT_ID}`);

            assert.equal(result.response.status, 200);
            assert.equal(result.body._id, EVENT_ID);
        }
    );
});

test('admin can create an event', async () => {
    const session = await getAdminSession();

    await withStub(
        Event,
        'create',
        async (payload) => ({
            _id: EVENT_ID,
            ...payload
        }),
        async () => {
            const result = await request('/events', {
                method: 'POST',
                headers: {
                    cookie: session
                },
                body: JSON.stringify({
                    ...eventFixture,
                    _id: undefined
                })
            });

            assert.equal(result.response.status, 201);
        }
    );
});

test('regular users cannot create an event', async () => {
    const session = await getUserSession();

    const result = await request('/events', {
        method: 'POST',
        headers: {
            cookie: session
        },
        body: JSON.stringify(eventFixture)
    });

    assert.equal(result.response.status, 403);
});

test('admin can update an event', async () => {
    const session = await getAdminSession();

    const event = {
        ...eventFixture,
        async save() {
            return this;
        }
    };

    await withStub(
        Event,
        'findById',
        async () => event,
        async () => {
            const result = await request(`/events/${EVENT_ID}`, {
                method: 'PUT',
                headers: {
                    cookie: session
                },
                body: JSON.stringify({
                    capacity: 200
                })
            });

            assert.equal(result.response.status, 200);
            assert.equal(result.body.capacity, 200);
        }
    );
});

test('regular users cannot update an event', async () => {
    const session = await getUserSession();

    const result = await request(`/events/${EVENT_ID}`, {
        method: 'PUT',
        headers: {
            cookie: session
        },
        body: JSON.stringify({
            capacity: 200
        })
    });

    assert.equal(result.response.status, 403);
});

test('admin can delete an event', async () => {
    const session = await getAdminSession();

    await withStub(
        Event,
        'findByIdAndDelete',
        async () => eventFixture,
        async () => {
            const result = await request(`/events/${EVENT_ID}`, {
                method: 'DELETE',
                headers: {
                    cookie: session
                }
            });

            assert.equal(result.response.status, 200);
        }
    );
});

test('regular users cannot delete an event', async () => {
    const session = await getUserSession();

    const result = await request(`/events/${EVENT_ID}`, {
        method: 'DELETE',
        headers: {
            cookie: session
        }
    });

    assert.equal(result.response.status, 403);
});

/* -------------------------------------------------------------------------- */
/* VENUES                                                                      */
/* -------------------------------------------------------------------------- */

test('GET /venues returns all active venues', async () => {
    await withStub(
        Venue,
        'find',
        async () => [venueFixture],
        async () => {
            const result = await request('/venues');

            assert.equal(result.response.status, 200);
            assert.equal(result.body.length, 1);
        }
    );
});

test('GET /venues/:id returns one venue', async () => {
    await withStub(
        Venue,
        'findOne',
        async () => venueFixture,
        async () => {
            const result = await request(`/venues/${VENUE_ID}`);

            assert.equal(result.response.status, 200);
            assert.equal(result.body._id, VENUE_ID);
        }
    );
});

test('admin can create a venue', async () => {
    const session = await getAdminSession();

    await withStub(
        Venue,
        'create',
        async (payload) => ({
            _id: VENUE_ID,
            ...payload
        }),
        async () => {
            const result = await request('/venues', {
                method: 'POST',
                headers: {
                    cookie: session
                },
                body: JSON.stringify({
                    ...venueFixture,
                    _id: undefined,
                    isActive: undefined
                })
            });

            assert.equal(result.response.status, 201);
        }
    );
});

test('regular users cannot create a venue', async () => {
    const session = await getUserSession();

    const result = await request('/venues', {
        method: 'POST',
        headers: {
            cookie: session
        },
        body: JSON.stringify(venueFixture)
    });

    assert.equal(result.response.status, 403);
});

test('admin can update a venue', async () => {
    const session = await getAdminSession();

    await withStub(
        Venue,
        'findOneAndUpdate',
        async (filter, update) => ({
            ...venueFixture,
            ...update
        }),
        async () => {
            const result = await request(`/venues/${VENUE_ID}`, {
                method: 'PUT',
                headers: {
                    cookie: session
                },
                body: JSON.stringify({
                    capacity: 250
                })
            });

            assert.equal(result.response.status, 200);
            assert.equal(result.body.capacity, 250);
        }
    );
});

test('regular users cannot update a venue', async () => {
    const session = await getUserSession();

    const result = await request(`/venues/${VENUE_ID}`, {
        method: 'PUT',
        headers: {
            cookie: session
        },
        body: JSON.stringify({
            capacity: 250
        })
    });

    assert.equal(result.response.status, 403);
});

test('admin can deactivate a venue', async () => {
    const session = await getAdminSession();

    await withStub(
        Venue,
        'findOneAndUpdate',
        async () => ({
            ...venueFixture,
            isActive: false
        }),
        async () => {
            const result = await request(`/venues/${VENUE_ID}`, {
                method: 'DELETE',
                headers: {
                    cookie: session
                }
            });

            assert.equal(result.response.status, 200);
        }
    );
});

test('regular users cannot deactivate a venue', async () => {
    const session = await getUserSession();

    const result = await request(`/venues/${VENUE_ID}`, {
        method: 'DELETE',
        headers: {
            cookie: session
        }
    });

    assert.equal(result.response.status, 403);
});

/* -------------------------------------------------------------------------- */
/* REGISTRATIONS                                                               */
/* -------------------------------------------------------------------------- */

test('admin can GET all registrations', async () => {
    const session = await getAdminSession();

    await withStub(
        Registration,
        'find',
        () => ({
            sort: async () => [registrationFixture]
        }),
        async () => {
            const result = await request('/registrations', {
                headers: {
                    cookie: session
                }
            });

            assert.equal(result.response.status, 200);
            assert.equal(result.body.length, 1);
        }
    );
});

test('regular users cannot GET all registrations', async () => {
    const session = await getUserSession();

    const result = await request('/registrations', {
        headers: {
            cookie: session
        }
    });

    assert.equal(result.response.status, 403);
});

test('registration owner can access their registration', async () => {
    const session = await getUserSession();

    await withStub(
        Registration,
        'findById',
        async () => registrationFixture,
        async () => {
            const result = await request(
                `/registrations/${REGISTRATION_ID}`,
                {
                    headers: {
                        cookie: session
                    }
                }
            );

            assert.equal(result.response.status, 200);
            assert.equal(result.body._id, REGISTRATION_ID);
        }
    );
});

test('admin can access any registration', async () => {
    const session = await getAdminSession();

    await withStub(
        Registration,
        'findById',
        async () => ({
            ...registrationFixture,
            userId: OTHER_USER_ID
        }),
        async () => {
            const result = await request(
                `/registrations/${REGISTRATION_ID}`,
                {
                    headers: {
                        cookie: session
                    }
                }
            );

            assert.equal(result.response.status, 200);
        }
    );
});

test('regular user cannot access another users registration', async () => {
    const session = await getUserSession();

    await withStub(
        Registration,
        'findById',
        async () => ({
            ...registrationFixture,
            userId: OTHER_USER_ID
        }),
        async () => {
            const result = await request(
                `/registrations/${REGISTRATION_ID}`,
                {
                    headers: {
                        cookie: session
                    }
                }
            );

            assert.equal(result.response.status, 403);
        }
    );
});

test('missing registration returns 404', async () => {
    const session = await getUserSession();

    await withStub(
        Registration,
        'findById',
        async () => null,
        async () => {
            const result = await request(
                `/registrations/${REGISTRATION_ID}`,
                {
                    headers: {
                        cookie: session
                    }
                }
            );

            assert.equal(result.response.status, 404);
        }
    );
});

test('authenticated user can create their own registration', async () => {
    const session = await getUserSession();

    await withStub(
        Registration,
        'create',
        async (payload) => ({
            _id: REGISTRATION_ID,
            ...payload
        }),
        async () => {
            const result = await request('/registrations', {
                method: 'POST',
                headers: {
                    cookie: session
                },
                body: JSON.stringify({
                    eventId: EVENT_ID,
                    status: 'registered',
                    notes: 'Requires wheelchair seating.'
                })
            });

            assert.equal(result.response.status, 201);
            assert.equal(result.body.userId, USER_ID);
            assert.equal(result.body.eventId, EVENT_ID);
        }
    );
});

test('regular user cannot supply userId when creating a registration', async () => {
    const session = await getUserSession();

    const result = await request('/registrations', {
        method: 'POST',
        headers: {
            cookie: session
        },
        body: JSON.stringify({
            userId: OTHER_USER_ID,
            eventId: EVENT_ID,
            status: 'registered'
        })
    });

    assert.equal(result.response.status, 400);
    assert.equal(result.body.status, 'fail');
});

test('admin can create a registration for another user', async () => {
    const session = await getAdminSession();

    await withStub(
        Registration,
        'create',
        async (payload) => ({
            _id: REGISTRATION_ID,
            ...payload
        }),
        async () => {
            const result = await request('/registrations', {
                method: 'POST',
                headers: {
                    cookie: session
                },
                body: JSON.stringify({
                    userId: OTHER_USER_ID,
                    eventId: EVENT_ID,
                    status: 'registered',
                    notes: 'Created by administrator.'
                })
            });

            assert.equal(result.response.status, 201);
            assert.equal(result.body.userId, OTHER_USER_ID);
            assert.equal(result.body.eventId, EVENT_ID);
        }
    );
});

test('registration owner can update their registration', async () => {
    const session = await getUserSession();

    await withStub(
        Registration,
        'findById',
        async () => registrationFixture,
        async () => {
            await withStub(
                Registration,
                'findByIdAndUpdate',
                async (id, update) => ({
                    ...registrationFixture,
                    ...update
                }),
                async () => {
                    const result = await request(
                        `/registrations/${REGISTRATION_ID}`,
                        {
                            method: 'PUT',
                            headers: {
                                cookie: session
                            },
                            body: JSON.stringify({
                                status: 'attended'
                            })
                        }
                    );

                    assert.equal(result.response.status, 200);
                    assert.equal(result.body.status, 'attended');
                }
            );
        }
    );
});

test('admin can update another users registration', async () => {
    const session = await getAdminSession();

    await withStub(
        Registration,
        'findById',
        async () => ({
            ...registrationFixture,
            userId: OTHER_USER_ID
        }),
        async () => {
            await withStub(
                Registration,
                'findByIdAndUpdate',
                async (id, update) => ({
                    ...registrationFixture,
                    userId: OTHER_USER_ID,
                    ...update
                }),
                async () => {
                    const result = await request(
                        `/registrations/${REGISTRATION_ID}`,
                        {
                            method: 'PUT',
                            headers: {
                                cookie: session
                            },
                            body: JSON.stringify({
                                userId: OTHER_USER_ID,
                                status: 'attended'
                            })
                        }
                    );

                    assert.equal(result.response.status, 200);
                    assert.equal(result.body.status, 'attended');
                    assert.equal(result.body.userId, OTHER_USER_ID);
                }
            );
        }
    );
});

test('regular user cannot update another users registration', async () => {
    const session = await getUserSession();

    await withStub(
        Registration,
        'findById',
        async () => ({
            ...registrationFixture,
            userId: OTHER_USER_ID
        }),
        async () => {
            const result = await request(
                `/registrations/${REGISTRATION_ID}`,
                {
                    method: 'PUT',
                    headers: {
                        cookie: session
                    },
                    body: JSON.stringify({
                        status: 'attended'
                    })
                }
            );

            assert.equal(result.response.status, 403);
        }
    );
});

test('registration owner can delete their registration', async () => {
    const session = await getUserSession();

    await withStub(
        Registration,
        'findById',
        async () => registrationFixture,
        async () => {
            await withStub(
                Registration,
                'findByIdAndDelete',
                async () => registrationFixture,
                async () => {
                    const result = await request(
                        `/registrations/${REGISTRATION_ID}`,
                        {
                            method: 'DELETE',
                            headers: {
                                cookie: session
                            }
                        }
                    );

                    assert.equal(result.response.status, 200);
                }
            );
        }
    );
});

test('admin can delete another users registration', async () => {
    const session = await getAdminSession();

    await withStub(
        Registration,
        'findById',
        async () => ({
            ...registrationFixture,
            userId: OTHER_USER_ID
        }),
        async () => {
            await withStub(
                Registration,
                'findByIdAndDelete',
                async () => ({
                    ...registrationFixture,
                    userId: OTHER_USER_ID
                }),
                async () => {
                    const result = await request(
                        `/registrations/${REGISTRATION_ID}`,
                        {
                            method: 'DELETE',
                            headers: {
                                cookie: session
                            }
                        }
                    );

                    assert.equal(result.response.status, 200);
                }
            );
        }
    );
});

test('regular user cannot delete another users registration', async () => {
    const session = await getUserSession();

    await withStub(
        Registration,
        'findById',
        async () => ({
            ...registrationFixture,
            userId: OTHER_USER_ID
        }),
        async () => {
            const result = await request(
                `/registrations/${REGISTRATION_ID}`,
                {
                    method: 'DELETE',
                    headers: {
                        cookie: session
                    }
                }
            );

            assert.equal(result.response.status, 403);
        }
    );
});

test('missing registration cannot be deleted', async () => {
    const session = await getUserSession();

    await withStub(
        Registration,
        'findById',
        async () => null,
        async () => {
            const result = await request(
                `/registrations/${REGISTRATION_ID}`,
                {
                    method: 'DELETE',
                    headers: {
                        cookie: session
                    }
                }
            );

            assert.equal(result.response.status, 404);
        }
    );
});

/* -------------------------------------------------------------------------- */
/* VALIDATION ORDER / INVALID IDS                                              */
/* -------------------------------------------------------------------------- */

test('invalid event creation returns 401 before validation when unauthenticated', async () => {
    const result = await request('/events', {
        method: 'POST',
        body: JSON.stringify({
            title: 'No',
            description: 'Too short'
        })
    });

    assert.equal(result.response.status, 401);
});

test('invalid event creation returns 400 after authentication and authorization', async () => {
    const session = await getAdminSession();

    const result = await request('/events', {
        method: 'POST',
        headers: {
            cookie: session
        },
        body: JSON.stringify({
            title: 'No',
            description: 'Too short'
        })
    });

    assert.equal(result.response.status, 400);
    assert.ok(result.body.errors.length > 0);
});

test('invalid event IDs return 400', async () => {
    const result = await request('/events/not-an-object-id');

    assert.equal(result.response.status, 400);
    assert.equal(result.body.status, 'fail');
});

test('invalid venue IDs return 400', async () => {
    const result = await request('/venues/not-an-object-id');

    assert.equal(result.response.status, 400);
    assert.equal(result.body.status, 'fail');
});

test('invalid registration IDs return 400', async () => {
    const session = await getUserSession();

    const result = await request(
        '/registrations/not-an-object-id',
        {
            headers: {
                cookie: session
            }
        }
    );

    assert.equal(result.response.status, 400);
    assert.equal(result.body.status, 'fail');
});

test('invalid registration update IDs return 400 before ownership lookup', async () => {
    const session = await getUserSession();

    let ownershipLookupCalled = false;

    await withStub(
        Registration,
        'findById',
        async () => {
            ownershipLookupCalled = true;
            return registrationFixture;
        },
        async () => {
            const result = await request(
                '/registrations/not-an-object-id',
                {
                    method: 'PUT',
                    headers: {
                        cookie: session
                    },
                    body: JSON.stringify({
                        status: 'attended'
                    })
                }
            );

            assert.equal(result.response.status, 400);
            assert.equal(result.body.status, 'fail');
            assert.equal(ownershipLookupCalled, false);
        }
    );
});

test('invalid registration deletion IDs return 400 before ownership lookup', async () => {
    const session = await getUserSession();

    let ownershipLookupCalled = false;

    await withStub(
        Registration,
        'findById',
        async () => {
            ownershipLookupCalled = true;
            return registrationFixture;
        },
        async () => {
            const result = await request(
                '/registrations/not-an-object-id',
                {
                    method: 'DELETE',
                    headers: {
                        cookie: session
                    }
                }
            );

            assert.equal(result.response.status, 400);
            assert.equal(result.body.status, 'fail');
            assert.equal(ownershipLookupCalled, false);
        }
    );
});

test('invalid event status filter returns 400', async () => {
    const result = await request('/events?status=unknown');

    assert.equal(result.response.status, 400);
});

test('venue and registration schemas reject invalid data', () => {
    assert.ok(createVenueSchema.validate({}).error);
    assert.ok(updateVenueSchema.validate({}).error);

    assert.ok(createRegistrationSchema.validate({}).error);
    assert.ok(createAdminRegistrationSchema.validate({}).error);

    assert.ok(updateRegistrationSchema.validate({}).error);
    assert.ok(updateAdminRegistrationSchema.validate({}).error);

    const validUserRegistration = createRegistrationSchema.validate({
        eventId: EVENT_ID
    });

    assert.equal(validUserRegistration.error, undefined);
    assert.equal(
        validUserRegistration.value.status,
        'registered'
    );

    const validAdminRegistration =
        createAdminRegistrationSchema.validate({
            userId: OTHER_USER_ID,
            eventId: EVENT_ID
        });

    assert.equal(validAdminRegistration.error, undefined);
    assert.equal(
        validAdminRegistration.value.status,
        'registered'
    );

    const validUserUpdate = updateRegistrationSchema.validate({
        status: 'attended'
    });

    assert.equal(validUserUpdate.error, undefined);

    const validAdminUpdate =
        updateAdminRegistrationSchema.validate({
            userId: OTHER_USER_ID,
            status: 'attended'
        });

    assert.equal(validAdminUpdate.error, undefined);
});

test('regular registration schema rejects userId', () => {
    const result = createRegistrationSchema.validate({
        userId: OTHER_USER_ID,
        eventId: EVENT_ID
    });

    assert.ok(result.error);
});

test('admin registration schema accepts userId', () => {
    const result = createAdminRegistrationSchema.validate({
        userId: OTHER_USER_ID,
        eventId: EVENT_ID
    });

    assert.equal(result.error, undefined);
});

test('regular registration update schema rejects userId', () => {
    const result = updateRegistrationSchema.validate({
        userId: OTHER_USER_ID,
        status: 'attended'
    });

    assert.ok(result.error);
});

test('admin registration update schema accepts userId', () => {
    const result = updateAdminRegistrationSchema.validate({
        userId: OTHER_USER_ID,
        status: 'attended'
    });

    assert.equal(result.error, undefined);
});

/* -------------------------------------------------------------------------- */
/* ERROR HANDLING                                                              */
/* -------------------------------------------------------------------------- */

test('unexpected controller errors return a safe 500 response', async () => {
    await withStub(
        Event,
        'findById',
        async () => {
            throw new Error('Simulated database failure');
        },
        async () => {
            const result = await request(`/events/${EVENT_ID}`);

            assert.equal(result.response.status, 500);
            assert.equal(result.body.status, 'error');

            assert.equal(
                result.body.message,
                'An unexpected internal server error occurred. Please try again later.'
            );

            assert.equal(result.body.stack, undefined);
        }
    );
});