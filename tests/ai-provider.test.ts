import { describe, expect, it } from "vitest";
import { getAiProviderStatus } from "@/lib/ai-provider";

describe("getAiProviderStatus", () => {
  it("falls back to local rules when OpenClaw configuration is incomplete", () => {
    expect(getAiProviderStatus({ AI_PROVIDER: "openclaw", OPENCLAW_MODEL: "gpt-5.5" })).toEqual({
      mode: "LOCAL_RULES",
      provider: "local",
      model: "local-rules",
      configured: false
    });
  });

  it("reports AI enhanced mode when OpenClaw compatible env vars are present", () => {
    expect(
      getAiProviderStatus({
        AI_PROVIDER: "openclaw",
        OPENCLAW_BASE_URL: "https://openclaw.example/v1",
        OPENCLAW_API_KEY: "test-key",
        OPENCLAW_MODEL: "gpt-5.5"
      })
    ).toMatchObject({
      mode: "AI_ENHANCED",
      provider: "openclaw",
      model: "gpt-5.5",
      configured: true
    });
  });
});
