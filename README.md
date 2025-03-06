# MathFluent [![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/sindresorhus/awesome)


<p align="center">
  <div style="background-color: #012c4e; width: 100%; padding: 20px; text-align: center;">
    <img src="logo.webp" alt="MathFluent Logo" width="150" height="150">
  </div>
</p>

A responsive math learning application with a "Question → Question" workflow for math questions.

## Table of Contents

- [Overview](#overview)
- [How to Use](#how-to-use)
- [License](#license)

## Overview

MathFluent is a full-stack application built with Next.js and FastAPI that allows users to:
- Answer math questions by drawing on a canvas
- Submit answers for automatic checking
- Progress through a sequence of questions

## How to Use

### Development

1. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will be available at http://localhost:3000

2. **Backend** (using UV):
   ```bash
   cd backend
   # Create and activate virtual environment
   uv sync
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   # Install dependencies
   # Run the server
   uvicorn app.main:app --reload
   ```
   Backend will be available at http://localhost:8000

### Production

Build and run with Docker:
```bash
docker-compose -f docker-compose.prod.yml up
```

## License

MIT © MathFluent
