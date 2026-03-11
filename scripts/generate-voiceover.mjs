#!/usr/bin/env node
/**
 * Generate voiceover clips for the Datost demo video using ElevenLabs TTS.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=sk-... node scripts/generate-voiceover.mjs
 *   ELEVENLABS_API_KEY=sk-... node scripts/generate-voiceover.mjs --list-voices
 *   ELEVENLABS_API_KEY=sk-... node scripts/generate-voiceover.mjs --voice "Josh"
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("Error: set ELEVENLABS_API_KEY environment variable");
  process.exit(1);
}

const BASE = "https://api.elevenlabs.io/v1";
const DEFAULT_OUT_DIR = path.resolve(import.meta.dirname, "../public/voiceover");

// ── Voiceover segments (Jason's reactive narration) ─────────────────────────

const SEGMENTS = [
  {
    id: "01-maceo-concern",
    text: "[concerned] Oh... quiet accounts before renewal? That's not good. Let's see what's going on.",
  },
  {
    id: "02-ask-datost",
    text: "[thoughtful] Let's just ask Datost to pull the numbers real quick.",
  },
  {
    id: "03-bot1-table",
    text: "[surprised] Rivian's down seventy-two percent? [serious] That is not good.",
  },
  {
    id: "05-bot2-trends",
    text: "[serious] Rivian fell off a cliff in January. Plaid's a slow bleed. Two different problems.",
  },
  {
    id: "06-bot3-tickets",
    text: "[frustrated] Seven tickets, same login bug. That's on us. [concerned] And Plaid says they're evaluating alternatives.",
  },
  {
    id: "07-jason-churn",
    text: "[questioning] Okay but what about the rest of the book? Are there more like this that we're not seeing?",
  },
  {
    id: "08-bot4-risk",
    text: "[alarmed] One and a half million at risk. It's eight accounts, not four.",
  },
  {
    id: "09-bot5-export",
    text: "[impressed] Spreadsheet, PDF, risk scores... just like that.",
  },
  {
    id: "10-jason-dashboard",
    text: "[determined] We need this running all the time, not just when someone has a bad feeling.",
  },
  {
    id: "11-bot6-dashboard",
    text: "[satisfied] Live dashboard, auto-flags anything at risk. Done.",
  },
];

// ── Voice settings (conversational, reactive, natural) ──────────────────────

const VOICE_SETTINGS = {
  stability: 0.35,
  similarity_boost: 0.78,
  style: 0.6,
  use_speaker_boost: true,
  speed: 1.1,
};

const MODEL_ID = "eleven_v3";
const OUTPUT_FORMAT = "mp3_44100_128";

// ── Helpers ─────────────────────────────────────────────────────────────────

async function listVoices() {
  const res = await fetch(`${BASE}/voices`, {
    headers: { "xi-api-key": API_KEY },
  });
  if (!res.ok) throw new Error(`Failed to list voices: ${res.status}`);
  const { voices } = await res.json();
  console.log("\nAvailable voices:\n");
  for (const v of voices) {
    const labels = v.labels
      ? Object.entries(v.labels).map(([k, val]) => `${k}:${val}`).join(", ")
      : "";
    console.log(`  ${v.name.padEnd(24)} ${v.voice_id}   ${labels}`);
  }
  console.log(`\nTotal: ${voices.length} voices`);
  return voices;
}

async function findVoiceId(name) {
  const res = await fetch(`${BASE}/voices`, {
    headers: { "xi-api-key": API_KEY },
  });
  if (!res.ok) throw new Error(`Failed to list voices: ${res.status}`);
  const { voices } = await res.json();
  const match = voices.find(
    (v) => v.name.toLowerCase() === name.toLowerCase()
  );
  if (!match) {
    console.error(`Voice "${name}" not found. Use --list-voices to see options.`);
    process.exit(1);
  }
  return match.voice_id;
}

async function generateClip(voiceId, segment) {
  const res = await fetch(
    `${BASE}/text-to-speech/${voiceId}?output_format=${OUTPUT_FORMAT}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": API_KEY,
      },
      body: JSON.stringify({
        text: segment.text,
        model_id: MODEL_ID,
        voice_settings: VOICE_SETTINGS,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS failed for "${segment.id}": ${res.status} ${err}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const outPath = path.join(OUT_DIR, `${segment.id}.mp3`);
  await writeFile(outPath, buffer);
  console.log(`  ✓ ${segment.id}.mp3  (${(buffer.length / 1024).toFixed(0)} KB)`);
}

// ── Main ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes("--list-voices")) {
  await listVoices();
  process.exit(0);
}

// Resolve voice
let voiceId = "UgBBYS2sOqTuMpoF3BR0"; // default voice ID
const voiceIdx = args.indexOf("--voice");
if (voiceIdx !== -1 && args[voiceIdx + 1]) {
  const arg = args[voiceIdx + 1];
  // If it looks like a voice ID (alphanumeric, 20+ chars), use directly
  if (/^[a-zA-Z0-9]{10,}$/.test(arg)) {
    voiceId = arg;
  } else {
    voiceId = await findVoiceId(arg);
  }
}

// Resolve output directory
const outDirIdx = args.indexOf("--out-dir");
const OUT_DIR = outDirIdx !== -1 && args[outDirIdx + 1]
  ? path.resolve(args[outDirIdx + 1])
  : DEFAULT_OUT_DIR;

console.log(`\nUsing voice ID: ${voiceId}`);
console.log(`Output directory: ${OUT_DIR}`);

await mkdir(OUT_DIR, { recursive: true });

console.log(`Generating ${SEGMENTS.length} voiceover clips...\n`);

for (const segment of SEGMENTS) {
  await generateClip(voiceId, segment);
}

console.log(`\nDone! Files saved to ${OUT_DIR}/`);
console.log("Next: wire these into Composition.tsx with <Audio> sequences.");
