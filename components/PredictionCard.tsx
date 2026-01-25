import { Calendar, Trophy, ChevronRight } from 'lucide-react';

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
}

export default function PredictionCard({ prediction }: { prediction: Prediction }) {
    return (
        <div className="relative group perspective-1000 w-full mb-8">
            {/* Glow Effect Layer */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-antigravity-accent via-antigravity-purple to-antigravity-accent rounded-xl blur-md opacity-30 group-hover:opacity-80 transition duration-500"></div>

            <div className="relative bg-antigravity-card/95 backdrop-blur-xl border border-antigravity-accent/30 rounded-xl p-6 md:p-8 transform transition-all duration-300">
                {/* Header: Date and Race */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-800/50">
                    <div className="flex items-center space-x-3 mb-2 md:mb-0">
                        <Calendar size={18} className="text-antigravity-accent" />
                        <span className="text-gray-400 font-mono tracking-wider font-bold">{prediction.race_date}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white flex items-center tracking-tight text-glow drop-shadow-lg">
                        <Trophy size={28} className="mr-3 text-yellow-400" />
                        {prediction.race_name}
                    </h3>
                </div>

                {/* 2-Tier Layout */}
                <div className="flex flex-col gap-4">
                    {/* Top Tier: Firm Horse (100% width) */}
                    <div className="w-full bg-black/40 p-5 rounded-lg border-l-4 border-antigravity-purple group/item hover:bg-antigravity-purple/10 transition-colors relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-2 opacity-10 group-hover/item:opacity-20 transition-opacity">
                            <Trophy size={40} />
                        </div>
                        <p className="text-gray-500 text-xs font-bold mb-1 tracking-widest uppercase">堅軸馬</p>
                        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                            <p className="text-2xl md:text-3xl lg:text-5xl font-black text-white tracking-wide leading-none break-words max-w-full">
                                {prediction.firm_horse}
                            </p>
                            {prediction.firm_horse_result && (
                                <span className="text-red-500 font-bold text-xl md:text-2xl whitespace-nowrap animate-pulse">
                                    {prediction.firm_horse_result}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Bottom Tier: Value Horses (3 Columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Value Horse 1 */}
                        {prediction.value_horse_1 && (
                            <div className="bg-black/40 p-4 rounded-lg border-l-4 border-antigravity-accent group/item hover:bg-antigravity-accent/10 transition-colors relative overflow-hidden">
                                <p className="text-gray-500 text-[10px] font-bold mb-1 tracking-widest uppercase">妙味馬</p>
                                <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                                    <p className="text-lg md:text-2xl font-black text-white tracking-wide leading-none break-words max-w-full">
                                        {prediction.value_horse_1}
                                    </p>
                                    {prediction.value_horse_1_result && (
                                        <span className="text-red-500 font-bold text-lg whitespace-nowrap">
                                            {prediction.value_horse_1_result}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Value Horse 2 */}
                        {prediction.value_horse_2 && (
                            <div className="bg-black/40 p-4 rounded-lg border-l-4 border-antigravity-accent group/item hover:bg-antigravity-accent/10 transition-colors relative overflow-hidden">
                                <p className="text-gray-500 text-[10px] font-bold mb-1 tracking-widest uppercase">妙味馬</p>
                                <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                                    <p className="text-lg md:text-2xl font-black text-white tracking-wide leading-none break-words max-w-full">
                                        {prediction.value_horse_2}
                                    </p>
                                    {prediction.value_horse_2_result && (
                                        <span className="text-red-500 font-bold text-lg whitespace-nowrap">
                                            {prediction.value_horse_2_result}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Value Horse 3 */}
                        {prediction.value_horse_3 && (
                            <div className="bg-black/40 p-4 rounded-lg border-l-4 border-antigravity-accent group/item hover:bg-antigravity-accent/10 transition-colors relative overflow-hidden">
                                <p className="text-gray-500 text-[10px] font-bold mb-1 tracking-widest uppercase">妙味馬</p>
                                <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                                    <p className="text-lg md:text-2xl font-black text-white tracking-wide leading-none break-words max-w-full">
                                        {prediction.value_horse_3}
                                    </p>
                                    {prediction.value_horse_3_result && (
                                        <span className="text-red-500 font-bold text-lg whitespace-nowrap">
                                            {prediction.value_horse_3_result}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
