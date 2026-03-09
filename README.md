# Task Manager — Trello-like App

A full-stack task management application inspired by Trello, built with modern technologies.

![.NET](https://img.shields.io/badge/.NET-10.0-purple)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15 + React
- TypeScript
- Tailwind CSS
- Axios

**Backend:**
- ASP.NET Core Web API (.NET 10)
- Entity Framework Core
- PostgreSQL
- JWT Authentication
- BCrypt password hashing

## ✨ Features

- User authentication (register and login with JWT)
- Create, view and delete boards
- Create, reorder and delete columns
- Create, move and delete tasks between columns
- Add and delete comments on tasks
- Fully responsive UI

## 📦 Getting Started

### Prerequisites

- .NET 10 SDK
- Node.js 18+
- PostgreSQL

### Backend Setup
```bash
cd TaskManager.API
```

Create your `appsettings.json` file:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=taskmanager;Username=postgres;Password=yourpassword"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key-minimum-32-characters",
    "Issuer": "TaskManagerAPI",
    "Audience": "TaskManagerClient",
    "ExpirationHours": 24
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

Run migrations and start the API:
```bash
dotnet ef database update
dotnet run
```

API will be available at `http://localhost:5099`
Swagger docs at `http://localhost:5099/swagger`

### Frontend Setup
```bash
cd taskmanager-web
```

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5099
```

Install dependencies and run:
```bash
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 📁 Project Structure
```
taskmanager/
├── TaskManager.API/          # .NET Backend
│   ├── Controllers/          # API endpoints
│   ├── Models/               # Database entities
│   ├── DTOs/                 # Data transfer objects
│   ├── Services/             # Business logic
│   └── Data/                 # DbContext
│
└── taskmanager-web/          # Next.js Frontend
    ├── app/                  # Pages
    ├── components/           # Reusable components
    ├── context/              # Auth context
    ├── lib/                  # API configuration
    └── types/                # TypeScript types
```

## 📄 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | ❌ |
| POST | /api/auth/login | Login user | ❌ |
| GET | /api/boards | List boards | ✅ |
| POST | /api/boards | Create board | ✅ |
| DELETE | /api/boards/{id} | Delete board | ✅ |
| GET | /api/columns/board/{id} | List columns | ✅ |
| POST | /api/columns | Create column | ✅ |
| PUT | /api/columns/reorder | Reorder columns | ✅ |
| DELETE | /api/columns/{id} | Delete column | ✅ |
| GET | /api/tasks/column/{id} | List tasks | ✅ |
| POST | /api/tasks | Create task | ✅ |
| PUT | /api/tasks/{id} | Update task | ✅ |
| PUT | /api/tasks/{id}/move | Move task | ✅ |
| DELETE | /api/tasks/{id} | Delete task | ✅ |
| GET | /api/comments/task/{id} | List comments | ✅ |
| POST | /api/comments | Add comment | ✅ |
| DELETE | /api/comments/{id} | Delete comment | ✅ |

## 👨‍💻 Author

Made by **Otavio** — [GitHub](https://github.com/otavioleme)
