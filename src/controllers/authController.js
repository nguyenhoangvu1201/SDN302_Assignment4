const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Get info
exports.getInfo = (req, res) => {
    res.json({
        data: {
            fullName: 'Nguyen Hoang Vu',
            studentCode: 'QE170032',
        },
    });
};


exports.register = async (req, res) => {
    const { fullName, username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ success: false, message: 'Username already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ fullName, username, password: hashedPassword });
        await user.save();

        res.status(201).json({ success: true, message: 'User registered successfully', data: { id: user._id, fullName, username } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ success: true, message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getUserInfo = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId).select('-password'); // Loại bỏ trường password

        // Kiểm tra xem người dùng có tồn tại không
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { _id, ...userData } = user.toObject(); // Chuyển đổi Mongoose Document thành Object
        res.status(200).json({ success: true, data: { id: _id, ...userData } }); // Thay _id bằng id
    } catch (error) {
        console.error(error); // Ghi log lỗi ra console
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updateUserInfo = async (req, res) => {
    const userId = req.user.id;
    const { fullName } = req.body;
    try {
        // Cập nhật thông tin người dùng
        const user = await User.findByIdAndUpdate(userId, { fullName }, { new: true, runValidators: true })
            .select('-password'); // Loại bỏ password 

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User information updated successfully', data: { id: user._id, fullName: user.fullName, username: user.username } });
    } catch (error) {
        console.error(error); // Ghi log lỗi ra console
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


