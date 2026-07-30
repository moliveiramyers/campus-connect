import { NotFoundError } from '../utils/error.js';
import { hashPassword } from '../utils/password.js';
import User from '../models/users.js';

const getAllUsers = async (req, res) => {
    const users = await User.find();
    
    res.status(200).json(users);
}

const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.status(200).json(user);
}

const createUser = async (req, res) => {
    const { password, ...userData } = req.body;

    const passwordHash = await hashPassword(password);

    const authMethods = [
        {
            provider: 'local',
            passwordHash
        }
    ];

    const newUser = {
        ...userData,
        authMethods
    }

    const createdUser = await User.create(newUser);

    res.status(201).json(createdUser);
}

const updateUser = async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { returnDocument: 'after' }
    );

    if (!updatedUser) {
        throw new NotFoundError('User not found for update');
    }

    res.status(200).json(updatedUser);
}

const deleteUser = async (req, res) => {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
        throw new NotFoundError('User not found for deletion.');
    }

    res.status(200).json({ message: 'User deleted successfully.' });
}

export {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};