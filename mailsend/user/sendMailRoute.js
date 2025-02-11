const { Router } = require("express");
const { verifyUserMail } = require("./sendMailHandler");
const router = Router();

router.route("/").post(verifyUserMail);

module.exports = router;
