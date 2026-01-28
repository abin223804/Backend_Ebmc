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

## 📝 Individual Profile API

### Endpoints

#### 1. Create Individual Profile
- **Method:** POST
- **URL:** `{{baseUrl}}/individual-profile/create`
- **Auth:** Required (Bearer Token)
- **Body:** multipart/form-data

**Key Fields:**
- `customerName` - Full name (required)
- `dob` - Date of birth in YYYY-MM-DD format (required)
- `nationality` - Customer nationality (required)
- `email` - Email address
- `mobile` - Mobile number (required)
- `idDetails[0][idType]` - ID type (e.g., Passport)
- `idDetails[0][idNumber]` - ID number
- `idDetails[0][file]` - Upload ID document file

**File Uploads:**
- ID documents can be uploaded using the `idDetails[0][file]` field
- Supported formats: PDF, images (JPG, PNG)

#### 2. Get All Individual Profiles
- **Method:** GET
- **URL:** `{{baseUrl}}/individual-profile`
- **Auth:** Required

Returns all individual profiles sorted by creation date (newest first).

#### 3. Get Individual Profile by ID
- **Method:** GET
- **URL:** `{{baseUrl}}/individual-profile/:id`
- **Auth:** Required
- **Path Variable:** `id` - MongoDB ObjectId

Returns detailed information for a specific profile.

### Background Check Integration

The Individual Profile API automatically performs background checks via Shufti Pro API with the following filters:
- Sanction lists
- Warning lists
- Fitness & probity checks
- PEP (Politically Exposed Person) checks (Class 1-4)

Results are stored in the `apiResult` field of the profile.

## 🏢 Corporate Profile API

### Endpoints

#### 1. Create Corporate Profile
- **Method:** POST
- **URL:** `{{baseUrl}}/corporate-profile/create`
- **Auth:** Required (Bearer Token)
- **Body:** multipart/form-data

**Key Fields:**

**Company Information:**
- `customerType` - Type of customer (required)
- `customerName` - Company name (required)
- `entityLegalType` - Legal entity type (required)
- `country` - Country of incorporation
- `incorporationDate` - Date in YYYY-MM-DD format

**Address:**
- `address[emirates]` - Emirates/State
- `address[buildingName]` - Building name
- `address[areaStreet]` - Street/Area
- `address[poBox]` - PO Box

**Trade License:**
- `tradeLicenseNumber` - License number
- `tradeLicenseExpiryDate` - Expiry date
- `tradeLicenseFile` - Upload license file

**UBOs (Ultimate Beneficial Owners):**
- `ubos[0][uboName]` - UBO name
- `ubos[0][shareholdingPercentage]` - Ownership percentage
- `ubos[0][passportNumber]` - Passport number
- `ubos[0][nationality]` - Nationality
- `ubos[0][isPep]` - PEP status (YES/NO)
- `ubos[0][passportFile]` - Upload passport file
- `ubos[0][emiratesIdFile]` - Upload Emirates ID file

**Shareholders:**
- `shareholders[0][name]` - Shareholder name
- `shareholders[0][shareholdingPercentage]` - Ownership percentage
- `shareholders[0][passportNumber]` - Passport number
- `shareholders[0][isPep]` - PEP status

**Documents (All optional file uploads):**
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

#### 2. Get All Corporate Profiles
- **Method:** GET
- **URL:** `{{baseUrl}}/corporate-profile`
- **Auth:** Required

Returns all corporate profiles sorted by creation date (newest first).

#### 3. Get Corporate Profile by ID
- **Method:** GET
- **URL:** `{{baseUrl}}/corporate-profile/:id`
- **Auth:** Required
- **Path Variable:** `id` - MongoDB ObjectId

Returns detailed information for a specific corporate profile.

### Business AML Check Integration

The Corporate Profile API automatically performs business AML checks via Shufti Pro API with the following filters:
- Sanction lists
- Fitness & probity checks
- Warning lists
- PEP checks

Results are stored in the `apiResult` field of the profile.

## 📤 File Upload Guidelines

### Supported File Types
- PDF documents
- Images (JPG, JPEG, PNG)

### How to Upload Files in Postman

1. In the request body, find the file field (e.g., `idDetails[0][file]`)
2. Change the type from "Text" to "File"
3. Click "Select Files" and choose your file
4. Send the request

### Multiple File Uploads

For arrays (like multiple UBOs or shareholders):
- Use index notation: `ubos[0][passportFile]`, `ubos[1][passportFile]`, etc.
- Each array item can have its own file uploads

## 🧪 Testing Workflow

### Individual Profile Testing

1. **Prepare test data:**
   - Customer personal information
   - ID document (passport/Emirates ID)
   
2. **Create profile:**
   - Use "Create Individual Profile" request
   - Fill in all required fields
   - Upload ID document
   - Send request
   
3. **Verify creation:**
   - Check response for `success: true`
   - Note the `_id` in the response
   - Check `apiResult` for background check results
   
4. **Retrieve profile:**
   - Use "Get Individual Profile by ID"
   - Replace `:id` with the actual profile ID
   - Verify all data is stored correctly

### Corporate Profile Testing

1. **Prepare test data:**
   - Company information
   - Trade license document
   - UBO information and documents
   - Shareholder information
   - Required compliance documents
   
2. **Create profile:**
   - Use "Create Corporate Profile" request
   - Fill in company details
   - Add at least one UBO
   - Add shareholders if applicable
   - Upload required documents
   - Send request
   
3. **Verify creation:**
   - Check response for `success: true`
   - Note the `_id` in the response
   - Check `apiResult` for AML check results
   
4. **Retrieve profile:**
   - Use "Get Corporate Profile by ID"
   - Verify all nested data (UBOs, shareholders, documents)

## 🔍 Response Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful (GET requests) |
| 201 | Created | Profile created successfully |
| 400 | Bad Request | Invalid data or missing required fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 404 | Not Found | Profile not found |
| 500 | Internal Server Error | Server error or external API failure |

## 📊 Profile Status Values

Both profile types have a `status` field with these possible values:

- `PENDING` - Profile created, awaiting review
- `APPROVED` - Profile approved
- `REJECTED` - Profile rejected
- `CHECK_REQUIRED` - Additional verification needed

## 🛠️ Troubleshooting

### Authentication Issues
- Ensure `accessToken` is set in environment variables
- Check that the token hasn't expired
- Verify cookies are enabled in Postman settings

### File Upload Issues
- Ensure file type is set to "File" not "Text"
- Check file size limits
- Verify file format is supported

### 404 Errors
- Verify the `baseUrl` is correct
- Check that the server is running
- Ensure route paths match your backend configuration

### External API Errors
- Check `.env` file has `SHUFTIPRO_CLIENT_ID` and `SHUFTIPRO_CLIENT_SECRET`
- Verify Shufti Pro API credentials are valid
- Check `apiResult` field in response for error details

## 📞 Support

For issues or questions:
1. Check the error message in the response
2. Verify all required fields are provided
3. Check server logs for detailed error information
4. Ensure external API credentials are configured correctly

## 🔄 Version History

- **v1.0** - Initial release with Individual and Corporate Profile APIs
  - Create, Read operations
  - File upload support
  - External API integration (Shufti Pro)
  - Background checks and AML verification
