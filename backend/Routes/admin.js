const express = require("express");
const router = express.Router();
const adminuser = "admin";
const adminpass = "admin";

router.post("/adminlogin", (req, res) => {
  const { username, password } = req.body;
  if (username === adminuser && password === adminpass) {
    return res.status(200).json({ success: true, message: "admin is here" });
  }

  return res.status(401).json({ success: false, message: "unauthorized" });
});
module.exports = router;
