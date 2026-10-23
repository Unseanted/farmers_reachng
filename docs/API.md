# FarmerReachNG API Documentation

Base URL (development): `http://localhost:5000`  
All authenticated routes require header: `Authorization: Bearer <token>`

---

## Health

### `GET /health`
Returns service status.

**Response**
```json
{
  "status": "ok",
  "service": "FarmerReachNG API",
  "timestamp": "2026-10-22T18:00:00.000Z"
}
```

---

## Auth

### `POST /api/auth/register`
Register with email/password.

**Body**
```json
{
  "name": "Musa Farmer",
  "email": "musa@example.com",
  "password": "securepass",
  "phone": "08012345678",
  "role": "farmer",
  "lga": "Barkin Ladi",
  "crops": ["Tomato", "Maize"],
  "irrigationStatus": "partial",
  "organization": ""
}
```
`role` allowed on public register: `farmer` | `extension_officer` | `storage_operator`

**Response** `201`
```json
{
  "success": true,
  "token": "eyJhbG...",
  "user": { "id": "...", "name": "...", "email": "...", "role": "farmer", ... }
}
```

### `POST /api/auth/login`
**Body**
```json
{ "email": "musa@example.com", "password": "securepass" }
```

**Response** `200` — same shape as register.

### `POST /api/auth/google`
Sign in or sign up with a Google ID token (from Google Identity Services).

**Body**
```json
{
  "idToken": "<Google JWT credential>",
  "role": "farmer",
  "phone": "08012345678",
  "lga": "Jos North",
  "crops": ["Irish Potato"],
  "irrigationStatus": "full",
  "organization": ""
}
```

- If the email already exists, the account is linked and logged in.
- If new, a user is created with the optional profile fields.
- Requires `GOOGLE_CLIENT_ID` on the server (and matching `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on the client).

**Response** `200` or `201` — same shape as login/register.

### `GET /api/auth/me`
Requires auth. Returns the current user.

### `POST /api/auth/logout`
Clears the HTTP-only cookie.

---

## Users

### `GET /api/users`
Admin / Super Admin / Extension Officer.  
Query: `?role=farmer&lga=Jos South&search=musa`

### `PATCH /api/users/me`
Update own profile.

### `PATCH /api/users/:id`
Admin / Super Admin — update any user (role, isActive, etc.).

---

## Campaigns (Extension Officers, Admin, Super Admin)

### `GET /api/campaigns`
List campaigns (own for officers, all for admins).

### `POST /api/campaigns`
Create campaign.

**Body**
```json
{
  "title": "Dry season tomato care",
  "message": "Apply mulch and irrigate early morning. Contact ADP for seeds.",
  "channel": "sms",
  "targetLgas": ["Barkin Ladi", "Bokkos"],
  "targetCrops": ["Tomato"],
  "targetIrrigation": "partial"
}
```
`channel`: `sms` | `whatsapp` | `both`  
`targetIrrigation`: `all` | `none` | `partial` | `full`

### `GET /api/campaigns/:id`

### `POST /api/campaigns/:id/send`
Triggers Twilio delivery to matching farmers. Updates delivery stats.

---

## Storage

### `GET /api/storage/facilities`
Public list. Query: `?lga=Jos East&type=cold`

### `GET /api/storage/facilities/:id`

### `POST /api/storage/facilities`
Storage Operator / Admin. Create facility.

**Body**
```json
{
  "name": "Jos Cold Hub",
  "type": "cold",
  "lga": "Jos East",
  "address": "Old Airport Rd",
  "totalCapacityKg": 50000,
  "availableCapacityKg": 50000,
  "pricePerKgPerDay": 15,
  "features": ["24/7 security", "loading bay"]
}
```
`type`: `ambient` | `cold` | `silo` | `warehouse`

### `POST /api/storage/bookings`
Farmer books storage.

**Body**
```json
{
  "facility": "<facilityId>",
  "quantityKg": 500,
  "startDate": "2026-11-01",
  "endDate": "2026-11-15",
  "cropType": "Tomato",
  "notes": ""
}
```

### `GET /api/storage/bookings/me`
Farmer’s own bookings.

### `GET /api/storage/bookings/operator`
Operator’s facility bookings.

---

## Produce (Market Access)

### `GET /api/produce`
Public marketplace. Query: `?crop=Tomato&lga=Barkin Ladi&status=available`

### `POST /api/produce`
Farmer lists produce.

**Body**
```json
{
  "crop": "Tomato",
  "quantityKg": 800,
  "unitPrice": 450,
  "quality": "premium",
  "harvestDate": "2026-10-20",
  "lga": "Barkin Ladi",
  "description": "Fresh Roma tomatoes",
  "contactPhone": "08012345678"
}
```

### `GET /api/produce/me`
Farmer’s own listings.

### `PATCH /api/produce/:id`
Update status / quantity / price.

---

## Analytics

### `GET /api/analytics/dashboard`
Admin / Super Admin / Extension Officer.

**Response example**
```json
{
  "success": true,
  "data": {
    "totalFarmers": 120,
    "totalOfficers": 8,
    "totalCampaigns": 24,
    "messagesSent": 4520,
    "totalFacilities": 6,
    "activeBookings": 18,
    "produceListings": 45,
    "farmersByLga": [ ... ],
    "recentCampaigns": [ ... ]
  }
}
```

---

## Roles & Permissions Summary

| Resource | Farmer | Extension Officer | Storage Operator | Admin | Super Admin |
|----------|--------|-------------------|------------------|-------|-------------|
| Own profile | ✓ | ✓ | ✓ | ✓ | ✓ |
| Campaigns CRUD + send | | ✓ | | ✓ | ✓ |
| Storage facilities | view | view | manage own | manage | manage |
| Bookings | create / own | | view operator | view | view |
| Produce | create / own | view | view | view | view |
| Users list / update | | limited | | ✓ | ✓ |
| Analytics | | ✓ | | ✓ | ✓ |

---

## Error format
```json
{
  "success": false,
  "message": "Human readable message",
  "errors": [{ "msg": "...", "path": "email" }]
}
```

Common status codes: `400` validation, `401` auth, `403` forbidden, `404` not found, `500` server error.
