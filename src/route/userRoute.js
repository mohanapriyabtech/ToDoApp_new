const express = require("express");
const router = express.Router();
const userv1 = require("../controller/v1.0.0/userControl");
const userv2 = require("../controller/v1.0.1/userControl")
const passport = require("passport");
require("../middleware/passportJwt")(passport);

router.post("/v1/signup", userv1.signUp); // import var user. export signup
router.post("/v1/login", userv1.logIn);
router.post("/v1/otpverify", userv1.otpVerify);
router.patch("/v1/:userid/update", passport.authenticate("jwt", { session: false }),userv1.updateUser);
router.post("/v1/:userid/delete", passport.authenticate("jwt", { session: false }),userv1.deleteUser);
router.get("/v1/:userid/find", userv1.findTask);

// v1.0.1
router.post("/v1.0.1/signup", userv2.signUp); // import name signup. export  signup
router.post("/v1.0.1/login", userv2.logIn);
router.patch("/v1.0.1/:userid/update", passport.authenticate("jwt", { session: false }),userv2.updateUser);


module.exports = router;
