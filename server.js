const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const supabase = require('./database')
const accountRoutes =  require('./routes/accounts');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cors({ origin: ['http://localhost:5000','http://localhost:5173','https://project-reactjs-eta.vercel.app'], credentials: true }));
app.use(cookieParser());


app.use('/auth', authRoutes);
app.use('/auth', accountRoutes);


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});



// app.use('/auth', authRoutes);
// app.use('/auth', accountRoutes);
// app.use('/auth', transactionsRoutes);

// app.get('/', (req, res) => {
//     res.send('Hello World!')
// });

// app.get('/users', async (req, res) => {
//     try {
//         let { data, error } = await supabase.from('users').select('*');
//         if (error) throw error;
//         res.status(200).json(data);
//     } catch (error) {
//         console.error('Error fetching dinosaurs:', error.message);
//         res.status(500).json({ error: 'Error fetching dinosaurs' });
//     }
// });