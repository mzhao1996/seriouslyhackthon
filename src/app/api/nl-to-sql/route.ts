import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Please provide a query' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional SQL query generation assistant. Your task is to convert natural language queries into valid PostgreSQL SQL queries.

The generated SQL queries will be used directly with Supabase's Edge Functions through the invoke method:
const { data, error } = await supabase.functions.invoke('run-sql', {
  body: { sql: sqlQuery }
})

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
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const sqlQuery = completion.choices[0].message.content;
    console.log('Generated SQL Query:', sqlQuery);

    return NextResponse.json({ sqlQuery });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing the request' },
      { status: 500 }
    );
  }
} 