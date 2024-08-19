require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const RefreshToken = require('../models/RefreshToken');
const SendEmail = require('./EmailController');
const crypto = require("crypto");

let verification_code;

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_CONNECTION).catch((err) => console.log(err));

const storeRefreshToken = async (token) => {
    await token.save();
}

const getRefreshTokens = async (token) => {
    const res = await RefreshToken.find({ token: token });
    return res;
}

const generateTokenObject = (user) => {
    return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    }
}

// Middleware to Authenticate token
const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1hr' }); // 1hr, 1m
};

module.exports = {
    login: async (req, res) => {
        const user = await Employee.find({ email: req.body.email });

        if (!user[0]) return res.status(400).send('User not found');

        // Authenticate User
        try {
            // Use Bcrypt compare the found User password with the incoming Request User password
            bcrypt.compare(req.body.password, user[0].password).then(doesMatch => {
                if (doesMatch) {
                    const _user = generateTokenObject(user[0]);
                    const accessToken = generateAccessToken(_user);
                    const refreshToken = jwt.sign(_user, process.env.REFRESH_TOKEN_SECRET);

                    const newToken = new RefreshToken({
                        token: refreshToken
                    });
                    storeRefreshToken(newToken);

                    res.send({ accessToken: accessToken, refreshToken: refreshToken, message: 'Logged in successfully' });
                } else {
                    res.send({ error: 'Incorrect Password' });
                }
            });
        } catch (e) {
            res.status(500).send(e);
        }
    },
    refresh_token: async (req, res) => {
        const refreshToken = req.body.token;

        if (!refreshToken) return res.sendStatus(401);

        const refresh_Tokens = await getRefreshTokens(refreshToken);

        if (refresh_Tokens.length < 1) return res.sendStatus(403);

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {

            if (err) return res.sendStatus(403);

            const accessToken = generateAccessToken(generateTokenObject(user));
            res.json({ accessToken: accessToken });
        });
    },
    logout: async (req, res) => {
        refreshTokens = await RefreshToken.deleteOne({ token: req.body.token });

        res.status(204).send();
    },
    forgot_password: async (req, res) => {
        const user = await Employee.find({ email: req.body.email });

        if (!user[0]) return res.status(400).send('User not found');

        try {
            verification_code = crypto.randomBytes(10).toString('hex');
            let body = {
                verification_code,
                to: user[0].email, // list of receivers
                subject: "Verification Code", // Subject line
                text: `Your Verification code: ${verification_code}`, // plain text body
                html: `
                    <div class="container">
                        <img src="https://img.freepik.com/free-vector/emails-concept-illustration_114360-1355.jpg?w=740&t=st=1667382667~exp=1667383267~hmac=672fc7039e14cd627e26453fbfdc1f2ccc11bcae152a78e92ee8a4db108b6be9" alt="Logo" width="150px" height="150px" />
                        <h2>Hi ${user[0].firstName}</h2>
                        <p>Here is your verification code: <b>${verification_code}</b></p>
                    </div>
                `, // html body
            }

            req.body = body;
            SendEmail.send_email(req, res);
        } catch (err) {
            res.status(400).send(err);
        }
    },
    verify_code: async (req, res) => {
        if (req.body.verification_code === verification_code) {
            res.status(200).send({ message: "success" });
        } else {
            res.status(400).send('Invalid Verification Code');
        }
    },
    change_password: async (req, res) => {
        const hashedPassword = await bcrypt.hash(req.body.new_password, 10);

        await Employee.updateOne({ email: req.body.email }, {
            password: hashedPassword
        });

        res.status(200).send({ message: "success" });
    }
}