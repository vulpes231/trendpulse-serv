const User = require("../../models/User");
const { generateOTP } = require("../../utils/generateCode");
const { sendMail } = require("../../utils/mailer");

const sendEmailCode = async (req, res) => {
  const userId = req.userId;
  if (!userId)
    return res.status(401).json({ message: "You are not logged in." });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found!" });
    const subject = "Verify Your Email Address";
    const code = generateOTP();
    const message = `
      <html>
        <body>
          <p>Welcome <strong>${user.username}</strong>,</p>
          <p>Thank you for joining Vestor Markets. Your email verification code is <strong>${code}</strong>.</p>
          <footer>
            <img src="https://trendpulse.markets/trend.png" alt="Vestor Markets Logo" width="150" />
          </footer>
        </body>
      </html>
    `;
    await sendMail(user.email, subject, message);
    res.status(200).json({ message: "Verification code sent.", code });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const userId = req.userId;
  if (!userId)
    return res.status(401).json({ message: "You are not logged in." });

  const { userCode, serverCode } = req.body;

  if (!userCode || !serverCode)
    return res.status(401).json({ message: "OTP required!" });

  try {
    if (serverCode !== userCode)
      return res.status(400).json({ message: "OTP do not match!" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found!" });

    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendEmailCode, verifyEmail };
