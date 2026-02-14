import { NextResponse } from 'next/server';
import { RaceScraper } from '@/lib/scraper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ horses: [] });
    }

    const scraper = new RaceScraper();
    const horses = await scraper.searchHorse(query);

    return NextResponse.json({ horses });
}
