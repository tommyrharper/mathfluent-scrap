# Bootstrap Prompt

Create a clean, minimal full-stack app (Next.js + FastAPI) with industry best practices, prioritizing maintainability and scalability. Below are detailed requirements, including architecture, testing, and deployment guidelines. It should be visually appealing.

# Overview & Goals

- A responsive "Question 1 → Question 2" workflow for math questions.
- Store and validate drawings (canvas base64) in a mock correctness flow.
- Future-proof design for potential database/auth integrations.

# README.md structure
Maintain the following structure in the README.md file:
  1. Title and Awesome badge
  2. Logo
  3. Short description
  5. Table of Contents
  6. How to Use section
  8. License section

# Frontend

## Tech Stack

- **Next.js** PWA with TypeScript.
  - Do not use server side rendering
- **Tailwind CSS** for styling (modern, responsive design).
- **React Query** for API state management.
- **Jest** + **React Testing Library** for unit tests.
- **Docker**:
  - Separate `Dockerfile.dev` (Node.js + hot reload) and `Dockerfile.prod` (multi-stage build with NGINX).
  - `docker-compose.yml` for local development.

## Design Requirements

- Ipad-first, responsive layout.
- Use KaTeX with SSR for math rendering (e.g., `sin(2θ)`).
- Smooth transitions between questions/review pages.

## Features

### Question Page

1. Display `sin(2θ) = ?` centered using KaTeX.
2. Canvas:
   - Allow drawing the response on the page using a canvas.
   - Save drawings as base64 PNG in React state.
3. Submit Button:
   - POST image to `/api/check-answer` (mock correctness: `true`).
   - Handle loading/error states.
4. Dynamic Questions:
   - After submission, show `cos(2θ) = ?` (hardcoded for now).

# Backend

## Tech Stack

- **FastAPI** with Python 3.10.
- **UV** for dependency management.
- **Pydantic** for request validation.
- **PostgreSQL** for future-proofing (ignored for now).
- **Docker**:
  - Separate `Dockerfile.dev` (hot reload) and `Dockerfile.prod`.
  - Integrate with frontend via `docker-compose.prod.yml`.

## Features

1. `/check-answer` (POST):
   - Accept image (base64).
   - Return `{ "is_correct": true }` (mock logic).

## Security

- Enable CORS for frontend origin.
- Environment variables for secrets (e.g., `HF_TOKEN`).

# Instructions

1. **Development**:
   - Frontend: `npm run dev` (port 3000).
   - Backend: `uvicorn app:app --reload` (port 8000).
2. **Production**:
   - Build with `docker-compose -f docker-compose.prod.yml up`.
   - Frontend served via NGINX (port 80).
   - Backend on port 8000 (reverse-proxy via NGINX).

# Deliverables

1. Minimal MVP with mocked correctness.
2. Clear documentation for setup, env vars, and testing.
3. Example `.env` file template.
