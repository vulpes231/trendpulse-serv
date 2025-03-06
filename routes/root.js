const { Router } = require("express");
const router = Router();

router.get("/", async (req, res) => {
  try {
    res.status(200).json({ message: "Welcome to the vestor!" });
  } catch (error) {
    res.status(500).json({ message: "server error!" });
  }
});

module.exports = router;
