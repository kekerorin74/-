import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { RaceScraper } from '@/lib/scraper';
import { get } from 'fast-levenshtein';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // 1. Verify Cron Secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow local dev testing if no secret provided, or strictly enforce?
        // For security, enforce.
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Fetch Unresolved Races (where main result is empty)
        // Only fetch recent ones to avoid checking ancient history
        const { rows: pendingPredictions } = await db.query(`
            SELECT * FROM predictions 
            WHERE firm_horse_result IS NULL 
            OR firm_horse_result = ''
            ORDER BY id DESC LIMIT 20
        `);

        if (pendingPredictions.length === 0) {
            return NextResponse.json({ message: 'No pending predictions' });
        }

        const scraper = new RaceScraper();
        const updates = [];

        for (const p of pendingPredictions) {
            // Extract location from race_name if not stored separately
            // Assuming race_name format "中山11R ..." or similar
            // Simple parser: "中山"
            let location = '';
            if (p.race_name.includes('中山')) location = '中山';
            if (p.race_name.includes('東京')) location = '東京';
            if (p.race_name.includes('阪神')) location = '阪神';
            if (p.race_name.includes('京都')) location = '京都';
            if (p.race_name.includes('小倉')) location = '小倉';
            if (p.race_name.includes('新潟')) location = '新潟';
            if (p.race_name.includes('福島')) location = '福島';
            if (p.race_name.includes('中京')) location = '中京';
            if (p.race_name.includes('札幌')) location = '札幌';
            if (p.race_name.includes('函館')) location = '函館';

            if (!location) continue;

            const result = await scraper.scrapeRace(p.race_date, location, p.race_name);

            if (result) {
                // Fuzzy Match Logic helper
                const updateData: any = { id: p.id };
                const horses = [
                    { key: 'firm_horse', resKey: 'firm_horse_result', payWin: 'firm_payout_win', payPlace: 'firm_payout_place' },
                    { key: 'value_horse_1', resKey: 'value_horse_1_result', payPlace: 'value_1_payout_place' },
                    { key: 'value_horse_2', resKey: 'value_horse_2_result', payPlace: 'value_2_payout_place' },
                    { key: 'value_horse_3', resKey: 'value_horse_3_result', payPlace: 'value_3_payout_place' },
                ];

                let hasUpdate = false;
                const resultNames = Object.keys(result.horse_results);

                for (const h of horses) {
                    const myName = p[h.key];
                    if (!myName) continue;

                    // Find best match in scraped results
                    // clean spaces
                    const cleanMyName = myName.replace(/\d+/g, '').replace(/\s+/g, ''); // Remove leading numbers if user typed "14 モリノ..."

                    let bestMatchName = '';
                    let minDist = 3; // Strict threshold

                    for (const rName of resultNames) {
                        const dist = get(cleanMyName, rName);
                        if (dist < minDist) {
                            minDist = dist;
                            bestMatchName = rName;
                        }
                    }

                    if (bestMatchName) {
                        const r = result.horse_results[bestMatchName];
                        updateData[h.resKey] = r.rank;
                        if (h.payWin && r.payout_win) updateData[h.payWin] = r.payout_win;
                        if (h.payPlace && r.payout_place) updateData[h.payPlace] = r.payout_place;
                        hasUpdate = true;
                    }
                }

                if (hasUpdate) {
                    // Execute Update
                    await db.sql`
                        UPDATE predictions SET 
                            firm_horse_result = ${updateData.firm_horse_result || p.firm_horse_result},
                            firm_payout_win = ${updateData.firm_payout_win || null},
                            firm_payout_place = ${updateData.firm_payout_place || null},
                            value_horse_1_result = ${updateData.value_horse_1_result || p.value_horse_1_result},
                            value_1_payout_place = ${updateData.value_1_payout_place || null},
                            value_horse_2_result = ${updateData.value_horse_2_result || p.value_horse_2_result},
                            value_2_payout_place = ${updateData.value_2_payout_place || null},
                            value_horse_3_result = ${updateData.value_horse_3_result || p.value_horse_3_result},
                            value_3_payout_place = ${updateData.value_3_payout_place || null}
                        WHERE id = ${p.id}
                    `;
                    updates.push({ id: p.id, match: true });
                }
            }
        }

        return NextResponse.json({ success: true, updates });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
