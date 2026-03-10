const express = require("express");
const mysql = require("mysql2");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "manju",
    database: "student_db"
});

db.connect(err => {
    if (err) {
        console.log("DB Error:", err);
    } else {
        console.log("✅ MySQL Connected");
    }
});

app.post("/register", (req, res) => {
    console.log(req.body); // 🔍 DEBUG

    const { name, email, gender, course, dob, phone } = req.body;

    const sql = `
        INSERT INTO students (name, email, gender, course, dob, phone)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, email, gender, course, dob, phone], (err) => {
        if (err) {
            console.log(err);
            return res.send("Database Error");
        }
        res.send("Registration Successful");
    });
});

app.listen(3000, () => {
    console.log("🚀 Server running at http://localhost:3000");
});