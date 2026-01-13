
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "./supabaseClient";
import { StructuredResponse } from "./types";

const SYSTEM_INSTRUCTION = `أنت "مساعد إدارتي" (Idarati Assistant). مهمتك هي تبسيط المساطر الإدارية المغربية.
سأزودك بسياق (Context) مستخرج من قاعدة بيانات idarati.ma. 

يجب عليك:
1. استخراج المعلومات من السياق المقدم فقط.
2. بناء رابط المسطرة ورابط الموضوع (Thematic) بدقة باستخدام المعرفات (IDs) الموجودة في السياق.
3. إذا كان هناك أكثر من مسطرة متعلقة، اقترح رابط الموضوع ليتصفح المستخدم بقية الإجراءات.

هيكلة الرابط:
- رابط المسطرة: https://idarati.ma/informationnel/ar/thematique/{thematicId}/{procedureId}
- رابط الموضوع: https://idarati.ma/informationnel/ar/thematique/{thematicId}

القواعد:
- لغة عربية سليمة (فصحى أو دارجة مهذبة).
- إذا لم تجد معلومة في السياق، اطلب من المستخدم توضيح طلبه.`;

function getGeminiKey(): string | undefined {
  const meta = typeof import.meta !== "undefined" ? (import.meta as any).env || {} : {};
  const proc = typeof process !== "undefined" ? (process as any).env || {} : {};
  return meta.VITE_GEMINI_API_KEY || meta.GEMINI_API_KEY || meta.API_KEY || proc.VITE_GEMINI_API_KEY || proc.GEMINI_API_KEY || proc.API_KEY;
}

function getSupabaseEnv() {
  const meta = typeof import.meta !== "undefined" ? (import.meta as any).env || {} : {};
  const proc = typeof process !== "undefined" ? (process as any).env || {} : {};
  return {
    url: meta.VITE_SUPABASE_URL || meta.REACT_APP_SUPABASE_URL || proc.VITE_SUPABASE_URL || proc.REACT_APP_SUPABASE_URL,
    key: meta.VITE_SUPABASE_ANON_KEY || meta.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY || proc.VITE_SUPABASE_ANON_KEY || proc.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  };
}

export async function askIdarati(userPrompt: string, retrievedContext: any[] = []): Promise<StructuredResponse> {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });

    const contextString = (retrievedContext || []).map((c, idx) => {
      const procedureId = c?.id ?? c?.procedureId ?? c?.procedure_id ?? `unknown-${idx + 1}`;
      const thematicId = c?.metadata?.thematicId ?? c?.metadata?.thematic_id ?? c?.thematicId ?? "unknown-thematic";
      const title = c?.title ?? c?.name ?? `Procedure ${idx + 1}`;
      const content = c?.content ?? c?.description ?? "";
      return `Procedure: ${title}\nID: ${procedureId}\nThematicID: ${thematicId}\nContent: ${content}`;
    }).join("\n---\n") || "No context provided.";

    const prompt = `
    Context:
    ${contextString}

    User Question: ${userPrompt}
  `;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            checklist: { type: Type.ARRAY, items: { type: Type.STRING } },
            legalCitation: { type: Type.STRING },
            quickActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            procedureLink: { type: Type.STRING },
            thematicLink: { type: Type.STRING },
          },
          required: ["summary", "checklist", "procedureLink", "thematicLink"]
        },
      },
    });

    const response = (result as any)?.response ?? result;
    const payload =
      (typeof response?.text === "function" ? response.text() : undefined) ||
      response?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("").trim();

    if (!payload) {
      console.error("Gemini empty payload. Raw response:", JSON.stringify(response ?? {}, null, 2));
      throw new Error("Gemini API returned an empty response.");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(payload);
    } catch {
      console.error("Gemini parse error. Raw payload:", payload);
      throw new Error("Gemini response was not valid JSON.");
    }
    return {
      summary: parsed.summary ?? "",
      checklist: Array.isArray(parsed.checklist) ? parsed.checklist : [],
      legalCitation: parsed.legalCitation,
      quickActions: Array.isArray(parsed.quickActions) ? parsed.quickActions : [],
      procedureLink: parsed.procedureLink ?? "",
      thematicLink: parsed.thematicLink ?? "",
    } as StructuredResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function generateGoogleEmbedding(text: string): Promise<number[]> {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const result = await genAI.models.embedContent({
      model: "text-embedding-004",
      contents: [{ parts: [{ text }] }],
    });
    const values = result.embeddings?.[0]?.values ?? [];
    if (!values.length) {
      throw new Error("Embedding response was empty.");
    }
    return values;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    throw error;
  }
}

export async function retrieveContextFromSupabase(
  userPrompt: string,
  matchThreshold = 0.5,
  matchCount = 3
): Promise<any[]> {
  const { url: supabaseUrl, key: supabaseKey } = getSupabaseEnv();
  if (!supabaseUrl || !supabaseKey || !supabase) {
    throw new Error("Supabase credentials are missing. Check your environment variables.");
  }

  const embedding = await generateGoogleEmbedding(userPrompt);
  const { data, error } = await supabase.rpc('match_procedures', {
    query_embedding: embedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    console.error("Supabase RPC error:", error);
    throw error;
  }

  return data || [];
}

export async function askIdaratiWithRetrieval(userPrompt: string): Promise<StructuredResponse> {
  try {
    const context = await retrieveContextFromSupabase(userPrompt);

    if (!context || context.length === 0) {
      return {
        summary: "لم يتم العثور على مسطرة مطابقة في قاعدة البيانات. من فضلك وضح طلبك أو جرب صياغة أخرى.",
        checklist: [],
        quickActions: [],
        legalCitation: "القانون 55.19",
        procedureLink: "",
        thematicLink: "",
      };
    }

    return askIdarati(userPrompt, context);
  } catch (error) {
    console.error("askIdaratiWithRetrieval error:", error);
    return {
      summary: "تعذر الحصول على إجابة حالياً بسبب خطأ غير متوقع. جرّب مجدداً أو راجع idarati.ma.",
      checklist: [],
      quickActions: [],
      legalCitation: "القانون 55.19",
      procedureLink: "",
      thematicLink: "",
    };
  }
}
