// /app/api/call-by-ai/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { professional, details, type } = await req.json();

    const phone = professional?.skills?.skills?.contact?.phone;
    const name = professional?.full_name;
    const summary = details?.summary;
    const questions = details?.questions;
    const email = details?.email;

    if (type === 'fake') {
      return NextResponse.json({ success: true, message: "mock call", callId: "1234567890" }, { status: 200 });
    }
    else {



    if (!professional || !details || !type || !summary || !questions || !email || !phone) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const contextPrompt = `The caller's information include: ${summary}. They have the following questions: ${questions} to the talent with the phone number: ${phone} named ${name}.`;

    const response = await fetch("https://api.simpleai.dev/v1/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SIMPLE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: process.env.SIMPLE_AI_AGENT_ID,
        phone_number: phone,
        context: contextPrompt,
        metadata: {
          email,
          professionalId: professional.id,
        },
      }),
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Call successfully initiated.",
      callId: result.id,
    });
}
  } catch (error) {
    console.error("Call initiation failed:", error);
    return NextResponse.json({ error: "Call failed" }, { status: 500 });
  }
}