-- ==========================================
-- RCCG House of Glory SQLite Database Schema
-- For deployment on Render / Shared Hosting
-- ==========================================

-- 1. Create Church Branding settings table
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
    logoUrl TEXT -- Base64 url string or public image link
);

-- 2. Create Donation Bank Accounts table
CREATE TABLE IF NOT EXISTS donation_accounts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    bankName TEXT NOT NULL,
    accountNumber TEXT NOT NULL,
    accountName TEXT NOT NULL,
    isDefault INTEGER DEFAULT 0 -- 0: false, 1: true
);

-- 3. Prepopulate Default Seed Data (Initial Configuration)
INSERT INTO church_branding (
    id, churchName, churchSubtitle, heroTitle, heroSubheader, 
    footerScripture, footerScriptureRef, footerThankYou, copyrightText, logoUrl
) VALUES (
    'branding', 
    'RCCG House Of Glory', 
    'International Worship Center', 
    'Fuel the Vision.', 
    'Your generosity powers every life changed, every worship experience, and every community reached. Thank you for investing in the future.', 
    'Freely you have received; freely give.', 
    '— Matthew 10:8', 
    'Thank you for partnering with God''s work. Your resource is directly used in expanding the body of Christ, teaching truth, and caring for the vulnerable.', 
    '© 2026 RCCG House of Glory. All Rights Reserved.',
    NULL
);

-- 4. Prepopulate Default Seed Bank Accounts
INSERT INTO donation_accounts (id, title, bankName, accountNumber, accountName, isDefault)
VALUES 
('default-offering', 'OFFERING ACCOUNT', 'UBA', '1028246694', 'RCCG HOUSE OF GLORY', 1),
('default-tithe', 'TITHE ACCOUNT', 'UBA', '1028247440', 'RCCG HOUSE OF GLORY', 1),
('default-project', 'PROJECT ACCOUNT', 'UBA', '1028247206', 'RCCG HOUSE OF GLORY', 1);
