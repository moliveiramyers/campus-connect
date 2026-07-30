import mongoose from 'mongoose';
import { ValidationError } from '../utils/error.js';

const validateID = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ValidationError('The provided ID is not a valid MongoDB ObjectId.');
    }
    
    next();
}

export default validateID;