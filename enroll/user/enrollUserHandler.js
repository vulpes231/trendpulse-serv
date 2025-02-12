const User = require("../../models/User");

const enrollUser = async (req, res) => {
  const {
    firstname,
    lastname,
    username,
    password,
    email,
    country,
    phone,
    street,
    state,
    city,
    zipcode,
    dob,
    nationality,
    currency,
    employment,
    experience,
  } = req.body;
  console.log("req.body", req.body);
  if (
    !firstname ||
    !lastname ||
    !username ||
    !password ||
    !email ||
    !country ||
    !phone ||
    !street ||
    !city ||
    !state ||
    !zipcode ||
    !dob ||
    !nationality ||
    !experience ||
    !currency ||
    !employment
  ) {
    return res.status(400).json({ message: "Invalid user data!" });
  }
  try {
    const userData = {
      firstname,
      lastname,
      username,
      password,
      email,
      country,
      phone,
      street,
      state,
      city,
      zipcode,
      dob,
      nationality,
      currency,
      employment,
      experience,
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
