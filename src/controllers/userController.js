import User from '../models/userModel.js';


const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


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
