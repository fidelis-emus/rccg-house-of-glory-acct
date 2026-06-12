import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Enable large raw body parsing for uploaded logos (Base64 is large)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "portal_db.json");

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial defaults
const DEFAULT_ACCOUNTS = [
  {
    id: 'default-offering',
    title: 'OFFERING ACCOUNT DETAILS',
    bankName: 'UBA',
    accountNumber: '1028246694',
    accountName: 'RCCG HOUSE OF GLORY',
    isDefault: true
  },
  {
    id: 'default-tithe',
    title: 'TITHE ACCOUNT DETAILS',
    bankName: 'UBA',
    accountNumber: '1028247440',
    accountName: 'RCCG HOUSE OF GLORY',
    isDefault: true
  },
  {
    id: 'default-project',
    title: 'PROJECT ACCOUNT DETAILS',
    bankName: 'UBA',
    accountNumber: '1028247206',
    accountName: 'RCCG HOUSE OF GLORY',
    isDefault: true
  },
  {
    id: 'default-dollar',
    title: 'DOLLAR ACCOUNT (USD) DETAILS',
    bankName: 'UBA',
    accountNumber: '3004812341',
    accountName: 'RCCG HOUSE OF GLORY',
    isDefault: true
  }
];

const DEFAULT_BRANDING = {
  churchName: 'RCCG House Of Glory',
  churchSubtitle: 'International Worship Center',
  heroTitle: 'Fuel the Vision.',
  heroSubheader: 'Your generosity powers every life changed, every worship experience, and every community reached. Thank you for investing in the future.',
  footerScripture: 'Freely you have received; freely give.',
  footerScriptureRef: '— Matthew 10:8',
  footerThankYou: 'Thank you for partnering with God\'s work. Your resource is directly used in expanding the body of Christ, teaching truth, and caring for the vulnerable.',
  copyrightText: '© 2026 RCCG House of Glory. All Rights Reserved.'
};

interface PortalData {
  accounts: typeof DEFAULT_ACCOUNTS;
  branding: typeof DEFAULT_BRANDING;
  logoUrl: string | null;
}

// Helper to load current state
const loadPortalData = (): PortalData => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error loading portal data from file, fallback to defaults", err);
  }
  return {
    accounts: DEFAULT_ACCOUNTS,
    branding: DEFAULT_BRANDING,
    logoUrl: null,
  };
};

// Helper to save current state
const savePortalData = (data: PortalData) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing portal data to file", err);
    return false;
  }
};

// API: Get unified portal configurations
app.get("/api/portal-data", (req, res) => {
  const data = loadPortalData();
  res.json(data);
});

// API: Save unified portal configurations
app.post("/api/portal-data", (req, res) => {
  const { accounts, branding, logoUrl } = req.body;
  
  if (!accounts || !branding) {
    return res.status(400).json({ error: "Missing required accounts or branding data" });
  }

  const payload: PortalData = {
    accounts,
    branding,
    logoUrl: logoUrl !== undefined ? logoUrl : null
  };

  const success = savePortalData(payload);
  if (success) {
    res.json({ success: true, message: "Portal configurations updated successfully" });
  } else {
    res.status(500).json({ error: "Internal server error saving configurations" });
  }
});

async function startServer() {
  // Vite integration middleware
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
    console.log(`[RCCG PORTAL SERVER] Listening on http://localhost:${PORT}`);
  });
}

startServer();
