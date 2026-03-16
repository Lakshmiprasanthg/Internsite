const express = require("express");
const router = express.Router();

const isProduction = process.env.NODE_ENV === "production";
const adminuser = process.env.ADMIN_USERNAME || (isProduction ? null : "admin");
const adminpass = process.env.ADMIN_PASSWORD || (isProduction ? null : "admin");

router.post("/adminlogin", (req, res) => {
  if (!adminuser || !adminpass) {
    return res.status(500).json({
      success: false,
      message: "Admin credentials are not configured",
    });
  }

  const { username, password } = req.body;
  if (username === adminuser && password === adminpass) {
    return res.status(200).json({ success: true, message: "admin is here" });
  }

  return res.status(401).json({ success: false, message: "unauthorized" });
});
module.exports = router;
