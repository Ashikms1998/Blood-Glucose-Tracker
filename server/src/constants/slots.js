export const VALID_SLOTS = [
  'morning_fasting',
  'after_breakfast',
  'after_lunch',
  'after_dinner',
];

export const SLOT_LABELS = {
  morning_fasting: 'Morning (fasting)',
  after_breakfast: 'After breakfast',
  after_lunch: 'After lunch',
  after_dinner: 'After dinner',
};

export const formatDuplicateSlotMessage = (slot) => {
  const label = SLOT_LABELS[slot] || slot;
  const article = /^[aeiou]/i.test(label) ? 'an' : 'a';
  return `You already have ${article} ${label} reading for this date.`;
};