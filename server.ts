import express from "express";
import path from "path";
import dotenv from "dotenv";
import twilio from "twilio";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import fs from "fs";

// Load environment variables
dotenv.config();

// Simple JSON File Database for Cross-Device Synchronization
const DB_FILE = path.join(process.cwd(), "db.json");

interface SyncDatabase {
  registeredUsers: any[];
  carts: Record<string, any[]>;
  wishlists: Record<string, any[]>;
  addresses: Record<string, any[]>;
  orders: Record<string, any[]>;
}

function loadDatabase(): SyncDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Failed to load schema from db.json, returning empty defaults:", err);
  }
  return {
    registeredUsers: [],
    carts: {},
    wishlists: {},
    addresses: {},
    orders: {}
  };
}

function saveDatabase(data: SyncDatabase) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save state to db.json:", err);
  }
}

// Lazy initialization of Twilio client
let twilioClient: any = null;

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    return null;
  }
  if (!twilioClient) {
    try {
      twilioClient = twilio(accountSid, authToken);
    } catch (e) {
      console.warn("Could not handle twilio initialization:", e);
      return null;
    }
  }
  return twilioClient;
}

// Lazy initialization of Nodemailer transporter
let mailTransporter: any = null;

function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  if (!mailTransporter) {
    try {
      mailTransporter = nodemailer.createTransport({
        host: host,
        port: parseInt(port || "587"),
        secure: port === "465",
        auth: {
          user: user,
          pass: pass,
        },
      });
    } catch (err) {
      console.warn("Nodemailer transporter definition failed:", err);
      return null;
    }
  }
  return mailTransporter;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON parsing middleware for API routes
  app.use(express.json());

  // API endpoints for persistence across devices
  app.get("/api/registered-users", (req, res) => {
    try {
      const db = loadDatabase();
      res.json({ success: true, users: db.registeredUsers });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get("/api/sync-data", (req, res) => {
    try {
      const email = req.query.email ? String(req.query.email).trim().toLowerCase() : "";
      if (!email) {
        return res.status(400).json({ success: false, message: "Email parameter is required." });
      }
      const db = loadDatabase();
      res.json({
        success: true,
        cart: db.carts[email] || [],
        wishlist: db.wishlists[email] || [],
        addresses: db.addresses[email] || [],
        orders: db.orders[email] || []
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/sync-data", (req, res) => {
    try {
      const { email, cart, wishlist, addresses, orders, user } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required to sync data." });
      }
      const targetEmail = String(email).trim().toLowerCase();
      const db = loadDatabase();

      // Save user specific stores
      if (cart !== undefined) db.carts[targetEmail] = cart;
      if (wishlist !== undefined) db.wishlists[targetEmail] = wishlist;
      if (addresses !== undefined) db.addresses[targetEmail] = addresses;
      if (orders !== undefined) db.orders[targetEmail] = orders;

      // Upsert registered user information if provided
      if (user) {
        const index = db.registeredUsers.findIndex(u => u.email.trim().toLowerCase() === targetEmail);
        if (index > -1) {
          db.registeredUsers[index] = { ...db.registeredUsers[index], ...user };
        } else {
          db.registeredUsers.push(user);
        }
      }

      saveDatabase(db);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // API endpoint to dispatch Email OTP verification codes securely
  app.post("/api/send-email-otp", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ success: false, message: "Email and verification code are required." });
      }

      const cleanEmail = email.trim();
      const transporter = getMailTransporter();
      const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "no-reply@babycareapp.local";

      if (!transporter) {
        console.log(`[SIMULATED EMAIL LOG] SMTP config missing. To: ${cleanEmail}, Content: Your security verification code is ${code}`);
        return res.json({
          success: true,
          mode: "simulated",
          message: "SMTP keys are not configured. Switched to secure simulation preview panel."
        });
      }

      // Send actual email using SMTP!
      await transporter.sendMail({
        from: `"Baby Care App Security" <${fromEmail}>`,
        to: cleanEmail,
        subject: `${code} is your Baby Care App verification code`,
        text: `Your Baby Care App secure verification code is: ${code}. Please enter this code in the verification screen to complete your registration.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; line-height: 1.5; color: #1c1917;">
            <h2 style="color: #0c0a09; font-weight: 800; border-bottom: 1px solid #e7e5e4; padding-bottom: 10px;">Verification Code</h2>
            <p>Welcome! Your Baby Care App registration secure verification code is:</p>
            <div style="background-color: #f5f5f4; border: 1px solid #e7e5e4; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-family: monospace; font-size: 28px; font-weight: 900; tracking: 0.1em; color: #1c1917;">${code}</span>
            </div>
            <p style="font-size: 12px; color: #78716c;">This verification code is unique to you. Do not share this code with anyone.</p>
          </div>
        `
      });

      console.log(`[REAL MAIL SENT] Verification code successfully dispatched to ${cleanEmail}`);
      return res.json({
        success: true,
        mode: "live",
        message: "Email verification OTP code has been successfully dispatched."
      });
    } catch (err: any) {
      console.error("Failed to transmit email code via SMTP:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "An error occurred while contacting the Mail delivery gateway."
      });
    }
  });

  // API endpoint to dispatch SMS verification codes securely
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { phone, code } = req.body;
      if (!phone || !code) {
        return res.status(400).json({ success: false, message: "Phone number and verification code are required." });
      }

      // Format clean phone number
      const cleanPhone = phone.trim();

      const client = getTwilioClient();
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!client || !fromNumber) {
        console.log(`[SIMULATED SMS LOG] Keys missing. To: ${cleanPhone}, Content: Your security OTP key is ${code}`);
        return res.json({
          success: true,
          mode: "simulated",
          message: "Twilio credentials are not configured. Switched to secure simulation preview panel."
        });
      }

      // Send actual real SMS using Twilio Client!
      const message = await client.messages.create({
        body: `Your Baby Care App registration secure verification code is: ${code}`,
        from: fromNumber,
        to: cleanPhone
      });

      console.log(`[REAL SMS SENT] Message SID: ${message.sid} dispatched successfully to ${cleanPhone}`);
      return res.json({
        success: true,
        mode: "live",
        message: "Secure SMS verification code dispatched successfully!"
      });
    } catch (err: any) {
      console.error("Failed to transmit SMS code via Twilio:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Unknown error occurred while contacting the SMS gateway."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
