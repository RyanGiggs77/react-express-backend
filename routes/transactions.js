const express = require('express');
const supabase = require('../database');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// **CREATE TRANSACTION**
router.post('/transactions', authenticateToken, async (req, res) => {
    const { name, amount, note, status } = req.body;
    const userId = req.user.id;

    try {
        console.log("Creating transaction for user:", userId); // Log userId untuk debugging
        const { data, error } = await supabase
            .from('transactions')
            .insert([{ user_id: userId, transaction: name, data: new Date(), amount, note, status }])
            .select('*')
            .single();

        if (error) {
            console.error("Create Transaction Error:", error.message); // Log error ke terminal
            return res.status(500).json({ error: 'Failed to create transaction', details: error.message });
        }

        res.status(201).json(data);
    } catch (error) {
        console.error("Create Transaction Error:", error.message); // Log error ke terminal
        res.status(500).json({ error: 'Failed to create transaction', details: error.message });
    }
});

// **GET USER'S TRANSACTIONS**
router.get('/transactions', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    console.log("Fetching transactions for user:", userId); // Debugging

    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('id, transaction, data, amount, note, status')
            .eq('user_id', userId)
            .order('data', { ascending: false });

        if (error) {
            console.error("Fetch Transactions Error:", error.message); // Log error ke terminal
            return res.status(500).json({ error: 'Failed to fetch transactions', details: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error("Fetch Transactions Error:", error.message); // Log error ke terminal
        res.status(500).json({ error: 'Failed to fetch transactions', details: error.message });
    }
});

// **GET SINGLE TRANSACTION**
router.get('/transactions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error("Fetch Transaction Error:", error.message); // Log error ke terminal
            return res.status(500).json({ error: 'Failed to fetch transaction', details: error.message });
        }

        if (!data) return res.status(404).json({ error: 'Transaction not found' });

        res.json(data);
    } catch (error) {
        console.error("Fetch Transaction Error:", error.message); // Log error ke terminal
        res.status(500).json({ error: 'Failed to fetch transaction', details: error.message });
    }
});

// **UPDATE TRANSACTION**
router.put('/transactions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, amount, note, status } = req.body;
    const userId = req.user.id;

    try {
        console.log("Updating transaction for user:", userId); // Log userId untuk debugging
        const { data, error } = await supabase
            .from('transactions')
            .update({ transaction: name, amount, note, status })
            .eq('id', id)
            .eq('user_id', userId)
            .select('*')
            .single();

        if (error) {
            console.error("Update Transaction Error:", error.message); // Log error ke terminal
            return res.status(500).json({ error: 'Failed to update transaction', details: error.message });
        }

        if (!data) return res.status(404).json({ error: 'Transaction not found' });

        res.json(data);
    } catch (error) {
        console.error("Update Transaction Error:", error.message); // Log error ke terminal
        res.status(500).json({ error: 'Failed to update transaction', details: error.message });
    }
});

// **DELETE TRANSACTION**
router.delete('/transactions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        console.log("Deleting transaction for user:", userId); // Log userId untuk debugging
        const { data, error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)
            .select('*')
            .single();

        if (error) {
            console.error("Delete Transaction Error:", error.message); // Log error ke terminal
            return res.status(500).json({ error: 'Failed to delete transaction', details: error.message });
        }

        if (!data) return res.status(404).json({ error: 'Transaction not found' });

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error("Delete Transaction Error:", error.message); // Log error ke terminal
        res.status(500).json({ error: 'Failed to delete transaction', details: error.message });
    }
});

module.exports = router;