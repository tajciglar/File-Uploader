require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./config/passport'); 
const routes = require('./routes/userRoutes');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient(); // Single instance

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    cookie: {
     maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    },
    secret: 'a santa at nasa',
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      prisma, // Use the existing Prisma client instance
      {
        checkPeriod: 2 * 60 * 1000,  // 2 minutes
        dbRecordIdIsSessionId: true,
      }
    )
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
