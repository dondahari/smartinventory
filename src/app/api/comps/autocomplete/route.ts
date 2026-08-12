import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Common resale autocomplete database for instant offline speed (<10ms)
const COMMON_SUGGESTIONS: Record<string, string[]> = {
  lego: [
    'LEGO Batman Batmobile (76139)',
    'LEGO Back to the Future DeLorean (10300)',
    'LEGO Star Wars Millennium Falcon (75192)',
    'LEGO Harry Potter Hogwarts Castle (71043)',
    'LEGO Marvel Daily Bugle (76178)',
    'LEGO Technic Porsche 911 GT3 RS (42056)',
    'LEGO Ideas Saturn V (21309)'
  ],
  'lego ba': [
    'LEGO Batman Batmobile (76139)',
    'LEGO Back to the Future DeLorean (10300)',
    'LEGO Batcave Shadow Box (76252)',
    'LEGO Baseball Player Minifigure Series 10'
  ],
  jordan: [
    'Air Jordan 1 High OG "Chicago Lost & Found"',
    'Air Jordan 4 Retro "Bred Reimagined"',
    'Air Jordan 11 Retro "Concord"',
    'Air Jordan 3 Retro "White Cement Reimagined"'
  ],
  pokemon: [
    'Pokémon Red Version Game Boy Cartridge',
    'Pokémon Base Set Charizard 1st Edition',
    'Pokémon Violet Nintendo Switch Game',
    'Pokémon Booster Box Evolving Skies'
  ],
  sony: [
    'Sony Walkman TPS-L2 Vintage Cassette Player',
    'Sony PlayStation 5 Disc Edition Console',
    'Sony Handycam DCR-TRV900 Vintage Camcorder',
    'Sony WH-1000XM5 Wireless Headphones'
  ],
  nintendo: [
    'Nintendo Game Boy Color Atomic Purple',
    'Nintendo Switch OLED Model',
    'Super Mario Bros 3 NES Cartridge',
    'Nintendo 64 Console Smoke Grey'
  ],
  pacman: [
    'Pac-Man Fever Vinyl LP Album (1982)',
    'Pac-Man Arcade Cabinet Micro Player',
    'Pac-Man Namco Museum Game Boy Advance'
  ]
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  // 1. Direct prefix hit from fast memory index
  if (COMMON_SUGGESTIONS[q]) {
    return NextResponse.json({ suggestions: COMMON_SUGGESTIONS[q] });
  }

  // 2. Filter memory database for matching substring
  const allInMemory = Object.values(COMMON_SUGGESTIONS).flat();
  const matchedInMemory = Array.from(new Set(allInMemory.filter(item => item.toLowerCase().includes(q)))).slice(0, 6);

  if (matchedInMemory.length >= 3) {
    return NextResponse.json({ suggestions: matchedInMemory });
  }

  // 3. Fallback to Gemini AI for intelligent real-time autocomplete for any query
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

      const prompt = `
Generate 5 accurate resale product search completions for query prefix: "${q}".
Output strictly JSON array of strings:
["Completion 1", "Completion 2", "Completion 3", "Completion 4", "Completion 5"]
`;

      const aiRes = await model.generateContent(prompt);
      const text = aiRes.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return NextResponse.json({ suggestions: parsed.slice(0, 6) });
      }
    } catch (err) {
      console.warn('Gemini autocomplete error:', err);
    }
  }

  // Generic fallback generator
  const capitalized = q.charAt(0).toUpperCase() + q.slice(1);
  return NextResponse.json({
    suggestions: [
      `${capitalized} Collector Edition`,
      `${capitalized} Vintage Original`,
      `${capitalized} Sealed Box Set`,
      `${capitalized} Rare Edition`
    ]
  });
}
