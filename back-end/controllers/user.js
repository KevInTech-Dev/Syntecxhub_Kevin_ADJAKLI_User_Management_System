
const User = require("../models/user");
const nodemailer = require("nodemailer");



const addUser = async (req, res) => {
  try {
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    
    const user = new User({
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      otp,
      otpExpires
    });
    const result = await user.save();

    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: req.body.email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`
    });

    res.status(200).json({
      msg: "User created and OTP sent to email",
      user: {
        _id: result._id,
        name: result.name,
        address: result.address,
        phone: result.phone,
        email: result.email
      }
    });
  } catch (error) {
    console.log(error);
    res.status(501).json(error);
  }
};


const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 });
    if (users.length > 0) {
      res.status(200).json(users);
    } else {
      res.status(204).json({ msg: "No users found" });
    }
  } catch (error) {
    console.log(error);
    res.status(501).json(error);
  }
};


const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(204).json({ msg: "This user does not exist" });
    }
  } catch (error) {
    console.log(error);
    res.status(501).json(error);
  }
};


const updateUser = async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email
      },
      { new: true }
    );
    if (result) {
      res.status(200).json({ msg: "Update successful", user: result });
    } else {
      res.status(404).json({ msg: "This user does not exist" });
    }
  } catch (error) {
    console.log(error);
    res.status(501).json(error);
  }
};


const deleteUser = async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (result) {
      res.status(200).json({ msg: "Deletion successful" });
    } else {
      res.status(404).json({ msg: "This user does not exist" });
    }
  } catch (error) {
    console.log(error);
    res.status(501).json(error);
  }
};


const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    
    const user = await User.findOneAndUpdate(
      { email },
      { otp, otpExpires },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
       user: process.env.GMAIL_USER, 
      pass: process.env.GMAIL_PASS  
      }
    });

    await transporter.sendMail({
      from: "devkevintech@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Hi, your OTP code is: ${otp}`
    });

    res.status(200).json({ msg: "OTP sent to email", email });
  } catch (error) {
    console.log(error);
    res.status(501).json(error);
  }
};


const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp });

    if (!user) {
      return res.status(400).json({ msg: "Invalid OTP or email" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ msg: "OTP verified, authentication successful" });
  } catch (error) {
    console.log(error);
    res.status(501).json(error);
  }
};

module.exports = {
  addUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  sendOtp,
  verifyOtp
};