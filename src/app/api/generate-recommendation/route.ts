import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { professional, searchQuery } = await req.json();

    if (!professional || !searchQuery) {
      return NextResponse.json(
        { error: 'Please provide both professional data and search query' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
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

    const recommendation = completion.choices[0].message.content;
    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating the recommendation' },
      { status: 500 }
    );
  }
} 