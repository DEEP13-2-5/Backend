import "dotenv/config";

const getopenrouterResponse = async (message) => {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    // Recommended by OpenRouter for rate limits and safety
    "HTTP-Referer": process.env.APP_URL || "http://localhost:5173/",
    "X-Title": process.env.APP_NAME || "SigmaGPT",
  };

  const preferredModel = process.env.OPENROUTER_MODEL || "arcee-ai/trinity-large-preview:free";
  const fallbackModel = process.env.OPENROUTER_FALLBACK_MODEL || "openrouter/auto";

  const buildBody = (model) => ({
    model: model,
    messages: [ { role: "user", content: message } ],
  });

  try {
    // First try preferred model
    let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(buildBody(preferredModel)),
    });

    // On 404/400, retry once with fallback model
    if (!response.ok && (response.status === 404 || response.status === 400)) {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify(buildBody(fallbackModel)),
      });
    }

    if (!response.ok) {
      let detail = "";
      try { detail = await response.text(); } catch {}
      throw new Error(`API error: ${response.status} ${detail}`);
    }

    const data = await response.json();
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error("Unexpected response structure");
    }
    return data.choices[0].message.content;
  } catch (err) {
    console.error("OpenRouter error:", err?.message || err);
    return null;
  }
};

export default getopenrouterResponse;