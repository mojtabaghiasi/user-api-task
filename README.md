# User API

## Overview

This project is a **User Management System** implemented as part of the task. It is built using **NestJS**, a progressive Node.js framework for building scalable and maintainable server-side applications.

## Features

- User registration
- User authentication (JWT-based authentication)
- User role management
- CRUD operations for user management
- Secure API endpoints with access control

## Technologies Used

- **NestJS** - Backend framework
- **TypeScript** - Programming language
- **JWT (JSON Web Token)** - Authentication
- **PostgreSQL** - Database
- **Prisma** - ORM
- **Docker** - Containerization (optional)

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)
- [PostgreSQL](https://www.postgresql.org/)

### Steps to Set Up

1. **Clone the Repository:**

   ```sh
   git clone https://github.com/mojtabaghiasi/user-api-task.git
   ```

2. **Install Dependencies:**

   ```sh
   npm install
   ```

3. **Configure Environment Variables:** Copy environment variables from `.env.dev` and move them to your `.env` file. Update the database connection URL and custom values:

   ```env
   DATABASE_URL="postgresql://DATABASE_USER:DATABASE_PASSWORD@localhost:5432/user_api_task_db?schema=public"
   JWT_SECRET="your_secret_key"
   PGDB_USERNAME="your_db_username"
   PGDB_PASSWORD="your_db_password"
   PERSIST_VOLUME_PATH_POSTGRES=./pg-presist
   ```

4. **Run the Project:**

   ```sh
   # Development
   npm run start

   # Watch mode
   npm run start:dev

   # Production mode
   npm run start:prod
   ```

## Running Tests

```sh
# Unit tests
npm run test
```

## Running with Docker

1. Change the database URL in your `.env` file:
   ```env
   DATABASE_URL="postgresql://DATABASE_USER:DATABASE_PASSWORD@user-api-postgres:5432/user_api_task_db?schema=public"
   ```
2. Run the project using Docker:
   ```sh
   docker compose up --build
   ```

---


