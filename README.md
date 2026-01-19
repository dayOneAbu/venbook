# PEDS Elegant Replacement SaaS

A cloud-native, offline-first **Banquet & Event Management SaaS** designed to replace the legacy **PEDS Elegant** system for hotels and venues in **Ethiopia**.

This platform focuses on **venue booking accuracy, operational execution (BEOs), Ethiopian tax compliance, and local payments**, while maintaining reliability under unstable internet conditions.

---

## 🚀 Vision

To become the **default banquet and event management system** for Ethiopian hotels by delivering:

* Zero double-bookings
* Accurate VAT & service charge calculations
* Clear operational execution via BEOs
* Remote visibility for owners and managers
* Reliable operation even during internet outages

---

## 🎯 Problem Statement

Most hotels in Ethiopia still rely on **on‑premise legacy systems** like PEDS Elegant, which suffer from:

* Poor UX and limited mobile support
* Manual tax and service charge calculations
* No real-time visibility for owners
* Difficult upgrades and maintenance
* Weak integration with local payment systems

Modern international tools fail because they **do not localize** for:

* Ethiopian tax rules
* Telebirr / M‑Pesa payments
* Unstable connectivity
* Local data residency concerns

---

## 🧠 Core Philosophy

1. **BEO-first design** – Operations drive the system, not just bookings
2. **Offline-first** – The system must work during internet outages
3. **Local-first** – Built specifically for Ethiopian hospitality
4. **Enterprise-ready** – Approvals, audit logs, and role separation

---

## 🏗️ Core Features

### 1. Venue & Capacity Management

* Multiple venues per hotel
* Configurable layouts (banquet, theatre, classroom, etc.)
* Capacity enforcement per layout
* Support for divisible halls

### 2. Event Lifecycle Management

* Inquiry → Tentative → Confirmed → Executed → Billed
* Multi-day events
* Guaranteed vs actual pax tracking
* Conflict detection to prevent double-booking

### 3. Banquet Event Orders (BEO)

* Versioned BEOs
* Department-specific breakdowns (Kitchen, AV, Setup)
* Approval workflow
* Printable and mobile-friendly formats

### 4. Financial & Tax Engine

* Automated VAT (15%) and Service Charge (10%)
* Proforma & final invoices
* Deposits, partial payments, and refunds
* ERCA-compliant reporting

### 5. Local Payments

* Telebirr payment links
* M‑Pesa support
* Bank transfer recording
* SMS payment notifications

### 6. Reliability & Offline Support

* Offline viewing of schedules
* Draft BEO creation without internet
* Automatic sync when connection returns

### 7. Roles, Approvals & Audit Logs

* Role-based access (Sales, Finance, Manager, Operations)
* Approval flows for discounts and BEOs
* Full audit trail for compliance

---

## 🧩 Target Users

* Hotels (3★ – 5★)
* Conference centers
* Wedding & event venues
* Hotel groups with multiple properties

---

## 🛠️ Technical Architecture

### Stack (T3 – Ethiopia Edition)

* **Frontend**: Next.js 15 (App Router)
* **Backend**: tRPC (type-safe APIs)
* **Database**: PostgreSQL (multi-tenant via `hotelId`)
* **ORM**: Prisma
* **State & Sync**: TanStack Query with persistence
* **Hosting**: Cloudflare Workers (edge) + Ethiopian data centers

---

## 🗄️ Core Domain Models (High Level)

* Hotel
* Venue
* VenueLayout
* Event
* BEO (Banquet Event Order)
* BEOItem
* Package & Pricing
* Invoice
* Payment
* Department & Task
* User & AuditLog

---

## 📦 Multi-Tenancy Model

* Logical isolation using `hotelId`
* Subdomain-based access (`hotelname.platform.et`)
* Secure role separation per hotel

---

## 🗺️ Roadmap

### Phase 1 – Core System

* Multi-tenant architecture
* Venue & layout management
* Event booking & conflict detection
* BEO creation and versioning
* Basic invoicing

### Phase 2 – Localization

* Telebirr & M‑Pesa integration
* ERCA-compliant invoices
* VAT & service charge automation

### Phase 3 – Offline Engine

* Persistent local cache
* Auto-sync logic
* Conflict resolution

### Phase 4 – Pilot

* Deploy to 3 hotels in Addis Ababa
* Collect UX and operational feedback
* Prepare for commercial rollout

---

## 🏆 Competitive Advantage

| Area         | Legacy PEDS Elegant | This SaaS            |
| ------------ | ------------------- | -------------------- |
| Deployment   | On‑premise          | Cloud + Offline      |
| Payments     | Manual              | Telebirr / M‑Pesa    |
| UX           | Legacy              | Modern, mobile-first |
| Reporting    | Static              | Real-time            |
| Multi-hotel  | No                  | Yes                  |
| Localization | Partial             | Deep Ethiopian focus |

---

## 🔐 Compliance & Trust

* Ethiopian Data Protection Proclamation (1321/2024)
* Local data residency
* Role-based access control
* Full audit logs

---

## 📌 Non-Goals (Out of Scope for MVP)

* Full HR & payroll
* Inventory & procurement
* CRM & marketing automation

---

## 📄 License

Proprietary – Internal Project

---

## ✨ Final Note

This is **not just a booking system**.

It is an **operational backbone** for banquet and event execution — designed for Ethiopian realities and built to replace PEDS Elegant with confidence.
