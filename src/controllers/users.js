import { NotFoundError } from '../utils/error.js';
import { hashPassword } from '../utils/password.js';
import User from '../models/users.js';

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
        const { password, ...userData } = req.body;

        const passwordHash = await hashPassword(password);

        const authMethods = [
            {
                provider: 'local',
                passwordHash
            }
        ];

        const createdUser = await User.create({
            ...userData,
            authMethods
        });

        res.status(201).json(createdUser);
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { password, ...userData } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            throw new NotFoundError('User not found for update');
        }

        Object.assign(user, userData);

        if (password) {
            const passwordHash = await hashPassword(password);
            const localMethod = user.authMethods.find(
                (method) => method.provider === 'local'
            );

            if (localMethod) {
                localMethod.passwordHash = passwordHash;
            } else {
                user.authMethods.push({
                    provider: 'local',
                    passwordHash
                });
            }
        }

        const updatedUser = await user.save();
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
