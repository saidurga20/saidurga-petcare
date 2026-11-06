
const express = require('express');
const db = require('./DB');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dashboard counts
app.get('/api/dashboard', (req, res) => {
    const sql = `
        SELECT
        (SELECT COUNT(*) FROM owners) AS totalOwners,
        (SELECT COUNT(*) FROM pets) AS totalPets,
        (SELECT COUNT(*) FROM appointments) AS totalAppointments
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result[0]);
    });
});

// Display owners
app.get('/api/owners', (req, res) => {
    db.query('SELECT * FROM owners', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Add owner
app.post('/api/owners', (req, res) => {
    const { name, email, phone, address } = req.body;

    const sql = 'INSERT INTO owners (name, email, phone, address) VALUES (?, ?, ?, ?)';

    db.query(sql, [name, email, phone, address], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Owner added successfully!' });
    });
});

// Display pets
app.get('/api/pets', (req, res) => {
    db.query('SELECT * FROM pets', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Add pet
app.post('/api/pets', (req, res) => {
    const { owner_id, pet_name, species, breed, age } = req.body;

    const sql = `
        INSERT INTO pets
        (owner_id, pet_name, species, breed, age)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [owner_id, pet_name, species, breed, age], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Pet added successfully!' });
    });
});

// Display appointments
app.get('/api/appointments', (req, res) => {
    const sql = `
        SELECT a.*, p.pet_name, p.species, o.name AS owner_name
        FROM appointments a
        JOIN pets p ON a.pet_id = p.pet_id
        JOIN owners o ON p.owner_id = o.owner_id
        ORDER BY a.appointment_date DESC
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Add appointment
app.post('/api/appointments', (req, res) => {
    const { pet_id, doctor_name, appointment_date, reason, status } = req.body;

    const sql = `
        INSERT INTO appointments
        (pet_id, doctor_name, appointment_date, reason, status)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql,
        [pet_id, doctor_name, appointment_date, reason, status],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Appointment added successfully!' });
        }
    );
});

// Update appointment status
app.put('/api/appointments/:id', (req, res) => {
    const { status } = req.body;

    const sql = 'UPDATE appointments SET status = ? WHERE appointment_id = ?';

    db.query(sql, [status, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Appointment status updated successfully!' });
    });
});

// Delete owner
app.delete('/api/owners/:id', (req, res) => {
    db.query('DELETE FROM owners WHERE owner_id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Owner deleted successfully!' });
    });
});

// Delete pet
app.delete('/api/pets/:id', (req, res) => {
    db.query('DELETE FROM pets WHERE pet_id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Pet deleted successfully!' });
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
