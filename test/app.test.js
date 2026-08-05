import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import Event from '../src/models/events.js';
import Registration from '../src/models/registrations.js';
import User from '../src/models/users.js';
import Venue from '../src/models/venues.js';
import {
    createRegistrationSchema,
    updateRegistrationSchema
} from '../src/validators/validateRegistrations.js';
import {
    createVenueSchema,
    updateVenueSchema
} from '../src/validators/validateVenue.js';

process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-session-secret-not-used-in-production';
delete process.env.GITHUB_CLIENT_ID;
delete process.env.GITHUB_CLIENT_SECRET;

const { default: app } = await import('../src/app.js');

const USER_ID = '66b4b7d9a2f1c3e4d5a6b7c8';
const EVENT_ID = '66b4b7d9a2f1c3e4d5a6b7c9';
const VENUE_ID = '66b4b7d9a2f1c3e4d5a6b7ca';
const REGISTRATION_ID = '66b4b7d9a2f1c3e4d5a6b7cb';

const userFixture = {
    _id: USER_ID,
    name: 'Alex Student',
    email: 'alex.student@example.com',
    role: 'user',
    authMethods: [{ provider: 'local' }]
};

const eventFixture = {
    _id: EVENT_ID,
    title: 'Campus Technology Fair',
    description: 'Students present technology projects to the campus community.',
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
            ...(options.body ? { 'content-type': 'application/json' } : {}),
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

test('health route and Swagger document are available', async () => {
    const health = await request('/');
    assert.equal(health.response.status, 200);
    assert.equal(health.body.documentation, '/api-docs');

    const swagger = await request('/swagger.json');
    assert.equal(swagger.response.status, 200);
    assert.ok(swagger.body.paths['/users'] || swagger.body.paths['/users/']);
    assert.ok(swagger.body.paths['/events'] || swagger.body.paths['/events/']);
    assert.ok(swagger.body.paths['/venues'] || swagger.body.paths['/venues/']);
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

    const proxiedSwagger = await request('/swagger.json', {
        headers: { 'x-forwarded-proto': 'https' }
    });
    assert.deepEqual(proxiedSwagger.body.schemes, ['https']);

    const authStatus = await request('/auth/status');
    assert.equal(authStatus.response.status, 200);
    assert.equal(authStatus.body.authenticated, false);

    const oauthUnavailable = await request('/auth/github');
    assert.equal(oauthUnavailable.response.status, 503);
});

test('GET /users returns all users', async () => {
    await withStub(User, 'find', async () => [userFixture], async () => {
        const result = await request('/users');
        assert.equal(result.response.status, 200);
        assert.equal(result.body.length, 1);
    });
});

test('GET /users/:id returns one user', async () => {
    await withStub(User, 'findById', async () => userFixture, async () => {
        const result = await request(`/users/${USER_ID}`);
        assert.equal(result.response.status, 200);
        assert.equal(result.body._id, USER_ID);
    });
});

test('user write routes return the expected success statuses', async () => {
    await withStub(User, 'create', async (payload) => ({
        _id: USER_ID,
        ...payload,
        authMethods: payload.authMethods.map(({ provider }) => ({ provider }))
    }), async () => {
        const result = await request('/users', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Alex Student',
                email: 'alex.student@example.com',
                password: 'Campus123!',
                role: 'user'
            })
        });
        assert.equal(result.response.status, 201);
    });

    await withStub(User, 'findById', async () => ({
        ...userFixture,
        authMethods: [...userFixture.authMethods],
        async save() {
            return this;
        }
    }), async () => {
        const result = await request(`/users/${USER_ID}`, {
            method: 'PUT',
            body: JSON.stringify({ name: 'Alex Updated' })
        });
        assert.equal(result.response.status, 200);
        assert.equal(result.body.name, 'Alex Updated');
    });

    await withStub(User, 'findByIdAndDelete', async () => userFixture, async () => {
        const result = await request(`/users/${USER_ID}`, {
            method: 'DELETE'
        });
        assert.equal(result.response.status, 200);
    });
});

test('GET /events returns all events', async () => {
    await withStub(Event, 'find', () => ({
        sort: async () => [eventFixture]
    }), async () => {
        const result = await request('/events?status=published');
        assert.equal(result.response.status, 200);
        assert.equal(result.body.length, 1);
    });
});

test('GET /events/:id returns one event', async () => {
    await withStub(Event, 'findById', async () => eventFixture, async () => {
        const result = await request(`/events/${EVENT_ID}`);
        assert.equal(result.response.status, 200);
        assert.equal(result.body._id, EVENT_ID);
    });
});

test('event write routes return the expected success statuses', async () => {
    await withStub(Event, 'create', async (payload) => ({
        _id: EVENT_ID,
        ...payload
    }), async () => {
        const result = await request('/events', {
            method: 'POST',
            body: JSON.stringify({
                ...eventFixture,
                _id: undefined
            })
        });
        assert.equal(result.response.status, 201);
    });

    await withStub(Event, 'findById', async () => ({
        ...eventFixture,
        async save() {
            return this;
        }
    }), async () => {
        const result = await request(`/events/${EVENT_ID}`, {
            method: 'PUT',
            body: JSON.stringify({ capacity: 200 })
        });
        assert.equal(result.response.status, 200);
        assert.equal(result.body.capacity, 200);
    });

    await withStub(Event, 'findByIdAndDelete', async () => eventFixture, async () => {
        const result = await request(`/events/${EVENT_ID}`, {
            method: 'DELETE'
        });
        assert.equal(result.response.status, 200);
    });
});

test('GET /venues returns all active venues', async () => {
    await withStub(Venue, 'find', async () => [venueFixture], async () => {
        const result = await request('/venues');
        assert.equal(result.response.status, 200);
        assert.equal(result.body.length, 1);
    });
});

test('GET /venues/:id returns one venue', async () => {
    await withStub(Venue, 'findOne', async () => venueFixture, async () => {
        const result = await request(`/venues/${VENUE_ID}`);
        assert.equal(result.response.status, 200);
        assert.equal(result.body._id, VENUE_ID);
    });
});

test('GET /registrations returns all registrations', async () => {
    await withStub(Registration, 'find', () => ({
        sort: async () => [registrationFixture]
    }), async () => {
        const result = await request('/registrations?status=registered');
        assert.equal(result.response.status, 200);
        assert.equal(result.body.length, 1);
    });
});

test('GET /registrations/:id returns one registration', async () => {
    await withStub(
        Registration,
        'findById',
        async () => registrationFixture,
        async () => {
            const result = await request(`/registrations/${REGISTRATION_ID}`);
            assert.equal(result.response.status, 200);
            assert.equal(result.body._id, REGISTRATION_ID);
        }
    );
});

test('venue and registration writes require an OAuth session', async () => {
    const requests = [
        request('/venues', {
            method: 'POST',
            body: JSON.stringify({})
        }),
        request(`/venues/${VENUE_ID}`, {
            method: 'PUT',
            body: JSON.stringify({ capacity: 200 })
        }),
        request('/registrations', {
            method: 'POST',
            body: JSON.stringify({})
        }),
        request(`/registrations/${REGISTRATION_ID}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'attended' })
        })
    ];

    const results = await Promise.all(requests);
    results.forEach(({ response, body }) => {
        assert.equal(response.status, 401);
        assert.equal(body.status, 'fail');
    });
});

test('invalid request data returns 400 without calling MongoDB', async () => {
    const invalidId = await request('/events/not-an-object-id');
    assert.equal(invalidId.response.status, 400);
    assert.equal(invalidId.body.status, 'fail');

    const invalidEvent = await request('/events', {
        method: 'POST',
        body: JSON.stringify({
            title: 'No',
            description: 'Too short'
        })
    });
    assert.equal(invalidEvent.response.status, 400);
    assert.ok(invalidEvent.body.errors.length > 0);

    const invalidFilter = await request('/events?status=unknown');
    assert.equal(invalidFilter.response.status, 400);
});

test('venue and registration POST/PUT schemas reject invalid data', () => {
    assert.ok(createVenueSchema.validate({}).error);
    assert.ok(updateVenueSchema.validate({}).error);
    assert.ok(createRegistrationSchema.validate({}).error);
    assert.ok(updateRegistrationSchema.validate({}).error);

    const validRegistration = createRegistrationSchema.validate({
        userId: USER_ID,
        eventId: EVENT_ID
    });
    assert.equal(validRegistration.error, undefined);
    assert.equal(validRegistration.value.status, 'registered');
});

test('unexpected controller errors return a safe 500 response', async () => {
    await withStub(Event, 'findById', async () => {
        throw new Error('Simulated database failure');
    }, async () => {
        await withStub(console, 'error', () => {}, async () => {
            const result = await request(`/events/${EVENT_ID}`);
            assert.equal(result.response.status, 500);
            assert.equal(result.body.status, 'error');
            assert.equal(
                result.body.message,
                'An unexpected internal server error occurred. Please try again later.'
            );
            assert.equal(result.body.stack, undefined);
        });
    });
});
