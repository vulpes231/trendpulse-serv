const User = require("../../models/User");

const enrollUser = async (req, res) => {
  const {
    firstname,
    lastname,
    username,
    password,
    email,
    country_id,
    confirmPassword,
    phone,
    address,
    state_id,
    city,
    zipcode,
    dob,
    nationality,
    currency_id,
    experience,
    employment,
    family,
  } = req.body;
  console.log("req.body", req.body);
  if (
    !firstname ||
    !lastname ||
    !email ||
    !username ||
    !password ||
    !confirmPassword ||
    !phone ||
    !address ||
    !country_id ||
    !state_id ||
    !city ||
    !zipcode ||
    !dob ||
    !nationality ||
    !currency_id ||
    !experience ||
    !employment
  ) {
    return res.status(400).json({ message: "Invalid user data!" });
  }
  try {
    const userData = {
      username,
      password,
      email,
      country_id,
      confirmPassword,
      phone,
      address,
      state_id,
      city,
      zipcode,
      dob,
      nationality,
      currency_id,
      experience,
      employment,
      family,
    };
    const { accessToken, refreshToken } = await User.registerUser(userData);
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: `User ${username} account created!`,
      accessToken,
      email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { enrollUser };
