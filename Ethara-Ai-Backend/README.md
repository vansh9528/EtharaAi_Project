# Ethara AI Dashboard Backend

FastAPI backend for the Ethara AI Dashboard. Provides authentication, user management, projects, and tasks APIs.

**Live:** https://etharaai-project.onrender.com  
**API Docs:** https://etharaai-project.onrender.com/docs

## Features

- ✅ User authentication (register, login, logout)
- ✅ JWT token-based security
- ✅ Role-based access control
- ✅ Project management
- ✅ Task tracking
- ✅ User dashboard
- ✅ CORS enabled for frontend integration
- ✅ SQLite database

## Quick Start

### Prerequisites
- Python 3.9+
- pip

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vansh9528/EtharaAi_Project.git
cd Ethara-Ai-Backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
python main.py
```

Server will be available at `http://localhost:8000`

### API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
Ethara-Ai-Backend/
├── main.py                 # Entry point
├── requirements.txt        # Dependencies
├── README.md
└── app/
    ├── __init__.py
    ├── api/
    │   ├── router.py       # Main router
    │   └── routes/
    │       ├── auth.py     # Authentication endpoints
    │       ├── dashboard.py # Dashboard endpoints
    │       ├── projects.py  # Projects endpoints
    │       ├── tasks.py     # Tasks endpoints
    │       └── users.py     # Users endpoints
    ├── core/
    │   ├── config.py       # Settings & configuration
    │   └── security.py     # JWT & password handling
    ├── db/
    │   ├── base.py         # Database models
    │   └── session.py      # Database session
    ├── models/
    │   ├── user.py
    │   ├── project.py
    │   └── task.py
    └── schemas/
        ├── auth.py
        ├── common.py
        ├── project.py
        └── task.py
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Dashboard
- `GET /api/dashboard` - Get dashboard summary

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Users
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL=sqlite:///./ethara.db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

## Deployment

### Deploy to Render

1. Push to GitHub
2. Go to https://dashboard.render.com
3. Create new Web Service
4. Connect your GitHub repo
5. Set build command: `pip install -r requirements.txt`
6. Set start command: `gunicorn main:app`
7. Deploy!

The backend is currently deployed on Render's Hobby plan.

## Technologies Used

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database
- **Pydantic** - Data validation
- **JWT** - Authentication tokens
- **SQLite** - Database
- **Uvicorn** - ASGI server

## Testing

View API docs and test endpoints:
```bash
curl https://etharaai-project.onrender.com/docs
```

Test login:
```bash
curl -X POST https://etharaai-project.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open a GitHub issue.
```

## Run

```bash
cd Ethara-Ai-Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: `http://localhost:8000/docs`

## Notes

- SQLite is the default development database through `DATABASE_URL`.
- JWT settings and allowed frontend origins are managed in `app/core/config.py`.
- Protected routes now read the `Authorization: Bearer <token>` header correctly, which matches how the UI stores and sends the token.
