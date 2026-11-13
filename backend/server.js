
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("CareerTrack Backend is Running!");
});

app.get('/api/test-db', (req, res) => {
    db.query('SELECT 1 AS result', (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Database query failed",
                error: err.message
            });
        }

        res.json({
            message: "Database connected successfully!",
            data: results
        });
    });
});


app.get('/api/dashboard', (req, res) => {

    const userId = req.query.user_id;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({
            message: "Valid user_id is required"
        });
    }

    const sql = `
        SELECT
            COUNT(*) AS totalApplications,
            SUM(CASE WHEN LOWER(status) LIKE '%interview%' THEN 1 ELSE 0 END) AS interviews,
            SUM(CASE WHEN LOWER(status) = 'selected' THEN 1 ELSE 0 END) AS selected,
            SUM(CASE WHEN LOWER(status) = 'rejected' THEN 1 ELSE 0 END) AS rejected
        FROM applications
        WHERE user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch dashboard statistics",
                error: err.message
            });
        }

        res.status(200).json({
            message: "Dashboard statistics fetched successfully!",
            data: results[0]
        });

    });

});

app.post('/api/applications', (req, res) => {

    const {
        user_id,
        company_name,
        job_role,
        location,
        applied_date,
        status,
        job_description
    } = req.body;

    const sql = `
        INSERT INTO applications
        (user_id, company_name, job_role, location, applied_date, status, job_description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        user_id,
        company_name,
        job_role,
        location,
        applied_date,
        status,
        job_description
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to add application",
                error: err.message
            });
        }

        res.status(201).json({
            message: "Application added successfully!",
            application_id: result.insertId
        });
    });
});

app.get('/api/applications', (req, res) => {

    const sql = 'SELECT * FROM applications';

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch applications",
                error: err.message
            });
        }

        res.status(200).json({
            message: "Applications fetched successfully!",
            data: results
        });

    });

});

app.get('/api/applications/:id', (req, res) => {

    const applicationId = req.params.id;

    const sql = 'SELECT * FROM applications WHERE application_id = ?';

    db.query(sql, [applicationId], (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch application",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.status(200).json({
            message: "Application fetched successfully!",
            data: results[0]
        });

    });

});

app.put('/api/applications/:id', (req, res) => {

    const applicationId = req.params.id;
    const { status } = req.body;

    const sql = `
        UPDATE applications
        SET status = ?
        WHERE application_id = ?
    `;

    db.query(sql, [status, applicationId], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to update application",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.status(200).json({
            message: "Application updated successfully!"
        });

    });

});

app.delete('/api/applications/:id', (req, res) => {

    const applicationId = req.params.id;

    const sql = 'DELETE FROM applications WHERE application_id = ?';

    db.query(sql, [applicationId], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to delete application",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.status(200).json({
            message: "Application deleted successfully!"
        });

    });

});


app.post('/api/interviews', (req, res) => {

    const {
        application_id,
        interview_date,
        interview_round,
        result
    } = req.body;

    if (!application_id || !interview_date || !interview_round) {
        return res.status(400).json({
            message: "Application ID, interview date and round are required"
        });
    }

    const sql = `
        INSERT INTO interviews
        (application_id, interview_date, interview_round, result)
        VALUES (?, ?, ?, ?)
    `;

    const values = [
        application_id,
        interview_date,
        interview_round,
        result || "Pending"
    ];

    db.query(sql, values, (err, response) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to schedule interview",
                error: err.message
            });
        }

        res.status(201).json({
            message: "Interview scheduled successfully!",
            interview_id: response.insertId
        });

    });

});


app.get('/api/interviews', (req, res) => {

    const sql = `
        SELECT
            i.interview_id,
            i.application_id,
            i.interview_date,
            i.interview_round,
            i.result,
            a.company_name,
            a.job_role
        FROM interviews i
        JOIN applications a
        ON i.application_id = a.application_id
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch interviews",
                error: err.message
            });
        }

        res.status(200).json({
            message: "Interviews fetched successfully!",
            data: results
        });

    });

});


app.put('/api/interviews/:id', (req, res) => {

    const interviewId = req.params.id;

    const {
        application_id,
        interview_date,
        interview_round,
        result
    } = req.body;

    const sql = `
        UPDATE interviews
        SET application_id = ?,
            interview_date = ?,
            interview_round = ?,
            result = ?
        WHERE interview_id = ?
    `;

    const values = [
        application_id,
        interview_date,
        interview_round,
        result,
        interviewId
    ];

    db.query(sql, values, (err, response) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to update interview",
                error: err.message
            });
        }

        if (response.affectedRows === 0) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        res.status(200).json({
            message: "Interview updated successfully!"
        });

    });

});



app.delete('/api/interviews/:id', (req, res) => {

    const interviewId = req.params.id;

    const sql = `
        DELETE FROM interviews
        WHERE interview_id = ?
    `;

    db.query(sql, [interviewId], (err, response) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to delete interview",
                error: err.message
            });
        }

        if (response.affectedRows === 0) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }

        res.status(200).json({
            message: "Interview deleted successfully!"
        });

    });

});




const PORT = 5000;


// GET PROFILE
app.get('/api/profile/:id', (req, res) => {
    const userId = req.params.id;

    const sql = `
        SELECT user_id, name, email, phone, location
        FROM users
        WHERE user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to fetch profile",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile fetched successfully",
            data: results[0]
        });
    });
});


// PUT UPDATE PROFILE
app.put('/api/profile/:id', (req, res) => {
    const userId = req.params.id;

    const { name, email, phone, location } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            message: "Name and email are required"
        });
    }

    const sql = `
        UPDATE users
        SET name = ?,
            email = ?,
            phone = ?,
            location = ?
        WHERE user_id = ?
    `;

    const values = [
        name,
        email,
        phone || null,
        location || null,
        userId
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    message: "Email already exists"
                });
            }

            return res.status(500).json({
                message: "Failed to update profile",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found or no changes made"
            });
        }

        res.status(200).json({
            message: "Profile updated successfully!"
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});