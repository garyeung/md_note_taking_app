# Markdown Note-taking App
(https://roadmap.sh/projects/markdown-note-taking-app)  
A RESTful API  built with NestJS for managin notes with markdown support and grammar checking capabilities.

## Features
- Create and manage notes
- Upload markdown files
- Convert notes to HTML
- Grammar checking
- Error handling

## Prerequisites
- Node.js (latest)
- npm or yarn
- PostgreSQL database
- TypeScript
- A 3rd party grammar checker API

## Installation
```sh
git clone https://github.com/garyeung/md_note_taking_app.git 

cd md_note_taking_app/note_api 

npm install 
```
Creating your .env file according to the .env.example file

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## API Endpoints
### Notes
| Method | Endpoint | Description |
|---|---|---|
| POST | /notes | Create a new note
| GET |	/notes | Get all notes
| GET |	/notes/:id | Get a specific note
| GET |	/notes/:id/html | Get HTML rendered version of a note
| DELETE | /notes/:id |	Delete a note
| POST | /notes/upload | Upload a markdown file
| POST | /notes/check-grammar |	Check grammar in text 

## Request Examples
### Create a Note
```bash
POST /notes
Content-Type: application/json

{
    "title": "My Note",
    "content": "# Hello World"
}
```

### Upload a Markdown File
```bash
POST /notes/upload
Content-Type: multipart/form-data

file: your-markdown-file.md

```

### Check Grammar
```bash
POST /notes/check-grammar
Content-Type: application/json

{
    "text": "This is a sample text to check grammar."
}
```

## Response Format

All API responses follow this format:
```bash

{
    "success": boolean,
    "data": any
}
```


## Validation

- File uploads are limited to 5MB
- Only .md files are accepted for upload
- Note title and content are required fields

## Technical Stack

- NestJS - A progressive Node.js framework
- TypeScript - Programming language
- Zod - Schema validation
- Jest - Testing framework
- Multer - File upload handling
- Marked - Markdown to HTML conversion

## Project Structure
```stylus
src/
├── notes/
│   ├── notes.module.ts
│   ├── notes.entity.ts
│   ├── notes.controller.ts
│   ├── notes.controller.spec.ts
│   ├── notes.service.ts
│   ├── note.interface.ts
│   └── note.dto.ts
├── grammar/
│   ├── grammar.module.ts
│   ├── grammar.service.ts
│   ├── grammar.service.spec.ts
│   └── grammar.dto.ts
├── filters/
│   └── exception.filter.ts
├── pipes/
│   └── validation.pipe.ts
├── app.module.ts 
└── main.ts
```
## Mechanism
NestJS is a classic backend framework that uses modules and dependency injection concepts.

- Controllers are responsible for handling incoming requests and returning responses to the client and the routing functionality is included in the controller decorator.

- Providers are anything that can be injected as a dependency, including services, repositories, factories and helpers.

- Modules are the metadata that Nest uses to organise the application structure.

- Exception filters -- unified error response.

- Pipes -- for transforming input data into the desired form and evaluating the input data.
