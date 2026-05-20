require('do.env.local').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testEmbedding() {
  const apiKey = process.env.local.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No API key");

  const model = "gemini-embedding-001";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      model: `models/${model}`,
      content: { parts: [{ text: "fleet manager" }] },
      output_dimensionality: 768
    }),
  });

  const json = await res.json();
  console.log("Status:", res.status);
  console.log("Embedding length:", json?.embedding?.values?.length);
  if (res.status !== 200) console.log(json);
}

testEmbedding().catch(console.error);
