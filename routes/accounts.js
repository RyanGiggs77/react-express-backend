const express = require('express');
const pool = require('../database');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// **CREATE ACCOUNT**
router.post('/account', authenticateToken, async (req, res) => {
    const { balance, cvv, xp } = req.body;
    const userId = req.user.id;

    try {
        console.log("Creating account for user:", userId); // Log userId untuk debugging
        const { data, error } = await pool
            .from('accounts')
            .insert([{ user_id: userId, balance: balance || 0.00, cvv, xp }])
            .select('*')
            .single();

        if (error) {
            console.error("Create Account Error:", error.message); // Log error ke terminal
            return res.status(500).json({ error: 'Failed to create account', details: error.message });
        }

        res.status(201).json(data);
    } catch (error) {
        console.error("Create Account Error:", error.message); // Log error ke terminal
        res.status(500).json({ error: 'Failed to create account', details: error.message });
    }
});

// **READ ACCOUNT (GET USER'S ACCOUNT INFO)**
router.get('/account', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        console.log("Fetching account for user:", userId); // Log userId untuk debugging
        const { data, error } = await pool
            .from('accounts')
            .select('user_id, balance, cvv, xp')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error("Fetch Account Error:", error.message); // Log error ke terminal
            return res.status(500).json({ error: 'Failed to fetch account', details: error.message });
        }

        if (!data) return res.status(404).json({ error: 'Account not found' });

        res.json(data);
    } catch (error) {
        console.error("Fetch Account Error:", error.message); // Log error ke terminal
        res.status(500).json({ error: 'Failed to fetch account', details: error.message });
    }
});

// **UPDATE ACCOUNT (BALANCE & CVV)**
router.put('/account', authenticateToken, async (req, res) => {
    const { balance, cvv, xp } = req.body;
    const userId = req.user.id;

    try {
        console.log("Updating account for user:", userId); // Log userId untuk debugging
        const { data, error } = await pool
            .from('accounts')
            .update({ balance, cvv, xp })
            .eq('user_id', userId)
            .select('*')
            .single();

        if (error) {
            console.error("Update Account Error:", error.message); // Log error ke terminal
            return res.status(500).json({ error: 'Failed to update account', details: error.message });
        }

        if (!data) return res.status(404).json({ error: 'Account not found' });

        res.json(data);
    } catch (error) {
        console.error("Update Account Error:", error.message); // Log error ke terminal
        res.status(500).json({ error: 'Failed to update account', details: error.message });
    }
});

// **DELETE ACCOUNT**
router.delete('/account', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        console.log("Deleting account for user:", userId); // Log userId untuk debugging
        const { data, error } = await pool
            .from('accounts')
            .delete()
            .eq('user_id', userId)
            .select('*')
            .single();

        if (error) {
            console.error("Delete Account Error:", error.message); // Log error ke terminal
            return res.status(500).json({ error: 'Failed to delete account', details: error.message });
        }

        if (!data) return res.status(404).json({ error: 'Account not found' });

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error("Delete Account Error:", error.message); // Log error ke terminal
        res.status(500).json({ error: 'Failed to delete account', details: error.message });
    }
});

module.exports = router;