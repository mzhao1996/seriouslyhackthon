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
          content: `You are a professional SQL query conversion assistant. Your task is to convert natural language queries into SQL statements for a professionals database.

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

Important notes:
1. The skills column is a JSONB object with nested structure
2. The experience and education columns are JSONB arrays
3. When querying skills, use JSONB operators (e.g., ->, ->>, @>)
4. For text searches, use ILIKE for case-insensitive matching
5. Return only the SQL query, no explanations
6. Use proper SQL syntax for PostgreSQL
7. Include appropriate WHERE clauses for filtering
8. Use proper JOIN syntax if needed
9. Format the query for readability

Example queries:
- "Find all professionals from the United States" -> "SELECT * FROM professionals WHERE country ILIKE '%United States%'"
- "Find professionals with Python skills" -> "SELECT * FROM professionals WHERE skills->'skills'->'technical' ? 'Python'"
- "Find professionals with more than 3 years of Python experience" -> "SELECT * FROM professionals WHERE (skills->'skills'->'technical'->>'Python')::int > 3"
- "Find professionals with experience at Google" -> "SELECT * FROM professionals WHERE experience @> '[{\"company\": \"Google\"}]'"
- "Find professionals with a Master's degree" -> "SELECT * FROM professionals WHERE education @> '[{\"degree\": \"Master\"}]'"`
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
    console.log("looooooooooooooooooooook here", sqlQuery);

    return NextResponse.json({ sqlQuery });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing the request' },
      { status: 500 }
    );
  }
} 