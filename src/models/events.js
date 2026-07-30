import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 150
        },
        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 5000
        },
        category: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true,
            validate: {
                validator(value) {
                    return !this.startDate || value > this.startDate;
                },
                message: 'endDate must be later than startDate'
            }
        },
        venueId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Venue',
            required: true
        },
        organizerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        capacity: {
            type: Number,
            required: true,
            min: 1,
            max: 100000
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'cancelled', 'completed'],
            default: 'draft',
            required: true
        },
        imageUrl: {
            type: String,
            trim: true,
            maxlength: 2048
        }
    },
    {
        timestamps: true
    }
);

eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ organizerId: 1 });
eventSchema.index({ venueId: 1 });

export default mongoose.model('Event', eventSchema);
