# Ethara AI Dashboard Backend

FastAPI backend for the Ethara dashboard login and registration UI.

## Structure

```text
Ethara-Ai-Backend/
├── main.py
├── requirements.txt
└── app/
    ├── api/
    │   ├── router.py
    │   └── routes/
    │       └── auth.py
    ├── core/
    │   ├── config.py
    │   └── security.py
    ├── db/
    │   ├── base.py
    │   └── session.py
    ├── models/
    │   └── user.py
    └── schemas/
        └── auth.py
```

## Frontend Contract

The React UI already calls these endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Both `register` and `login` return:

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "created_at": "2026-05-10T10:00:00"
  }
}
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
