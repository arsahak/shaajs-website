export const CONTACT_TOPICS = [
  { value: "general", label: "General question" },
  { value: "order", label: "Help with an order" },
  { value: "returns", label: "Returns & refunds" },
  { value: "seller", label: "Selling on BongoOcean" },
  { value: "other", label: "Something else" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

export function isContactTopic(value: unknown): value is ContactTopic {
  return CONTACT_TOPICS.some((topic) => topic.value === value);
}
