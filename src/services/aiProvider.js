function trimSlash(url) {
  return (url || "").trim().replace(/\/$/, "");
}

export async function listOllamaModels(url) {
  const base = trimSlash(url) || "http://localhost:11434";
  const res = await fetch(`${base}/api/tags`);
  if (!res.ok) throw new Error(`Ollama respondio ${res.status}`);
  const data = await res.json();
  return (data.models || []).map((entry) => entry.name).filter(Boolean);
}

export async function generateWithOllama({ url, model }, messages) {
  const base = trimSlash(url) || "http://localhost:11434";
  if (!model) throw new Error("Falta elegir un modelo de Ollama.");
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama respondio ${res.status}`);
  const data = await res.json();
  const text = data.message?.content?.trim();
  if (!text) throw new Error("Ollama no devolvio texto.");
  return text;
}

export async function generateWithOpenAI({ apiKey, model }, messages) {
  if (!apiKey) throw new Error("Falta la API key de OpenAI.");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      messages,
      temperature: 0.4,
      max_tokens: 150,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message || `OpenAI respondio ${res.status}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI no devolvio texto.");
  return text;
}

export function resolveAIProvider(aiConfig) {
  if (!aiConfig) return null;
  if (aiConfig.provider === "ollama" || aiConfig.provider === "openai") return aiConfig.provider;
  if (aiConfig.provider === undefined) return "ollama";
  return null;
}

export async function generateWithAI(aiConfig, messages) {
  const provider = resolveAIProvider(aiConfig);
  if (!provider) throw new Error("No hay proveedor de IA configurado.");
  if (provider === "ollama") return generateWithOllama(aiConfig.ollama || {}, messages);
  if (provider === "openai") return generateWithOpenAI(aiConfig.openai || {}, messages);
  throw new Error("Proveedor de IA desconocido.");
}
