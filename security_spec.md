# Security Specification: RCCG Church Donation Portal

## 1. Data Invariants

- **Church Branding Configuration (`/church_config/branding`):**
  - Only one single static document named `branding` is permitted.
  - Custom logo base64 URLs can be large but must not exceed 3MB characters to avoid resource exhaustion and database latency.
  - Subheaders, scripture, and thank-you text fields are strictly bounded in maximum characters (200 - 1000).

- **Donation Accounts (`/donation_accounts/{accountId}`):**
  - Document IDs must match standard ID formatting (alphanumeric, underscores, hyphens) and not exceed 128 characters.
  - All keys (`id`, `title`, `bankName`, `accountNumber`, `accountName`) are required on creation. No shadow or additional custom fields are accepted.
  - Account numbers must be string-typed and less than 50 characters to prevent overflow / malformed payment values.

---

## 2. The "Dirty Dozen" Payloads (Vulnerability Vector Mapping)

Below are the 12 malicious payloads meant to exploit the database security and state invariants, all of which are rejected under the security schema.

### Identity & Spoofing Vectors
1. **Unsanitized ID Injection**: Creating an account with a document ID containing special characters (e.g. `acc-../admin-hack`) to trigger directory-traversal or ID-poisoning.
2. **Shadow Field Insertion**: Attempting to insert an unauthorized `isAdmin: true` boolean field inside a normal donation account document.
3. **Empty Bank Account Details**: Attempting to upload a donation account with missing keys (e.g. omitting `accountNumber` or `accountName`).

### Resource Exhaustion (Denial of Wallet)
4. **Giant Logo Payload**: Submitting a logo string that is 10MB in length to trigger excessive memory usage.
5. **Oversized Text Descriptions**: Injecting a 50,000-character string inside `heroSubheader` to bloat rendering sizes.
6. **Infinite Document ID Injection**: Attempting to write a document with an ID greater than 1,000 characters.

### Type & Value Poisoning
7. **Invalid Type for Default Status**: Submitting `isDefault` as a string (`"yes"`) instead of a boolean value.
8. **Invalid Type for Bank Name**: Submitting the `bankName` as an array or object containing nested commands.
9. **Zero-Width Character Spaces**: Injecting hollow white-spaces to mimic a valid title.

### Structural & Logic Exploitation
10. **Branding Document Deletion**: Attempting to issue a delete request for the church's master branding config `/church_config/branding`.
11. **Account Deletion with Malformed ID**: Issuing a delete operation on path variables with malicious characters.
12. **Foreign Schema Mixing**: Writing arbitrary parameters into the accounts schema.
