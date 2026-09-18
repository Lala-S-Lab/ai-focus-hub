# AI Focus Hub

Build a modern, responsive AI Workplace Productivity Assistant with a professional SaaS-style interface using black, navy, and white.

AI Features

1. Meeting Notes AI

User pastes meeting notes.

AI generates a summary, key points, action items, decisions, and deadlines.

All results must be dynamically AI-generated from the user's input, never generic or pre-written.

AI output must be editable.

2. AI Task Planner

User enters tasks, priorities, and deadlines.

AI generates a personalized daily or weekly schedule.

AI prioritizes tasks based on the user's provided information.

Results must be dynamically AI-generated, not static examples.

Generated schedule must be editable.

3. AI Research Assistant

User enters a research topic, pastes text, or provides a website/article URL.

AI generates a summary, key insights, recommendations, and important findings based on the provided content.

All responses must be dynamically AI-generated from the user's input.

AI output must be editable.

Dashboard & UI

Modern dashboard with cards showing the three AI tools.

Sidebar navigation: Dashboard, Meeting Notes, Task Planner, Research Assistant.

Responsive desktop, tablet, and mobile design.

Clean black, navy, and white theme.

Professional text areas, buttons, cards, loading states, and error messages.

Include clear "Generate with AI" actions.

AI Requirements

Use structured AI prompts for each feature.

Never return generic placeholder responses when the user submits information.

AI responses must be relevant to the specific user input.

Show a loading state while AI is generating the response.

Handle empty, invalid, or unsupported inputs with clear messages.

Technical Constraints

Frontend only. No backend.

Do not create authentication, databases, or persistent storage.

Do not save user information or AI results.

Data only exists temporarily during the current session.

Include a visible Responsible AI Disclaimer: "AI-generated content may contain errors. Always review and verify AI outputs before using them for important workplace decisions."

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/22e8abf7-5e36-4866-b22b-7c9b7944d769).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
