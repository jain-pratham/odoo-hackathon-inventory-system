# Odoo Hackathon Inventory Management System

A **full-stack Inventory Management System** developed as part of the **Odoo Hackathon**.
This project digitizes and streamlines warehouse operations by replacing manual tracking methods such as Excel sheets or physical registers with a centralized, real-time inventory system.

The system allows businesses to manage **products, categories, warehouses, locations, and stock levels** efficiently while providing secure authentication and fast performance using caching.

---

# Project Overview

The goal of this project is to build a **modern inventory management platform** that enables organizations to:

* Track stock across multiple warehouses and locations
* Manage products and categories
* Monitor stock availability in real time
* Maintain organized warehouse operations
* Improve performance using Redis caching
* Provide secure access through authentication

The application is built using **modern full-stack technologies** and follows a scalable backend architecture suitable for production-level systems.

---

# Key Features

### Authentication & User Management

* User signup and login
* Secure password hashing
* JWT-based authentication
* Profile management
* Password reset with OTP support

### Product Management

* Create, update, delete products
* Unique SKU management
* Product categorization
* Reorder level tracking

### Category Management

* Create product categories
* Organize products efficiently

### Warehouse Management

* Create multiple warehouses
* Manage warehouse addresses
* Track inventory across warehouses

### Location Management

* Warehouse rack/location management
* Assign products to specific warehouse locations

### Inventory & Stock Tracking

* View stock availability per product
* Track stock across warehouse locations
* Real-time inventory visibility

### Redis Caching

* Faster API responses
* Reduced database load
* Cached product and inventory data

### API Architecture

* REST-based APIs
* Modular backend structure
* Clean separation of routes, models, and utilities

---

# Technology Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Lucide Icons

### Backend

* Next.js API Routes
* Node.js
* TypeScript

### Database

* MongoDB Atlas

### Cache Layer

* Redis (ioredis)

### Authentication

* JWT (JSON Web Tokens)
* bcrypt password hashing

---

# Project Structure

```
src
 ├ app
 │  ├ api
 │  │  ├ auth
 │  │  ├ products
 │  │  ├ categories
 │  │  ├ warehouses
 │  │  ├ locations
 │  │  └ stock
 │  │
 │  ├ layout.tsx
 │  ├ page.tsx
 │
 ├ models
 │  ├ user.model.ts
 │  ├ product.model.ts
 │  ├ category.model.ts
 │  ├ warehouse.model.ts
 │  ├ location.model.ts
 │  └ stock.model.ts
 │
 ├ lib
 │  ├ db.ts
 │  ├ redis.ts
 │  ├ cache.ts
 │  ├ rate-limits.ts
 │  ├ auth.ts
 │  └ jwt.ts
 │
 └ components
```

---

# API Endpoints

## Authentication

```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

## Profile

```
GET  /api/profile
PUT  /api/profile
```

## Categories

```
POST /api/categories
GET  /api/categories
```

## Products

```
POST   /api/products
GET    /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
```

## Warehouses

```
POST /api/warehouses
GET  /api/warehouses
```

## Locations

```
POST /api/locations
GET  /api/locations
```

## Stock

```
GET /api/stock
GET /api/stock/:productId
```

---

# Installation & Setup

### 1 Clone the repository

```
git clone https://github.com/your-username/odoo-hackathon-inventory-system.git
```

### 2 Navigate to project folder

```
cd odoo-hackathon-inventory-system
```

### 3 Install dependencies

```
npm install
```

### 4 Setup environment variables

Create a `.env` file in the root directory:

```
MONGODB_URI=your_mongodb_atlas_connection
REDIS_URL=your_redis_connection
JWT_SECRET=your_secret_key
```

### 5 Run the development server

```
npm run dev
```

Application will run on:

```
http://localhost:3000
```

---

# Redis Caching

Redis is used to improve performance by caching frequently accessed data such as:

* Product lists
* Inventory data
* Stock queries

This reduces database load and improves response speed.

---

# Security Features

* JWT Authentication
* Password hashing with bcrypt
* Rate limiting support
* Secure API architecture

---

# Team Collaboration

This project was developed as a **group project during the Odoo Hackathon**.

Team members collaborated by working on different modules such as:

* Core backend APIs
* Inventory operations
* Authentication system
* Database models
* Redis caching
* UI components

Each developer worked on dedicated branches and contributed through pull requests.

---

# Future Improvements

Possible improvements for the system include:

* Dashboard analytics
* Low stock alerts
* Email notifications
* Stock movement history
* Order management
* Role-based access control
* Advanced reporting

---

# License

This project was created for educational and hackathon purposes.

---

# Author

Developed as part of the **Odoo Hackathon Full-Stack Inventory Management System Project**.
