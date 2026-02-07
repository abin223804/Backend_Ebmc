# Profile API Documentation - Frontend Developer Guide

## Base URL
```
Production: https://starfish-app-bqn3p.ondigitalocean.app
Local: http://localhost:5000
```

## Authentication
All endpoints require JWT Bearer token authentication:
```
Authorization: Bearer <your-access-token>
```

---

# Individual Profile API

## Create Individual Profile

**Endpoint:** `POST /individual-profile/create`  
**Content-Type:** `multipart/form-data`

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `customerName` | string | Full name | "Abin Michael Doe" |
| `dob` | date | Date of birth (YYYY-MM-DD) | "1990-05-15" |
| `nationality` | string | Nationality | "United States" |
| `mobile` | string | Mobile number with country code | "+971-50-1234567" |
| `pepStatus` | string | PEP status | "NO" or "YES" |
| `residentStatus` | string | Resident status | "Resident" |
| `addressLine1` | string | Address line 1 | "Building 123, Sheikh Zayed Road" |
| `city` | string | City | "Dubai" |
| `searchBy` | string | Search method | "Name and DOB" |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `coreCustId` | string | Core customer ID from your system | - |
| `birthCountry` | string | Country of birth | - |
| `gender` | string | "Male", "Female", "Other" | - |
| `profession` | string | Profession/occupation | - |
| `email` | string | Email address | - |
| `state` | string | State/province | - |
| `addressLine2` | string | Address line 2 | - |
| `poBox` | string | PO Box | - |

### Search Configuration (Optional)

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `searchCategories[]` | array | AML filters (see below) | All 8 filters |
| `isExactMatch` | boolean | Exact name matching only | false |
| `matchScore` | number | Match threshold (0-100) | 85 |
| `includeRelatives` | boolean | Search relatives/associates | false |
| `includeAliases` | boolean | Search known aliases | false |

### Search Categories (Filters)

Send as **array notation** using `searchCategories[]`:

```
searchCategories[]: "sanction"
searchCategories[]: "warning"
searchCategories[]: "fitness-probity"
searchCategories[]: "pep"
searchCategories[]: "pep-class-1"
searchCategories[]: "pep-class-2"
searchCategories[]: "pep-class-3"
searchCategories[]: "pep-class-4"
```

**OR** as **comma-separated string**:
```
searchCategories: "sanction,warning,fitness-probity,pep,pep-class-1,pep-class-2,pep-class-3,pep-class-4"
```

**OR** omit entirely to use all 8 default filters.

### ID Details (Optional)

| Field | Type | Description |
|-------|------|-------------|
| `idDetails[0][idType]` | string | "Passport", "Emirates ID", etc. |
| `idDetails[0][idNumber]` | string | ID number |
| `idDetails[0][issueDate]` | date | Issue date (YYYY-MM-DD) |
| `idDetails[0][expiryDate]` | date | Expiry date (YYYY-MM-DD) |
| `idDetails[0][issuedCountry]` | string | Issuing country |

### Example Request (JavaScript/Fetch)

```javascript
const formData = new FormData();

// Required fields
formData.append('customerName', 'Abin Michael Doe');
formData.append('dob', '1990-05-15');
formData.append('nationality', 'United States');
formData.append('mobile', '+971-50-1234567');
formData.append('pepStatus', 'NO');
formData.append('residentStatus', 'Resident');
formData.append('addressLine1', 'Building 123, Sheikh Zayed Road');
formData.append('city', 'Dubai');
formData.append('searchBy', 'Name and DOB');

// Optional: Array-based filters
formData.append('searchCategories[]', 'sanction');
formData.append('searchCategories[]', 'warning');
formData.append('searchCategories[]', 'fitness-probity');
formData.append('searchCategories[]', 'pep');
formData.append('searchCategories[]', 'pep-class-1');
formData.append('searchCategories[]', 'pep-class-2');
formData.append('searchCategories[]', 'pep-class-3');
formData.append('searchCategories[]', 'pep-class-4');

// Optional: Exact matching
formData.append('isExactMatch', 'true');

const response = await fetch('https://starfish-app-bqn3p.ondigitalocean.app/individual-profile/create', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`
    },
    body: formData
});

const data = await response.json();
```

### Example Response

```json
{
    "success": true,
    "message": "Individual Profile created and checked successfully",
    "profile": {
        "id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "userId": "user123",
        "coreCustId": "CUST-2024-001",
        "mobile": "+971-50-1234567",
        "name": "Abin Michael Doe",
        "dob": "1990-05-15",
        "nationality": "United States",
        "screening": {
            "status": "verification.accepted",
            "categories": ["sanction", "warning", "fitness-probity", "pep", "pep-class-1", "pep-class-2", "pep-class-3", "pep-class-4"],
            "match": {
                "score": 85,
                "exact": true
            }
        },
        "verification": {
            "status": "SUCCESS",
            "provider": "ShuftiPro",
            "timestamp": "2024-02-06T10:30:00Z"
        }
    }
}
```

---

# Corporate Profile API

## Create Corporate Profile

**Endpoint:** `POST /corporate-profile/create`  
**Content-Type:** `multipart/form-data`

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `customerType` | string | Always "Corporate" | "Corporate" |
| `customerName` | string | Company name | "ShuftiPro Technologies LLC" |
| `entityLegalType` | string | Legal entity type | "Limited Liability Company" |
| `incorporationDate` | date | Date of incorporation (YYYY-MM-DD) | "2016-01-01" |
| `country` | string | Country of incorporation | "United Arab Emirates" |
| `mobile` | string | Company contact number | "+971-50-1234567" |

### Optional Company Fields

| Field | Type | Description |
|-------|------|-------------|
| `coreCustId` | string | Core customer ID |
| `address[emirates]` | string | Emirate/state |
| `address[buildingName]` | string | Building name |
| `address[areaStreet]` | string | Area/street |
| `address[poBox]` | string | PO Box |
| `tradeLicenseNumber` | string | Trade license number |
| `tradeLicenseExpiryDate` | date | License expiry date |

### Search Configuration (Optional)

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `searchCategories[]` | array | AML filters (same 8 as individual) | All 8 filters |
| `matchScore` | number | Match threshold (0-100) | 100 |
| `includeAliases` | boolean | Search business aliases | false |
| `includeRelatives` | boolean | Search related/connected companies | false |
| `countries[]` | array | ISO country codes to search | Uses `country` field |

### UBO (Ultimate Beneficial Owner) Fields

| Field | Type | Description |
|-------|------|-------------|
| `ubos[0][uboName]` | string | UBO full name |
| `ubos[0][uboType]` | string | "Individual" or "Corporate" |
| `ubos[0][shareholdingPercentage]` | number | Shareholding % |
| `ubos[0][passportName]` | string | Name on passport |
| `ubos[0][passportNumber]` | string | Passport number |
| `ubos[0][nationality]` | string | Nationality |
| `ubos[0][isPep]` | string | "YES" or "NO" |
| `ubos[0][dob]` | date | Date of birth |

### Shareholder Fields

| Field | Type | Description |
|-------|------|-------------|
| `shareholders[0][name]` | string | Shareholder name |
| `shareholders[0][passportNumber]` | string | Passport number |
| `shareholders[0][nationality]` | string | Nationality |
| `shareholders[0][shareholdingPercentage]` | number | Shareholding % |
| `shareholders[0][isPep]` | string | "YES" or "NO" |
| `shareholders[0][dob]` | date | Date of birth |

### Example Request (JavaScript/Fetch)

```javascript
const formData = new FormData();

// Required fields
formData.append('customerType', 'Corporate');
formData.append('customerName', 'ShuftiPro Technologies LLC');
formData.append('entityLegalType', 'Limited Liability Company');
formData.append('incorporationDate', '2016-01-01');
formData.append('country', 'United Arab Emirates');
formData.append('mobile', '+971-50-1234567');

// Address
formData.append('address[emirates]', 'Dubai');
formData.append('address[buildingName]', 'Business Bay Tower');
formData.append('address[areaStreet]', 'Sheikh Zayed Road');

// UBO
formData.append('ubos[0][uboName]', 'Ahmed Ali Hassan');
formData.append('ubos[0][uboType]', 'Individual');
formData.append('ubos[0][shareholdingPercentage]', '60');
formData.append('ubos[0][passportNumber]', 'P1234567');
formData.append('ubos[0][nationality]', 'United Arab Emirates');
formData.append('ubos[0][isPep]', 'NO');
formData.append('ubos[0][dob]', '1980-08-15');

// Array-based filters
formData.append('searchCategories[]', 'sanction');
formData.append('searchCategories[]', 'warning');
formData.append('searchCategories[]', 'fitness-probity');
formData.append('searchCategories[]', 'pep');
formData.append('searchCategories[]', 'pep-class-1');
formData.append('searchCategories[]', 'pep-class-2');
formData.append('searchCategories[]', 'pep-class-3');
formData.append('searchCategories[]', 'pep-class-4');

// Optional: Multi-country search
formData.append('countries[]', 'ae');
formData.append('countries[]', 'gb');

const response = await fetch('https://starfish-app-bqn3p.ondigitalocean.app/corporate-profile/create', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`
    },
    body: formData
});

const data = await response.json();
```

### Example Response

```json
{
    "success": true,
    "message": "Corporate Profile created and checked successfully",
    "profile": {
        "id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "userId": "user123",
        "coreCustId": "CORP-2024-001",
        "mobile": "+971-50-1234567",
        "name": "ShuftiPro Technologies LLC",
        "incorporationDate": "2016-01-01",
        "entityLegalType": "Limited Liability Company",
        "country": "United Arab Emirates",
        "ubos": [{
            "name": "Ahmed Ali Hassan",
            "type": "Individual",
            "shareholding": 60,
            "pep": false
        }],
        "screening": {
            "status": "verification.accepted",
            "categories": ["sanction", "warning", "fitness-probity", "pep", "pep-class-1", "pep-class-2", "pep-class-3", "pep-class-4"]
        },
        "verification": {
            "status": "SUCCESS",
            "provider": "ShuftiPro",
            "timestamp": "2024-02-06T10:30:00Z"
        }
    }
}
```

---

## Important Notes

### Array-Based Filters
✅ **Recommended:** Use `searchCategories[]` for clarity
```javascript
formData.append('searchCategories[]', 'sanction');
formData.append('searchCategories[]', 'warning');
// ... etc
```

✅ **Alternative:** Comma-separated string
```javascript
formData.append('searchCategories', 'sanction,warning,fitness-probity,pep,pep-class-1,pep-class-2,pep-class-3,pep-class-4');
```

✅ **Simplest:** Omit entirely (uses all 8 defaults)

### Exact Matching
- `isExactMatch: true` → Only exact name matches (no fuzzy/similar names)
- `isExactMatch: false` → Includes similar name variations

### Match Score
- Higher score = stricter matching
- `100` = Exact matches only
- `85` = Allow some variation
- `70` = More lenient matching

### Status Values
- `verification.accepted` - Passed all checks
- `verification.declined` - Failed checks
- `request.pending` - Still processing
- `request.invalid` - Invalid data/error

---

## Error Handling

```javascript
try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!data.success) {
        console.error('API Error:', data.message);
        // Handle error
    }
} catch (error) {
    console.error('Network Error:', error);
    // Handle network error
}
```

---

## Postman Collections

Import these collections for testing:
- **Individual Profile:** `postman_collections/Individual_Profile_API_Array_Format.postman_collection.json`
- **Corporate Profile:** `postman_collections/Corporate_Profile_API_Abin.postman_collection.json`
