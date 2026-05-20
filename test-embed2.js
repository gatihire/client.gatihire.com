require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testEmbedding() {
  const apiKey = process.env.GEMINI_API_KEY;
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
      content: { parts: [{ text: "fleet manager in delhi" }] },
      output_dimensionality: 768
    }),
  });

  const json = await res.json();
  const values = json?.embedding?.values || [];
  console.log("Embedding length:", values.length);
  
  if (values.length > 0) {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const { data, error } = await supabase.rpc("match_candidates", {
      query_embedding: values,
      match_threshold: 0.22,
      match_count: 5
    });
    
    console.log("Matches:", data?.length, error);
    if (data?.length > 0) {
      console.log("Top match similarity:", data[0].similarity);
    }
  }
}

testEmbedding().catch(console.error);
