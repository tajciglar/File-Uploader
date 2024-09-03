const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('../db/pool'); 

module.exports = function(passport) {
    passport.use(new LocalStrategy(
        async (username, password, done) => {
            try {
                const { rows } = await db.query('SELECT * FROM users WHERE username = $1', [username]);
                const user = rows[0];

                if (!user) {
                    return done(null, false, { message: 'No user with that username' });
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

     // Serialize user to store user ID in session
     passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser((id, done) => {
        db.query('SELECT * FROM users WHERE id = $1', [id])
            .then(result => {
                done(null, result.rows[0]);
            })
            .catch(err => done(err));
    });
};
