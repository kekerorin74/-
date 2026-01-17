import Image from 'next/image';
import db from '@/lib/db';
import PredictionCard from '@/components/PredictionCard';

// Ensure fresh data on every request
export const dynamic = 'force-dynamic';

export default async function Home() {
  let predictions: any[] = [];
  try {
    const { rows } = await db.query('SELECT * FROM predictions ORDER BY id DESC LIMIT 6');
    predictions = rows;
  } catch (e) {
    console.error('Database connection failed (Vercel Postgres not configured?)', e);
  }

  return (
    <main className="min-h-screen bg-antigravity-bg flex flex-col">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[60vh]">
        <Image
          src="/hero.jpg"
          alt="Antigravity Hero"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-antigravity-bg"></div>
        <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white text-glow drop-shadow-[0_0_30px_rgba(0,243,255,0.6)] mb-4">
              堅軸馬＆妙味馬
            </h1>
            <p className="text-xs md:text-xl text-antigravity-text/80 font-bold tracking-wider text-glow">
              <span className="block md:inline">堅軸馬：能力上位で3着内率が最も高い想定の馬</span>
              <span className="hidden md:inline">　</span>
              <span className="block md:inline">妙味馬：期待値の高い馬</span>
            </p>
          </div>
        </div>
      </div>

      {/* Predictions Section */}
      <div className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col gap-8">
          {predictions.map((p: any) => (
            <PredictionCard key={p.id} prediction={p} />
          ))}
        </div>
      </div>

      <footer className="py-8 text-center text-gray-600 text-xs">
        <p>&copy; 2026 ANTIGRAVITY. All rights reserved.</p>
      </footer>
    </main>
  );
}
