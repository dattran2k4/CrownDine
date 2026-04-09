# 👑 CrownDine - Intelligent Restaurant Management System

**CrownDine** is a comprehensive, modern restaurant management solution designed to optimize operational workflows from reservation and ordering to kitchen management and payment. Integrated with AI and real-time technology, CrownDine delivers a seamless experience for both diners and staff.

---

## ✨ Key Features

### 📅 Smart Reservation

- Intuitive step-by-step booking process.
- Interactive **Table Map** allowing customers to pick their preferred seating.
- Professional **Calendar View** for staff to manage bookings effortlessly.

### 🍽️ Digital Menu & Ordering

- Vibrant electronic menu with high-quality images and detailed descriptions.
- Flexible cart system and item customization.
- Powerful search and filtering by categories.

### 🧑‍🍳 Kitchen Display System (KDS)

- **Real-time** dish status updates.
- Chronological "batch" grouping for efficient meal preparation.
- Instant notifications to staff once dishes are ready for serving.

### 💰 Cashier & Payment Management

- Quick bill management, table merging, and splitting.
- **PayOS** integration (QR Code, Bank Transfer).
- Periodic revenue reporting and Excel data export.

### 🤖 AI Admin Chatbot

- Integrated with **Google Gemini AI** for data analytics.
- Q&A regarding business performance, inventory, and customer forecasting.

### 🔐 Security & Access Control

- Granular permissions: Admin, Staff, Kitchen, Customer.
- Secure authentication via JWT and Google OAuth2.

---

## 🔄 System Workflow

### 1. Customer Reservation Journey

CrownDine provides a seamless 4-step booking experience:

- **Step 1: Date & Time:** Select your visiting date and time slot. The system checks for real-time availability.
- **Step 2: Table Selection:** View a high-fidelity interactive map of the restaurant. Pick your favorite table based on floor, area, and seating capacity.
- **Step 3: Food Pre-ordering:** Browse the digital menu and add dishes to your reservation. This helps the kitchen prepare in advance.
- **Step 4: Payment:** Confirm details and pay via **PayOS**. Once successful, a QR code or confirmation is issued.

### 2. Kitchen & Staff Operations

- **Real-time Synchronization:** When a customer pays or a staff member creates a walk-in order, the **Kitchen Display System (KDS)** immediately updates using **WebSockets**.
- **Order Batching:** The kitchen receives dishes grouped by preparation time/priority to optimize cooking efficiency.
- **Notification Loop:** Once the kitchen marks a dish as "Ready," staff receive an instant toast notification via the frontend to serve the customer.

### 3. AI-Powered Management

- The **Admin Chatbot (Gemini)** doesn't just answer questions; it analyzes current reservations, popular dishes, and peak hours to provide actionable insights for restaurant owners.

---

## 🚀 Technology Stack

### Backend (Java Ecosystem)

- **Framework:** Spring Boot 3.5+
- **Security:** Spring Security, JWT, OAuth2
- **Database:** MySQL 8.0
- **Migration:** Flyway
- **Real-time:** Spring WebSocket (STOMP)
- **AI Integration:** Spring AI (Google GenAI)
- **Cloud:** Cloudinary (Image Hosting)
- **Payment:** PayOS Integration

### Frontend (Modern Web)

- **Framework:** React 19 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4, Radix UI, Lucide Icons
- **State Management:** Zustand
- **Data Fetching:** React Query (TanStack)
- **Form:** React Hook Form + Zod
- **Charts:** Recharts
- **Notifications:** Sonner, React Toastify

---

## 🛠️ Installation & Setup

### Prerequisites

- JDK 21+
- Node.js 20+
- MySQL 8.x

### 1. Backend

```bash
cd backend
# Configure application-dev.yml with your DB, Cloudinary, and PayOS credentials
./mvnw spring-boot:run
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📝 License

This project is licensed under the MIT License.

---

## 🤝 Contact

- **Author:** [Crowndine]
- **Email:** [Crowdine@gmail.com]
- **Website:** [Crowdine.com]

---

_Developed with ❤️ by the CrownDine Team._
