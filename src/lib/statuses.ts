export interface StatusItem {
  /** Slack/GitHub colon shortcode, e.g. ":fire:" */
  emoji: string;
  text: string;
  /** Actual emoji character, used for display/HUD, e.g. "🔥" */
  gitlab_emoji: string;
}

export const STATUSES: StatusItem[] = [
  { emoji: ":fire:", text: "Putting out fires since 9am", gitlab_emoji: "🔥" },
  {
    emoji: ":bar_chart:",
    text: "Death by a thousand dashboards",
    gitlab_emoji: "📊",
  },
  {
    emoji: ":dart:",
    text: "Missing targets like a Stormtrooper",
    gitlab_emoji: "🎯",
  },
  {
    emoji: ":juggling:",
    text: "Juggling priorities and sanity",
    gitlab_emoji: "🤹",
  },
  {
    emoji: ":zap:",
    text: 'Sprinting through another "quick sync"',
    gitlab_emoji: "⚡",
  },
  {
    emoji: ":jigsaw:",
    text: "All the pieces, wrong puzzle",
    gitlab_emoji: "🧩",
  },
  {
    emoji: ":bulb:",
    text: "Ideas are cheap, implementations expensive",
    gitlab_emoji: "💡",
  },
  {
    emoji: ":circus_tent:",
    text: "Running the stakeholder circus",
    gitlab_emoji: "🎪",
  },
  {
    emoji: ":chart_with_downwards_trend:",
    text: "Making graphs go up (hopefully)",
    gitlab_emoji: "📉",
  },
  {
    emoji: ":world_map:",
    text: "Lost in the roadmap wilderness",
    gitlab_emoji: "🗺️",
  },
  {
    emoji: ":coffee:",
    text: "Fueled by coffee and compromises",
    gitlab_emoji: "☕",
  },
  {
    emoji: ":game_die:",
    text: "Rolling the dice on features",
    gitlab_emoji: "🎲",
  },
  {
    emoji: ":rocket:",
    text: "Launching things and praying",
    gitlab_emoji: "🚀",
  },
  {
    emoji: ":compass:",
    text: "Finding north in feature chaos",
    gitlab_emoji: "🧭",
  },
  {
    emoji: ":alarm_clock:",
    text: "5 meetings away from actual work",
    gitlab_emoji: "⏰",
  },
  {
    emoji: ":performing_arts:",
    text: "Acting like I have a plan",
    gitlab_emoji: "🎭",
  },
  {
    emoji: ":crystal_ball:",
    text: "Crystal ball's in the shop",
    gitlab_emoji: "🔮",
  },
  { emoji: ":skull:", text: "Survived another standup", gitlab_emoji: "💀" },
  {
    emoji: ":building_construction:",
    text: "Building castles in the backlog",
    gitlab_emoji: "🏗️",
  },
  { emoji: ":ocean:", text: "Drowning in user feedback", gitlab_emoji: "🌊" },
  {
    emoji: ":roller_coaster:",
    text: "Emotional rollercoaster operator",
    gitlab_emoji: "🎢",
  },
  {
    emoji: ":wrench:",
    text: "Fixing things that aren't broken",
    gitlab_emoji: "🔧",
  },
  {
    emoji: ":iphone:",
    text: "Ping-ponging between Slack channels",
    gitlab_emoji: "📱",
  },
  { emoji: ":tornado:", text: "Eye of the sprint storm", gitlab_emoji: "🌪️" },
  {
    emoji: ":dart:",
    text: "Pivoting the pivot of the pivot",
    gitlab_emoji: "🎯",
  },
  { emoji: ":brain:", text: "Context switching champion", gitlab_emoji: "🧠" },
  {
    emoji: ":fire:",
    text: "Everything's fine (narrator: it wasn't)",
    gitlab_emoji: "🔥",
  },
  { emoji: ":gift:", text: "Unwrapping technical debt", gitlab_emoji: "🎁" },
  {
    emoji: ":crossed_swords:",
    text: "Fighting scope creep daily",
    gitlab_emoji: "⚔️",
  },
  {
    emoji: ":runner:",
    text: "Running towards unclear goals",
    gitlab_emoji: "🏃",
  },
];

export function randomStatus(): StatusItem {
  return STATUSES[Math.floor(Math.random() * STATUSES.length)];
}
