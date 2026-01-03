import User from '../models/userModel.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a user
// @route   POST /api/users
// @access  Public
const createUser = async (req, res) => {
    const { name, email } = req.body;

    try {
        const user = await User.create({
            name,
            email,
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export {
    getUsers,
    createUser,
};
