import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';
import bcrypt from 'bcrypt';
import passport from 'passport';
import 'dotenv/config';
import { Strategy as LocalStrategy } from 'passport-local';
import { ObjectId } from 'mongodb';
import { connectDB, getDB } from './db.js';
import routes from './routes/indexRoutes.js';


const app = express();
const port = 3000;
const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(session({ secret: 'secret', resave: true, saveUninitialized: false, cookie: { secure: false } }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');
app.set('views', './views');


async function main() {
    try {
        await connectDB();
        const { db, usersCollection, videoCollection } = getDB();

        passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
            async (email, password, done) => {
                try {
                    const user = await usersCollection.findOne({ email });
                    if (!user) return done(null, false, { message: 'Користувача не знайдено' });

                    const isMatch = await bcrypt.compare(password, user.password);
                    if (!isMatch) return done(null, false, { message: 'Неправильний пароль' });

                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        ));

        passport.serializeUser((user, done) => {
            done(null, user._id.toString());
        });

        passport.deserializeUser(async (id, done) => {
            try {
                const user = await usersCollection.findOne({ _id: new ObjectId(id) });
                done(null, user);
            } catch (err) {
                done(err);
            }
        });


        app.use((req, res, next) => {
            req.db = { db, usersCollection, videoCollection };
            next();
        });

        app.use('/', routes);

        app.listen(port, () => console.log(`🚀 Listening on port ${port}`));
    } catch (err) {
        console.error("❌ Failed to connect to DB:", err);
        process.exit(1);
    }
}

main();
