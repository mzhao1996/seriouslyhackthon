# Project Overview

This is a **Next.js 13+** application built with **TypeScript**. The project follows modern web development practices with a clean architecture.

## Features

- Next.js App Router
- TypeScript support
- Tailwind CSS (or other CSS framework)
- Modern development tooling (ESLint, PostCSS, etc.)
- AI-powered phone call capability with automatic email summaries

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

### Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

### Building for Production

To build the application:

```bash
npm run build
# or
yarn build
```

## AI Integration

This project is based on **OpenAI API** and **Simple AI**. It provides the ability to:

### 1. Convert Natural Language to SQL

(model: `gpt-3.5-turbo`) — Convert user queries into PostgreSQL syntax to search through a professionals database.

### 2. Generate Professional Recommendations

(model: `gpt-3.5-turbo`) — Create personalized recommendation summaries based on profile data.

### 3. Make AI Phone Calls & Generate Summaries

Using **Simple AI**, this app can:
- Initiate phone calls to professionals
- Provide the AI caller with a summary and questions
- Receive the **transcript** of the call via webhook
- Automatically generate:
  - A professional summary of the call
  - A readable script version
- Use **Resend** to email both results to the user's email address

### Example Webhook Flow
1. `Simple AI` calls `/api/webhook` with `event: 'call.completed'`
2. Your server uses OpenAI to:
   - Summarize the transcript
   - Format it as a dialogue script
3. The result is emailed to the user using **Resend API**

## Filter Handling

```ts
let sqlQuerybuilder = searchQuery;

if (countryFilter && skillFilter) {
  sqlQuerybuilder = (searchQuery || "I want to find a Professional") + " lived in " + countryFilter + " and has " + skillFilter + " skills";
} else if (countryFilter) {
  sqlQuerybuilder = (searchQuery || "I want to find a Professional") + " lived in " + countryFilter;
} else if (skillFilter) {
  sqlQuerybuilder = (searchQuery || "I want to find a Professional") + " has " + skillFilter + " skills";
}
```

> **Note:**  
> I am the only developer for this project, I will use something like `if (countryFilter != null)` to make my coworker understand what I am gonna do

## Project Structure

```plaintext
src/
├── app/            # Next.js app router pages
├── components/     # Reusable UI components
├── lib/            # Utility functions and libraries
├── data/           # Data sources and models
```

## Configuration Files

- `next.config.ts` — Next.js configuration
- `tsconfig.json` — TypeScript configuration
- `postcss.config.mjs` — PostCSS configuration
- `eslint.config.mjs` — ESLint configuration

## Environment Variables

Create a `.env.local` file and add your environment variables:

```env
NEXT_PUBLIC_API_URL=your_api_url_here
OPENAI_API_KEY=your_openai_api_key
RESEND_API_KEY=your_resend_api_key
```

## Contributing

Pull requests are welcome.  
For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT License](https://choosealicense.com/licenses/mit/)

