# ParcelOS - Last-Mile Delivery Tracker

ParcelOS is a production-grade last-mile delivery management platform designed for complex logistics operations. It handles dynamic pricing rules (rate calculation engine), intelligent agent auto-assignment using geospatial algorithms, robust order lifecycle tracking, and a neo-brutalist customer/admin dashboard.

## System Architecture

**Frontend**: Next.js 14 (App Router), Tailwind CSS, Leaflet Maps, Neo-Brutalist UI 🎨
**Backend**: Node.js, Express, TypeScript, Prisma ORM, Zod, JWT 🔧
**Database**: PostgreSQL (with Neon)

### Database Schema (Prisma)
- `User`: Handles Customers, Agents, and Admins.
- `AgentProfile`: Tracks agent availability and current geospatial coordinates (lat/lng).
- `Zone` & `Area`: Defines geographical zones mapped to specific pincodes.
- `RateCard`: Defines pricing between zones for B2B/B2C, including base rates, per/kg weights, and COD surcharges.
- `Order`: Stores the package dimensions, computed billable weight, origin/destinations, pricing breakdown, and status.
- `TrackingEvent`: Append-only, immutable ledger logging every status transition.

---

## Engineering Design & Implementations

### 1. Rate Calculation Engine
The engine operates securely on the backend, preventing any client-side manipulation of charges:
1. **Zone Detection**: Resolves the origin and destination pincodes to their respective `Zone`s.
2. **Volumetric Weight**: Evaluates `L × B × H / 5000` against the `actualWeight` and selects the maximum as the `billableWeight`.
3. **Rate Lookup**: Matches the (Origin Zone, Destination Zone, Order Type) against the `RateCard` table.
4. **Final Computation**: `Base Rate + (Billable Weight × Rate per Kg) + (COD Surcharge, if applicable)`.

### 2. Algorithmic Rigor in Auto-Assignment
Instead of an O(N) loop computing distances in application memory, the backend pushes the workload to the database using the **Haversine formula** directly in SQL:
```sql
SELECT ap.*, 
  (6371 * acos(cos(radians($1)) * cos(radians(ap."currentLat")) * cos(radians(ap."currentLng") - radians($2)) + sin(radians($1)) * sin(radians(ap."currentLat")))) AS distance
FROM "AgentProfile" ap
WHERE ap."isAvailable" = true
ORDER BY distance ASC LIMIT 1
FOR UPDATE SKIP LOCKED
```
**Race Condition Mitigation:** 
The `FOR UPDATE SKIP LOCKED` clause ensures that if two orders try to assign an agent at the exact same millisecond, the database creates a transaction lock on that row. The first transaction claims the nearest agent, while the concurrent transaction safely skips the locked agent and fetches the next available nearest agent.

### 3. Immutable Order Status Lifecycle
The lifecycle tracks: `CREATED → CONFIRMED → ASSIGNED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED`.
- If a delivery fails (`FAILED`), the customer dashboard provides a "Reschedule" option. 
- Rescheduling moves the status to `RESCHEDULED`, releases the original agent, and triggers the `autoAssignAgent` geospatial algorithm to dispatch a new agent immediately based on the new time/coordinates.
- Every state change writes an immutable `TrackingEvent` to the database, ensuring a pristine audit trail.

### 4. Hardened Security
- **Strict Payload Validation**: All endpoints enforce `Zod` schema validation to block negative weights, invalid dimensions, or SQL injection payloads.
- **Idempotency**: The order creation endpoint implements `idempotencyKey` tracking. If a customer accidentally double-clicks "Confirm", the system returns the existing order instead of double-billing them.
- **RBAC**: Customers cannot mutate URLs to view other customers' orders (IDOR protection). Admin endpoints strictly require the `ADMIN` JWT role.

---

## Setup & Run Instructions (Local)

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database URL (e.g., Neon.tech)

### 1. Backend Setup
```bash
cd backend
npm install
```

Copy the environment variables:
```bash
cp .env.example .env
```
*Edit `.env` and add your `DATABASE_URL` (You can create a free DB on Neon).*

Generate the Prisma client and push the schema to your database:
```bash
npx prisma generate
npx prisma db push
```

Start the backend server:
```bash
npm run dev
```
*The backend API will run on `http://localhost:5000`.*
*Interactive API Swagger documentation is available at `http://localhost:5000/api/docs`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Copy the environment variables:
```bash
cp .env.example .env.local
```
*Make sure `NEXT_PUBLIC_API_URL` is set to `http://localhost:5000/api`.*

Start the frontend development server:
```bash
npm run dev
```
*The UI will run on `http://localhost:3000`.*

### Demo Data (Admin Seeding)
Once the backend is connected to the DB, you can instantly seed the database with demo Zones, Areas, Agents, and Rate Cards by calling the admin seed route. In a new terminal, run:
```bash
curl -X POST http://localhost:5000/api/admin/seed
```
