require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();


/* ------------------ MIDDLEWARE ------------------ */
app.use(cors());
app.use(express.json());



/* ------------------ DB CONNECTION ------------------ */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  });



/* ------------------ MAIL TRANSPORTER ------------------ */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});



/* ------------------ VERIFY MAILER ------------------ */
transporter.verify((error) => {
  if (error) {
    console.error("Email transporter error:", error.message);
  } else {
    console.log("Email transporter ready");
  }
});



/* ------------------ ROUTES ------------------ */
app.post("/sendmail", async (req, res) => {
  const { msg, emailList } = req.body;

  // ✅ Respond immediately
  res.status(200).json({
    success: true,
    message: "Email sending started",
  });



  // ✅ Send emails in background
  try {
    for (const email of emailList || []) {
      await transporter.sendMail({
        from: `"Bulk Mail App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Message from Bulk Mail App",
        text: msg,
      });

      console.log(`Email sent to: ${email}`);
    }
  } catch (err) {
    console.error("Email sending error:", err.message);
  }
});



/* ------------------ SERVER ------------------ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* ------------------ SAFETY ------------------ */
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});
