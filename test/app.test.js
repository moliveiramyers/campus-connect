import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import app from '../src/app.js';
import Event from '../src/models/events.js';
import User from '../src/models/users.js';

process.env.NODE_ENV = 'test';

const USER_ID = '66b4b7d9a2f1c3e4d5a6b7c8';
const EVENT_ID = '66b4b7d9a2f1c3e4d5a6b7c9';
const VENUE_ID = '66b4b7d9a2f1c3e4d5a6b7ca';

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
    assert.ok(swagger.body.paths['/users']);
    assert.ok(swagger.body.paths['/events']);

    const docs = await request('/api-docs/');
    assert.equal(docs.response.status, 200);
    assert.match(docs.body, /Swagger UI/);
});

test('user CRUD routes return the expected success statuses', async () => {
    await withStub(User, 'find', async () => [userFixture], async () => {
        const result = await request('/users');
        assert.equal(result.response.status, 200);
        assert.equal(result.body.length, 1);
    });

    await withStub(User, 'findById', async () => userFixture, async () => {
        const result = await request(`/users/${USER_ID}`);
        assert.equal(result.response.status, 200);
        assert.equal(result.body._id, USER_ID);
    });

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

test('event CRUD routes return the expected success statuses', async () => {
    await withStub(Event, 'find', () => ({
        sort: async () => [eventFixture]
    }), async () => {
        const result = await request('/events?status=published');
        assert.equal(result.response.status, 200);
        assert.equal(result.body.length, 1);
    });

    await withStub(Event, 'findById', async () => eventFixture, async () => {
        const result = await request(`/events/${EVENT_ID}`);
        assert.equal(result.response.status, 200);
        assert.equal(result.body._id, EVENT_ID);
    });

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
