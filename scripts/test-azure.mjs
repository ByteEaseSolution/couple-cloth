// Probes the Azure OpenAI endpoint two ways to figure out what shape is correct.
// Run: node scripts/test-azure.mjs

import { config } from "dotenv";
config({ path: ".env.local" });
import OpenAI, { AzureOpenAI } from "openai";

const RAW_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || "";
const API_KEY = process.env.AZURE_OPENAI_API_KEY || "";
const API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview";
const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

const baseEndpoint = RAW_ENDPOINT.replace(/\/openai\/v1\/?$/, "").replace(/\/+$/, "");

console.log("Configured endpoint:", RAW_ENDPOINT);
console.log("Bare resource URL  :", baseEndpoint);
console.log("Deployment         :", DEPLOYMENT);
console.log("API version        :", API_VERSION);
console.log();

async function tryAzureClient() {
  console.log("--- Test 1: AzureOpenAI client with bare endpoint (deployment routing) ---");
  try {
    const client = new AzureOpenAI({
      endpoint: baseEndpoint,
      apiKey: API_KEY,
      apiVersion: API_VERSION,
      deployment: DEPLOYMENT,
    });
    const r = await client.chat.completions.create({
      model: DEPLOYMENT,
      messages: [{ role: "user", content: "Say 'pong' and nothing else." }],
      max_tokens: 5,
    });
    console.log("OK ✓", r.choices[0]?.message?.content);
    return "azure";
  } catch (e) {
    console.log("FAIL ✗", e?.status || "", e?.message || e);
    return null;
  }
}

async function tryV1Client() {
  console.log("\n--- Test 2: OpenAI client with /openai/v1 baseURL (Foundry v1 unified) ---");
  const v1 = baseEndpoint + "/openai/v1";
  try {
    const client = new OpenAI({
      baseURL: v1,
      apiKey: API_KEY,
      defaultHeaders: { "api-key": API_KEY },
      defaultQuery: { "api-version": "preview" },
    });
    const r = await client.chat.completions.create({
      model: DEPLOYMENT,
      messages: [{ role: "user", content: "Say 'pong' and nothing else." }],
      max_tokens: 5,
    });
    console.log("OK ✓", r.choices[0]?.message?.content);
    return "v1";
  } catch (e) {
    console.log("FAIL ✗", e?.status || "", e?.message || e);
    return null;
  }
}

async function tryVisionAzure() {
  console.log("\n--- Test 3: AzureOpenAI vision with inline base64 (preferred) ---");
  try {
    const r0 = await fetch("https://picsum.photos/seed/duet/512/640");
    if (!r0.ok) throw new Error(`fetch failed: ${r0.status}`);
    const ct = r0.headers.get("content-type") || "image/jpeg";
    const b64 = Buffer.from(await r0.arrayBuffer()).toString("base64");
    const dataUrl = `data:${ct};base64,${b64}`;

    const client = new AzureOpenAI({
      endpoint: baseEndpoint,
      apiKey: API_KEY,
      apiVersion: API_VERSION,
      deployment: DEPLOYMENT,
    });
    const r = await client.chat.completions.create({
      model: DEPLOYMENT,
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "What's in this image? One word." },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      }],
      max_tokens: 10,
    });
    console.log("OK ✓", r.choices[0]?.message?.content);
  } catch (e) {
    console.log("FAIL ✗", e?.status || "", e?.message || e);
  }
}

const t1 = await tryAzureClient();
const t2 = await tryV1Client();
if (t1 || t2) await tryVisionAzure();
console.log("\nVerdict:", t1 ? "use AzureOpenAI client with bare endpoint" : t2 ? "use OpenAI client with /openai/v1 baseURL" : "neither worked — check key/region/deployment");
