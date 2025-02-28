# API Documentation

## Getting Started

### Base URL
```
http://localhost:5000/v1
```

### Running Migrations
To run the migrations, you need to install ts-node first, then execute the migration script:

```bash
$ ts-node src/migrations/users/migrateUsers.ts
```

## Authentication

### Sign Up
**Endpoint:** `/auth/signup` (POST)

**Request Body:**
```json
{
    "displayName": "Alfred Emmanuel",
    "email": "www@gmail.com",
    "password": "jdioshfiosjhdibusov"
}
```

### Login
**Endpoint:** `/auth/login` (POST)

**Request Body:**
```json
{
    "email": "www@gmail.com",
    "password": "jdioshfiosjhdibusov"
}
```

### Authentication for Protected Routes
For endpoints that require authentication, you need to include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

The access token is provided in the response after successful login.

## Available Routes

All route endpoints are defined in:
```
src/app/router/index.ts
```

<!-- Refer to this file for a complete list of available endpoints and their requirements. -->