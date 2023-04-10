const greetingsData = [
  {
    country: 'USA',
    greetings: ['Hi there!', 'Good morning/afternoon/evening!', "Hey, how's it going?", "What's up?"],
  },
  {
    country: 'United Kingdom',
    greetings: ['Hello there!', 'Hiya!', 'Good day!', "Hey, how's it going?"],
  },
  {
    country: 'Germany',
    greetings: ['Guten Tag!', 'Hallo!', 'Grüß Gott!', 'Servus!'],
  },
  {
    country: 'Denmark',
    greetings: ['Hej!', 'God dag!', 'Godmorgen!', 'God eftermiddag!'],
  },
  {
    country: 'France',
    greetings: ['Bonjour!', 'Salut!', 'Coucou!', 'Comment ça va?'],
  },
  {
    country: 'Japan',
    greetings: ['こんにちは！', 'おはようございます！', 'こんばんは！', 'お元気ですか？'],
  },
  {
    country: 'Canada',
    greetings: ['Hello there!', "Hey, how's it going?", 'Bonjour!', "What's up, eh?"],
  },
  {
    country: 'India',
    greetings: ['नमस्ते।', 'आप कैसे हैं?', 'Aap kaise hain?', 'Shubh sandhya!'],
  },
  {
    country: 'Austria',
    greetings: ['Servus!', 'Guten Tag!', 'Grüß Gott!', 'Hallo!'],
  },
  {
    country: 'Sweden',
    greetings: ['Hej!', 'God dag!', 'God morgon!', 'God middag!'],
  },
  {
    country: 'Brazil',
    greetings: ['Olá!', 'Bom dia/tarde/noite!', 'Tudo bem?', 'Prazer em conhecê-lo!'],
  },
  {
    country: 'Spain',
    greetings: ['¡Hola!', 'Buenos días/tardes/noches!', '¿Qué tal?', 'Mucho gusto en conocerle!'],
  },
  {
    country: 'Australia',
    greetings: ["G'day!", 'Good morning/afternoon/evening!', "How ya goin'?", 'Nice to meet ya!'],
  },
  {
    country: 'Italy',
    greetings: ['Ciao!', 'Buongiorno/pomeriggio/sera!', 'Come stai?', 'Piacere di conoscerti!'],
  },
  {
    country: 'Belgium',
    greetings: ['Hallo!', 'Goedemorgen/middag/avond!', 'Hoe gaat het met u?', 'Aangenaam kennis te maken!'],
  },
  {
    country: 'Netherlands',
    greetings: ['Hallo!', 'Goedemorgen/middag/avond!', 'Hoe gaat het met u?', 'Aangenaam kennis te maken!'],
  },
  {
    country: 'Switzerland',
    greetings: ['Grüezi!', 'Bonjour!', 'Buongiorno!', 'Allegra!'],
  },
  {
    country: 'Israel',
    greetings: ['Shalom!', 'Boker tov/tzohorayim/tov leil!', 'Ma shlomcha?', "Na'im meod/mikiratkha!"],
  },
  {
    country: 'South Korea',
    greetings: ['안녕하세요?', '안녕!', '만나서 반갑습니다.', '어디 가세요?'],
  },
  {
    country: 'Ireland',
    greetings: ['Dia dhuit!', 'Haigh!', 'Conas atá tú?', 'Céad míle fáilte!'],
  },
  {
    country: 'Turkey',
    greetings: ['Merhaba!', 'Selam!', 'İyi günler!', 'Nasılsın?'],
  },
  {
    country: 'Poland',
    greetings: ['Cześć!', 'Witaj!', 'Dzień dobry!', 'Jak się masz?'],
  },
  {
    country: 'Mexico',
    greetings: ['¡Hola!', '¿Qué onda?', 'Buen día!', '¿Cómo estás?'],
  },
  {
    country: 'Slovenia',
    greetings: ['Dober dan!', 'Živjo!', 'Kako ste?', 'Lepo vas je spoznati!'],
  },
  {
    country: 'Norway',
    greetings: ['Hei!', 'God dag!', 'Hvordan går det?', 'Hyggelig å møte deg!'],
  },
  {
    country: 'Russia',
    greetings: ['Здравствуйте!', 'Привет!', 'Как дела?', 'Рад встрече!'],
  },
  {
    country: 'Czech Republic',
    greetings: ['Dobrý den!', 'Ahoj!', 'Jak se máte?', 'Těší mě!'],
  },
  {
    country: 'Luxembourg',
    greetings: ['Moien!', 'Gudde Moien!', 'Wéi geet et Iech?', 'Schéin Iech kennen ze léieren!'],
  },
  {
    country: 'South Africa',
    greetings: ['Hello!', 'Howzit!', 'Good morning/afternoon/evening!', 'How are you?'],
  },
  {
    country: 'Indonesia',
    greetings: ['Halo!', 'Selamat pagi!', 'Apa kabar?', 'Senang bertemu dengan Anda!'],
  },
  {
    country: 'Peru',
    greetings: ['¡Hola!', 'Buen día!', '¿Cómo estás?', '¡Mucho gusto!'],
  },
  {
    country: 'Finland',
    greetings: ['Hei!', 'Hyvää päivää!', 'Mitä kuuluu?', 'Hauska tavata!'],
  },
  {
    country: 'Portugal',
    greetings: ['Olá!', 'Bom dia!', 'Como está?', 'Prazer em conhecê-lo!'],
  },
  {
    country: 'Slovakia',
    greetings: ['Ahoj!', 'Dobrý deň!', 'Ako sa máš?', 'Teší ma!'],
  },
  {
    country: 'Chile',
    greetings: ['¡Hola!', 'Buen día!', '¿Cómo estás?', 'Mucho gusto!'],
  },
  {
    country: 'Croatia',
    greetings: ['Bok!', 'Dobar dan!', 'Kako ste?', 'Drago mi je!'],
  },
  {
    country: 'Lithuania',
    greetings: ['Labas!', 'Sveikas!', 'Kaip sekasi?', 'Malonu susipažinti!'],
  },
  {
    country: 'Thailand',
    greetings: ['สวัสดี', 'สวัสดีตอนเช้า', 'สบายดีไหม', 'ยินดีที่ได้รู้จัก'],
  },
  {
    country: 'Malaysia',
    greetings: ['Hello!', 'Selamat pagi!', 'Apa khabar?', 'Senang berjumpa denganmu!'],
  },
  {
    country: 'New Zealand',
    greetings: ['Kia ora!', 'Good morning/afternoon/evening!', "How's it going?", 'Nice to meet you!'],
  },
  {
    country: 'Singapore',
    greetings: ['你好', 'வணக்கம்', 'Selamat pagi', 'Good morning'],
  },
  {
    country: 'Greece',
    greetings: ['Γεια σας!', 'Καλημέρα!', 'Τι κάνετε', 'Χαίρω πολύ!'],
  },
  {
    country: 'Latvia',
    greetings: ['Sveiki!', 'Labrīt!', 'Kā jums klājas?', 'Prieks iepazīties!'],
  },
  {
    country: 'Philippines',
    greetings: ['Kamusta!', 'Magandang araw!', 'Kumusta ka?', 'Maganda ang makilala ka!'],
  },
  {
    country: 'Colombia',
    greetings: ['Hola!', 'Buenos días!', '¿Cómo estás?', 'Mucho gusto!'],
  },
  {
    country: 'Argentina',
    greetings: ['Hola!', 'Buen día!', '¿Cómo estás?', 'Mucho gusto!'],
  },
  {
    country: 'Iceland',
    greetings: ['Halló!', 'Góðan daginn!', 'Hvernig hefur þú það?', 'Gaman að kynnast þér!'],
  },
  {
    country: 'China',
    greetings: ['你好', '早上好', '你怎么样？', '很高兴认识你'],
  },
  {
    country: 'Bulgaria',
    greetings: ['Здравейте', 'Добро утро', 'Как сте?', 'Радвам се да се запознаем'],
  },
  {
    country: 'Romania',
    greetings: ['Salut!', 'Bună dimineața!', 'Ce faci?', 'Îmi pare bine să te cunosc!'],
  },
  {
    country: 'Hong Kong',
    greetings: ['你好', '早晨', '最近點呀?', '很高興認識你'],
  },
  {
    country: 'Estonia',
    greetings: ['Tere!', 'Tere hommikust!', 'Kuidas sul läheb?', 'Rõõm teid näha!'],
  },
  {
    country: 'Kenya',
    greetings: ['Jambo!', 'Habari za asubuhi?', 'Habari gani?', 'Nafurahi kukuona!'],
  },
  {
    country: 'Bahrain',
    greetings: ['السلام عليكم', 'صباح الخير', 'كيف حالك؟', 'سررت بمعرفتك'],
  },
  {
    country: 'Costa Rica',
    greetings: ['Hola!', 'Buenos días!', '¿Cómo estás?', 'Mucho gusto!'],
  },
  {
    country: 'Ecuador',
    greetings: ['Hola!', 'Buenos días!', '¿Cómo estás?', 'Mucho gusto!'],
  },
  {
    country: 'Vietnam',
    greetings: ['Xin chào!', 'Chào buổi sáng!', 'Bạn khỏe không?', 'Rất vui được gặp bạn!'],
  },
  {
    country: 'Nigeria',
    greetings: ['Hello!', 'Good morning!', 'How you dey?', 'Nice to meet you!'],
  },
  {
    country: 'Bangladesh',
    greetings: ['হাই', 'শুভ সকাল', 'কেমন আছেন?', 'আপনার সাথে পরিচিত হতে খুব আনন্দ হয়েছে'],
  },
  {
    country: 'United Arab Emirates',
    greetings: ['مرحبا', 'صباح الخير', 'كيف حالك؟', 'سررت بمعرفتك'],
  },
];

const allGreetings: string[] = [];
const greetingsByCountry = new Map<string, string[]>();
for (let { country, greetings } of greetingsData) {
  greetingsByCountry.set(country, greetings);
  allGreetings.push(...greetings);
}

/**
 * Returns a country-specific greeting with 75% chance if available. Otherwise, return a random greeting.
 */
export function getGreeting(country: string) {
  if (greetingsByCountry.has(country) && Math.random() < 0.75) {
    const greetings = greetingsByCountry.get(country)!;
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  }
  const randomIndex = Math.floor(Math.random() * allGreetings.length);
  return allGreetings[randomIndex];
}
