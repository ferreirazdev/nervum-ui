/**
 * Mock AI chat: returns canned replies with simulated latency.
 * No HTTP calls; all in-memory.
 */

const MOCK_REPLIES_GENERIC = [
  "Here's what I found.",
  "You can check the dashboard for that.",
  "I'm a demo assistant. In production I'd use a real model.",
  "Try the Environments page for more details.",
  "That's a good question. Have a look at the map view for context.",
  "I don't have access to live data in this demo, but you can explore the app.",
  "Feel free to ask about dashboard, environments, or the map.",
];

const KEYWORD_REPLIES: { keyword: RegExp; reply: string }[] = [
  { keyword: /\bdashboard\b/i, reply: "You can find an overview and KPIs on the Dashboard. Use the sidebar to navigate there." },
  { keyword: /\benvironment(s)?\b/i, reply: "Environments are listed under Environments in the sidebar. Open one to see its map and entities." },
  { keyword: /\bmap\b/i, reply: "The map view shows your environment topology. Open an environment to explore it." },
  { keyword: /\bhelp\b/i, reply: "I'm a mocked assistant. Navigate via the sidebar: Dashboard, Organization, Environments, and Profile." },
  { keyword: /\bhello\b|\bhi\b/i, reply: "Hi! I'm the Nervum AI assistant (demo mode). How can I help?" },
];

/**
 * Returns a mock assistant reply for the given user message.
 * Simulates 300–800 ms latency and uses keyword matching or a random canned reply.
 */
export async function getMockReply(userMessage: string): Promise<string> {
  const delayMs = 300 + Math.random() * 500;
  await new Promise((r) => setTimeout(r, delayMs));

  const trimmed = userMessage.trim().toLowerCase();
  if (!trimmed) return "Send a message and I'll reply with a demo response.";

  for (const { keyword, reply } of KEYWORD_REPLIES) {
    if (keyword.test(userMessage)) return reply;
  }

  const index = Math.floor(Math.random() * MOCK_REPLIES_GENERIC.length);
  return MOCK_REPLIES_GENERIC[index];
}
