# MathFluent Backend

Backend API for the MathFluent application.

## Development Setup

This project uses UV for Python package management.

### Prerequisites

- Python 3.10
- UV (`pip install uv`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   uv sync
   ```

### Running the server

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000/

### API Documentation

After starting the server, you can access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Docker

### Development

```bash
docker build -f Dockerfile.dev -t mathfluent-backend-dev .
docker run -p 8000:8000 -v $(pwd):/app mathfluent-backend-dev
```

### Production

```bash
docker build -f Dockerfile.prod -t mathfluent-backend .
docker run -p 8000:8000 mathfluent-backend
``` 