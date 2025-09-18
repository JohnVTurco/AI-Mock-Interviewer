# AI-Mock-Interviewer

An AI assistant to conduct mock technical interviews

## Features

- Left Panel: Code editor (powered by CodeMirror)

- Right Panel: AI Assistant

- Random Algorithm/Design Question Generator: Get random coding questions

- Configurable Timer: Default set to 45 minutes

- AI Feedback: Evaluate your solution and get real-time AI feedback

## Tech Stack

- Next.js + TypeScript

- Tailwind CSS v4 (via @tailwindcss/postcss)

- CodeMirror (@uiw/react-codemirror)

- OpenAI Responses API (official OpenAI SDK)

## Getting Started

### Install Dependencies

Run the following command to install all required packages:

`npm install`

## Set Up Environment Variables

### Create a file named .env.local at the project root (do not commit this file):

`OPENAI_API_KEY=sk-your-key-here`


## Tailwind Setup (v4)

### Install the PostCSS plugin:

`npm i -D @tailwindcss/postcss`


## Run the Project

### Start the development server:

`npm run dev`


Open your browser and go to http://localhost:3000
