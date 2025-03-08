const { Router } = require("express");
const { requestVerification, getVerifyData } = require("./verifyHandler");

const router = Router();

router.route("/").get(getVerifyData).post(requestVerification);

module.exports = router;
