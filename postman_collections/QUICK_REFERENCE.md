# Quick Reference Guide

## 🎯 Individual Profile - Minimal Request

**Endpoint:** `POST {{baseUrl}}/individual-profile/create`

**Required Fields:**
```
customerName: "John Doe"
dob: "1990-05-15"
nationality: "United States"
birthCountry: "United States"
profession: "Software Engineer"
pepStatus: "NO"
residentStatus: "Resident"
mobile: "+971-50-1234567"
addressLine1: "Building 123, Sheikh Zayed Road"
city: "Dubai"
searchBy: "Name and DOB"
```

## 🏢 Corporate Profile - Minimal Request

**Endpoint:** `POST {{baseUrl}}/corporate-profile/create`

**Required Fields:**
```
customerType: "Corporate"
customerName: "ABC Trading LLC"
entityLegalType: "Limited Liability Company"
```

## 📋 Common Patterns

### Adding ID Details (Individual)
```
idDetails[0][idType]: "Passport"
idDetails[0][idNumber]: "N1234567"
idDetails[0][issueDate]: "2020-01-15"
idDetails[0][expiryDate]: "2030-01-15"
idDetails[0][issuedCountry]: "United States"
```

### Adding UBO (Corporate)
```
ubos[0][uboName]: "Ahmed Ali Hassan"
ubos[0][uboType]: "Individual"
ubos[0][shareholdingPercentage]: "60"
ubos[0][passportNumber]: "P1234567"
ubos[0][nationality]: "United Arab Emirates"
ubos[0][isPep]: "NO"
ubos[0][dob]: "1980-08-15"
```

### Adding Shareholder (Corporate)
```
shareholders[0][name]: "Sarah Mohammed"
shareholders[0][passportNumber]: "P7654321"
shareholders[0][nationality]: "United Arab Emirates"
shareholders[0][shareholdingPercentage]: "40"
shareholders[0][isPep]: "NO"
shareholders[0][dob]: "1985-12-10"
```

## 📁 File Upload Examples

### Individual Profile - ID Document
```
idDetails[0][file]: [SELECT FILE] (Type: File)
```

### Corporate Profile - Trade License
```
tradeLicenseFile: [SELECT FILE] (Type: File)
```

### Corporate Profile - UBO Passport
```
ubos[0][passportFile]: [SELECT FILE] (Type: File)
```

### Corporate Profile - Documents
```
documents[accountOpeningForm]: [SELECT FILE] (Type: File)
documents[amlPolicy]: [SELECT FILE] (Type: File)
documents[moa]: [SELECT FILE] (Type: File)
```

## ⚡ Quick Tips

1. **Start with "Minimal" requests** - Test basic functionality first
2. **Disable unused file fields** - Right-click → Disable
3. **Use YYYY-MM-DD for dates** - e.g., "2026-01-28"
4. **PEP Status values** - "YES" or "NO"
5. **Gender values** - "Male", "Female", or "Other"

## 🔍 Get Requests

### Get All Profiles
```
GET {{baseUrl}}/individual-profile
GET {{baseUrl}}/corporate-profile
```

### Get Profile by ID
```
GET {{baseUrl}}/individual-profile/:id
GET {{baseUrl}}/corporate-profile/:id
```

Replace `:id` with actual MongoDB ObjectId from create response.

## ✅ Success Response Example

```json
{
    "success": true,
    "message": "Profile created and checked successfully",
    "data": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "customerName": "John Doe",
        "status": "PENDING",
        "apiResult": {
            "reference": "REF-65a1b2c3d4e5f6g7h8i9j0k1",
            "event": "verification.accepted"
        },
        "createdAt": "2026-01-28T06:54:00.000Z"
    }
}
```

## ❌ Common Errors

### Empty String Error (FIXED)
```json
{
    "success": false,
    "message": "Cast to Embedded failed for value \"\" (type string)"
}
```
**Solution:** Backend now handles this automatically. But still disable unused file fields.

### Missing Required Field
```json
{
    "success": false,
    "message": "IndividualProfile validation failed: customerName: Path `customerName` is required."
}
```
**Solution:** Add the missing required field.

### Invalid Date Format
```json
{
    "success": false,
    "message": "Cast to Date failed for value \"invalid-date\""
}
```
**Solution:** Use YYYY-MM-DD format (e.g., "2026-01-28").

## 🔐 Authentication Setup

1. Login to get access token
2. Set environment variable:
   - Key: `accessToken`
   - Value: `your-jwt-token-here`
3. Collection automatically uses Bearer token auth

## 📊 Environment Variables

```
baseUrl: http://localhost:5000
accessToken: your-jwt-access-token-here
```

## 🎨 Request Variants

### Individual Profile
- ✅ Minimal (required fields only)
- ✅ With ID Details (adds ID information)
- ✅ Complete (all fields, no files)

### Corporate Profile
- ✅ Minimal (required fields only)
- ✅ With UBO (adds one UBO)
- ✅ Complete (UBOs + shareholders)
- ✅ With Files (file upload examples)
