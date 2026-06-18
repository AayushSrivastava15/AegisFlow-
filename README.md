# AegisFlow v2.0 - Enterprise SaaS License Management Platform

AegisFlow is a modern, developer-first, multi-tenant License Management Platform and telemetry diagnostics suite. It behaves like Stripe or Clerk for software licensing, enabling platforms and developers to issue cryptographic license keys, track server node health, enforce usage limits, audit administrative logs, and manage subscription quotas.

Built with **Next.js 16 (App Router / Turbopack)**, **React 19**, **Zustand**, and **Cloud Firestore**.

---

## 🚀 Key Features

### 1. Multi-Tenant Company Isolation
* **Tenant Partitioning**: All data (Products, Customers, Licenses, Heartbeats, Logs) is strictly partitioned using a `companyId` scope retrieved from the authenticated user profile.
* **Role-Based Access Control (RBAC)**: Support for roles (`owner`, `admin`, `manager`, `viewer`) controlling admin privileges. Viewers have read-only access (creation and settings controls are dynamically disabled).
* **Billing Quota Management**: Tiers (Free, Starter, Growth, Enterprise) with resource tracking. Quota usage bars dynamically warn users when approaching license or node limits.

### 2. REST API Validation Gateway
* **`POST /api/licenses/validate`**: Secure endpoint for client applications to validate keys. Checks:
  * Expiry Dates (automatically sets license status to `EXPIRED` if past date).
  * Administrative Overrides (instantly fails validation if status is `SUSPENDED` or `REVOKED`).
  * Quota Limits (blocks validation once `usageCount` reaches `usageLimit`).
  * Writes audit logs automatically on each successful handshake.
* **`POST /api/heartbeat`**: Live telemetry endpoint for client applications to report server status (`UP` / `DOWN`), active version, environment (`production`, `staging`, `development`), and current concurrent users count.

### 3. Live Heartbeat Telemetry & Heatmap
* **Node Heatmap Grid**: Visual 48-point ping grid displaying status representation of online server instances (heartbeats).
* **Health Scoring Engine**: Automatically calculates product health score based on node availability and telemetry status updates.
* **Telemetry Heartbeat Simulator**: Built-in simulator modal allowing you to test client telemetry reporting directly from the dashboard.

### 4. Integrated Developer Documentation Center
* Accessible at `/dashboard/docs` directly in the sidebar.
* Complete API Reference documentation.
* Integration guides for popular backends: Node.js (Axios), Python (Requests), and Spring Boot/Java.
* Step-by-step instructions for Ubuntu/VPS self-hosted deployment.

### 5. Automatic Database Storage Pruning
* Self-cleaning background engine runs on dashboard load.
* Automatically deletes `activityLogs` and `heartbeats` older than 24 hours.
* Prevents Firestore databases from exceeding free storage limits due to frequent API validation and telemetry pings.

---

## 🛠️ Tech Stack

* **Frontend Framework**: Next.js 16 (App Router / Turbopack), React 19, TypeScript
* **State Management**: Zustand
* **Database / Backend**: Firebase Authentication & Cloud Firestore (NoSQL)
* **Styling**: Vanilla CSS + Tailwind CSS v4 (Glassmorphic layouts, dark mode presets)
* **Animations**: Framer Motion
* **Icons**: Lucide Icons

---

## 📦 Directory Structure

* `/src/app/`: App Router page views:
  * `/(auth)/`: Login, registration, and user self-healing page logic.
  * `/dashboard/`: Corporate workspace overview and main telemetry analytics.
  * `/dashboard/products/`: Product catalogs and details (Overview, Licenses, Customers, Analytics, SDK, Audit, Billing, Settings).
  * `/dashboard/docs/`: Built-in markdown documentation viewer.
  * `/api/`: CORS-enabled REST route handlers (`/api/licenses/validate` and `/api/heartbeat`).
* `/src/components/`: Navigation wrappers (Header, Sidebar, or card templates).
* `/src/store/`: Zustand state stores coordinating Firebase CRUD actions.
* `/src/types/`: Typescript interfaces mapping the domain models.
* `/src/lib/`: Firebase Client SDK initialization wrapper.

---

## 🚀 Getting Started

### 1. Setup Environment Configuration
Create a `.env.local` file at the root of the project:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the assigned port) in your browser.

### 4. Compile Production Target
```bash
npm run build
```
The Next.js router compiles dynamic gateways and statically optimized dashboard modules.

---

## 🔒 Security & Best Practices

* **Rotate API Secrets**: Rotate your SDK Secret and API Keys every 180 days to mitigate exposure.
* **Server-Side Checks**: Always perform license validation inside your server-side backend (Node, Python, Go, Java) rather than client-side JavaScript. This prevents users from inspecting/patching local browser memory to bypass key validation checks.
* **Implement Offline Grace Period Cache**: For mission-critical production instances, cache the license check state on the client server for 24-72 hours to ensure operations continue even if Firestore or AegisFlow experiences temporary network disconnects.