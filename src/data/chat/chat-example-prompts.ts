export const chatExamplePrompts = [
  'In which country was BA.1 first found more than 10 times on a day?',
  'How many sequences where found in February 2022 in Germany that have the mutation 23048A?',
  'Which 10 countries upload the most sequences in 2023?',
  'It has come to my attention that the ORF1a:L3606F mutation is quite intriguing, and I simply cannot resist the urge to discover which country in the vast expanse of South America has generated the highest number of sequences with this specific mutation.',
  "In the realm of scientific inquiry, it's often the case that multiple mutations may coexist within the same sequence, and with this in mind, I would be most grateful if you could reveal the total number of sequences detected in Australia during the month of June 2022, which exhibit both the S:R346T and S:L452R mutations simultaneously.",
];

export function getRandomChatPrompt() {
  const randomIndex = Math.floor(Math.random() * chatExamplePrompts.length);
  return chatExamplePrompts[randomIndex];
}
