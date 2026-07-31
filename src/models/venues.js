import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 255,
        },
        venueType: {
            type: String,
            enum: ["in-person", "online"],
            required: true,
        },
        meetingLink: {
            type: String,
            trim: true,
            maxlength: 2048,
            required: function () {
                return this.venueType === "online";
            },
        },

        building: {
            type: String,
            trim: true,
            minlength: 1,
            maxlength: 255,
            required: function () {
                return this.venueType === "in-person";
            },
        },

        room: {
            type: String,
            trim: true,
            minlength: 1,
            maxlength: 255,
            required: function () {
                return this.venueType === "in-person";
            }
        },
        address: {
            type: String,
            trim: true,
            minlength: 1,
            maxlength: 255,
            required: function () {
                return this.venueType === "in-person";

            },
        },
        capacity: {
            type: Number,
            required: true,
            min: 1,
        },
        accessibilityNotes: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        isActive: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true

    }
);


export default mongoose.model("Venue", venueSchema);