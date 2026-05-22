export type AiProviderStatus = {
  mode: "LOCAL_RULES" | "AI_ENHANCED";
  provider: "local" | "openclaw" | "openai-compatible";
  model: string;
  configured: boolean;
};

type EnvLike = Record<string, string | undefined>;

export function getAiProviderStatus(env: EnvLike = process.env): AiProviderStatus {
  const provider = env.AI_PROVIDER?.toLowerCase() ?? "local";
  if (provider !== "openclaw") {
    return {
      mode: "LOCAL_RULES",
      provider: "local",
      model: "local-rules",
      configured: false
    };
  }

  const baseUrl = env.OPENCLAW_BASE_URL?.trim();
  const apiKey = env.OPENCLAW_API_KEY?.trim();
  const model = env.OPENCLAW_MODEL?.trim() || "gpt-5.5";

  if (!baseUrl || !apiKey) {
    return {
      mode: "LOCAL_RULES",
      provider: "local",
      model: "local-rules",
      configured: false
    };
  }

  return {
    mode: "AI_ENHANCED",
    provider: "openclaw",
    model,
    configured: true
  };
}

export async function createOpenClawChatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  env: EnvLike = process.env
) {
  const status = getAiProviderStatus(env);
  if (!status.configured || status.provider !== "openclaw") {
    return null;
  }

  const baseUrl = env.OPENCLAW_BASE_URL?.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENCLAW_API_KEY}`
    },
    body: JSON.stringify({
      model: status.model,
      messages,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}
