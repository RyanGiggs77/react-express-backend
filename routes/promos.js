const express = require('express');
const supabase = require('../database');
const router = express.Router();

// **CREATE PROMO**
router.post('/promos', async (req, res) => {
    const { promo_start, promo_end, usage_period, max_transaction, about, how_to, team_conditions, partners, promo_name } = req.body;

    try {
        console.log("Creating promo:" . promo_name); // Log promo_name for debugging
        const { data, error } = await supabase
            .from('promos')
            .insert([{ promo_start, promo_end, usage_period, max_transaction, about, how_to, team_conditions, partners, promo_name }])
            .select('*')
            .single();

        console.log(data);

        if (error) {
            console.error("Create Promo Error:", error.message); // log error
            return res.status(500).json({ error: 'Failed to create promo', details: error.message });
        }

        res.status(201).json(data);

    } catch (error) {
        console.error("Create Promo Error:", error.message); // log error
        res.status(500).json({ error: 'Failed to create promo', details: error.message });
    }
});

// **GET PROMOS**
router.get('/promos', async (req, res) => {
    try {
        console.log("Fetching promos"); // Log for debugging
        const { data, error } = await supabase
            .from('promos')
            .select('*');

        if (error) {
            console.error("Fetch Promos Error:", error.message); // Log error
            return res.status(500).json({ error: 'Failed to fetch promos', details: error.message });
        }

        res.json(data);

    } catch (error) {
        console.error("Fetch Promos Error:", error.message); // Log error
        res.status(500).json({ error: 'Failed to fetch promos', details: error.message });
    }
});

// **GET SINGLE PROMO**
router.get('/promos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        console.log("Fetching promo:", id); // Log for debugging
        const { data, error } = await supabase
            .from('promos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Fetch Promo Error:", error.message); // Log error
            return res.status(500).json({ error: 'Failed to fetch promo', details: error.message });
        }

        if (!data) return res.status(404).json({ error: 'Promo not found' });

        res.json(data);

    } catch (error) {
        console.error("Fetch Promo Error:", error.message); // Log error
        res.status(500).json({ error: 'Failed to fetch promo', details: error.message });
    }
});

// **UPDATE PROMO**
router.put('/promos/:id', async (req, res) => {
    const { id } = req.params;
    const { promo_start, promo_end, usage_period, max_transaction, about, how_to, team_conditions, partners, promo_name } = req.body;

    try {
        console.log("Updating promo:", id); // Log for debugging
        const { data, error } = await supabase
            .from('promos')
            .update({ promo_start, promo_end, usage_period, max_transaction, about, how_to, team_conditions, partners, promo_name })
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            console.error("Update Promo Error:", error.message); // Log error
            return res.status(500).json({ error: 'Failed to update promo', details: error.message });
        }

        if (!data) return res.status(404).json({ error: 'Promo not found' });

        res.json(data);

    } catch (error) {
        console.error("Update Promo Error:", error.message); // Log error
        res.status(500).json({ error: 'Failed to update promo', details: error.message });
    }
});

// **DELETE PROMO**
router.delete('/promos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        console.log("Deleting promo:", id); // Log for debugging
        const { data, error } = await supabase
            .from('promos')
            .delete()
            .eq('id', id)
            .single();

        if (error) {
            console.error("Delete Promo Error:", error.message); // Log error
            return res.status(500).json({ error: 'Failed to delete promo', details: error.message });
        }

        if (!data) return res.status(404).json({ error: 'Promo not found' });

        res.json(data);

    } catch (error) {
        console.error("Delete Promo Error:", error.message); // Log error
        res.status(500).json({ error: 'Failed to delete promo', details: error.message });
    }
});

module.exports = router;