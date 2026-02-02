import Link from 'next/link';
import { Trophy, Calendar, ArrowLeft } from 'lucide-react';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Prediction {
    id: number;
    race_date: string;
    race_name: string;
    firm_horse: string;
    firm_horse_result?: string;
    value_horse_1: string;
    value_horse_1_result?: string;
    value_horse_2?: string;
    value_horse_2_result?: string;
    value_horse_3?: string;
    value_horse_3_result?: string;
    // Payout Fields for Stats
    firm_payout_win?: number;
    firm_payout_place?: number;
    value_1_payout_place?: number;
    value_2_payout_place?: number;
    value_3_payout_place?: number;
}

export default async function ArchivePage() {
    let predictions: Prediction[] = [];
    try {
        const { rows } = await db.query('SELECT * FROM predictions ORDER BY id DESC');
        predictions = rows;
    } catch (e) {
        console.error('Database connection failed', e);
    }

    // Group by Date
    const groupedPredictions: { [key: string]: Prediction[] } = {};
    predictions.forEach(p => {
        if (!groupedPredictions[p.race_date]) {
            groupedPredictions[p.race_date] = [];
        }
        groupedPredictions[p.race_date].push(p);
    });

    const dates = Object.keys(groupedPredictions);

    // Calculate Stats
    let totalFirm = 0;
    let firmWinHits = 0;
    let firmPlaceHits = 0;
    let totalWinPayout = 0;
    let totalPlacePayoutFirm = 0; // For Firm Only? Or Overall?
    // Request asked for: "Win Recovery" (Firm) and "Place Recovery" (Overall?)
    // Let's assume Win Recovery = Firm Only. Place Recovery = All Horses? 
    // Usually "Place Recovery" implies predicting Place. 
    // Let's calculate: Firm Win Recovery & Firm Place Rate & "Value" Recovery?
    // Request Text: "単勝回収率(Win Div / Count)", "複勝回収率(Place Div / Count)"
    // Let's assume strictly Firm Horse for Win, and Firm+Value for Place? 
    // Or just Firm for both? "堅軸馬と妙味馬の2つのセクションに分け" -> Separate stats! Great.

    // Firm Stats
    let firmInvest = 0; // 100yen per race
    let firmWinReturn = 0;
    let firmPlaceReturn = 0;

    // Value Stats
    let valueInvest = 0; // 100yen per valid horse
    let valuePlaceReturn = 0;
    let valuePlaceHits = 0;
    let totalValueHorses = 0;

    predictions.forEach(p => {
        // Firm
        if (p.firm_horse) {
            totalFirm++;
            firmInvest += 100;
            if (p.firm_horse_result === '1着') firmWinHits++;
            if (['1着', '2着', '3着'].includes(p.firm_horse_result || '')) firmPlaceHits++;

            if (p.firm_payout_win) firmWinReturn += p.firm_payout_win;
            if (p.firm_payout_place) firmPlaceReturn += p.firm_payout_place;
        }

        // Value
        [
            { name: p.value_horse_1, res: p.value_horse_1_result, pay: p.value_1_payout_place },
            { name: p.value_horse_2, res: p.value_horse_2_result, pay: p.value_2_payout_place },
            { name: p.value_horse_3, res: p.value_horse_3_result, pay: p.value_3_payout_place },
        ].forEach(v => {
            if (v.name) {
                totalValueHorses++;
                valueInvest += 100;
                if (['1着', '2着', '3着'].includes(v.res || '')) {
                    valuePlaceHits++;
                    if (v.pay) valuePlaceReturn += v.pay;
                }
            }
        });
    });

    const firmWinRate = totalFirm ? Math.round((firmWinHits / totalFirm) * 100) : 0;
    const firmPlaceRate = totalFirm ? Math.round((firmPlaceHits / totalFirm) * 100) : 0;
    const firmWinRecovery = firmInvest ? Math.round((firmWinReturn / firmInvest) * 100) : 0;
    const firmPlaceRecovery = firmInvest ? Math.round((firmPlaceReturn / firmInvest) * 100) : 0;

    const valuePlaceRate = totalValueHorses ? Math.round((valuePlaceHits / totalValueHorses) * 100) : 0;
    const valuePlaceRecovery = valueInvest ? Math.round((valuePlaceReturn / valueInvest) * 100) : 0;

    return (
        <main className="min-h-screen flex flex-col text-white pb-20">
            {/* Header / Nav */}
            <div className="p-6">
                <Link href="/" className="inline-flex items-center text-antigravity-accent hover:text-white transition-colors mb-8">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Home
                </Link>
                <h1 className="text-3xl md:text-5xl font-black text-center text-glow drop-shadow-[0_0_15px_rgba(0,243,255,0.4)] mb-12">
                    ARCHIVE
                    <span className="block text-sm md:text-lg text-gray-400 font-normal mt-2 tracking-widest">
                        過去の予想一覧
                    </span>
                </h1>

                {/* Performance Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Firm Horse Stats */}
                    <div className="bg-gradient-to-br from-antigravity-purple/20 to-black border border-antigravity-purple/50 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <Trophy className="text-antigravity-purple mr-2" size={24} />
                            堅軸馬 成績
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/40 p-3 rounded-lg text-center">
                                <p className="text-gray-400 text-xs mb-1">単勝回収率</p>
                                <p className={`text-2xl font-black ${firmWinRecovery > 100 ? 'text-red-500' : 'text-white'}`}>{firmWinRecovery}%</p>
                            </div>
                            <div className="bg-black/40 p-3 rounded-lg text-center">
                                <p className="text-gray-400 text-xs mb-1">複勝回収率</p>
                                <p className={`text-2xl font-black ${firmPlaceRecovery > 100 ? 'text-red-500' : 'text-white'}`}>{firmPlaceRecovery}%</p>
                            </div>
                            <div className="bg-black/40 p-3 rounded-lg text-center">
                                <p className="text-gray-400 text-xs mb-1">勝率 (1着)</p>
                                <p className="text-2xl font-black text-white">{firmWinRate}%</p>
                            </div>
                            <div className="bg-black/40 p-3 rounded-lg text-center">
                                <p className="text-gray-400 text-xs mb-1">複勝率 (3着内)</p>
                                <p className="text-2xl font-black text-white">{firmPlaceRate}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Value Horse Stats */}
                    <div className="bg-gradient-to-br from-antigravity-accent/20 to-black border border-antigravity-accent/50 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                            <Trophy className="text-antigravity-accent mr-2" size={24} />
                            妙味馬 成績
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/40 p-3 rounded-lg text-center col-span-2">
                                <p className="text-gray-400 text-xs mb-1">複勝回収率</p>
                                <p className={`text-3xl font-black ${valuePlaceRecovery > 100 ? 'text-red-500' : 'text-white'}`}>{valuePlaceRecovery}%</p>
                            </div>
                            <div className="bg-black/40 p-3 rounded-lg text-center col-span-2">
                                <p className="text-gray-400 text-xs mb-1">複勝率 (3着内)</p>
                                <p className="text-3xl font-black text-white">{valuePlaceRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl">
                {dates.map((date) => (
                    <div key={date} className="mb-16">
                        {/* Date Header */}
                        <div className="flex items-center justify-center space-x-3 mb-8 border-b border-antigravity-accent/30 pb-4">
                            <Calendar className="text-antigravity-accent" />
                            <h2 className="text-2xl font-bold tracking-wider">{date}</h2>
                        </div>

                        {/* Grid of Races for this Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {groupedPredictions[date].map((pred) => (
                                <div key={pred.id} className="bg-black/60 border border-gray-700 rounded-lg overflow-hidden">
                                    {/* Race Title Header */}
                                    <div className="bg-gray-800/80 p-3 text-center border-b border-gray-600">
                                        <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                                            <Trophy size={18} className="text-yellow-500" />
                                            {pred.race_name}
                                        </h3>
                                    </div>

                                    {/* Table Content */}
                                    <div className="p-2">
                                        <table className="w-full text-sm md:text-base border-collapse">
                                            <tbody>
                                                {/* Firm Horse (Yellow Border/Highlight) */}
                                                <tr className="border-b border-gray-700/50">
                                                    <td className="p-2 text-gray-400 w-20">堅軸馬</td>
                                                    <td className="p-2 font-bold text-white break-words">{pred.firm_horse}</td>
                                                    <td className="p-2 text-right text-red-500 font-bold whitespace-nowrap w-16">
                                                        {pred.firm_horse_result}
                                                    </td>
                                                </tr>

                                                {/* Value Horse 1 */}
                                                <tr className="border-b border-gray-700/50">
                                                    <td className="p-2 text-gray-500 w-20">妙味馬 1</td>
                                                    <td className="p-2 text-gray-200 break-words">{pred.value_horse_1}</td>
                                                    <td className="p-2 text-right text-red-500 font-bold whitespace-nowrap w-16">
                                                        {pred.value_horse_1_result}
                                                    </td>
                                                </tr>

                                                {/* Value Horse 2 */}
                                                {pred.value_horse_2 && (
                                                    <tr className="border-b border-gray-700/50">
                                                        <td className="p-2 text-gray-500 w-20">妙味馬 2</td>
                                                        <td className="p-2 text-gray-200 break-words">{pred.value_horse_2}</td>
                                                        <td className="p-2 text-right text-red-500 font-bold whitespace-nowrap w-16">
                                                            {pred.value_horse_2_result}
                                                        </td>
                                                    </tr>
                                                )}

                                                {/* Value Horse 3 */}
                                                {pred.value_horse_3 && (
                                                    <tr>
                                                        <td className="p-2 text-gray-500 w-20">妙味馬 3</td>
                                                        <td className="p-2 text-gray-200 break-words">{pred.value_horse_3}</td>
                                                        <td className="p-2 text-right text-red-500 font-bold whitespace-nowrap w-16">
                                                            {pred.value_horse_3_result}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
