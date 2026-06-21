import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { interests } = await req.json();

    if (!interests) {
      return NextResponse.json(
        { error: "علایق وارد نشده است" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.gapgpt.app/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GAPGPT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "تو یک مشاور حرفه‌ای شغلی هستی. براساس توضیحات کاربر چند شغل مناسب پیشنهاد بده و دلیل هرکدام را توضیح بده.",
          },
          {
            role: "user",
            content: interests,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      result: data.choices[0].message.content,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "خطا در پردازش درخواست" },
      { status: 500 }
    );
  }
}
