# Sample API Request - Create Individual Profile

## Endpoint
```
POST /individual-profile/create
```

## Route Configuration
```javascript
router.post("/create", verifyUser, upload.any(), createIndividualProfile, processExternalVerification);
```

**Middleware Chain:**
1. `verifyUser` - JWT authentication
2. `upload.any()` - Handles file uploads (multipart/form-data)
3. `createIndividualProfile` - Creates profile in database
4. `processExternalVerification` - Calls Shufti Pro API and updates status

---

## Complete cURL Example

```bash
curl --request POST \
  --url 'https://starfish-app-bqn3p.ondigitalocean.app/individual-profile/create' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN_HERE' \
  --form 'customerName=John Michael Doe' \
  --form 'dob=1990-05-15' \
  --form 'nationality=United States' \
  --form 'birthCountry=United States' \
  --form 'gender=Male' \
  --form 'profession=Software Engineer' \
  --form 'landline=+971-4-1234567' \
  --form 'email=john.doe@example.com' \
  --form 'pepStatus=NO' \
  --form 'eaaCount=5' \
  --form 'residentStatus=Resident' \
  --form 'eaaVolume=50000' \
  --form 'mobile=+971-50-1234567' \
  --form 'addressLine1=Building 123, Sheikh Zayed Road' \
  --form 'addressLine2=Apartment 456' \
  --form 'city=Dubai' \
  --form 'state=Dubai' \
  --form 'poBox=12345' \
  --form 'sponsorName=ABC Company LLC' \
  --form 'visaNumber=784-1234-5678901-1' \
  --form 'visaExpiryDate=2026-12-31' \
  --form 'erpUin=ERP123456' \
  --form 'remarks=VIP Customer - High Priority' \
  --form 'searchBy=Name and DOB' \
  --form 'searchCategories=sanction,warning,fitness-probity,pep,pep-class-1,pep-class-2,pep-class-3,pep-class-4' \
  --form 'matchScore=85' \
  --form 'isExactMatch=false' \
  --form 'includeRelatives=true' \
  --form 'includeAliases=true' \
  --form 'idDetails[0][idType]=Passport' \
  --form 'idDetails[0][idNumber]=N1234567' \
  --form 'idDetails[0][issueDate]=2020-01-15' \
  --form 'idDetails[0][expiryDate]=2030-01-15' \
  --form 'idDetails[0][issuedCountry]=United States'
```

---

## Minimal cURL Example (Required Fields Only)

```bash
curl --request POST \
  --url 'https://starfish-app-bqn3p.ondigitalocean.app/individual-profile/create' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN_HERE' \
  --form 'customerName=Jane Smith' \
  --form 'dob=1985-03-20' \
  --form 'nationality=United Kingdom' \
  --form 'mobile=+44-20-1234567'
```

**Note:** When `searchCategories` is omitted, the backend automatically uses all 8 default filters.

---

## Postman Setup

### 1. Headers
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 2. Body (form-data)

#### Required Fields
| Key | Value | Type |
|-----|-------|------|
| `customerName` | John Michael Doe | text |
| `dob` | 1990-05-15 | text |
| `nationality` | United States | text |
| `mobile` | +971-50-1234567 | text |

#### Optional Fields
| Key | Value | Type |
|-----|-------|------|
| `birthCountry` | United States | text |
| `gender` | Male | text |
| `profession` | Software Engineer | text |
| `email` | john.doe@example.com | text |
| `pepStatus` | NO | text |
| `residentStatus` | Resident | text |
| `addressLine1` | Building 123, Sheikh Zayed Road | text |
| `city` | Dubai | text |
| `state` | Dubai | text |

#### Search Configuration (Optional)
| Key | Value | Type |
|-----|-------|------|
| `searchBy` | Name and DOB | text |
| `searchCategories` | sanction,warning,fitness-probity,pep,pep-class-1,pep-class-2,pep-class-3,pep-class-4 | text |
| `matchScore` | 85 | text |
| `isExactMatch` | false | text |
| `includeRelatives` | true | text |
| `includeAliases` | true | text |

#### ID Documents (Optional)
| Key | Value | Type |
|-----|-------|------|
| `idDetails[0][idType]` | Passport | text |
| `idDetails[0][idNumber]` | N1234567 | text |
| `idDetails[0][issueDate]` | 2020-01-15 | text |
| `idDetails[0][expiryDate]` | 2030-01-15 | text |
| `idDetails[0][issuedCountry]` | United States | text |
| `idDetails[0][file]` | (select file) | file |

---

## searchCategories Options

### Option 1: Comma-Separated String (Recommended)
```
searchCategories: sanction,warning,fitness-probity,pep,pep-class-1,pep-class-2,pep-class-3,pep-class-4
```

### Option 2: Omit Field (Use Defaults)
Don't include `searchCategories` field - backend uses all 8 filters automatically

### Option 3: Custom Filters
```
searchCategories: sanction,pep,pep-class-1
```

---

## Expected Response

### Success (201 Created)
```json
{
  "success": true,
  "message": "Individual Profile created and checked successfully",
  "profile": {
    "id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "697875709...",
    "coreCustId": null,
    "name": "John Michael Doe",
    "dob": "1990-05-15T00:00:00.000Z",
    "gender": "Male",
    "nationality": "United States",
    "screening": {
      "status": "verification.accepted",
      "apiStatus": "verification.accepted",
      "searchBy": "Name and DOB",
      "categories": [
        "sanction",
        "warning",
        "fitness-probity",
        "pep",
        "pep-class-1",
        "pep-class-2",
        "pep-class-3",
        "pep-class-4"
      ]
    },
    "verification": {
      "status": "SUCCESS",
      "provider": "ShuftiPro",
      "error": null
    }
  }
}
```

### Error (400/500)
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information"
}
```

---

## Important Notes

✅ **Authentication Required:** Must include valid JWT token in Authorization header  
✅ **Content-Type:** Automatically set to `multipart/form-data` when using form-data  
✅ **searchCategories:** Can be string (comma-separated) or omitted (uses defaults)  
✅ **File Upload:** Optional - use `idDetails[0][file]` for document upload  
✅ **Shufti Pro:** Automatically called after profile creation  
✅ **Default Filters:** All 8 filters applied if `searchCategories` not provided
