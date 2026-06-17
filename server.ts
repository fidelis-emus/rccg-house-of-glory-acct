import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import sqlite3 from "sqlite3";

// Initial seed data
const DEFAULT_BRANDING = {
  churchName: "RCCG HOuse OF GLORY",
  churchSubtitle: "The Gateway of Heaven",
  heroTitle: "DUE BENEVOLENT SUPPORT",
  heroSubheader: "Your cheerful giving goes a long way towards church expansion, missionary operations, and local community outreach.",
  footerScripture: "Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.",
  footerScriptureRef: "2 Corinthians 9:7 (KJV)",
  footerThankYou: "Thank you for partnering with us in establishing the Kingdom of God.",
  copyrightText: "© 2026 RCCG House of Glory. All Rights Reserved."
};

const DEFAULT_ACCOUNTS = [
  {
    id: "default-offering",
    title: "OFFERING ACCOUNT",
    bankName: "ACCESS BANK",
    accountNumber: "0102030405",
    accountName: "RCCG HOuse OF GLORY OFFERING",
    isDefault: 1
  },
  {
    id: "default-tithe",
    title: "TITHE ACCOUNT",
    bankName: "GUARANTY TRUST BANK",
    accountNumber: "0908070605",
    accountName: "RCCG HOuse OF GLORY TITHE",
    isDefault: 0
  }
];

// Initialize SQLite database
const storageDir = path.join(process.cwd(), "storage");
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const dbPath = path.join(storageDir, "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite:", err.message);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
  }
});

// Create tables and seed data
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS church_branding (
      id TEXT PRIMARY KEY,
      churchName TEXT,
      churchSubtitle TEXT,
      heroTitle TEXT,
      heroSubheader TEXT,
      footerScripture TEXT,
      footerScriptureRef TEXT,
      footerThankYou TEXT,
      copyrightText TEXT,
      logoUrl TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS donation_accounts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      bankName TEXT NOT NULL,
      accountNumber TEXT NOT NULL,
      accountName TEXT NOT NULL,
      isDefault INTEGER DEFAULT 0
    )
  `);

  // Seed default branding if not already present
  db.get("SELECT COUNT(*) as count FROM church_branding WHERE id = 'branding'", (err, row: any) => {
    if (!err && row && row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO church_branding (
          id, churchName, churchSubtitle, heroTitle, heroSubheader, 
          footerScripture, footerScriptureRef, footerThankYou, copyrightText, logoUrl
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        "branding",
        DEFAULT_BRANDING.churchName,
        DEFAULT_BRANDING.churchSubtitle,
        DEFAULT_BRANDING.heroTitle,
        DEFAULT_BRANDING.heroSubheader,
        DEFAULT_BRANDING.footerScripture,
        DEFAULT_BRANDING.footerScriptureRef,
        DEFAULT_BRANDING.footerThankYou,
        DEFAULT_BRANDING.copyrightText,
        null
      );
      stmt.finalize();
      console.log("Seeded default branding into SQLite.");
    }
  });

  // Seed default accounts if empty
  db.get("SELECT COUNT(*) as count FROM donation_accounts", (err, row: any) => {
    if (!err && row && row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO donation_accounts (id, title, bankName, accountNumber, accountName, isDefault)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      DEFAULT_ACCOUNTS.forEach((acc) => {
        stmt.run(acc.id, acc.title, acc.bankName, acc.accountNumber, acc.accountName, acc.isDefault);
      });
      stmt.finalize();
      console.log("Seeded default donation accounts into SQLite.");
    }
  });
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Request logger middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API ROUTES

  // GET branding
  app.get("/api/branding", (req, res) => {
    db.get("SELECT * FROM church_branding WHERE id = 'branding'", (err, row: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row || DEFAULT_BRANDING);
    });
  });

  // POST update branding
  app.post("/api/branding", (req, res) => {
    const {
      churchName,
      churchSubtitle,
      heroTitle,
      heroSubheader,
      footerScripture,
      footerScriptureRef,
      footerThankYou,
      copyrightText
    } = req.body;

    db.run(
      `UPDATE church_branding SET 
        churchName = COALESCE(?, churchName),
        churchSubtitle = COALESCE(?, churchSubtitle),
        heroTitle = COALESCE(?, heroTitle),
        heroSubheader = COALESCE(?, heroSubheader),
        footerScripture = COALESCE(?, footerScripture),
        footerScriptureRef = COALESCE(?, footerScriptureRef),
        footerThankYou = COALESCE(?, footerThankYou),
        copyrightText = COALESCE(?, copyrightText)
       WHERE id = 'branding'`,
      [
        churchName,
        churchSubtitle,
        heroTitle,
        heroSubheader,
        footerScripture,
        footerScriptureRef,
        footerThankYou,
        copyrightText
      ],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        db.get("SELECT * FROM church_branding WHERE id = 'branding'", (err2, row) => {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }
          res.json({ success: true, branding: row });
        });
      }
    );
  });

  // POST logoUrl
  app.post("/api/logo", (req, res) => {
    const { logoUrl } = req.body; // Expect base64 url or null
    db.run(
      "UPDATE church_branding SET logoUrl = ? WHERE id = 'branding'",
      [logoUrl],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, logoUrl });
      }
    );
  });

  // GET accounts
  app.get("/api/donation_accounts", (req, res) => {
    db.all("SELECT * FROM donation_accounts", (err, rows: any[]) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // Convert isDefault integer back to boolean for React compatibility
      const accounts = rows.map((r) => ({
        ...r,
        isDefault: !!r.isDefault
      }));
      res.json(accounts);
    });
  });

  // POST create account
  app.post("/api/donation_accounts", (req, res) => {
    const { id, title, bankName, accountNumber, accountName, isDefault } = req.body;
    if (!title || !bankName || !accountNumber || !accountName) {
      return res.status(400).json({ error: "Missing required account fields." });
    }

    const finalId = id || "acc-" + Date.now();
    const finalIsDefault = isDefault ? 1 : 0;

    db.run(
      `INSERT INTO donation_accounts (id, title, bankName, accountNumber, accountName, isDefault)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [finalId, title, bankName, accountNumber, accountName, finalIsDefault],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          success: true,
          account: { id: finalId, title, bankName, accountNumber, accountName, isDefault: !!isDefault }
        });
      }
    );
  });

  // PUT update account
  app.put("/api/donation_accounts/:id", (req, res) => {
    const { id } = req.params;
    const { title, bankName, accountNumber, accountName, isDefault } = req.body;

    const finalIsDefault = isDefault ? 1 : 0;

    db.run(
      `UPDATE donation_accounts SET
        title = COALESCE(?, title),
        bankName = COALESCE(?, bankName),
        accountNumber = COALESCE(?, accountNumber),
        accountName = COALESCE(?, accountName),
        isDefault = COALESCE(?, isDefault)
       WHERE id = ?`,
      [title, bankName, accountNumber, accountName, finalIsDefault, id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
      }
    );
  });

  // DELETE account
  app.delete("/api/donation_accounts/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM donation_accounts WHERE id = ?", [id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    });
  });

  // POST reset database
  app.post("/api/reset", (req, res) => {
    db.serialize(() => {
      db.run("DELETE FROM church_branding");
      db.run("DELETE FROM donation_accounts");

      const stmt1 = db.prepare(`
        INSERT INTO church_branding (
          id, churchName, churchSubtitle, heroTitle, heroSubheader, 
          footerScripture, footerScriptureRef, footerThankYou, copyrightText, logoUrl
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt1.run(
        "branding",
        DEFAULT_BRANDING.churchName,
        DEFAULT_BRANDING.churchSubtitle,
        DEFAULT_BRANDING.heroTitle,
        DEFAULT_BRANDING.heroSubheader,
        DEFAULT_BRANDING.footerScripture,
        DEFAULT_BRANDING.footerScriptureRef,
        DEFAULT_BRANDING.footerThankYou,
        DEFAULT_BRANDING.copyrightText,
        null
      );
      stmt1.finalize();

      const stmt2 = db.prepare(`
        INSERT INTO donation_accounts (id, title, bankName, accountNumber, accountName, isDefault)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      DEFAULT_ACCOUNTS.forEach((acc) => {
        stmt2.run(acc.id, acc.title, acc.bankName, acc.accountNumber, acc.accountName, acc.isDefault);
      });
      stmt2.finalize();

      res.json({ success: true, branding: DEFAULT_BRANDING, accounts: DEFAULT_ACCOUNTS, logoUrl: null });
    });
  });

  // Vite preview & build asset serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
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
    console.log(`Express application serving SQLite + Vite on http://localhost:${PORT}`);
  });
}

startServer();
