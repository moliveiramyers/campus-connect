import mongoose from 'mongoose';

import Event from '../models/events.js';
import { NotFoundError, ValidationError } from '../utils/error.js';

const getAllEvents = async (req, res, next) => {
    try {
        const filters = {};
        const allowedFilters = ['category', 'status', 'venueId', 'organizerId'];

        allowedFilters.forEach((field) => {
            if (req.query[field]) {
                filters[field] = req.query[field];
            }
        });

        const allowedStatuses = ['draft', 'published', 'cancelled', 'completed'];
        if (filters.status && !allowedStatuses.includes(filters.status)) {
            throw new ValidationError(
                `status must be one of: ${allowedStatuses.join(', ')}.`
            );
        }

        for (const field of ['venueId', 'organizerId']) {
            if (filters[field] && !mongoose.Types.ObjectId.isValid(filters[field])) {
                throw new ValidationError(
                    `${field} must be a valid MongoDB ObjectId.`
                );
            }
        }

        if (req.query.from || req.query.to) {
            filters.startDate = {};

            if (req.query.from) {
                const from = new Date(req.query.from);
                if (Number.isNaN(from.getTime())) {
                    throw new ValidationError('from must be a valid ISO date.');
                }
                filters.startDate.$gte = from;
            }

            if (req.query.to) {
                const to = new Date(req.query.to);
                if (Number.isNaN(to.getTime())) {
                    throw new ValidationError('to must be a valid ISO date.');
                }
                filters.startDate.$lte = to;
            }

            if (
                filters.startDate.$gte
                && filters.startDate.$lte
                && filters.startDate.$gte > filters.startDate.$lte
            ) {
                throw new ValidationError('from must be earlier than or equal to to.');
            }
        }

        const events = await Event.find(filters).sort({ startDate: 1 });
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

const getEventById = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            throw new NotFoundError('Event not found.');
        }

        res.status(200).json(event);
    } catch (error) {
        next(error);
    }
};

const createEvent = async (req, res, next) => {
    try {
        const event = await Event.create(req.body);
        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
};

const updateEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            throw new NotFoundError('Event not found for update.');
        }

        Object.assign(event, req.body);
        const updatedEvent = await event.save();

        res.status(200).json(updatedEvent);
    } catch (error) {
        next(error);
    }
};

const deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            throw new NotFoundError('Event not found for deletion.');
        }

        res.status(200).json({ message: 'Event deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

export {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};
