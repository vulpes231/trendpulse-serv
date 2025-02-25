const { Router } = require("express");
const { sendEmailCode, verifyEmail } = require("./sendMailHandler");
const router = Router();

router.route("/").post(sendEmailCode).put(verifyEmail);

module.exports = router;
