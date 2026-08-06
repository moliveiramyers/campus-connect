import { NotFoundError } from '../utils/error.js';
import { hashPassword } from '../utils/password.js';
import User from '../models/users.js';
import { createLocalUser, updateUserProfile } from '../services/userService.js';

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const newUser = await createLocalUser(req.body);

        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const updatedUser = await updateUserProfile(req.params.id, req.body);

        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            throw new NotFoundError('User not found for deletion.');
        }

        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

export {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
