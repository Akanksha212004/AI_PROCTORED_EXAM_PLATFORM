import { NextResponse } from "next/server";

// Server-side Global Cache (Taaki duplicate Sarvam API calls save ho jayein)
const translationCache = new Map<string, string>();

export async function POST(req: Request) {
  let originalText = "";
  try {
    const { text, targetLang } = await req.json();

    // 1. Agar English hai ya text empty hai, toh direct wahi wapas kar do
    if (!text || targetLang === "en" || targetLang === "en-IN") {
      return NextResponse.json({ translatedText: text });
    }

    // 2. Target language code ko Sarvam format me banao (e.g., "hi" -> "hi-IN")
    const langCode = targetLang.includes("-") ? targetLang : `${targetLang}-IN`;
    const cacheKey = `${text.trim().toLowerCase()}_${langCode}`;

    // 3. Agar Cache me pehle se translate ho chuka hai, toh instant return karo (0ms)
    if (translationCache.has(cacheKey)) {
      return NextResponse.json({ translatedText: translationCache.get(cacheKey) });
    }

    // 4. Sarvam AI API ko call karo
    const response = await fetch("https://api.sarvam.ai/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": process.env.SARVAM_API_KEY!,
      },
      body: JSON.stringify({
        input: text,
        source_language_code: "en-IN",
        target_language_code: langCode,
      }),
    });

    const data = await response.json();
    const translatedText = data.translated_text || text;

    // 5. Naye word ko cache me store kar lo
    translationCache.set(cacheKey, translatedText);

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Auto-Translate Error:", error);
    return NextResponse.json({ translatedText: originalText }); // Fallback to original
  }
}