# Quiz Backend (NestJS)

## Description

Backend API for Quiz application built with NestJS, TypeORM, and PostgreSQL.

## Technologies

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript and JavaScript
- **PostgreSQL** - Relational database
- **TypeScript** - Type-safe JavaScript

## Installation
```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=test-quiz
```

## Running the app
```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Quizzes

- `GET /quizzes` - Get all quizzes
- `GET /quizzes/:id` - Get quiz by ID
- `POST /quizzes` - Create new quiz
- `DELETE /quizzes/:id` - Delete quiz

## Example Request

### Create Quiz
```bash
POST /quizzes
Content-Type: application/json

{
  "title": "JavaScript Basics Quiz",
  "description": "Basic JavaScript knowledge test",
  "questions": [
    {
      "type": "BOOLEAN",
      "questionText": "JavaScript is a typed language?",
      "correctAnswer": false
    },
    {
      "type": "INPUT",
      "questionText": "What keyword is used to declare a variable?",
      "correctText": "let"
    },
    {
      "type": "CHECKBOX",
      "questionText": "Which of these are JavaScript frameworks?",
      "options": [
        { "text": "React", "isCorrect": true },
        { "text": "Laravel", "isCorrect": false },
        { "text": "Vue", "isCorrect": true },
        { "text": "Django", "isCorrect": false }
      ]
    }
  ]
}
```
