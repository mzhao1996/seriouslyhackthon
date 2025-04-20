// /app/api/webhook/route.ts
// /app/api/webhook/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { event, data } = await req.json();

    if (event !== "call.completed") {
      return NextResponse.json({ message: "Ignored" }, { status: 200 });
    }

    const { transcript, metadata } = data;
    const email = metadata?.email;

    if (!transcript || !email) {
      return NextResponse.json({ error: "Missing transcript or email" }, { status: 400 });
    }

    const summaryPrompt = `
Summarize this call in a professional note. Highlight key discussion points, any decisions made, and questions asked.

Transcript:
${transcript}
`;

    const scriptPrompt = `
Turn the following transcript into a natural-sounding, readable conversation script.
Use labels like "User:" and "AI:" and keep it clear and easy to follow.

Transcript:
${transcript}
`;

    const [summaryRes, scriptRes] = await Promise.all([
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: summaryPrompt }],
        }),
      }),
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: scriptPrompt }],
        }),
      }),
    ]);

    const summaryData = await summaryRes.json();
    const scriptData = await scriptRes.json();

    const summary = summaryData.choices[0].message.content;
    const script = scriptData.choices[0].message.content;

    const emailRes = await resend.emails.send({
      from: "AI Assistant <ai@yourdomain.com>", // replace this domain, used resend api key
      to: email,
      subject: "Your AI Call Summary & Script",
      text: `Call Summary:\n\n${summary}\n\nFull Script:\n\n${script}`,
    });

    return NextResponse.json({ success: true, emailRes });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json({ error: "Webhook failure" }, { status: 500 });
  }
}

// need update this api to the simple ai website/console/terminal
//https://domain.com/api/webhook