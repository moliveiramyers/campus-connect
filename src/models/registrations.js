import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true
        },
        status: {
            type: String,
            enum: ['registered', 'waitlisted', 'cancelled', 'attended'],
            default: 'registered',
            required: true
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 500
        }
    },
    {
        timestamps: true
    }
);

registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
registrationSchema.index({ eventId: 1, status: 1 });

export default mongoose.model('Registration', registrationSchema);
