# FarmerReachNG – Database Schemas (MongoDB)

## User
| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| email | String | unique, required |
| password | String | hashed, optional if Google-only |
| phone | String | |
| role | String | `farmer` \| `extension_officer` \| `storage_operator` \| `admin` \| `super_admin` |
| lga | String | Plateau LGA |
| crops | [String] | farmer crops |
| irrigationStatus | String | `none` \| `partial` \| `full` |
| organization | String | officer / operator org |
| googleId | String | sparse unique for Google Auth |
| avatar | String | |
| isActive | Boolean | default true |
| lastLogin | Date | |
| timestamps | createdAt, updatedAt | |

## Campaign
| Field | Type | Notes |
|-------|------|-------|
| title | String | required |
| message | String | required |
| channel | String | `sms` \| `whatsapp` \| `both` |
| targetLgas | [String] | |
| targetCrops | [String] | |
| targetIrrigation | String | `all` \| `none` \| `partial` \| `full` |
| status | String | `draft` \| `scheduled` \| `sending` \| `completed` \| `failed` |
| scheduledAt / sentAt | Date | |
| totalRecipients / delivered / failed | Number | |
| createdBy | ObjectId → User | |
| deliveryLog | [{ phone, status, sid, error, timestamp }] | |

## StorageFacility
| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| description | String | |
| type | String | `ambient` \| `cold` \| `silo` \| `warehouse` |
| lga | String | required |
| address | String | |
| coordinates | { lat, lng } | |
| totalCapacityKg | Number | required |
| availableCapacityKg | Number | required |
| pricePerKgPerDay | Number | required (NGN) |
| minBookingDays | Number | default 1 |
| features | [String] | |
| isActive | Boolean | |
| operator | ObjectId → User | required |
| images | [String] | |

## Booking
| Field | Type | Notes |
|-------|------|-------|
| facility | ObjectId → StorageFacility | |
| farmer | ObjectId → User | |
| quantityKg | Number | min 1 |
| startDate / endDate | Date | |
| totalDays | Number | |
| totalCost | Number | NGN |
| cropType | String | |
| status | String | `pending` \| `confirmed` \| `active` \| `completed` \| `cancelled` |
| paymentStatus | String | `unpaid` \| `partial` \| `paid` |
| notes | String | |

## Produce
| Field | Type | Notes |
|-------|------|-------|
| farmer | ObjectId → User | |
| crop | String | required |
| quantityKg | Number | required |
| unitPrice | Number | NGN/kg |
| quality | String | `standard` \| `premium` \| `organic` |
| harvestDate / availableFrom | Date | |
| lga | String | |
| description | String | |
| status | String | `available` \| `reserved` \| `sold` \| `expired` |
| contactPhone | String | |

---

## Indexes (recommended)
- User: `email` (unique), `googleId` (sparse), `role + lga`
- Campaign: `createdBy`, `status`
- StorageFacility: `lga + type + isActive`
- Booking: `farmer`, `facility`, `status`
- Produce: `crop + lga + status`
