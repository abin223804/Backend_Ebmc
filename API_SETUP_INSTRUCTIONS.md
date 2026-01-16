# Shufti Pro API Configuration

I have updated the integration to work specifically with Shufti Pro (Offsite / Direct Interface).

## Action Required
Please update your `.env` file with the following variables:

```env
# Shufti Pro Credentials
SHUFTIPRO_CLIENT_ID=your_client_id_here
SHUFTIPRO_CLIENT_SECRET=your_secret_key_here

# API URL (Optional, defaults to production if omitted)
SHUFTIPRO_API_URL=https://api.shuftipro.com/
```

## How it works
- The system will automatically take the **Customer Name** and **Date of Birth** from the new profile.
- It sends this data to Shufti Pro's `background_checks` service.
- The result is saved in the `apiResult` field of the profile in MongoDB.
