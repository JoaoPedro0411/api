const passport = require("passport");
const jwt = require("jsonwebtoken");
const LocalStrategy = require("passport-local");
const GitHubStrategy = require("passport-github2").Strategy;
const bcrypt = require("bcrypt");

const User = require("../models/user");

passport.use(
  new LocalStrategy(
    {
      usernameField: "userEmail",
      passwordField: "userPassword",
    },

    async (userEmail, userPassword, done) => {
      try {
        const user = await User.findOne({ where: { userEmail } });
        if (!user) {
          return done(null, false, { message: "Usuário não encontrado" });
        }
        const isMatch = await bcrypt.compare(userPassword, user.userPassword);
        if (!isMatch) {
          return done(null, false, { message: "E-mail ou senha incorretos" });
        }

        return done(null, { user });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userEmail =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!userEmail) {
          return done(
            new Error(
              "O email do usuário não está disponível no perfil do GitHub."
            )
          );
        }

        let user = await User.findOne({ where: { userEmail } });
        if (!user) {
          user = await User.create({
            userId: profile.id,
            userName: profile.username,
            userEmail: userEmail,
          });
        }

        return done(null, { user });
      } catch (error) {
        return done(error);
      }
    }
  )
);

module.exports = passport;
