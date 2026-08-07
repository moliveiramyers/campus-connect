import swaggerAutogen from 'swagger-autogen';

const serverHost = (
    process.env.API_HOST
    || process.env.RENDER_EXTERNAL_HOSTNAME
    || 'localhost:8080'
).replace(/^https?:\/\//, '').replace(/\/$/, '');

const schemesList = serverHost.includes('localhost')
    ? ['http']
    : ['https'];

const doc = {
    info: {
        title: 'Campus Connect API',
        description:
            'Campus Connect API for managing users, events, venues, and registrations. Sign in at /auth/login or /auth/github before using protected routes.',
        version: '2.0.0'
    },
    host: serverHost,
    schemes: schemesList,
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
        sessionAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'campus.connect.sid',
            description: 'Session cookie established after local login or GitHub OAuth.'
        },
        githubOAuth: {
            type: 'oauth2',
            flow: 'accessCode',
            authorizationUrl: 'https://github.com/login/oauth/authorize',
            tokenUrl: 'https://github.com/login/oauth/access_token',
            scopes: {
                'user:email': 'Read the authenticated GitHub account email'
            }
        }
    },
    definitions: {
        Error: {
            status: 'fail',
            message: 'Validation failed for this request.'
        },
        User: {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            password: 'SecurePass123!',
            role: 'user',
            profileImage: 'https://example.com/profile-image.jpg'
        },
        NewUser: {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            password: 'SecurePass123!',
            profileImage: 'https://example.com/profile-image.jpg'
        },
        LoginRequest: {
            email: 'jane.doe@example.com',
            password: 'SecurePass123!'
        },
        UserUpdate: {
            name: 'Jane Smith',
            profileImage: 'https://example.com/new-profile-image.jpg'
        },
        Event: {
            title: 'Campus Technology Fair',
            description:
                'Students present technology projects to the campus community.',
            category: 'Technology',
            startDate: '2026-08-15T15:00:00.000Z',
            endDate: '2026-08-15T18:00:00.000Z',
            venueId: '66b4b7d9a2f1c3e4d5a6b7ca',
            organizerId: '66b4b7d9a2f1c3e4d5a6b7c8',
            capacity: 150,
            status: 'published',
            imageUrl: 'https://example.com/events/technology-fair.jpg'
        },
        EventUpdate: {
            capacity: 200,
            status: 'published'
        },
        InPersonVenue: {
            name: 'Library Auditorium',
            venueType: 'in-person',
            building: 'Library Building',
            room: '205',
            address: 'Campus North',
            capacity: 150,
            accessibilityNotes: 'Wheelchair accessible.'
        },
        OnlineVenue: {
            name: 'Zoom Conference Room',
            venueType: 'online',
            meetingLink: 'https://zoom.us/j/123456789',
            capacity: 500,
            accessibilityNotes: 'Live captions enabled.'
        },
        VenueUpdate: {
            capacity: 250,
            accessibilityNotes:
                'Recently renovated and wheelchair accessible.'
        },
        Registration: {
            userId: '66b4b7d9a2f1c3e4d5a6b7c8',
            eventId: '66b4b7d9a2f1c3e4d5a6b7c9',
            status: 'registered',
            notes: 'Requires wheelchair seating.'
        },
        RegistrationUpdate: {
            status: 'attended',
            notes: 'Checked in at the main entrance.'
        }
    }
};

const outputFile = './swagger.json';
const endpointsFiles = ['./src/routes/index.js'];

await swaggerAutogen()(outputFile, endpointsFiles, doc);
