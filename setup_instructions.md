# RCCG House Of Glory - REST API Setup & Deployment Guide

This document describes how to deploy and interact with the converted **PHP 8 + SQLite** REST API. It is completely standalone, lightweight, file-based, secure, and ready for deployment on **Render**, shared hosting providers (such as Hostinger, Bluehost, Namecheap), or any self-managed Apache/Nginx web hosting server.

---

## 📂 Folder Structure

When hosting your application, make sure the directory layout is structured as follows:

```text
├── api.php                  # Primary standalone REST HTTP handler
├── .htaccess                # Apache routing, CORS and database access restriction list
├── schema.sql               # SQLite physical database schema copy
├── setup_instructions.md    # Deployment guides & API specification
└── storage/                 # Data directory (created dynamically by api.php with 0755)
    ├── database.sqlite      # The physical file-based database containing your data
    └── api_requests.log     # Plaintext request logging of active connections
```

---

## 🚀 Easy Deployment Instructions

### Option A: Hosting on Render (PHP Web Service)
1. Commit the root files (`api.php`, `.htaccess`, `schema.sql`) to a fresh private GitHub repository.
2. Log into your [Render Dashboard](https://dashboard.render.com).
3. Select **New** > **Web Service** and link your newly created GitHub repository.
4. Set the following configuration details:
   - **Runtime**: `PHP`
   - **Build Command**: *Leave blank*
   - **Start Command**: *Leave blank* (Render uses Apache/PHP automatically for PHP files if not specified)
5. Under **Disk** or **Persistent Storage**, mount a disk at `/storage` directory (or use standard local persistence if you don't require persistent disk, but mounting a Render Disk on `/storage` guarantees database files persist perfectly across deployment rollouts!). Note that `api.php` saves databases inside `__DIR__ . '/storage'`.
6. Click **Deploy Web Service** and your REST endpoints are live!

### Option B: Shared Hosting (Apache + PHP + cPanel)
1. Log into your hosting account cPanel and open the **File Manager**.
2. Navigate to your root directory (typically `public_html/` or a subfolder domain directory).
3. Drag and upload the following files into that directory:
   - `api.php`
   - `.htaccess`
   - `schema.sql`
4. The script will automatically create the `storage/` directory, set correct folder permissions (0755), instantiate `database.sqlite` and seed default parameters, you do not need to execute anything manually!

---

## 📡 Example Web Requests & Response Payloads

Below are concrete curl requests you can use to test endpoints:

### 1. View Church Branding Details
- **Endpoint**: `GET /api.php/branding` (or with htaccess rewrite: `GET /branding`)
- **Headers**: `Accept: application/json`
- **Request**:
  ```bash
  curl -X GET "https://yourdomain.com/branding" -H "Accept: application/json"
  ```
- **Response** (200 OK):
  ```json
  {
      "id": "branding",
      "churchName": "RCCG House Of Glory",
      "churchSubtitle": "International Worship Center",
      "heroTitle": "Fuel the Vision.",
      "heroSubheader": "Your generosity powers every life changed...",
      "footerScripture": "Freely you have received; freely give.",
      "footerScriptureRef": "— Matthew 10:8",
      "footerThankYou": "Thank you for partnering with God's work...",
      "copyrightText": "© 2026 RCCG House of Glory. All Rights Reserved.",
      "logoUrl": null
  }
  ```

### 2. Update Church Branding Details
- **Endpoint**: `POST /api.php/branding` (or with htaccess rewrite: `POST /branding`)
- **Headers**: `Content-Type: application/json`
- **Request**:
  ```bash
  curl -X POST "https://yourdomain.com/branding" \
       -H "Content-Type: application/json" \
       -d '{
         "churchName": "RCCG House of Glory High Praise",
         "churchSubtitle": "Glory Sanctuary",
         "heroTitle": "Inspired Giving Section",
         "heroSubheader": "Supporting the physical church structure and programs.",
         "footerScripture": "God loves a cheerful giver.",
         "footerScriptureRef": "2 Cor 9:7",
         "footerThankYou": "Thanks!",
         "copyrightText": "© 2026 Updated Church Logo Center"
       }'
  ```
- **Response** (200 OK):
  ```json
  {
      "success": true,
      "branding": {
          "id": "branding",
          "churchName": "RCCG House of Glory High Praise",
          "churchSubtitle": "Glory Sanctuary",
          "heroTitle": "Inspired Giving Section",
          "heroSubheader": "Supporting the physical church structure and programs.",
          "footerScripture": "God loves a cheerful giver.",
          "footerScriptureRef": "2 Cor 9:7",
          "footerThankYou": "Thanks!",
          "copyrightText": "© 2026 Updated Church Logo Center",
          "logoUrl": null
      }
  }
  ```

### 3. Fetch Paginated & Sorted Donation Accounts
- **Endpoint**: `GET /api.php/donation_accounts?page=1&limit=2&sort_by=title&order=ASC`
- **Request**:
  ```bash
  curl -X GET "https://yourdomain.com/donation_accounts?page=1&limit=2&sort_by=title&order=ASC"
  ```
- **Response** (200 OK):
  ```json
  {
      "data": [
          {
              "id": "default-offering",
              "title": "OFFERING ACCOUNT",
              "bankName": "UBA",
              "accountNumber": "1028246694",
              "accountName": "RCCG HOUSE OF GLORY",
              "isDefault": true
          },
          {
              "id": "default-project",
              "title": "PROJECT ACCOUNT",
              "bankName": "UBA",
              "accountNumber": "1028247206",
              "accountName": "RCCG HOUSE OF GLORY",
              "isDefault": true
          }
      ],
      "pagination": {
          "total_records": 3,
          "total_pages": 2,
          "current_page": 1,
          "limit": 2
      }
  }
  ```

### 4. Create New Bank Account
- **Endpoint**: `POST /api.php/donation_accounts`
- **Request**:
  ```bash
  curl -X POST "https://yourdomain.com/donation_accounts" \
       -H "Content-Type: application/json" \
       -d '{
         "title": "MISSIONS DEPT DETAILS",
         "bankName": "Zenith Bank",
         "accountNumber": "1019283746",
         "accountName": "RCCG HOG MISSIONS",
         "isDefault": false
       }'
  ```
- **Response** (201 Created):
  ```json
  {
      "success": true,
      "message": "Donation Account created successfully",
      "account": {
          "id": "acc-171810573921",
          "title": "MISSIONS DEPT DETAILS",
          "bankName": "Zenith Bank",
          "accountNumber": "1019283746",
          "accountName": "RCCG HOG MISSIONS",
          "isDefault": false
      }
  }
  ```

### 5. Update Existing Bank Account
- **Endpoint**: `PUT /api.php/donation_accounts/acc-171810573921`
- **Request**:
  ```bash
  curl -X PUT "https://yourdomain.com/donation_accounts/acc-171810573921" \
       -H "Content-Type: application/json" \
       -d '{
         "bankName": "Zenith International",
         "isDefault": true
       }'
  ```
- **Response** (200 OK):
  ```json
  {
      "success": true,
      "message": "Donation Account updated successfully"
  }
  ```

### 6. Delete Bank Account
- **Endpoint**: `DELETE /api.php/donation_accounts/acc-171810573921`
- **Request**:
  ```bash
  curl -X DELETE "https://yourdomain.com/donation_accounts/acc-171810573921"
  ```
- **Response** (200 OK):
  ```json
  {
      "success": true,
      "message": "Donation Account 'acc-171810573921' deleted successfully"
  }
  ```

### 7. Reset Database to Seed Parameters
- **Endpoint**: `POST /api.php/reset`
- **Request**:
  ```bash
  curl -X POST "https://yourdomain.com/reset"
  ```
- **Response** (200 OK):
  ```json
  {
      "success": true,
      "message": "Database fully reset to default factory seeds.",
      "branding": {
          "churchName": "RCCG House Of Glory",
          "churchSubtitle": "International Worship Center",
          "heroTitle": "Fuel the Vision.",
          "...": "..."
      },
      "accounts": [
          {"id": "default-offering", "title": "OFFERING ACCOUNT", "bankName": "UBA", "accountNumber": "1028246694", "accountName": "RCCG HOUSE OF GLORY", "isDefault": 1},
          {"id": "default-tithe", "title": "TITHE ACCOUNT", "bankName": "UBA", "accountNumber": "1028247440", "accountName": "RCCG HOUSE OF GLORY", "isDefault": 1},
          {"id": "default-project", "title": "PROJECT ACCOUNT", "bankName": "UBA", "accountNumber": "1028247206", "accountName": "RCCG HOUSE OF GLORY", "isDefault": 1}
      ]
  }
  ```
