require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const register = require("./REst_api_auth/schema2");
const ForgotPassword = require("./forgotPassword");

const app = express();

// 🔗 CONNECT TO MONGODB
mongoose
  .connect(process.env.CONN_STR)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// 🔧 MIDDLEWARE
app.use(
  cors({
    origin: ["http://localhost:5173", "https://powerorg.netlify.app"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📩 EMAIL VERIFICATION FUNCTION
const sendVerificationEmail = async (email, name, userId) => {
  const verificationToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  const verificationLink = `https://powerorg.netlify.app/verify-email?token=${verificationToken}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"PowerOrg Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "PowerOrg – Confirm Your Email",
    html: `
      <h2>Hi ${name},</h2>
      <p>Please verify your email by clicking the button below:</p>
      <a href="${verificationLink}" style="padding: 10px 20px; background: #41CA1A; color: white; border-radius: 5px;">Verify Email</a>
      <p>If the button doesn’t work, copy and paste this URL:</p>
      <p>${verificationLink}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// 📝 SIGN UP
app.post("/SignUp", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required." });

  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters with uppercase, lowercase, and number.",
    });
  }

  const existingUser = await register.findOne({ email });
  if (existingUser)
    return res.status(409).json({ message: "Email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new register({
    name,
    email,
    password: hashedPassword,
    isVerified: false,
  });
  await user.save();

  sendVerificationEmail(email, name, user._id).catch(console.error);

  res
    .status(201)
    .json({ message: "Signup successful. Please verify your email." });
});

// ✅ VERIFY EMAIL
app.get("/verify-email", async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ message: "Token is missing." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await register.findByIdAndUpdate(
      decoded.userId,
      { isVerified: true, emailVerifiedAt: new Date() },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "Email verified successfully." });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token." });
  }
});

// 🔁 RESEND VERIFICATION
app.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  const user = await register.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found." });
  if (user.isVerified)
    return res.status(400).json({ message: "Email already verified." });

  try {
    await sendVerificationEmail(email, user.name, user._id);
    res.json({ message: "Verification email resent." });
  } catch (err) {
    res.status(500).json({ message: "Failed to send email." });
  }
});

// 🔐 SIGN IN
app.post("/SignIn", async (req, res) => {
  const { email, password } = req.body;
  const user = await register.findOne({ email }).select("+password");

  if (!user || !user.password)
    return res.status(400).json({ message: "Invalid credentials." });
  if (!user.isVerified)
    return res.status(403).json({ message: "Please verify your email first." });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Invalid credentials." });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ message: "Sign in successful", token, name: user.name });
});

app.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;
  const user = await register.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found." });

  const name = user.name;
  const token = crypto.randomBytes(32).toString("hex");
  await ForgotPassword.create({ email, token });

  const resetLink = `https://powerorg.netlify.app/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"PowerOrg Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your PowerOrg Password",
    html: `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background: #ffffff; border: 1px solid #e5e7eb;">
      
      <!-- Header with Light Grey Background -->
      <div style="background-color: #f5f5f5; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
          <span style="color: #41CA1A;">Power</span><span style="color: #FF9E1B;">Org</span>
        </h1>
      </div>

      <!-- Body Content -->
      <div style="padding: 24px 20px; color: #1f2937;">
        <h2 style="font-size: 22px; margin-top: 0;">Password reset request</h2>
        
        <p style="font-size: 16px;">Hi ${name || "there"},</p>

        <p style="font-size: 15px; line-height: 1.5;">
          We received a request to reset your password. To proceed, simply click the button below. You may be asked to verify your identity before updating your password.
        </p>

        <p style="font-size: 14px; font-weight: bold; margin-top: 20px;">
          Please note: This request will expire in 1 hour.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #41CA1A; color: white; padding: 14px 28px; font-size: 16px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block;">
            Reset your password
          </a>
        </div>

        <p style="font-size: 14px; color: #374151;">
          Having trouble? Copy and paste this link into your browser:
        </p>

        <p style="font-size: 13px; word-break: break-word;">
          <a href="${resetLink}" style="color: #1f2937;">${resetLink}</a>
        </p>

        <p style="font-size: 14px;">If you didn’t request this, no further action is required.</p>

        <p style="font-size: 14px;">Thank you,<br />The PowerOrg Team</p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
        Need help? <a href="https://powerorg.netlify.app/contact" style="color: #41CA1A; text-decoration: none;">Contact Support</a><br/>
        &copy; ${new Date().getFullYear()} PowerOrg Inc. All rights reserved.
      </div>
    </div>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Reset email sent." });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ message: "Failed to send email." });
  }
});

// 🔒 RESET PASSWORD
app.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password)
    return res
      .status(400)
      .json({ message: "Token and password are required." });

  const record = await ForgotPassword.findOne({ token });
  if (!record)
    return res.status(400).json({ message: "Invalid or expired token." });

  const user = await register.findOne({ email: record.email });
  if (!user) return res.status(404).json({ message: "User not found." });

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();

  await ForgotPassword.deleteOne({ token });

  res.json({ message: "Password reset successful." });
});

// 🚀 START SERVER
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
