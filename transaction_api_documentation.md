# Transaction & Customer Management API Documentation

**Base URL**: `http://localhost:5000` (or your deployed URL)
**Authentication**: Requires `Authorization: Bearer <token>` header for all endpoints.

## 1. Transactions

### Create Transaction
Create a new transaction entry in the system.

- **Endpoint**: `POST /transaction`
- **Body Parameters**:
  - `customerId` (String, Required): Core Customer ID (e.g., "1000659") or MongoDB ID.
  - `customerType` (String, Required): "IndividualProfile" or "CorporateProfile".
  - `transactionDate` (Date, Required): e.g., "2023-10-27".
  - `transactionTime` (String): e.g., "14:30".
  - `branch` (String, Required): Branch name.
  - `invoiceNumber` (String, Required): Invoice identifier.
  - `invoiceAmount` (Number): Amount on invoice.
  - `source` (String): "Online", "Offline", or "Select".
  - `transactionType` (String, Required): "Deposit" or "Withdrawal".
  - `product` (String, Required): Product name.
  - `payments` (Array): List of payment methods.
    - `{ "mode": "Cash", "amount": 500 }`
  - `totalAmount` (Number, Required): Total transaction amount.

- **Example Request**:
```json
{
    "customerId": "1000659",
    "customerType": "IndividualProfile",
    "transactionDate": "2023-10-27T00:00:00.000Z",
    "branch": "Main Branch",
    "invoiceNumber": "INV-101",
    "transactionType": "Deposit",
    "product": "Savings",
    "payments": [
        { "mode": "Card", "amount": 1000 }
    ],
    "totalAmount": 1000
}
```

---

## 2. Customer Management (Transaction Route)

These endpoints allow you to search, view, edit, and delete customers directly from the transaction module.

### List Customers (Table View)
Retrieve a paginated list of customers with fields optimized for the selection table.

- **Endpoint**: `GET /transaction/customers`
- **Query Parameters**:
  - `page` (Number): Page number (default 1).
  - `limit` (Number): Items per page (default 10).
  - `search` (String): Search by customer name.
  - `searchType` (String): "Core customer number", "Name", etc.
  - `searchValue` (String): Value to search for.

- **Response Fields**:
  - `coreCustId`: Displayed as "Core Cust ID".
  - `name`: Displayed as "Name".
  - `mobile`: Displayed as "Mobile".
  - `country`: Displayed as "Country".
  - `idNumber`: Displayed as "ID Number".
  - `idExpDate`: Displayed as "ID Exp Date".

### Get Customer Details
View full details of a specific customer.

- **Endpoint**: `GET /transaction/customers/:id`
- **Path Parameter**: `id` (MongoDB ID of the profile).

### Update Customer
Edit an existing customer's profile.

- **Endpoint**: `PUT /transaction/customers/:id`
- **Path Parameter**: `id` (MongoDB ID).
- **Body**: JSON object with fields to update (e.g., `mobile`, `address`).

### Delete Customer
Soft delete a customer profile.

- **Endpoint**: `DELETE /transaction/customers/:id`
- **Path Parameter**: `id` (MongoDB ID).

### Download Customer Profile
Download the full customer profile as a JSON file.

- **Endpoint**: `GET /transaction/customers/download/:id`
- **Path Parameter**: `id` (MongoDB ID).
- **Response**: Triggers a file download (`Content-Disposition: attachment`).
