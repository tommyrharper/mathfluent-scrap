# Review Page Prompt

Here are instructions to add a review page to the application. It should be visually appealing.

# Overview & Goals

- Update to a responsive “Questions → Review → Complete” workflow for math questions.

# Frontend

## Features

### Question Page

After the second question is complete, the user should go to the review page.

### Review Page

1. Table:
   - Columns: Question | Answer (thumbnail) | Correct | Confirm Toggle.
   - Toggle Logic: Invert `Correct` value when confirm is off.

2. Complete Button:
   - POST to `/api/submit-results` with payload:
     ```json
     {
       "questions": ["sin(2θ) = ?", ...],
       "answers": ["base64-img1", ...],
       "is_correct": [true, ...] // Adjusted by toggles
     }
     ```

# Backend

## Features

Add a new endpoint for when the users submits their results.

1. `/submit-results` (POST):
   - Validate payload.
   - Simulate Hugging Face upload (log to console).
   - (Future) Add auth headers for Hugging Face API.
