const jwt = require("jsonwebtoken");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const userSchema = require("../model/userSchema");
require("dotenv").config();

const params = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
};

let strategy = new JWTStrategy(params, function (token, done) {
  userSchema.find({ id: token.id }).then((user) => {
    if (!user) return done(null, false);
    else return done(null, user);
  });
});

module.exports = (passport) => passport.use(strategy);
