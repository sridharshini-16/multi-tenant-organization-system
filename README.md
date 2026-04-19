---
title: Multi Tenant Organization System
emoji: 🌖
colorFrom: purple
colorTo: purple
sdk: docker
pinned: false
---

# Multi-Tenant Task Management System (Permify)

A multi-tenant task management platform with role-based access control (RBAC), JWT authentication, and strict data isolation between organizations.

## Features

- **Multi-Tenant Architecture**: Strict data isolation between organizations
- **Role-Based Access Control (RBAC)**: Three roles - Organization, Admin, Member
- **JWT Authentication**: Secure token-based authentication using `jose`
- **Task Management**: Full CRUD with audit logging
- **Event Management**: Create, update, delete organization events
- **Member Management**: View, activate/deactivate members
- **Audit Logs**: Track all task-related changes
- **Docker Support**: Containerized with Dockerfile and docker-compose

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: JWT (jose library)
- **Deployment**: Docker, Hugging Face Spaces

## Roles & Permissions

| Action | Organization | Admin | Member |
|--------|-------------|-------|--------|
| View all tasks | ✅ | ✅ | Own only |
| Create tasks | ✅ | ✅ | ❌ |
| Edit tasks | ✅ All | Own only | ❌ |
| Delete tasks | ✅ All | Own only | ❌ |
| View members | ✅ | ✅ | ❌ |
| Activate/deactivate members | ✅ | ❌ | ❌ |
| Create events | ✅ | ✅ | ❌ |
| View events | ✅ | ✅ | ✅ |

## Running Locally

```bash
npm install
npm run dev
```

## Docker

```bash
docker-compose up --build
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | Required |
| JWT_SECRET | Secret key for JWT signing | fallback_secret_key |
| NODE_ENV | Environment | development |
