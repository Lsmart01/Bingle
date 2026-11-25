// Builds the "what got pushed to main" email for the Push digest workflow.
// Reads the pushed range from env, asks Claude for a plain-English overview,
// writes the email body to $OUT_DIR/digest-body.txt and the subject to $GITHUB_OUTPUT.
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const Anthropic = require("@anthropic-ai/sdk").default;

const { BEFORE, AFTER, PUSHER, COMPARE_URL, OUT_DIR, GITHUB_OUTPUT } = process.env;
const MAX_DIFF_CHARS = 400_000; // keeps one push well inside the context window

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

// A brand-new branch or force-push has no usable "before"; fall back to the last commit only.
const hasBefore = BEFORE && !/^0+$/.test(BEFORE) && (() => {
  try { git("cat-file", "-e", `${BEFORE}^{commit}`); return true; } catch { return false; }
})();
const range = hasBefore ? `${BEFORE}..${AFTER}` : `${AFTER}~1..${AFTER}`;

const log = git("log", "--no-merges", "--format=- %h %s (%an)", range);
const stat = git("diff", "--stat", range);
// Lockfiles are noise for a human summary.
let diff = git("diff", range, "--", ".", ":(exclude)package-lock.json");
let note = "";
if (diff.length > MAX_DIFF_CHARS) {
  note = `The full diff was ${diff.length} characters, so only the first ${MAX_DIFF_CHARS} were sent. Say in the overview that some changes were not reviewed in detail.`;
  diff = diff.slice(0, MAX_DIFF_CHARS);
}

async function main() {
  const client = new Anthropic();
  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    output_config: { effort: "medium" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system:
      "You write short email digests for a small startup team building Bink, a pickleball matchmaking app. " +
      "A teammate just pushed to main. Explain what changed and why it matters, in plain English for people who know the product but did not write this code. " +
      "Plain text only, no markdown symbols. Structure: a one-line summary; then 'What changed' with short bullet points (use '- '), grouped by area of the app; " +
      "then 'Worth checking' listing anything risky, unfinished, or that touches the database, auth, payments or config (write 'Nothing stood out' if so). " +
      "Keep it under 300 words. Do not invent changes that are not in the diff.",
    messages: [{
      role: "user",
      content: `Pushed by: ${PUSHER}\n\nCommits:\n${log}\n\nFiles:\n${stat}\n\n${note}\n\nDiff:\n${diff}`,
    }],
  });

  if (response.stop_reason === "refusal") throw new Error("Claude declined to summarise this push.");
  const overview = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  const firstLine = overview.split("\n").find((l) => l.trim()) ?? "New changes on main";
  const commitCount = log.trim() ? log.trim().split("\n").length : 0;

  const body = `${overview}\n\n---\nCommits (${commitCount}):\n${log}\nSee the full diff: ${COMPARE_URL}\n`;
  fs.writeFileSync(path.join(OUT_DIR, "digest-body.txt"), body);
  fs.appendFileSync(GITHUB_OUTPUT, `subject=${PUSHER} pushed to main: ${firstLine.replace(/[\r\n]/g, " ").slice(0, 120)}\n`);
  console.log(body);
}

main().catch((err) => { console.error(err); process.exit(1); });
