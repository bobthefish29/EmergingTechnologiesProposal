const express = require("express");
const router = express.Router();

//Displaying the page
router.get("/", (req, res) => { res.render("chat/chat"); });

module.exports = router;