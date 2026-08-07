import User from '../models/users.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { UnauthorizedError, NotFoundError } from '../utils/error.js';

const createLocalUser = async (userData) => {
    const { password, ...otherData } = userData;
    const passwordHash = await hashPassword(password);

    const newUser = await User.create({
        ...otherData,
        authMethods: [
            {
                provider: 'local',
                passwordHash
            }
        ]
    });

    return newUser;
}

const authenticateLocalUser = async (userData) => {
    const { email, password } = userData;
    const user = await User.findOne(
        {
            email,
            isActive: true
        }
    ).select('+authMethods.passwordHash');

    if (!user) {
        throw new UnauthorizedError('Invalid email or password.');
    }

    const localMethod = user.authMethods.find(
        (method) => method.provider === 'local'
    );

    if (!localMethod) {
        throw new UnauthorizedError('No local login credentials found for this account.');
    }

    const passwordMatches = await comparePassword(password, localMethod.passwordHash);

    if (!passwordMatches) {
        throw new UnauthorizedError('Invalid email or password.');
    }

    return user;
}

const updateUserProfile = async (userId, data) => {
    const { password, ...userData } = data;
    const user = await User.findById(userId);

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

    return updatedUser;
}

export { createLocalUser, authenticateLocalUser, updateUserProfile };