/**********************************
 * Bulk Mail Sender Backend
 * Node.js + Express + MongoDB + SendGrid
 **********************************/

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const sgMail = require("@sendgrid/mail");

const app = express();

/* ------------------ MIDDLEWARE ------------------ */
// Enable CORS for all origins and handle preflight automatically
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());


/* ------------------ SENDGRID SETUP ------------------ */
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* ------------------ ROUTE: SEND EMAIL ------------------ */
app.post("/sendmail", async (req, res) => {
  console.log('mail received');
  
  const { msg, emailList } = req.body;

  // Validate message
  if (!msg || typeof msg !== "string") {
    return res.status(400).json({ success: false, message: "Message is required" });
  }

  // Clean and validate email list
  const cleanEmails = (emailList || [])
    .filter(email => typeof email === "string" && email.trim() && email.includes("@"))
    .map(email => email.trim());

  if (cleanEmails.length === 0) {
    return res.status(400).json({ success: false, message: "No valid emails found" });
  }

  // Send emails one by one
  const results = [];

  for (const email of cleanEmails) {
    try {
      await sgMail.send({
        to: email,
        from: process.env.EMAIL_USER, // MUST be a verified SendGrid sender
        subject: "Message from Bulk Mail App",
        text: msg
      });
      console.log("Sent to:", email);
      results.push({ email, status: "success" });
    } catch (err) {
      console.error(`Failed to send to ${email}:`, err.response?.body || err.message);
      results.push({ email, status: "failed", error: err.response?.body || err.message });
    }
  }

  res.status(200).json({
    success: true,
    message: `Processed ${cleanEmails.length} emails`,
    results
  });
});

/* ------------------ START SERVER ------------------ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* ------------------ ERROR HANDLING ------------------ */
process.on("unhandledRejection", err => console.error("Unhandled Rejection:", err.message));
process.on("uncaughtException", err => console.error("Uncaught Exception:", err.message));