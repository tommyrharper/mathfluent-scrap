# MathFluent Backend

Backend API for the MathFluent application.

## Development Setup

This project uses UV for Python package management.

### Prerequisites

- Python 3.10
- UV (`pip install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`)

### Installation

1. Clone the repository
2. Set up a virtual environment and install dependencies with UV:
   ```bash
   cd backend
   uv sync
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

### Running the server

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000/

### Adding New Dependencies

To add new dependencies with UV:

```bash
uv add package_name
```

To update the pyproject.toml file after adding dependencies:

```bash
uv lock
uv sync
```

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