const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

    passport.use(new LocalStrategy(
        async (username, password, done) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { email: username }
                });

                if (!user) {
                    return done(null, false, { message: 'No user with that email' });
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: 'Password incorrect' });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: id }
            });
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    module.exports = passport;
