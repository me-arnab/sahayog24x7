# Admin Dashboard - Notice Management Module Implementation Plan

## Objective

Implement a complete **Notice Management Module** for the Admin
Dashboard using the provided UI design while integrating it with the
existing backend.

------------------------------------------------------------------------

# Phase 1 - UI Development

## Notices Page

Recreate the design exactly.

### Header

-   Title: **Notices**
-   Subtitle: Create and manage notices for consumers.
-   **Add Notice** button (top-right)

### Statistics Cards

-   Total Notices
-   Active Notices
-   Scheduled Notices
-   Inactive Notices

### Search & Filter

-   Search by title
-   Filter by Notice Type
-   Filter by Status
-   Sort (Newest First / Oldest First)

### Notice Table

Columns: - Title - Notice Type - Audience - Start Date - End Date -
Status - Created On - Actions

Actions: - View - Edit - Delete - Activate / Deactivate

Pagination at the bottom.

------------------------------------------------------------------------

# Phase 2 - Add/Edit Notice Modal

Fields:

-   Notice Title
-   Notice Type
-   Message
-   Start Date & Time
-   End Date & Time
-   Audience
-   Status

Buttons: - Cancel - Add Notice / Update Notice

Validation: - Required fields - End date \>= Start date - Message length
validation - Disable submit while saving

------------------------------------------------------------------------

# Phase 3 - Backend (Node.js + Express + MongoDB)

## Notice Schema

``` js
title
message
type
audience
status
startDate
endDate
createdBy
createdAt
updatedAt
```

Notice Types: - Maintenance - Payment - Outage - General

Audience: - All Consumers - Zone - Ward - Consumer Group

Status: - Active - Scheduled - Inactive

------------------------------------------------------------------------

# Phase 4 - REST API

## Create Notice

POST /api/notices

## Get Notices

GET /api/notices

Supports: - search - status - type - page - limit - sort

## Get Single Notice

GET /api/notices/:id

## Update Notice

PUT /api/notices/:id

## Delete Notice

DELETE /api/notices/:id

## Toggle Status

PATCH /api/notices/:id/status

## Dashboard Statistics

GET /api/notices/stats

Returns: - Total - Active - Scheduled - Inactive

------------------------------------------------------------------------

# Phase 5 - Controller Logic

-   Create Notice
-   Update Notice
-   Delete Notice
-   Pagination
-   Search
-   Filtering
-   Sorting
-   Statistics aggregation
-   Validation
-   Error handling

------------------------------------------------------------------------

# Phase 6 - Frontend API Integration

Create: - noticeService.ts / noticeApi.js

Functions: - getNotices() - getNotice(id) - createNotice() -
updateNotice() - deleteNotice() - updateStatus() - getStats()

Use: - Axios - JWT Authorization - Loading states - Toast notifications

------------------------------------------------------------------------

# Phase 7 - React Components

    pages/
        NoticesPage.tsx

    components/
        NoticeTable.tsx
        NoticeCard.tsx
        NoticeStats.tsx
        NoticeFilters.tsx
        NoticeModal.tsx
        DeleteModal.tsx
        StatusBadge.tsx

    services/
        noticeService.ts

    hooks/
        useNotice.ts

    types/
        notice.ts

------------------------------------------------------------------------

# Phase 8 - Features

-   Live search
-   Filter
-   Sorting
-   Pagination
-   View Notice
-   Edit Notice
-   Delete Notice
-   Activate/Deactivate
-   Responsive UI
-   Loading skeleton
-   Empty state
-   Confirmation dialog
-   Success/Error toasts

------------------------------------------------------------------------

# Phase 9 - Consumer Integration

Consumers should only receive: - Active notices - Scheduled notices once
start time arrives

Consumer APIs: GET /api/consumer/notices

Optional: - Filter by area/zone - Auto-hide expired notices

------------------------------------------------------------------------

# Phase 10 - Testing Checklist

-   Create notice
-   Edit notice
-   Delete notice
-   Search
-   Filters
-   Pagination
-   Statistics update
-   Validation
-   Unauthorized access
-   Responsive layout

------------------------------------------------------------------------

# Deliverables

-   Pixel-perfect UI matching the provided design
-   Fully functional CRUD
-   MongoDB integration
-   Express APIs
-   React frontend integration
-   Authentication & authorization
-   Production-ready Notice Management module
