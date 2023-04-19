export const chatExamplePrompts = [
  'In which country was BA.1 first found more than 10 times on a day?',
  'How many sequences where found in February 2022 in Germany that have the mutation 23048A?',
  'Which 10 countries uploaded the most sequences in 2023?',
  "What's the name of the current US president?",
  'Which nucleotide mutations are present in more than half of all SARS-CoV-2 sequences?',
  'It has come to my attention that the ORF1a:L3606F mutation is quite intriguing, and I simply cannot resist the urge to discover which country in the vast expanse of South America has generated the highest number of sequences with this specific mutation.',
  "In the realm of scientific inquiry, it's often the case that multiple mutations may coexist within the same sequence, and with this in mind, I would be most grateful if you could reveal the total number of sequences detected in Australia during the month of June 2022, which exhibit both the S:R346T and S:L452R mutations simultaneously.",
  'Which lineages have the mutations A23403G, A23063T, and C3037T?',
  'Which country submitted the most animal samples?',
  'For which animals do we have sequences?',
  'How many sequences were submitted in the last 4 weeks?',
  'Which are the most common 5 variants this year?',
  'When and where was the first XBB.1.16 collected?',
  'When was the first XBB.1.16 submitted?',
  'Please tell me the most common 10 AA mutations that occur in lineage XBB',
  'When did the S:484K first co-appear with S:501Y?',
  'number of sequences per canton in Switzerland',
  'Would you mind giving me the number of sequences per state from the US sorted by the name of the states?',
  "I have a rather complex query that I'm hoping you can help me with, as I'm curious about the most frequently observed lineage in Asia that is specifically associated with the S:S373P mutation, and I would be most grateful if you could provide this information.",
  'Can you provide tips for improving my photography skills?',
];

export function getRandomChatPrompt() {
  const randomIndex = Math.floor(Math.random() * chatExamplePrompts.length);
  return chatExamplePrompts[randomIndex];
}
