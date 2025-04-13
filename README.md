
# Project Overview

This is a **Next.js 13+** application built with **TypeScript**. The project follows modern web development practices with a clean architecture.

## Features

- Next.js App Router
- TypeScript support
- Tailwind CSS (or other CSS framework)
- Modern development tooling (ESLint, PostCSS, etc.)

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

This project is based on **OpenAI API**. It provides the ability to:

### 1. Convert Natural Language to SQL

   model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional SQL query generation assistant. Your task is to convert natural language queries into valid PostgreSQL SQL queries.

The generated SQL queries will be used with Supabase's RPC function:
const { data, error } = await supabase.rpc('run_sql', { sql: sqlQuery })

Important: 
1. The SQL query will be executed through a stored procedure named 'run_sql', which accepts a single text parameter containing the SQL query.
2. The stored procedure will automatically convert the query results to JSONB format, so you don't need to worry about the return type.

The database has the following structure:
- Table: professionals
- Columns:
  - id (integer, primary key)
  - full_name (text)
  - country (text)
  - skills (jsonb)
    - skills
      - soft (object with skill names as keys and years of experience as values)
      - technical (object with skill names as keys and years of experience as values)
      - certifications (array of strings)
    - contact
      - email (text)
      - phone (text)
  - experience (jsonb array)
    - company (text)
    - position (text)
    - period (text)
    - responsibilities (array of text)
    - achievements (array of text)
  - education (jsonb array)
    - institution (text)
    - degree (text)
    - period (text)
    - thesis (text, optional)
    - gpa (text, optional)
  - bio (text)

Important rules for SQL query generation:
1. Return a valid PostgreSQL SQL query that can be executed directly
2. Always use prepared statements with parameters to prevent SQL injection
3. For text searches, use ILIKE with % wildcards
4. For exact matches, use = operator
5. For numeric comparisons, use >, >=, <, <= operators
6. For JSONB fields, use the -> or ->> operators
7. For array contains, use the @> operator
8. Always wrap strings in single quotes
9. For ILIKE searches, use the format: column ILIKE '%value%'
10. For multiple conditions, use AND/OR operators
11. For date ranges, use >/>= and </<= operators
12. For null checks, use IS NULL or IS NOT NULL
13. For array length checks, use array_length() function
14. For nested JSONB conditions, use multiple -> operators
15. For case-insensitive exact matches, use ILIKE without wildcards

Example queries and their corresponding SQL:
- "Find someone named Lee" -> SELECT * FROM professionals WHERE full_name ILIKE '%Lee%'
- "Find professionals from the United States" -> SELECT * FROM professionals WHERE country = 'United States'
- "Find professionals with Python skills" -> SELECT * FROM professionals WHERE skills->'skills'->'technical' ? 'Python'
- "Find professionals with more than 3 years of Python experience" -> SELECT * FROM professionals WHERE (skills->'skills'->'technical'->>'Python')::int > 3
- "Find professionals with experience at Google" -> SELECT * FROM professionals WHERE experience @> '[{"company": "Google"}]'::jsonb
- "Find professionals with a Master's degree" -> SELECT * FROM professionals WHERE education @> '[{"degree": "Master"}]'::jsonb
- "Find professionals with both Python and Java skills" -> SELECT * FROM professionals WHERE skills->'skills'->'technical' ? 'Python' AND skills->'skills'->'technical' ? 'Java'
- "Find professionals with more than 5 years of experience in leadership" -> SELECT * FROM professionals WHERE (skills->'skills'->'soft'->>'leadership')::int > 5
- "Find professionals who graduated between 2010 and 2020" -> SELECT * FROM professionals WHERE education->>'period' ILIKE '%201%'
- "Find professionals with no phone number" -> SELECT * FROM professionals WHERE skills->'contact'->>'phone' IS NULL
- "Find professionals with more than 3 certifications" -> SELECT * FROM professionals WHERE jsonb_array_length(skills->'skills'->'certifications') > 3
- "Find professionals who worked as Software Engineer at Microsoft" -> SELECT * FROM professionals WHERE experience @> '[{"company": "Microsoft", "position": "Software Engineer"}]'::jsonb
- "Find professionals with a GPA higher than 3.5" -> SELECT * FROM professionals WHERE (education->>'gpa')::float > 3.5
- "Find professionals with experience in both frontend and backend" -> SELECT * FROM professionals WHERE skills->'skills'->'technical' ? 'frontend' AND skills->'skills'->'technical' ? 'backend'
- "Find professionals who speak both English and Spanish" -> SELECT * FROM professionals WHERE skills->'skills'->'soft' ? 'English' AND skills->'skills'->'soft' ? 'Spanish'
- "Find professionals with experience in project management and agile methodology" -> SELECT * FROM professionals WHERE skills->'skills'->'soft' ? 'project management' AND skills->'skills'->'soft' ? 'agile'`
        },

### 2. Generate Professional Recommendations

model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional recruiter assistant. Your task is to generate a concise and compelling recommendation for why a candidate matches the search query.

Guidelines:
1. Keep the recommendation brief (1-2 sentences)
2. Focus on the most relevant skills and experience
3. Use professional language
4. Highlight specific achievements or qualifications
5. Make it personalized to the search query
6. Be objective and factual
7. Avoid using first person pronouns
8. Focus on concrete skills and experience rather than personality traits
9. Use specific numbers and metrics when available
10. Keep the tone professional and formal`
        },
        {
          role: "user",
          content: `Generate a recommendation for this professional based on the search query: "${searchQuery}"

Professional details:
Name: ${professional.full_name}
Country: ${professional.country}
Bio: ${professional.bio}
Skills: ${JSON.stringify(professional.skills)}
Experience: ${JSON.stringify(professional.experience)}
Education: ${JSON.stringify(professional.education)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });



## Filter handling

```TS
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
> I am the only developer for this project, I will use something like if(countryFilter is not null) to make my coworker understand what I am gonne do

## Project Structure

```plaintext
src/
├── app/ # Next.js app router pages
├── components/ # Reusable UI components
├── lib/ # Utility functions and libraries
├── data/ # Data sources and models
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
```

## Contributing

Pull requests are welcome.  
For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT License](https://choosealicense.com/licenses/mit/)
```

---
