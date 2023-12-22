var express = require('express');
var router = express.Router();
const userModel = require('./users');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const jwt =require('jsonwebtoken');
let otp;
const secretKey = 'financeApp';

router.post('/generate-otp', async (req, res) => {
    const { currentUserMail } = req.body;
    if (currentUserMail !== undefined) {
        var transport = nodemailer.createTransport({
            host: 'mail.proexelancers.com',
            port: 465,
            auth: {
                user: 'shreekrushna.shinde@proexelancers.com',
                pass: 'Shreekrushna@123',
            },
        });
        otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });
        var mailOptions = {
            from: 'shreekrushna.shinde@proexelancers.com',
            to: `${currentUserMail}`,
            subject: 'OTP verification | Finance App',
            html: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f8f8;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h1 {
            color: #007bff;
        }

        .content {
            padding: 20px;
            text-align: center;
        }

        .otp {
            font-size: 36px;
            font-weight: bold;
            color: #28a745;
            border: 2px solid #28a745;
            border-radius: 8px;
            padding: 10px;
            display: inline-block;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
        }

        .footer p {
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>OTP Verification | Finance App</h1>
        </div>
        <div class="content">
            <p>Your One-Time Password (OTP) is<br><span class="otp">${otp}</span></p>
        </div>
        <div class="footer">
            <p>This email is sent from Finance App. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
            `,
        };

        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            res.send(info);
        });
    } else {
        res.status(400).json({ message: 'Internal Server Error! Please try again' });
    }
});

router.post('/verify-otp', (req, res) => {
    const { userOtp } = req.body;
    if (userOtp == otp) {
        res.status(200).json({ message: 'OTP Verified', OTP: true });
    } else {
        res.status(401).json({ message: 'Otp is incorrect' });
    }
});

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const newUser = await userModel.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
    });
    const payload = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
    };
    const token= jwt.sign(payload,secretKey);
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.error('JWT verification failed:', err.message);
        } else {
            console.log('Decoded JWT:', decoded);
        }
    });
    res.status(200).json({ message: 'User Succesfully Registered', userData: newUser,token:token });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userDetails = await userModel.findOne({ email });
    if (!userDetails) {
        res.status(401).json({ message: 'User not exist' });
        return;
    }
    if (userDetails.password !== password) {
        res.status(401).json({ message: 'Email/Password is invalid' });
        return;
    }
    const payload = {
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        email: userDetails.email,
        password: userDetails.password,
    };
    const token= jwt.sign(payload,secretKey);
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.error('JWT verification failed:', err.message);
        } else {
            console.log('Decoded JWT:', decoded);
        }
    });
    res.status(200).json({ message: 'User login success', token:token });
});

router.get('/financeUsers', async (req, res) => {
    const allUsers = await userModel.find();
    res.send(allUsers);
});

module.exports = router;
