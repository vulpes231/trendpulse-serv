const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/mailer");
const { generateOTP } = require("../utils/generateCode");
require("dotenv");
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
Wallet = require("./Wallet");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    password: {
      type: String,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },

    firstname: {
      type: String,
      trim: true,
    },
    lastname: {
      type: String,
      trim: true,
    },
    refreshToken: {
      type: String,
    },
    isKYCVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    twoFactor: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
    },
    country: {
      type: String,
      trim: true,
      required: true,
    },
    address: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    zipcode: {
      type: String,
      trim: true,
    },
    dob: {
      type: String,
    },
    nationality: {
      type: String,
    },
    currency: {
      type: String,
    },
    experience: {
      type: String,
    },
    employment: {
      type: String,
    },
    family: {
      type: String,
    },
    depositAddress: {
      type: Array,
    },
    canWithdraw: {
      type: Boolean,
      default: true,
    },
    customWithdrawalMsg: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// login user
userSchema.statics.loginUser = async function (loginData) {
  try {
    const user = await User.findOne({
      email: loginData.email,
    });

    if (!user) {
      throw new Error("User does not exist!");
    }

    // Ensure password matches
    const passwordMatch = await bcrypt.compare(
      loginData.password,
      user.password
    );
    if (!passwordMatch) {
      throw new Error("Invalid username or password!");
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { username: user.username, userId: user._id },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { username: user.username, userId: user._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    let code;
    if (user.twoFactor) {
      const subject = "Vestor Login OTP Code";
      code = generateOTP();
      const message = `Your login verification code is ${code}`;
      await sendMail(user.email, subject, message);
    }

    return {
      accessToken,
      refreshToken,
      country: user.country,
      username: user.username,
      isBanned: user.isBanned,
      otpCode: code || "",
      isEmailVerified: user.isEmailVerified,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

userSchema.statics.logoutUser = async function (userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User does not exist!");
    }

    user.refreshToken = null;
    await user.save();
    return true;
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while logging out.");
  }
};

// get user
userSchema.statics.getUser = async function (userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User does not exist!");
    }
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// edit user
userSchema.statics.editUser = async function (userId, userData) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User does not exist!");
    }
    if (userData.firstname) {
      user.firstname = userData.firstname;
    }
    if (userData.lastname) {
      user.lastname = userData.lastname;
    }
    if (userData.address) {
      user.address = userData.address;
    }
    if (userData.phone) {
      user.phone = userData.phone;
    }
    if (userData.city) {
      user.city = userData.city;
    }
    if (userData.state) {
      user.state = userData.state;
    }
    if (userData.zipcode) {
      user.zipcode = userData.zipcode;
    }

    if (userData.nationality) {
      user.nationality = userData.nationality;
    }
    if (userData.experience) {
      user.experience = userData.experience;
    }
    if (userData.currency) {
      user.currency = userData.currency;
    }

    if (userData.employment) {
      user.employment = userData.employment;
    }

    await user.save();
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// register user
userSchema.statics.registerUser = async function (userData) {
  try {
    const userNameTaken = await User.findOne({
      username: userData.username,
    });
    if (userNameTaken) {
      throw new Error("Username taken!");
    }
    const emailTaken = await User.findOne({
      email: userData.email,
    });
    if (emailTaken) {
      throw new Error("Email registered!");
    }

    if (userData.password !== userData.confirmPassword) {
      throw new Error("Passwords do not match!");
    }

    const hashPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await User.create({
      firstname: userData.firstname,
      lastname: userData.lastname,
      username: userData.username,
      password: hashPassword,
      email: userData.email,
      country: userData.country_id,
      phone: userData.phone,
      address: userData.address,
      state: userData.state_id,
      city: userData.city,
      zipcode: userData.zipcode,
      dob: userData.dob,
      nationality: userData.nationality,
      currency: userData.currency_id,
      experience: userData.experience,
      employment: userData.employment,
      family: userData.family,
    });

    const depositWallet = await Wallet.create({
      ownerId: newUser._id,
      walletName: "deposit",
    });

    const investWallet = await Wallet.create({
      ownerId: newUser._id,
      walletName: "invest",
    });

    const accessToken = jwt.sign(
      { username: newUser.username, userId: newUser._id },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { username: newUser.username, userId: newUser._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "3d" }
    );

    newUser.refreshToken = refreshToken;
    await newUser.save();

    return { accessToken, refreshToken };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

userSchema.statics.changePassword = async function (userId, passwordData) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User does not exist!");
    }
    const passwordMatch = await bcrypt.compare(
      passwordData.password,
      user.password
    );
    if (!passwordMatch) {
      throw new Error("Invalid password!");
    }
    const hashPassword = await bcrypt.hash(passwordData.newPassword, 10);
    user.password = hashPassword;
    await user.save();
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

userSchema.statics.verifyMailAddress = async function (verifyData) {
  try {
    const user = await User.findById(verifyData.userId);

    if (user.isEmailVerified) {
      throw new Error("Email already verified");
    }

    if (verifyData.serverCode !== verifyData.userCode) {
      throw new Error("Invalid verification code");
    }

    user.isEmailVerified = true;

    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
