import Image from 'next/image';
import db from '@/lib/db';
import PredictionCard from '@/components/PredictionCard';

export const dynamic = 'force-dynamic';

export default async function Home() {
    let predictions: any[] = [];
    try {
        const { rows } = await db.query('SELECT * FROM predictions ORDER BY id DESC LIMIT 6');
        predictions = rows;
    } catch (e) {
        console.error('Database connection failed', e);
    }

    return (
        <main className="min-h-screen flex flex-col">
            <div className="relative w-full h-[40vh] md:h-[50vh] flex items-center justify-center">
                <div className="text-center z-10 p-4 mt-12">
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white text-glow drop-shadow-lg">
                        堅軸馬 & 妙味馬
                    </h1>
                    <p className="mt-8 text-white font-bold tracking-wider">
                        独自のAIアルゴリズムによる競馬予想アーカイブ
                    </p>
                    <div className="mt-8">
                        <a href="/archive" className="inline-block px-8 py-3 rounded-full border border-white text-white hover:bg-white hover:text-black transition-all">
                            過去の予想（アーカイブ）
                        </a>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col gap-8">
                    {predictions.map((p: any) => (
                        <PredictionCard key={p.id} prediction={p} />
                    ))}
                </div>
            </div>
        </main>
    );
}