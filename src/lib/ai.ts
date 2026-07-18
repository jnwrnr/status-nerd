import { AI, environment } from "@raycast/api";
import { StatusItem } from "./statuses";

export type Suggestion = Pick<StatusItem, "emoji" | "text">;

export function canUseAI(): boolean {
  return environment.canAccess(AI);
}

/**
 * Standard emoji shortcodes that exist on Slack, GitLab and GitHub alike.
 * The AI is restricted to these so Slack never rejects an unknown emoji.
 */
const SAFE_EMOJIS = [
  ":fire:",
  ":rocket:",
  ":coffee:",
  ":brain:",
  ":zap:",
  ":dart:",
  ":bulb:",
  ":skull:",
  ":ocean:",
  ":wrench:",
  ":gift:",
  ":tornado:",
  ":alarm_clock:",
  ":crystal_ball:",
  ":game_die:",
  ":compass:",
  ":hourglass:",
  ":sparkles:",
  ":tada:",
  ":bar_chart:",
  ":chart_with_upwards_trend:",
  ":chart_with_downwards_trend:",
  ":calendar:",
  ":hammer:",
  ":gear:",
  ":mag:",
  ":books:",
  ":memo:",
  ":clipboard:",
  ":computer:",
  ":bug:",
  ":construction:",
  ":warning:",
  ":snail:",
  ":turtle:",
  ":muscle:",
  ":pray:",
  ":sob:",
  ":sweat_smile:",
  ":ghost:",
  ":robot_face:",
  ":boom:",
  ":zzz:",
  ":rotating_light:",
  ":dizzy:",
  ":tea:",
  ":telephone:",
];
const SAFE_EMOJI_SET = new Set(SAFE_EMOJIS);
const DEFAULT_EMOJI = ":speech_balloon:";

/**
 * Ask Raycast AI for a batch of short, funny work statuses based on the
 * user's notes/keywords. Returns several options so the user can shuffle
 * through them without a new API call each time.
 */
export async function generateStatuses(
  notes: string,
  count = 6,
): Promise<Suggestion[]> {
  const notesLine = notes.trim()
    ? `Base them on these notes/keywords: ${notes.trim()}.`
    : "Base them on typical product-manager work life.";
  const prompt = `You write short, witty work statuses for a busy product manager.
${notesLine}
Generate ${count} distinct options — vary the angle and tone.
Return ONLY a compact JSON array, no markdown, no code fences, in this exact shape:
[{"emoji": ":shortcode:", "text": "status under 60 characters"}]
Rules:
- "emoji" MUST be chosen from this exact list (copy it verbatim): ${SAFE_EMOJIS.join(" ")}
- Pick the emoji that best fits each status.
- "text" is one punchy line, no surrounding quotes, no trailing period.
- Return exactly ${count} objects.`;

  const answer = await AI.ask(prompt, { creativity: "high" });
  const parsed = parseSuggestions(answer);
  if (parsed.length === 0) {
    throw new Error("Could not parse the AI response");
  }
  return parsed;
}

function parseSuggestions(raw: string): Suggestion[] {
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  // Prefer a JSON array; fall back to collecting individual objects.
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  const candidates: unknown[] = [];
  if (arrayMatch) {
    try {
      const arr = JSON.parse(arrayMatch[0]);
      if (Array.isArray(arr)) candidates.push(...arr);
    } catch {
      // fall through to object scan
    }
  }
  if (candidates.length === 0) {
    for (const m of cleaned.matchAll(/\{[^{}]*\}/g)) {
      try {
        candidates.push(JSON.parse(m[0]));
      } catch {
        // skip malformed object
      }
    }
  }

  const suggestions: Suggestion[] = [];
  for (const c of candidates) {
    const obj = c as { emoji?: string; text?: string };
    if (!obj?.text) continue;
    let emoji = (obj.emoji ?? DEFAULT_EMOJI).trim();
    if (!emoji.startsWith(":")) emoji = `:${emoji}`;
    if (!emoji.endsWith(":")) emoji = `${emoji}:`;
    // Guard against the AI inventing emoji Slack won't accept.
    if (!SAFE_EMOJI_SET.has(emoji)) emoji = DEFAULT_EMOJI;
    suggestions.push({ emoji, text: obj.text.trim() });
  }
  return suggestions;
}
