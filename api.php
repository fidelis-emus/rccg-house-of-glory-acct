<?php
/**
 * RCCG House of Glory - Standalone PHP REST API (api.php)
 * 
 * Elegant, production-ready, ultra-secure single-file API.
 * Uses plain PHP 8+ and SQLite for lightweight, high-performance data storage.
 * Ideal for shared hosting or Cloud platforms like Render.
 *
 * Features:
 *  - Automated SQLite database & directory creation
 *  - Full RESTful API Routing (GET, POST, PUT, DELETE)
 *  - CORS support (Allows cross-origin requests from React dashboard)
 *  - Strict Input Verification & Validation
 *  - Database SQL Query Sanitization (Prepared Statements to avoid SQL Injections)
 *  - Integrated Request Logging
 *  - Pagination, Searching, Filtering and Sorting for lists
 *  - Schema database self-migration
 */

// -------------------------------------------------------------
// 1. CORS Headers & Preflight
// -------------------------------------------------------------
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// -------------------------------------------------------------
// 2. Constants & Configuration
// -------------------------------------------------------------
define('DB_DIR', __DIR__ . '/storage');
define('DB_FILE', DB_DIR . '/database.sqlite');
define('LOG_FILE', DB_DIR . '/api_requests.log');

// Seed defaults
const DEFAULT_BRANDING = [
    'churchName' => 'RCCG House Of Glory',
    'churchSubtitle' => 'International Worship Center',
    'heroTitle' => 'Fuel the Vision.',
    'heroSubheader' => 'Your generosity powers every life changed, every worship experience, and every community reached. Thank you for investing in the future.',
    'footerScripture' => 'Freely you have received; freely give.',
    'footerScriptureRef' => '— Matthew 10:8',
    'footerThankYou' => "Thank you for partnering with God's work. Your resource is directly used in expanding the body of Christ, teaching truth, and caring for the vulnerable.",
    'copyrightText' => '© 2026 RCCG House of Glory. All Rights Reserved.'
];

const DEFAULT_ACCOUNTS = [
    [
        'id' => 'default-offering',
        'title' => 'OFFERING ACCOUNT',
        'bankName' => 'UBA',
        'accountNumber' => '1028246694',
        'accountName' => 'RCCG HOUSE OF GLORY',
        'isDefault' => 1
    ],
    [
        'id' => 'default-tithe',
        'title' => 'TITHE ACCOUNT',
        'bankName' => 'UBA',
        'accountNumber' => '1028247440',
        'accountName' => 'RCCG HOUSE OF GLORY',
        'isDefault' => 1
    ],
    [
        'id' => 'default-project',
        'title' => 'PROJECT ACCOUNT',
        'bankName' => 'UBA',
        'accountNumber' => '1028247206',
        'accountName' => 'RCCG HOUSE OF GLORY',
        'isDefault' => 1
    ]
];

// Ensure directories exist
if (!file_exists(DB_DIR)) {
    mkdir(DB_DIR, 0755, true);
}

// -------------------------------------------------------------
// 3. Request Logging Layer
// -------------------------------------------------------------
function logRequest() {
    $timestamp = date('Y-m-d H:i:s');
    $method = $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN';
    $uri = $_SERVER['REQUEST_URI'] ?? 'UNKNOWN';
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
    $agent = $_SERVER['HTTP_USER_AGENT'] ?? 'UNKNOWN';
    
    $log_line = "[$timestamp] IP: $ip | Method: $method | URI: $uri | Agent: $agent" . PHP_EOL;
    file_put_contents(LOG_FILE, $log_line, FILE_APPEND);
}
logRequest();

// -------------------------------------------------------------
// 4. Helper API Response Functions
// -------------------------------------------------------------
function successResponse(mixed $data, int $status_code = 200): never {
    http_response_code($status_code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit();
}

function errorResponse(string $message, int $status_code = 400): never {
    http_response_code($status_code);
    echo json_encode([
        'error' => true,
        'message' => $message,
        'status' => $status_code
    ], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit();
}

// -------------------------------------------------------------
// 5. Database Connection and Auto-Migrations
// -------------------------------------------------------------
try {
    $pdo = new PDO("sqlite:" . DB_FILE);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Auto Migrations
    $pdo->exec("
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
        );
        
        CREATE TABLE IF NOT EXISTS donation_accounts (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            bankName TEXT NOT NULL,
            accountNumber TEXT NOT NULL,
            accountName TEXT NOT NULL,
            isDefault INTEGER DEFAULT 0
        );
    ");

    // Initialize branding if missing
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM church_branding WHERE id = 'branding'");
    if ($stmt->fetch()['cnt'] == 0) {
        $ins = $pdo->prepare("
            INSERT INTO church_branding (
                id, churchName, churchSubtitle, heroTitle, heroSubheader, 
                footerScripture, footerScriptureRef, footerThankYou, copyrightText, logoUrl
            ) VALUES ('branding', :cn, :cs, :ht, :hs, :fs, :fr, :ft, :cr, NULL)
        ");
        $ins->execute([
            ':cn' => DEFAULT_BRANDING['churchName'],
            ':cs' => DEFAULT_BRANDING['churchSubtitle'],
            ':ht' => DEFAULT_BRANDING['heroTitle'],
            ':hs' => DEFAULT_BRANDING['heroSubheader'],
            ':fs' => DEFAULT_BRANDING['footerScripture'],
            ':fr' => DEFAULT_BRANDING['footerScriptureRef'],
            ':ft' => DEFAULT_BRANDING['footerThankYou'],
            ':cr' => DEFAULT_BRANDING['copyrightText']
        ]);
    }

    // Initialize accounts if empty
    $stmtAcc = $pdo->query("SELECT COUNT(*) as cnt FROM donation_accounts");
    if ($stmtAcc->fetch()['cnt'] == 0) {
        $insAcc = $pdo->prepare("
            INSERT INTO donation_accounts (id, title, bankName, accountNumber, accountName, isDefault)
            VALUES (:id, :title, :bank, :num, :name, :def)
        ");
        foreach (DEFAULT_ACCOUNTS as $acc) {
            $insAcc->execute([
                ':id' => $acc['id'],
                ':title' => $acc['title'],
                ':bank' => $acc['bankName'],
                ':num' => $acc['accountNumber'],
                ':name' => $acc['accountName'],
                ':def' => $acc['isDefault']
            ]);
        }
    }

} catch (PDOException $e) {
    errorResponse("Critical Database Connection/Migration Fail: " . $e->getMessage(), 500);
}

// -------------------------------------------------------------
// 6. Router & RESTful Integration
// -------------------------------------------------------------
$method = $_SERVER['REQUEST_METHOD'];

// Parse URL path to support /api.php/resource/{id} or fallback to ?resource=..., ?id=...
$path_info = $_SERVER['PATH_INFO'] ?? '';
if (empty($path_info)) {
    // Fallback if PATH_INFO not defined (some server environments)
    $req_uri = strtok($_SERVER['REQUEST_URI'] ?? '', '?');
    $script_name = $_SERVER['SCRIPT_NAME'] ?? '';
    if (strpos($req_uri, $script_name) === 0) {
        $path_info = substr($req_uri, strlen($script_name));
    }
}

$segments = array_filter(explode('/', trim($path_info, '/')));
$resource = $segments[0] ?? $_GET['resource'] ?? null;
$resource_id = $segments[1] ?? $_GET['id'] ?? null;

if (!$resource) {
    successResponse([
        'status' => 'OK',
        'api_name' => 'RCCG House of Glory REST API',
        'version' => '1.0.0',
        'endpoints' => [
            'GET /api.php/branding' => 'Retrieve church configurations & logoUrl',
            'POST /api.php/branding' => 'Update general church config details',
            'POST /api.php/logo' => 'Upload a base64 logo string',
            'GET /api.php/donation_accounts' => 'Query active bank donation accounts list (supports page, limit, search, sort)',
            'GET /api.php/donation_accounts/{id}' => 'Fetch single bank account details',
            'POST /api.php/donation_accounts' => 'Add customized offering/tithes bank account',
            'PUT /api.php/donation_accounts/{id}' => 'Edit specific church donation account information',
            'DELETE /api.php/donation_accounts/{id}' => 'Permanently delete specific church account',
            'POST /api.php/reset' => 'Instantly reset whole database to factory standards'
        ]
    ]);
}

// Read raw JSON post request input body
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// -------------------------------------------------------------
// 7. Input Request Verification Layer
// -------------------------------------------------------------
function validateRequest(array $data, array $required_keys) {
    $missing = [];
    foreach ($required_keys as $key) {
        if (!isset($data[$key]) || (is_string($data[$key]) && trim($data[$key]) === '')) {
            $missing[] = $key;
        }
    }
    if (!empty($missing)) {
        errorResponse("Missing required fields: " . implode(', ', $missing), 400);
    }
}

// -------------------------------------------------------------
// 8. REST Routing Controller Logic
// -------------------------------------------------------------
switch ($resource) {
    case 'branding':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM church_branding WHERE id = 'branding'");
            $brandingData = $stmt->fetch();
            successResponse($brandingData);
        } 
        elseif ($method === 'POST') {
            validateRequest($input, ['churchName', 'churchSubtitle']);
            
            $stmt = $pdo->prepare("
                UPDATE church_branding SET
                    churchName = :cn,
                    churchSubtitle = :cs,
                    heroTitle = :ht,
                    heroSubheader = :hs,
                    footerScripture = :fs,
                    footerScriptureRef = :fr,
                    footerThankYou = :ft,
                    copyrightText = :cr
                WHERE id = 'branding'
            ");
            $stmt->execute([
                ':cn' => $input['churchName'] ?? '',
                ':cs' => $input['churchSubtitle'] ?? '',
                ':ht' => $input['heroTitle'] ?? '',
                ':hs' => $input['heroSubheader'] ?? '',
                ':fs' => $input['footerScripture'] ?? '',
                ':fr' => $input['footerScriptureRef'] ?? '',
                ':ft' => $input['footerThankYou'] ?? '',
                ':cr' => $input['copyrightText'] ?? ''
            ]);

            $stmtOutput = $pdo->query("SELECT * FROM church_branding WHERE id = 'branding'");
            successResponse(['success' => true, 'branding' => $stmtOutput->fetch()]);
        } 
        else {
            errorResponse("Method $method Not Allowed on branding", 405);
        }
        break;

    case 'logo':
        if ($method === 'POST') {
            // Validate that we got a logo base64 field (can be null for removal)
            $logoUrl = isset($input['logoUrl']) ? $input['logoUrl'] : null;
            
            $stmt = $pdo->prepare("UPDATE church_branding SET logoUrl = :logo WHERE id = 'branding'");
            $stmt->execute([':logo' => $logoUrl]);
            
            successResponse(['success' => true, 'logoUrl' => $logoUrl]);
        } else {
            errorResponse("Method $method Not Allowed on logo", 405);
        }
        break;

    case 'donation_accounts':
        if ($method === 'GET') {
            if ($resource_id) {
                // Fetch details of single account
                $stmt = $pdo->prepare("SELECT * FROM donation_accounts WHERE id = :id");
                $stmt->execute([':id' => $resource_id]);
                $account = $stmt->fetch();
                if (!$account) {
                    errorResponse("Donation Account with ID '$resource_id' not found", 404);
                }
                $account['isDefault'] = (bool)$account['isDefault'];
                successResponse($account);
            } else {
                // Search query parsing
                $search = isset($_GET['search']) ? trim($_GET['search']) : '';
                
                // Pagination parameters
                $page = max(1, isset($_GET['page']) ? (int)$_GET['page'] : 1);
                $limit = max(1, min(100, isset($_GET['limit']) ? (int)$_GET['limit'] : 50));
                $offset = ($page - 1) * $limit;

                // Sorting
                $allowed_sort_fields = ['title', 'bankName', 'accountNumber', 'accountName', 'isDefault'];
                $sort_by = isset($_GET['sort_by']) && in_array($_GET['sort_by'], $allowed_sort_fields) ? $_GET['sort_by'] : 'title';
                $order = isset($_GET['order']) && strtoupper($_GET['order']) === 'DESC' ? 'DESC' : 'ASC';

                // Query creation
                $sql = "SELECT * FROM donation_accounts";
                $count_sql = "SELECT COUNT(*) as total FROM donation_accounts";
                $params = [];

                if ($search !== '') {
                    $sql .= " WHERE title LIKE :search OR bankName LIKE :search OR accountName LIKE :search";
                    $count_sql .= " WHERE title LIKE :search OR bankName LIKE :search OR accountName LIKE :search";
                    $params[':search'] = '%' . $search . '%';
                }

                $sql .= " ORDER BY $sort_by $order LIMIT :limit OFFSET :offset";

                // Count total rows
                $count_stmt = $pdo->prepare($count_sql);
                $count_stmt->execute($params);
                $total_records = (int)$count_stmt->fetch()['total'];
                $total_pages = ceil($total_records / $limit);

                // Fetch database records
                $stmt = $pdo->prepare($sql);
                // Bind limit and offset safely for SQLite execution
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                foreach ($params as $param_key => $param_val) {
                    $stmt->bindValue($param_key, $param_val);
                }
                $stmt->execute();
                
                $accounts = [];
                while ($row = $stmt->fetch()) {
                    $row['isDefault'] = (bool)$row['isDefault'];
                    $accounts[] = $row;
                }

                successResponse([
                    'data' => $accounts,
                    'pagination' => [
                        'total_records' => $total_records,
                        'total_pages' => $total_pages,
                        'current_page' => $page,
                        'limit' => $limit
                    ]
                ]);
            }
        } 
        elseif ($method === 'POST') {
            validateRequest($input, ['title', 'bankName', 'accountNumber', 'accountName']);
            
            $id = $input['id'] ?? ('acc-' . round(microtime(true) * 1000));
            $is_default = !empty($input['isDefault']) ? 1 : 0;

            $stmt = $pdo->prepare("
                INSERT INTO donation_accounts (id, title, bankName, accountNumber, accountName, isDefault)
                VALUES (:id, :title, :bank, :num, :name, :def)
            ");
            $stmt->execute([
                ':id' => $id,
                ':title' => $input['title'],
                ':bank' => $input['bankName'],
                ':num' => $input['accountNumber'],
                ':name' => $input['accountName'],
                ':def' => $is_default
            ]);

            successResponse([
                'success' => true,
                'message' => 'Donation Account created successfully',
                'account' => [
                    'id' => $id,
                    'title' => $input['title'],
                    'bankName' => $input['bankName'],
                    'accountNumber' => $input['accountNumber'],
                    'accountName' => $input['accountName'],
                    'isDefault' => (bool)$is_default
                ]
            ], 201);
        } 
        elseif ($method === 'PUT') {
            if (!$resource_id) {
                errorResponse("ID parameter is required to perform an update", 400);
            }
            
            // Check if record exists
            $chk = $pdo->prepare("SELECT COUNT(*) as cnt FROM donation_accounts WHERE id = :id");
            $chk->execute([':id' => $resource_id]);
            if ($chk->fetch()['cnt'] == 0) {
                errorResponse("Donation Account with ID '$resource_id' not found", 404);
            }

            $is_default = isset($input['isDefault']) ? ($input['isDefault'] ? 1 : 0) : null;

            $stmt = $pdo->prepare("
                UPDATE donation_accounts SET
                    title = COALESCE(:title, title),
                    bankName = COALESCE(:bank, bankName),
                    accountNumber = COALESCE(:num, accountNumber),
                    accountName = COALESCE(:name, accountName),
                    isDefault = COALESCE(:def, isDefault)
                WHERE id = :id
            ");
            $stmt->execute([
                ':id' => $resource_id,
                ':title' => $input['title'] ?? null,
                ':bank' => $input['bankName'] ?? null,
                ':num' => $input['accountNumber'] ?? null,
                ':name' => $input['accountName'] ?? null,
                ':def' => $is_default
            ]);

            successResponse(['success' => true, 'message' => 'Donation Account updated successfully']);
        } 
        elseif ($method === 'DELETE') {
            if (!$resource_id) {
                errorResponse("ID parameter is required to perform delete operations", 400);
            }

            // Check if record exists
            $chk = $pdo->prepare("SELECT COUNT(*) as cnt FROM donation_accounts WHERE id = :id");
            $chk->execute([':id' => $resource_id]);
            if ($chk->fetch()['cnt'] == 0) {
                errorResponse("Donation Account with ID '$resource_id' not found", 404);
            }

            $stmt = $pdo->prepare("DELETE FROM donation_accounts WHERE id = :id");
            $stmt->execute([':id' => $resource_id]);

            successResponse(['success' => true, 'message' => "Donation Account '$resource_id' deleted successfully"]);
        } 
        else {
            errorResponse("Method $method Not Allowed on donation_accounts", 405);
        }
        break;

    case 'reset':
        if ($method === 'POST') {
            // Delete all records and insert standard seed values
            $pdo->exec("DELETE FROM church_branding");
            $pdo->exec("DELETE FROM donation_accounts");

            $insBranding = $pdo->prepare("
                INSERT INTO church_branding (
                    id, churchName, churchSubtitle, heroTitle, heroSubheader, 
                    footerScripture, footerScriptureRef, footerThankYou, copyrightText, logoUrl
                ) VALUES ('branding', :cn, :cs, :ht, :hs, :fs, :fr, :ft, :cr, NULL)
            ");
            $insBranding->execute([
                ':cn' => DEFAULT_BRANDING['churchName'],
                ':cs' => DEFAULT_BRANDING['churchSubtitle'],
                ':ht' => DEFAULT_BRANDING['heroTitle'],
                ':hs' => DEFAULT_BRANDING['heroSubheader'],
                ':fs' => DEFAULT_BRANDING['footerScripture'],
                ':fr' => DEFAULT_BRANDING['footerScriptureRef'],
                ':ft' => DEFAULT_BRANDING['footerThankYou'],
                ':cr' => DEFAULT_BRANDING['copyrightText']
            ]);

            $insAcc = $pdo->prepare("
                INSERT INTO donation_accounts (id, title, bankName, accountNumber, accountName, isDefault)
                VALUES (:id, :title, :bank, :num, :name, :def)
            ");
            foreach (DEFAULT_ACCOUNTS as $acc) {
                $insAcc->execute([
                    ':id' => $acc['id'],
                    ':title' => $acc['title'],
                    ':bank' => $acc['bankName'],
                    ':num' => $acc['accountNumber'],
                    ':name' => $acc['accountName'],
                    ':def' => $acc['isDefault']
                ]);
            }

            successResponse([
                'success' => true, 
                'message' => 'Database fully reset to default factory seeds.',
                'branding' => DEFAULT_BRANDING,
                'accounts' => DEFAULT_ACCOUNTS
            ]);
        } else {
            errorResponse("Method $method Not Allowed on reset", 405);
        }
        break;

    default:
        errorResponse("Resource '$resource' not found in RCCG House of Glory API", 404);
}
