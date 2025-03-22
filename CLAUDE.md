# CLAUDE.md - Einsum Trainer Project Guidelines

## Build & Test Commands
- Project Setup: `npm install` (or `yarn install`)
- Run Development Server: `npm run dev` (or `yarn dev`)
- Run Tests: `npm test` (or `yarn test`)
- Run Single Test: `npm test -- -t "test name"` (or `yarn test -t "test name"`)
- Lint Code: `npm run lint` (or `yarn lint`)
- Type Check: `npm run typecheck` (or `yarn tsc`)

## Code Style Guidelines
- **Formatting**: Use Prettier with default settings
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Imports**: Group imports (React, third-party, local) with blank line between groups
- **Types**: Use TypeScript with explicit return types on exported functions
- **Error Handling**: Use try/catch blocks with specific error messages
- **Components**: Prefer functional components with hooks over class components
- **State Management**: Use React hooks (useState, useContext) for component state

## Project Structure
This is an interactive educational app for teaching Einstein Summation (Einsum) concepts through adaptive quizzes and visual feedback. The app features dynamic difficulty adjustment, personalized learning paths, and gamification elements.