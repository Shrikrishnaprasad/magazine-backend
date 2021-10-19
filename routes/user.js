const router = require("express").Router();
const CryptoJS = require("crypto-js");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

//register
router.post("/register", async (req, res) => {
  try {
    const newUser = new User({
      ...req.body,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString(),
    });
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ mobile: req.body.mobile });

    !user && res.status(401).json("Wrong userId !");

    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
    originalPassword !== req.body.password &&
      res.status(401).json("Wrong password !");

    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "5d",
    });

    const { password, ...info } = user._doc;
    res.status(200).json({ ...info, accessToken });
  } catch (error) {
    res.status(500).json(error);
  }
});

// upd subscription plan
router.post("/subscribe/:id", async (req, res) => {
  const userId = req.params.id;
  const amount = req.body.amount;
  try {
    const updPlan = await User.findByIdAndUpdate(
      { _id: userId },
      { paid: amount },
      { new: true }
    );
    res.status(201).json(updPlan);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
