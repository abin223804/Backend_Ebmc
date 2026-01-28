# Postman Collections for EBMC Backend API

This directory contains Postman collections for testing the Individual Profile and Corporate Profile APIs.

## 📁 Collections

1. **Individual_Profile_API.postman_collection.json** - Individual customer profile management
2. **Corporate_Profile_API.postman_collection.json** - Corporate customer profile management

## 🚀 Getting Started

### Import Collections into Postman

1. Open Postman
2. Click **Import** button (top left)
3. Select the JSON files from this directory
4. Collections will appear in your Postman workspace

### Configure Environment Variables

Both collections use the following variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `http://localhost:5000` | Your backend server URL |
| `accessToken` | `your-jwt-access-token-here` | JWT access token for authentication |

**To set these:**
1. In Postman, go to **Environments** (left sidebar)
2. Create a new environment (e.g., "EBMC Local")
3. Add the variables above
4. Select this environment before making requests

## 🔐 Authentication

Both APIs require authentication via JWT tokens. The authentication is configured at the collection level using Bearer Token.

### Getting an Access Token

1. First, authenticate using your user login endpoint
2. Copy the JWT access token from the response
3. Set it in your Postman environment as `accessToken`
4. All requests will automatically include this token

**Note:** The APIs also use cookie-based authentication. Make sure to enable "Send cookies" in Postman settings.

## ⚠️ IMPORTANT: File Upload Guidelines

### The Empty String Problem (FIXED)

The backend now automatically handles empty strings, but to avoid confusion:

**DO:**
- ✅ Only include fields you want to send
- ✅ DISABLE file upload fields you don't want to use
- ✅ DELETE file upload fields you don't need
- ✅ Use the appropriate request variant (Minimal, With ID Details, Complete, etc.)

**DON'T:**
- ❌ Leave file upload fields ENABLED but empty
- ❌ Send empty strings for nested objects

### How to Handle File Uploads in Postman

1. **If you DON'T want to upload a file:**
   - Right-click the file field → **Disable** (or just delete it)
   - The field will be grayed out and won't be sent

2. **If you DO want to upload a file:**
   - Keep the field enabled
   - Change type to "File" if not already
   - Click "Select Files" and choose your file

## 📝 Individual Profile API

### Available Requests

1. **Create Individual Profile (Minimal)** - Only required fields
2. **Create Individual Profile (With ID Details)** - Includes ID information
3. **Create Individual Profile (Complete)** - All fields without file uploads
4. **Get All Individual Profiles**
5. **Get Individual Profile by ID**

### Required Fields

- `customerName` - Full name
- `dob` - Date of birth (YYYY-MM-DD)
- `nationality` - Customer nationality
- `birthCountry` - Birth country
- `profession` - Profession
- `pepStatus` - PEP status (YES/NO)
- `residentStatus` - Resident status
- `mobile` - Mobile number
- `addressLine1` - Address line 1
- `city` - City
- `searchBy` - Search criteria

### Optional Fields

- `email`, `gender`, `landline`, `state`, `poBox`, `sponsorName`, `visaNumber`, `visaExpiryDate`, etc.
- `idDetails` - Array of ID documents (passport, Emirates ID, etc.)
- Search configuration fields: `searchCategories`, `matchScore`, `isExactMatch`, etc.

### ID Details Structure

When including ID details, provide ALL required fields:
```
idDetails[0][idType]         - e.g., "Passport"
idDetails[0][idNumber]       - ID number
idDetails[0][issueDate]      - YYYY-MM-DD
idDetails[0][expiryDate]     - YYYY-MM-DD
idDetails[0][issuedCountry]  - Country name
idDetails[0][file]           - (Optional) File upload
```

### Background Check Integration

The API automatically performs background checks via Shufti Pro with:
- Sanction lists
- Warning lists
- Fitness & probity checks
- PEP checks (Class 1-4)

Results are stored in the `apiResult` field.

## 🏢 Corporate Profile API

### Available Requests

1. **Create Corporate Profile (Minimal)** - Only required fields
2. **Create Corporate Profile (With UBO)** - Includes one UBO without files
3. **Create Corporate Profile (Complete)** - UBOs and shareholders without files
4. **Create Corporate Profile (With Files)** - Example with file uploads (disabled by default)
5. **Get All Corporate Profiles**
6. **Get Corporate Profile by ID**

### Required Fields

- `customerType` - Type of customer (e.g., "Corporate")
- `customerName` - Company name
- `entityLegalType` - Legal entity type

### Optional but Recommended

- `country` - Country of incorporation
- `incorporationDate` - Date in YYYY-MM-DD format
- `address` - Company address object
- `tradeLicenseNumber` - Trade license number
- `ubos` - Array of Ultimate Beneficial Owners
- `shareholders` - Array of shareholders
- `documents` - Various compliance documents

### UBO Structure

```
ubos[0][uboName]                  - UBO name
ubos[0][uboType]                  - e.g., "Individual"
ubos[0][shareholdingPercentage]   - Ownership %
ubos[0][passportNumber]           - Passport number
ubos[0][nationality]              - Nationality
ubos[0][isPep]                    - YES/NO
ubos[0][dob]                      - YYYY-MM-DD
ubos[0][passportFile]             - (Optional) File upload
ubos[0][emiratesIdFile]           - (Optional) File upload
```

### Shareholder Structure

```
shareholders[0][name]                      - Name
shareholders[0][passportNumber]            - Passport number
shareholders[0][nationality]               - Nationality
shareholders[0][shareholdingPercentage]    - Ownership %
shareholders[0][isPep]                     - YES/NO
shareholders[0][dob]                       - YYYY-MM-DD
shareholders[0][passportFile]              - (Optional) File upload
```

### Available Document Uploads

All document fields are optional:
- `documents[accountOpeningForm]`
- `documents[amlPolicy]`
- `documents[sourceOfFundDeclaration]`
- `documents[pepDeclaration]`
- `documents[oecdComplianceDeclaration]`
- `documents[lbmaDeclaration]`
- `documents[supplyChainPolicy]`
- `documents[boardResolution]`
- `documents[moa]` - Memorandum of Association
- `documents[vatRegistrationCertificate]`
- `documents[corporateTaxRegistrationCertificate]`
- `documents[staffAuthorization]`
- `documents[vatRcmDeclaration]`
- `documents[fiuGoAmlRegistrationScreenshot]`

### Business AML Check Integration

The API automatically performs business AML checks via Shufti Pro with:
- Sanction lists
- Fitness & probity checks
- Warning lists
- PEP checks

Results are stored in the `apiResult` field.

## 🧪 Testing Workflow

### Quick Start - Individual Profile

1. **Start Simple:**
   - Use "Create Individual Profile (Minimal)"
   - Fill in only the required fields
   - Send request

2. **Add Complexity:**
   - Use "Create Individual Profile (With ID Details)"
   - Add ID information
   - Test without file upload first

3. **Test File Upload:**
   - Enable the `idDetails[0][file]` field
   - Select a file
   - Send request

### Quick Start - Corporate Profile

1. **Start Simple:**
   - Use "Create Corporate Profile (Minimal)"
   - Fill in only required fields
   - Send request

2. **Add UBO:**
   - Use "Create Corporate Profile (With UBO)"
   - Add one UBO without files
   - Send request

3. **Test File Upload:**
   - Use "Create Corporate Profile (With Files)"
   - Enable ONLY the file fields you want to upload
   - Select files for enabled fields
   - Send request

## 📊 Response Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful (GET requests) |
| 201 | Created | Profile created successfully |
| 400 | Bad Request | Invalid data or missing required fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 404 | Not Found | Profile not found |
| 500 | Internal Server Error | Server error or external API failure |

## 🔍 Profile Status Values

Both profile types have a `status` field:

- `PENDING` - Profile created, awaiting review
- `APPROVED` - Profile approved
- `REJECTED` - Profile rejected
- `CHECK_REQUIRED` - Additional verification needed

## 🛠️ Troubleshooting

### 504 Gateway Timeout (FIXED)

**Problem:** `504 Gateway Timeout - The server, working as a gateway did not get a response in time`

**Solution:** The external Shufti Pro API calls now have a 30-second timeout to prevent hanging.

**What happens now:**
- ✅ Profile is always created successfully
- ✅ External API call times out after 30 seconds if no response
- ✅ `apiResult` field shows timeout status
- ✅ You can retry verification later if needed

**For detailed information, see:** [TROUBLESHOOTING_504.md](./TROUBLESHOOTING_504.md)

### Validation Errors

**Problem:** `Cast to Embedded failed for value "" (type string)`

**Solution:** This happens when file upload fields are enabled but empty. Either:
- Disable the file field (right-click → Disable)
- Delete the file field
- Select a file to upload

The backend now automatically cleans empty strings, but it's best practice to not send them.

### Authentication Issues

- Ensure `accessToken` is set in environment variables
- Check that the token hasn't expired
- Verify cookies are enabled in Postman settings

### File Upload Issues

- Ensure file type is set to "File" not "Text"
- Check file size limits
- Verify file format is supported (PDF, JPG, PNG)
- Make sure the field is ENABLED when uploading

### 404 Errors

- Verify the `baseUrl` is correct
- Check that the server is running
- Ensure route paths match your backend configuration

### External API Errors

- Check `.env` file has `SHUFTIPRO_CLIENT_ID` and `SHUFTIPRO_CLIENT_SECRET`
- Verify Shufti Pro API credentials are valid
- Check `apiResult` field in response for error details
- If API times out, profile is still created - check server logs

## 💡 Best Practices

1. **Start with minimal requests** - Test basic functionality first
2. **Add complexity gradually** - Add fields one at a time
3. **Test without files first** - Verify data structure before adding files
4. **Use appropriate variants** - Choose the request that matches your use case
5. **Disable unused file fields** - Don't leave file fields enabled but empty
6. **Check responses** - Always verify the `apiResult` field for external API status
7. **Monitor timeouts** - Check server logs if external API calls are slow

## 🔄 What's Fixed

### Backend Improvements

**v1.2 - Timeout Handling:**
- ✅ Added 30-second timeout to all external API calls
- ✅ Improved error handling with specific timeout detection
- ✅ Profile creation always succeeds, even if external API fails/times out
- ✅ Added detailed logging for debugging API calls

**v1.1 - Empty String Handling:**
The controllers include a `cleanEmptyStrings()` helper function that:
- ✅ Removes empty strings from nested objects
- ✅ Filters out empty objects from arrays
- ✅ Prevents Mongoose validation errors
- ✅ Handles deeply nested structures (UBOs, shareholders, documents)

This means you can now send requests without worrying about empty string errors or timeouts!

## 📞 Support

For issues or questions:
1. Check the error message in the response
2. Verify all required fields are provided
3. Ensure file fields are properly configured (enabled with file, or disabled)
4. Check server logs for detailed error information
5. Verify external API credentials are configured correctly
6. For 504 errors, see [TROUBLESHOOTING_504.md](./TROUBLESHOOTING_504.md)

## 🔄 Version History

- **v1.2** - Fixed 504 Gateway Timeout errors
  - Added 30-second timeout to external API calls
  - Improved error handling with timeout detection
  - Profile creation always succeeds regardless of external API status
  - Added detailed logging for API calls
  - Created comprehensive troubleshooting guide

- **v1.1** - Fixed empty string validation errors
  - Added `cleanEmptyStrings()` helper to both controllers
  - Reorganized Postman requests into variants (Minimal, With ID, Complete, With Files)
  - Updated documentation with troubleshooting guide
  
- **v1.0** - Initial release
  - Create, Read operations
  - File upload support
  - External API integration (Shufti Pro)
  - Background checks and AML verification

