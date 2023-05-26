const englishVoices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en-'));
const defaultVoice = englishVoices[Math.random() * englishVoices.length];

export const speak = (text: string, voice = defaultVoice) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  speechSynthesis.speak(utterance);
};
