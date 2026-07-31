import swaggerAutogen from "swagger-autogen";

const serverUrl =
    process.env.RENDER_EXTERNAL_URL || "localhost:8080";

const schemesList =
    process.env.RENDER_EXTERNAL_URL
        ? ["https"]
        : ["http"];

const doc = {
    info: {
        title: "Campus Connect API",
        description:
            "Campus Connect API for managing users, events, venues and registrations.",
    },

    host: serverUrl,
    schemes: schemesList,

    definitions: {
        // =====================================================
        // USERS
        // =====================================================

        User: {
            name: "Jane Doe",
            email: "jane.doe@example.com",
            password: "SecurePass123!",
            role: "user",
            profileImage:
                "https://example.com/profile-image.jpg",
        },

        UserUpdate: {
            name: "Jane Smith",
            profileImage:
                "https://example.com/new-profile-image.jpg",
        },

        // =====================================================
        // VENUES
        // =====================================================

        InPersonVenue: {
            name: "Library Auditorium",
            venueType: "in-person",
            building: "Library Building",
            room: "205",
            address: "Campus North",
            capacity: 150,
            accessibilityNotes:
                "Wheelchair accessible.",
        },

        OnlineVenue: {
            name: "Zoom Conference Room",
            venueType: "online",
            meetingLink:
                "https://zoom.us/j/123456789",
            capacity: 500,
            accessibilityNotes:
                "Live captions enabled.",
        },

        VenueUpdate: {
            capacity: 250,
            accessibilityNotes:
                "Recently renovated and wheelchair accessible.",
        },

        // =====================================================
        // EVENTS
        // Add later
        // =====================================================

        /*
        Event: {},

        EventUpdate: {},
        */

        // =====================================================
        // REGISTRATIONS
        // Add later
        // =====================================================

        /*
        Registration: {},

        RegistrationUpdate: {},
        */
    },
};

const outputFile = "./swagger.json";

const endpointsFiles = [
    "./src/routes/index.js"];

swaggerAutogen()(outputFile, endpointsFiles, doc);