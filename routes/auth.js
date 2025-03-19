const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../database');
const { body, validationResult } = require('express-validator');
const admin = require('../firebaseAdmin'); // Firebase Admin SDK
const router = express.Router();

// Generate JWT Tokens
const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });
};

// LOGIN DENGAN GOOGLE (FIREBASE)
router.post('/google-login', async (req, res) => {
    const { idToken } = req.body;
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name } = decodedToken;
        
        // Query to check if user exists
        const { data: existingUsers, error: selectError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);
        
        if (selectError) {
            console.error("Select Error:", selectError.message); // Log error to terminal
            return res.status(500).json({ error: 'Error checking user', details: selectError.message });
        }

        let user;
        if (existingUsers.length === 0) {
            // Insert new user
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([{ email, password: null, display_name: name || email, balance: 0, xp: 0, cvv: '000' }])
                .select('id, email, display_name')
                .single();
            
            if (insertError) {
                console.error("Insert Error:", insertError.message); // Log error to terminal
                return res.status(500).json({ error: 'Error creating user', details: insertError.message });
            }

            user = newUser;
        } else {
            user = existingUsers[0];
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Update refresh token
        const { error: updateError } = await supabase
            .from('users')
            .update({ refresh_token: refreshToken })
            .eq('id', user.id);

        if (updateError) {
            console.error("Update Error:", updateError.message); // Log error to terminal
            return res.status(500).json({ error: 'Error updating refresh token', details: updateError.message });
        }

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'strict' });
        res.json({ accessToken });
    } catch (error) {
        console.error("Google Login Error:", error.message); // Log error to terminal
        res.status(401).json({ error: 'Invalid Firebase Token', details: error.message });
    }
});

// REGISTER
router.post('/register', [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Registering user:", email); // Log email untuk debugging

        const { data, error } = await supabase
            .from("users")
            .insert([{ email, password: hashedPassword }])
            .select("id, email"); // Ambil hanya id dan email

        if (error) {
            console.error("Register Error:", error.message); // Log error ke terminal
            return res.status(500).json({ error: 'Error registering user', details: error.message });
        }

        console.log("User registered:", data[0]); // Log hasil insert
        res.status(201).json({ message: 'User registered', user: data[0] });

    } catch (error) {
        console.error("Register Error:", error.message); // Log error ke terminal
        res.status(500).json({ error: 'Error registering user', details: error.message });
    }
});


// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log("Logging in with email:", email); // Log email untuk debugging
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email);

        if (error) {
            console.error("Login Error:", error.message); // Log error ke terminal
            return res.status(500).json({ error: 'Error logging in', details: error.message });
        }

        if (data.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = data[0];
        if (!user.password || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const { updateError } = await supabase
            .from("users")
            .update({ refresh_token: refreshToken })
            .eq("id", user.id);

        if (updateError) {
            console.error("Update Refresh Token Error:", updateError.message); // Log error ke terminal
            return res.status(500).json({ error: 'Error updating refresh token', details: updateError.message });
        }

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'None' });
        res.json({ accessToken, userId: user.id, email: user.email, displayName: user.display_name || user.email });

    } catch (error) {
        console.error("Login Error:", error.message); // Log error ke terminal
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

// REFRESH TOKEN
router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(403).json({ error: 'Access Denied' });

    try {
        // const result = await supabase.query('SELECT * FROM users WHERE refresh_token = $1', [refreshToken]);
        // if (result.rows.length === 0) return res.status(403).json({ error: 'Invalid Refresh Token' });

        // const user = result.rows[0];
        // jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err) => {
        //     if (err) return res.status(403).json({ error: 'Invalid Token' });
        //     res.json({ accessToken: generateAccessToken(user) });
        // });

        const {data,error} = await supabase.from("users").select("*").eq("refresh_token", refreshToken);
        if (error) {
            console.error("Refresh Token Error:", error.message); // Log error ke terminal
            return res.status(500).json({ error: 'Error refreshing token', details: error.message });
        }

        if (data.length === 0) return res.status(403).json({ error: 'Invalid Refresh Token' });

        const user = data[0];
        const accessToken = generateAccessToken(user);
        res.json({ accessToken });

    } catch (error) {
        res.status(500).json({ error: 'Token refresh failed' });
    }
});

// LOGOUT
router.post('/logout', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(400).json({ error: 'No refresh token provided' });

        console.log("Logging out with refresh token:", refreshToken); // Log refresh token untuk debugging

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("refresh_token", refreshToken);

        if (error) {
            console.error("Logout Error:", error.message); // Log error ke terminal
            return res.status(500).json({ error: 'Error logging out', details: error.message });
        }

        if (data.length === 0) return res.status(400).json({ error: 'Invalid refresh token' });

        const user = data[0];
        if (!user.password) {
            try {
                const decodedToken = await admin.auth().verifyIdToken(refreshToken);
                await admin.auth().revokeRefreshTokens(decodedToken.sub);
            } catch (error) {
                console.error('Error revoking Firebase token:', error);
            }
        }

        const { updateError } = await supabase
            .from("users")
            .update({ refresh_token: null })
            .eq("id", user.id);

        if (updateError) {
            console.error("Update Refresh Token Error:", updateError.message); // Log error ke terminal
            return res.status(500).json({ error: 'Error updating refresh token', details: updateError.message });
        }

        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error("Logout Error:", error.message); // Log error ke terminal
        res.status(500).json({ error: 'Logout failed', details: error.message });
    }
});

module.exports = router;