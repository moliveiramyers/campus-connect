import mongoose from 'mongoose';

import Registration from '../models/registrations.js';
import { NotFoundError, ValidationError } from '../utils/error.js';

const allowedStatuses = ['registered', 'waitlisted', 'cancelled', 'attended'];

const getAllRegistrations = async (req, res, next) => {
    try {
        const filters = {};

        if (req.query.status) {
            if (!allowedStatuses.includes(req.query.status)) {
                throw new ValidationError(
                    `status must be one of: ${allowedStatuses.join(', ')}.`
                );
            }
            filters.status = req.query.status;
        }

        for (const field of ['userId', 'eventId']) {
            if (req.query[field]) {
                if (!mongoose.Types.ObjectId.isValid(req.query[field])) {
                    throw new ValidationError(
                        `${field} must be a valid MongoDB ObjectId.`
                    );
                }
                filters[field] = req.query[field];
            }
        }

        const registrations = await Registration.find(filters).sort({ createdAt: -1 });
        res.status(200).json(registrations);
    } catch (error) {
        next(error);
    }
};

const getRegistrationById = async (req, res, next) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            throw new NotFoundError('Registration not found.');
        }

        res.status(200).json(registration);
    } catch (error) {
        next(error);
    }
};

const createRegistration = async (req, res, next) => {
    try {
        const registrationData = {
            ...req.body,
            ...(req.user.role === 'admin'
                ? {}
                : { userId: req.user.id })
        };

        const registration = await Registration.create(registrationData);

        res.status(201).json(registration);
    } catch (error) {
        next(error);
    }
};

const updateRegistration = async (req, res, next) => {
    try {
        const registration = await Registration.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!registration) {
            throw new NotFoundError('Registration not found for update.');
        }

        res.status(200).json(registration);
    } catch (error) {
        next(error);
    }
};

const deleteRegistration = async (req, res, next) => {
    try {
        const registration = await Registration.findByIdAndDelete(req.params.id);

        if (!registration) {
            throw new NotFoundError('Registration not found for deletion.');
        }

        res.status(200).json({
            message: 'Registration deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

export {
    getAllRegistrations,
    getRegistrationById,
    createRegistration,
    updateRegistration,
    deleteRegistration
};