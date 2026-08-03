import { NotFoundError } from '../utils/error.js';
import Venue from '../models/venues.js';

const getAllVenues = async (req, res, next) => {
    try {
        const venues = await Venue.find({ isActive: true });
        res.status(200).json(venues);
    } catch (error) {
        next(error);
    }
};

const getVenueById = async (req, res, next) => {
    try {
        const venue = await Venue.findOne({
            _id: req.params.id,
            isActive: true
        });

        if (!venue) {
            throw new NotFoundError('Venue not found');
        }

        res.status(200).json(venue);
    } catch (error) {
        next(error);
    }
};

const createVenue = async (req, res, next) => {
    try {
        const createdVenue = await Venue.create(req.body);
        res.status(201).json(createdVenue);
    } catch (error) {
        next(error);
    }
};

const updateVenue = async (req, res, next) => {
    try {
        const updatedVenue = await Venue.findOneAndUpdate(
            {
                _id: req.params.id,
                isActive: true
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedVenue) {
            throw new NotFoundError('Venue not found for update');
        }

        res.status(200).json(updatedVenue);
    } catch (error) {
        next(error);
    }
};

const deleteVenue = async (req, res, next) => {
    try {
        const deletedVenue = await Venue.findOneAndUpdate(
            {
                _id: req.params.id,
                isActive: true
            },
            {
                isActive: false
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!deletedVenue) {
            throw new NotFoundError('Venue not found for deletion.');
        }

        res.status(200).json({ message: 'Venue deactivated successfully.' });
    } catch (error) {
        next(error);
    }
};

export {
    getAllVenues,
    getVenueById,
    createVenue,
    updateVenue,
    deleteVenue
};
