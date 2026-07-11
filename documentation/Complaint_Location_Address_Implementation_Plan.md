# Address Capture & Geolocation Workflow Plan

## Objective

Add a complaint submission flow for the West Bengal electricity complaint system that lets a citizen:

- choose whether the address is rural or urban
- use current GPS location or enter the address manually
- confirm the detected address before submission
- store structured address data with the complaint

The form should support these address parts:

- place
- district
- pincode
- grampanchayat
- block
- municipality
- ward
- latitude
- longitude
- accuracy
- timestamp

---

## User Flow

1. Citizen opens the complaint form.
2. Citizen selects **Address Type**.
3. Citizen chooses **Use Current Location** or **Enter Address Manually**.
4. If current location is chosen, the browser requests GPS permission.
5. If permission is allowed, the app stores latitude, longitude, accuracy, and timestamp.
6. The app reverse geocodes the coordinates and pre-fills available address fields.
7. Citizen verifies or edits the address fields.
8. The app shows a confirmation summary before submission.
9. Citizen submits the complaint.
10. Backend stores the complaint with both GPS data and structured address fields.

---

## Frontend Requirements

### Complaint Form Fields

Keep the existing complaint inputs and add a dedicated address workflow section:

- `addressType` with values `RURAL` or `URBAN`
- `locationMethod` with values `GPS` or `MANUAL`
- `latitude`
- `longitude`
- `accuracy`
- `timestamp`
- `state`
- `district`
- `subDivision`
- `block`
- `gramPanchayat`
- `municipality`
- `wardNumber`
- `village`
- `locality`
- `road`
- `houseNumber`
- `pinCode`
- `locationLabel`

### Capture Location Button

Add a button near the location section:

- label: **Use Current Location**
- action: call `navigator.geolocation.getCurrentPosition`
- on success:
  - store latitude, longitude, accuracy, and timestamp
  - mark the location method as `GPS`
  - call reverse geocoding to pre-fill available fields
- on failure:
  - show a clear error message
  - allow manual entry of all fields

### Manual Entry Support

The user must still be able to enter the address manually or override GPS suggestions.

This is important because:

- GPS can be inaccurate indoors or in dense areas
- reverse geocoding can be incomplete
- rural and urban administrative boundaries may require human confirmation

### Suggested UI Layout

Group the address flow into these sections:

#### Address Type

- Rural
- Urban

#### Location Method

- Use Current Location
- Enter Address Manually

#### GPS Capture

- Capture location button
- captured coordinates display
- accuracy display
- timestamp display

#### Address Details

- State
- District
- Sub-Division
- Block
- Gram Panchayat
- Municipality
- Ward Number
- Village
- Locality
- Road
- House Number
- PIN Code

---

## Rural Flow

When `addressType = RURAL`, show or prioritize:

- district
- sub-division
- CD block
- gram panchayat
- village
- road or landmark
- house number
- pincode

Recommended behavior:

- district may be auto-filled from GPS
- sub-division and block should be selected or confirmed manually
- gram panchayat and village should be editable

---

## Urban Flow

When `addressType = URBAN`, show or prioritize:

- district
- municipality
- ward number
- locality
- road
- house number
- pincode

Recommended behavior:

- district and municipality may be auto-filled from GPS
- ward number should be selected manually if geocoding does not return it
- locality and road should be editable

---

## Confirmation Step

Before final submit, show a confirmation panel with:

- address type
- selected location method
- state
- district
- municipality or gram panchayat
- ward number if present
- road or locality
- pincode
- latitude
- longitude
- accuracy

Buttons:

- **Confirm Location**
- **Edit Address**

This step is important so users can correct GPS-derived data before submission.

---

## Validation Rules

- `addressType` is required
- `locationMethod` is required
- `district` is required
- `pinCode` is required and must be numeric
- `latitude` and `longitude` are required when `locationMethod = GPS`
- `houseNumber` or `road` should be required depending on the flow used
- `wardNumber` is required for urban flow when available
- `gramPanchayat` or `village` should be required for rural flow when available

Recommended validation behavior:

- show field-level error messages
- disable submit until required fields are present
- keep the form usable even when geolocation is denied

---

## Backend Data Model

### Recommended Complaint Address Shape

Store the address as a structured object instead of one plain string.

```json
{
  "addressType": "URBAN",
  "locationMethod": "GPS",
  "location": {
    "latitude": 22.063541,
    "longitude": 88.109845,
    "accuracy": 8,
    "timestamp": "2026-07-11T11:05:20Z"
  },
  "address": {
    "state": "West Bengal",
    "district": "Purba Medinipur",
    "subDivision": null,
    "block": null,
    "gramPanchayat": null,
    "municipality": "Haldia Municipality",
    "wardNumber": "14",
    "village": null,
    "locality": "Durgachak",
    "road": "Durgachak Main Road",
    "houseNumber": "21A",
    "pinCode": "721602",
    "fullAddress": "21A, Durgachak Main Road, Durgachak, Ward 14, Haldia Municipality, Purba Medinipur, 721602"
  }
}
```

### Compatibility Note

The current system already uses `location` and `address` fields in several places.

To avoid breaking existing code:

- keep `location` for GPS coordinates and capture metadata
- keep `address` for the formatted full address string
- add new fields for the structured address breakdown

If the codebase prefers flat fields, the same values can be stored directly on the complaint document.

---

## Mongoose Schema Update

Recommended additions to the complaint model:

- `addressType: String`
- `locationMethod: String`
- `latitude: Number`
- `longitude: Number`
- `accuracy: Number`
- `capturedAt: Date`
- `state: String`
- `district: String`
- `subDivision: String`
- `block: String`
- `gramPanchayat: String`
- `municipality: String`
- `wardNumber: String`
- `village: String`
- `locality: String`
- `road: String`
- `houseNumber: String`
- `pinCode: String`
- `fullAddress: String`

This keeps the location data queryable and easier to display in the admin dashboard.

---

## API Changes

### Create Complaint

`POST /api/complaints`

Request body should accept:

```json
{
  "name": "Ananya Roy",
  "phone": "9876543210",
  "consumerId": "C12345",
  "issueType": "Power Outage",
  "description": "No power since morning",
  "emergency": true,
  "addressType": "URBAN",
  "locationMethod": "GPS",
  "location": {
    "latitude": 22.063541,
    "longitude": 88.109845,
    "accuracy": 8,
    "timestamp": "2026-07-11T11:05:20Z"
  },
  "address": {
    "state": "West Bengal",
    "district": "Purba Medinipur",
    "municipality": "Haldia Municipality",
    "wardNumber": "14",
    "locality": "Durgachak",
    "road": "Durgachak Main Road",
    "houseNumber": "21A",
    "pinCode": "721602"
  }
}
```

### Response

Return the stored complaint with:

- generated complaint ID
- formatted address
- captured coordinates
- accuracy
- timestamps

---

## Frontend State Management

Add separate form state for:

- address type
- location method
- geolocation status
- coordinate values
- accuracy and timestamp
- rural address fields
- urban address fields
- reverse geocoding loading state
- confirmation modal visibility

Suggested state flags:

- `isCapturingLocation`
- `locationPermissionDenied`
- `locationCaptured`
- `isReverseGeocoding`
- `showConfirmation`

---

## Reverse Geocoding Optional Step

If reverse geocoding is available, use it only as a helper.

Do not rely on it as the only source of truth because:

- rural addresses may be incomplete
- locality names may be inaccurate
- users still need manual control

Use reverse geocoding to:

- suggest district
- suggest municipality or gram panchayat
- suggest ward number if available
- suggest locality or road
- suggest pincode

---

## Admin and Worker Views

Update complaint listing and complaint detail views so they show:

- address type
- location method
- captured place or locality
- district
- pincode
- ward number
- municipality or gram panchayat when available
- map coordinates
- accuracy

This makes it easier for staff to route complaints to the right local area.

---

## Testing Checklist

- select rural address type
- select urban address type
- choose current location and capture GPS successfully
- handle location permission denied
- handle GPS timeout
- fill address manually without GPS
- verify reverse geocoding pre-fills fields
- edit GPS-derived values before submission
- confirm location before final submit
- submit complaint with all required address fields
- verify complaint stores coordinates correctly
- verify address displays correctly in user dashboard
- verify admin dashboard can read the new address format

---

## Acceptance Criteria

- citizen can choose rural or urban address type
- citizen can capture location from the browser or enter it manually
- complaint submission stores GPS metadata and structured address data
- place, district, pincode, grampanchayat, block, municipality, and ward are available in the complaint record
- confirmation happens before submission
- existing complaint views continue to work without breaking
