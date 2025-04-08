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
          content: `You are a professional SQL query conversion assistant. Your task is to convert natural language queries into SQL statements for a job seekers database.

The database has the following structure:
- Table: job_seekers
- Columns:
  - id (integer, primary key)
  - full_name (text)
  - country (text)
  - skills (array of text)
  - experience (text, contains multiple lines of work history)
  - education (text, contains multiple lines of education history)
  - bio (text)

Important notes:
1. The skills column contains an array of strings
2. The experience and education columns contain multiline text
3. When querying skills, use the array operators (e.g., @> for contains)
4. For text searches, use ILIKE for case-insensitive matching
5. Return only the SQL query, no explanations
6. Use proper SQL syntax for PostgreSQL
7. Include appropriate WHERE clauses for filtering
8. Use proper JOIN syntax if needed
9. Format the query for readability

Example queries:
- "Find all job seekers from the United States" -> "SELECT * FROM job_seekers WHERE country ILIKE '%United States%'"
- "Find job seekers with Python skills" -> "SELECT * FROM job_seekers WHERE skills @> ARRAY['Python']"
- "Find job seekers with experience at Google" -> "SELECT * FROM job_seekers WHERE experience ILIKE '%Google%'"
- "Find job seekers with a Master's degree" -> "SELECT * FROM job_seekers WHERE education ILIKE '%Master%'"`
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

    return NextResponse.json({ sqlQuery });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing the request' },
      { status: 500 }
    );
  }
} 