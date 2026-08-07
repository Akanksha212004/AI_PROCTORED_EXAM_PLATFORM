"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";

// Browser-side micro-cache taaki tab switch karne pe API dobara na chale
const clientCache = new Map<string, string>();

export function useAutoTranslate(text: string | undefined | null) {
  const { language } = useI18n(); // e.g., "hi-IN", "te-IN", "en"
  const [translatedText, setTranslatedText] = useState<string>(text || "");

  useEffect(() => {
    if (!text) return;

    // Agar English hai toh direct original text
    const currentLang = language?.split("-")[0] || "en";
    if (currentLang === "en") {
      setTranslatedText(text);
      return;
    }

    const cacheKey = `${text}_${currentLang}`;
    if (clientCache.has(cacheKey)) {
      setTranslatedText(clientCache.get(cacheKey)!);
      return;
    }

    // API Route call karo
    let isMounted = true;
    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang: currentLang }),
    })
      // .then((res) => res.json())
      // .then((data) => {
      //   if (isMounted && data.translatedText) {
      //     clientCache.set(cacheKey, data.translatedText);
      //     setTranslatedText(data.translatedText);
      //   }
      // })
      // .catch(() => {
      //   if (isMounted) setTranslatedText(text);
      // });

      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.translatedText) {
          // 🛡️ Student_X aur Examiner_X ko kisi bhi language me translate hone se roko:
          let cleanText = data.translatedText
            .replace(/छात्र[ _]?(\d+)/gi, "Student_$1")
            .replace(/परीक्षक[ _]?(\d+)/gi, "Examiner_$1");

          clientCache.set(cacheKey, cleanText);
          setTranslatedText(cleanText);
        }
      })
      .catch(() => {
        if(isMounted) setTranslatedText(text);
      });

    return () => {
      isMounted = false;
    };
  }, [text, language]);

  return translatedText;
}