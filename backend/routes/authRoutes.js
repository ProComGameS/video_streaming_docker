import express from "express";
const router = express.Router();
import passport from "passport";
import bcrypt from "bcrypt";

router.post('/register', async (req, res) => {
    const { usersCollection } = req.db;
    const { email, password } = req.body;
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
        return res.status(400).send({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({ email, password: hashedPassword });
    res.json({ message: 'Реєстрація успішна' });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: info.message });

        req.login(user, (err) => {
            if (err) return next(err);
            return res.json({ message: 'Авторизація успішна', user });
        });
    })(req, res, next);
});

router.post('/logout', (req, res) => {
    req.logout(() => {
        res.json({ message: 'Вихід успішний' });
    });
});

function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: 'Неавторизовано' });
}

router.get('/protected', ensureAuth, (req, res) => {
    res.json({ message: `Вітаю ${req.user.email}` });
});

module.exports = router;
