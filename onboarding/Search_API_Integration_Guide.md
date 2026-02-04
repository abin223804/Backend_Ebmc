# Search API Integration Guide

This guide details how to integrate the consolidated search functionality into the frontend application.

## Overview

The search system has been consolidated into a unified controller. All search requests, whether for "Individual", "Corporate", or "Both", use the same underlying logic.

**Base URL**: `http://localhost:5000` (or your production URL)
**Authentication**: Required (Bearer Token)

---

## Endpoints

There are three endpoints available depending on your specific need:

| Search Type | Endpoint | Method | Use Case |
| :--- | :--- | :--- | :--- |
| **Global** | `/search/unified` | `POST` | Search across **both** Individual and Corporate profiles at once. |
| **Individual** | `/individual-profile/search` | `POST` | Search **only** within Individual profiles. |
| **Corporate** | `/corporate-profile/search` | `POST` | Search **only** within Corporate profiles. |

---

## 1. Global Unified Search (`/search/unified`)

Use this when you want to show a combined list of results.

### Request Body
```json
{
    "customerName": "Jane",   // (Optional) Search by name (partial match, case-insensitive)
    "category": "all"         // (Optional, default: "all") Options: "all", "individual", "corporate"
}
```

### Response
```json
{
    "success": true,
    "count": {
        "total": 5,
        "individuals": 3,
        "corporates": 2
    },
    "results": {
        "individuals": [
            {
                "_id": "...",
                "customerName": "Jane Smith",
                "customerType": "Individual",
                "nationality": "UK",
                "dob": "1990-01-01",
                "createdAt": "2024-02-04T10:00:00.000Z"
                // ... other fields
            }
            // ... more individuals
        ],
        "corporates": [
            {
                "_id": "...",
                "customerName": "Jane's Bakery LLC",
                "customerType": "Corporate",
                "country": "UAE",
                "tradeLicenseNumber": "TL-123",
                "createdAt": "2024-02-04T11:00:00.000Z"
                // ... other fields
            }
            // ... more corporates
        ]
    }
}
```

---

## 2. Individual Search (`/individual-profile/search`)

Use this on the "Individual Profiles" list page.

### Request Body
```json
{
    "customerName": "John" 
}
```
*Note: The `category` is automatically set to "individual" by the backend.*

### Response
```json
{
    "success": true,
    "count": {
        "total": 10,
        "individuals": 10
    },
    "results": {
        "individuals": [ ... array of profiles ... ]
    }
}
```

---

## 3. Corporate Search (`/corporate-profile/search`)

Use this on the "Corporate Profiles" list page.

### Request Body
```json
{
    "customerName": "Tech"
}
```
*Note: The `category` is automatically set to "corporate" by the backend.*

### Response
```json
{
    "success": true,
    "count": {
        "total": 5,
        "corporates": 5
    },
    "results": {
        "corporates": [ ... array of profiles ... ]
    }
}
```

---

## Key Notes for Integration

1.  **Strict Isolation**: The API automatically filters results by the logged-in `userId`. Users will **never** see profiles created by other users.
2.  **No Pagination**: The API returns **all** matching results. If the list is long, implementing client-side pagination or virtualization (e.g., React Window) is recommended.
3.  **Fuzzy Search**: The `customerName` search is "contains" based (Regex) and case-insensitive. "Al" matches "Ali", "Alan", "Global", etc.
