# nodeproject

A minimal Node.js project using Express.js and PostgreSQL.

## Features

- RESTful API with Express.js
- PostgreSQL database integration
- User authentication with JWT tokens
- Password hashing with bcrypt
- Email functionality (forgot password, resend)
- User management (signup, login, profile editing)
- Protected routes with JWT middleware
- JSON API responses
- Environment-based port configuration

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (installed and running)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/neerajmahajan83/nodeproject.git
   cd nodeproject
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up PostgreSQL:
   - PostgreSQL is pre-installed in Codespaces.
   - Database: `mydb`
   - User: `myuser` (password: `mypassword`)
   - Authentication: Trust for local connections

4. Test database connection:
   ```bash
   node Dbconnection.js
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. The server runs on `http://localhost:3000` (or configured port).

3. Open in browser or use API endpoints.

## Public Access (Codespaces Ports)

In GitHub Codespaces, forward port `3000` in the Ports panel to get a public URL (e.g., `https://neerajmahajan83-nodeproject-xxx.github.dev:3000`).

Replace `http://localhost:3000` with your public URL for external access.

### All Endpoint URLs

#### Public Endpoints

 
- **GET /**: `https://psychic-robot-9grrjx77jxf7pvq-3000.app.github.dev/` - Welcome message
- **POST /signup**: `https://psychic-robot-9grrjx77jxf7pvq-3000.app.github.dev/signup` - Register user
- **POST /login**: `https://psychic-robot-9grrjx77jxf7pvq-3000.app.github.dev/login` - Login user
- **POST /forgot-password**: `https://psychic-robot-9grrjx77jxf7pvq-3000.app.github.dev/forgot-password` - Request password reset
- **POST /resend-email**: `https://psychic-robot-9grrjx77jxf7pvq-3000.app.github.dev/resend-email` - Resend email

#### Protected Endpoints (Require Authorization: Bearer <token>)
- **GET /profile**: `https://[public-url]:3000/profile` - Get user profile
- **PUT /profile**: `https://[public-url]:3000/profile` - Update profile
- **GET /users**: `https://[public-url]:3000/users` - List all users

### Public Endpoints

#### GET /
- Description: Welcome message
- Response: Plain text "Hello, Express!"

#### POST /signup
- Description: Register a new user
- Body: JSON `{"name": "User Name", "email": "user@example.com", "password": "password"}`
- Response: JSON `{ "id": 1, "message": "User created" }`

#### POST /login
- Description: Authenticate user
- Body: JSON `{"email": "user@example.com", "password": "password"}`
- Response: JSON `{ "token": "jwt_token", "user": {...} }`

#### POST /forgot-password
- Description: Request password reset
- Body: JSON `{"email": "user@example.com"}`
- Response: JSON `{ "message": "Reset email sent" }`

#### POST /resend-email
- Description: Resend verification or reset email
- Body: JSON `{"email": "user@example.com", "type": "reset"}`
- Response: JSON `{ "message": "Email resent" }`

### Protected Endpoints (Require Authorization Header: Bearer <token>)

#### GET /profile
- Description: Get user profile
- Response: JSON user object

#### PUT /profile
- Description: Update user profile
- Body: JSON `{"name": "New Name", "email": "new@example.com"}`
- Response: JSON `{ "message": "Profile updated" }`

#### GET /users
- Description: Retrieve all users (legacy, consider protecting)
- Response: JSON array of users

## Database Schema

### users table
- `id`: SERIAL PRIMARY KEY
- `name`: TEXT NOT NULL
- `email`: TEXT UNIQUE NOT NULL
- `password`: TEXT NOT NULL (hashed)
- `reset_token`: TEXT
- `reset_expires`: TIMESTAMP
- `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

## Scripts

- `npm start`: Start the server (runs `node index.js`)

## Project Structure

```
nodeproject/
├── index.js          # Main application file
├── Dbconnection.js   # Database connection test
├── package.json      # Dependencies and scripts
├── README.md         # This file
└── .gitignore        # Git ignore rules
```

## Development

- Test database: `node Dbconnection.js`
- Run server: `npm start`
- View logs in terminal

## Troubleshooting

- If database connection fails, ensure PostgreSQL is running: `sudo service postgresql status`
- Check ports: Use VS Code Ports panel to forward 3000
- Dependencies: Run `npm install` if modules are missing

## License

ISC
