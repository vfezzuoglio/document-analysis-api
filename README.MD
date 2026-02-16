# AI Document Analyzer

A full-stack web application for uploading, analyzing, and querying PDF documents using AI. Built with FastAPI (Python backend) and React (modern frontend).

## Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **PDF Upload & Processing**: Upload PDF documents and automatically extract text
- **Document Chunking**: Split documents into manageable chunks for analysis
- **Q&A Interface**: Ask questions about uploaded documents
- **Document Management**: View, organize, and delete your documents
- **Responsive UI**: Modern, responsive web interface built with React and Tailwind CSS
- **RESTful API**: Clean API with auto-generated documentation

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - Python ORM
- **Alembic** - Database migrations
- **PyPDF2** - PDF text extraction
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing

### Frontend
- **React 19** - UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **JavaScript (ES6+)** - Modern JavaScript

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **PostgreSQL 16** - Database service

## Project Structure

```
doc-analyzer/
├── apps/
│   ├── api/                          # FastAPI Backend
│   │   ├── app/
│   │   │   ├── core/                 # Core configuration
│   │   │   │   ├── config.py        # Settings management
│   │   │   │   ├── database.py      # Database setup
│   │   │   │   ├── security.py      # JWT & auth logic
│   │   │   │   └── security_deps.py # Auth dependencies
│   │   │   ├── models/              # SQLAlchemy ORM models
│   │   │   │   ├── user.py          # User model
│   │   │   │   ├── document.py      # Document model
│   │   │   │   └── chunk.py         # Document chunk model
│   │   │   ├── routers/             # API endpoint handlers
│   │   │   │   ├── auth.py          # Authentication endpoints
│   │   │   │   └── documents.py     # Document management endpoints
│   │   │   ├── schemas/             # Pydantic request/response schemas
│   │   │   │   ├── auth.py          # Auth schemas
│   │   │   │   └── documents.py     # Document schemas
│   │   │   └── services/            # Business logic
│   │   │       ├── chunking.py      # Document chunking logic
│   │   │       └── extraction.py    # PDF extraction logic
│   │   ├── alembic/                 # Database migrations
│   │   ├── main.py                  # FastAPI application entry point
│   │   ├── requirements.txt          # Python dependencies
│   │   ├── Dockerfile               # Docker configuration
│   │   └── alembic.ini
│   │
│   ├── web/                         # React Frontend
│   │   ├── src/
│   │   │   ├── components/          # Reusable React components
│   │   │   │   ├── UploadCard.jsx  # File upload component
│   │   │   │   ├── DocList.jsx     # Document list view
│   │   │   │   └── AskPanel.jsx    # Q&A interface
│   │   │   ├── pages/               # Page components
│   │   │   │   ├── Login.jsx       # Login page
│   │   │   │   └── Dashboard.jsx   # Main dashboard
│   │   │   ├── api/
│   │   │   │   └── client.js       # API client utilities
│   │   │   ├── assets/              # Static assets
│   │   │   ├── App.jsx              # Main App component
│   │   │   ├── main.jsx             # React entry point
│   │   │   ├── App.css              # App styles
│   │   │   └── index.css            # Global styles
│   │   ├── public/                  # Public static files
│   │   ├── package.json             # Node.js dependencies
│   │   ├── vite.config.js           # Vite configuration
│   │   ├── tailwind.config.js       # Tailwind CSS configuration
│   │   ├── eslint.config.js         # ESLint configuration
│   │   ├── Dockerfile               # Docker configuration
│   │   └── index.html               # HTML entry point
│   │
│   └── docker-compose.yml           # Multi-container orchestration
│
└── README.MD                         # This file
```

## Getting Started

### Prerequisites

- **Docker** & **Docker Compose** (recommended)
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop)
  
OR manually:
- **Python 3.9+** (for backend development)
- **Node.js 18+** (for frontend development)
- **PostgreSQL 12+** (if not using Docker)

### Quick Start with Docker Compose

1. **Navigate to the apps directory:**
```bash
cd doc-analyzer/apps
```

2. **Start all services:**
```bash
docker-compose up -d --build
```

3. **Application URLs:**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **Alternative API Docs**: http://localhost:8000/redoc

4. **View logs:**
```bash
docker-compose logs -f
```

5. **Stop services:**
```bash
docker-compose down
```

### Manual Setup (Development)

#### Backend Setup

1. **Navigate to API directory:**
```bash
cd doc-analyzer/apps/api
```

2. **Create virtual environment:**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
Create a `.env` file in `apps/api`:
```
DATABASE_URL=postgresql+psycopg://app:app@localhost:5432/docanalyzer
JWT_SECRET=your-secret-key-change-in-production
JWT_ALG=HS256
ACCESS_TOKEN_MINUTES=15
```

5. **Run database migrations:**
```bash
alembic upgrade head
```

6. **Start development server:**
```bash
uvicorn main:app --reload --port 8000
```

Server runs at: http://localhost:8000

#### Frontend Setup

1. **Navigate to web directory:**
```bash
cd doc-analyzer/apps/web
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

Frontend runs at: http://localhost:5173

## API Endpoints

### Health & Status
- `GET /health` - API health check

### Authentication
- `POST /auth/register` - Register new user
  - Body: `{ "email": "user@example.com", "password": "password" }`
- `POST /auth/login` - User login
  - Body: `{ "email": "user@example.com", "password": "password" }`
  - Returns: JWT access token

### User
- `GET /me` - Get current authenticated user info
  - Headers: `Authorization: Bearer {token}`

### Documents
- `GET /documents` - List all user documents
  - Headers: `Authorization: Bearer {token}`
- `POST /documents` - Upload new PDF document
  - Headers: `Authorization: Bearer {token}`
  - Body: Form data with file
- `GET /documents/{document_id}` - Get document details
  - Headers: `Authorization: Bearer {token}`
- `DELETE /documents/{document_id}` - Delete document
  - Headers: `Authorization: Bearer {token}`
- `POST /documents/{document_id}/ask` - Ask question about document
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ "question": "What is this document about?" }`

## Database Schema

### Users Table
```sql
- id (Integer, PK)
- email (String, Unique)
- password_hash (String)
- created_at (DateTime)
```

### Documents Table
```sql
- id (Integer, PK)
- user_id (Integer, FK → users.id)
- filename (String)
- status (String) -- 'uploaded', 'ready', 'failed'
- created_at (DateTime)
```

### Chunks Table
```sql
- id (Integer, PK)
- document_id (Integer, FK → documents.id)
- content (Text)
- index (Integer)
- created_at (DateTime)
```

## Environment Variables

### Backend (`.env` in `apps/api`)
```
DATABASE_URL=postgresql+psycopg://app:app@localhost:5432/docanalyzer
JWT_SECRET=your-secret-key-here
JWT_ALG=HS256
ACCESS_TOKEN_MINUTES=15
```

### Frontend (`.env.local` in `apps/web`)
```
VITE_API_URL=http://localhost:8000
```

### Docker Compose (uses defaults)
- Database: PostgreSQL 16
- DB User: `app`
- DB Password: `app`
- DB Name: `docanalyzer`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register** - Create new user account
2. **Login** - Receive JWT token
3. **Use Token** - Include in `Authorization: Bearer {token}` header for protected endpoints

Tokens expire after configured time (default: 15 minutes).

## Development Features

### Run Tests
```bash
cd apps/api
pytest

cd apps/web
npm test
```

### Code Quality
```bash
# Backend linting
cd apps/api
pylint app/

# Frontend linting
cd apps/web
npm run lint
```

### Build for Production
```bash
# Frontend
cd apps/web
npm run build

# Backend builds automatically in Docker
```

### Interactive API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Change ports in docker-compose.yml or kill process using the port
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Mac/Linux
```

**Database connection error:**
```bash
# Ensure database is healthy
docker-compose ps
docker-compose logs db
```

### API Not Responding
```bash
# Check if services are running
docker-compose ps

# Restart services
docker-compose restart api

# Check logs
docker-compose logs api
```

### Frontend Can't Connect to API
- Verify `VITE_API_URL` environment variable
- Check `CORS_ORIGINS` in backend settings
- Ensure backend is running (`http://localhost:8000/health`)

### Database Migrations Failed
```bash
# Reset database (caution: deletes data)
docker-compose down -v
docker-compose up -d --build

# Or manually run migrations
docker-compose exec api alembic upgrade head
```

## Key Dependencies

### Backend
- `fastapi==0.129.0` - Web framework
- `sqlalchemy` - ORM
- `psycopg` - PostgreSQL adapter  
- `pydantic` - Data validation
- `PyPDF2` - PDF processing
- `bcrypt` - Password hashing
- `python-jose` - JWT handling
- `alembic` - Database migrations

### Frontend
- `react==^19.2.0` - UI library
- `react-router-dom==^7.13.0` - Routing
- `tailwindcss==^4.1.18` - CSS framework
- `vite==^7.3.1` - Build tool
- `@vitejs/plugin-react` - React support

## Frontend Build Info

**Build Tool**: Vite
**CSS Framework**: Tailwind CSS
**Component Library**: React
**Routing**: React Router v7

### Available Scripts
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT License - Feel free to use this project as a template

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support & Help

- **API Documentation**: http://localhost:8000/docs (when running)
- **Issue Tracker**: Create an issue in the repository
- **Common Issues**: See Troubleshooting section above

## Roadmap

- [ ] Advanced search and filtering
- [ ] Document preview functionality
- [ ] Export results to PDF/CSV
- [ ] Real-time collaboration features
- [ ] Document versioning
- [ ] Analytics dashboard
- [ ] API rate limiting
- [ ] WebSocket support for live updates
- [ ] OCR support for scanned documents
- [ ] Multiple language support

## Quick Tips

- **Hot Reload**: Both frontend and backend support hot reloading during development
- **API Testing**: Use interactive docs at `/docs` endpoint
- **Database Inspection**: Connect to PostgreSQL on `localhost:5432`
- **Debug Mode**: Backend runs with `--reload` flag in development

---

**Last Updated**: February 2026
**Status**: Active Development
