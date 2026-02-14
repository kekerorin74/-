```
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Edit } from 'lucide-react';
import HorseAutocomplete from './HorseAutocomplete'; // Import

export default function AdminPostForm() {
    const [raceDate, setRaceDate] = useState('');
    const [raceName, setRaceName] = useState('');

    const [firmHorse, setFirmHorse] = useState('');
    const [firmHorseId, setFirmHorseId] = useState('');
    const [firmHorseResult, setFirmHorseResult] = useState('');

    const [valueHorse1, setValueHorse1] = useState('');
    const [valueHorse1Id, setValueHorse1Id] = useState(''); // Add IDs
    const [valueHorse1Result, setValueHorse1Result] = useState('');

    const [valueHorse2, setValueHorse2] = useState('');
    const [valueHorse2Id, setValueHorse2Id] = useState('');
    const [valueHorse2Result, setValueHorse2Result] = useState('');

    const [valueHorse3, setValueHorse3] = useState('');
    const [valueHorse3Id, setValueHorse3Id] = useState('');
    const [valueHorse3Result, setValueHorse3Result] = useState('');

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [predictions, setPredictions] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchPredictions = async () => {
        try {
            const res = await fetch('/api/predictions');
            if (res.ok) {
                const data = await res.json();
                setPredictions(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchPredictions();
    }, []);

    const handleEdit = (prediction: any) => {
        setEditingId(prediction.id);
        setRaceDate(prediction.race_date);
        setRaceName(prediction.race_name);
        setFirmHorse(prediction.firm_horse);
        setFirmHorseId(prediction.firm_horse_id || '');
        setFirmHorseResult(prediction.firm_horse_result || '');
        setValueHorse1(prediction.value_horse_1 || '');
        setValueHorse1Id(prediction.value_horse_1_id || '');
        setValueHorse1Result(prediction.value_horse_1_result || '');
        setValueHorse2(prediction.value_horse_2 || '');
        setValueHorse2Id(prediction.value_horse_2_id || '');
        setValueHorse2Result(prediction.value_horse_2_result || '');
        setValueHorse3(prediction.value_horse_3 || '');
        setValueHorse3Id(prediction.value_horse_3_id || '');
        setValueHorse3Result(prediction.value_horse_3_result || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setRaceDate('');
        setRaceName('');
        setFirmHorse('');
        setFirmHorseId('');
        setFirmHorseResult('');
        setValueHorse1('');
        setValueHorse1Id('');
        setValueHorse1Result('');
        setValueHorse2('');
        setValueHorse2Id('');
        setValueHorse2Result('');
        setValueHorse3('');
        setValueHorse3Id('');
        setValueHorse3Result('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = {
                race_date: raceDate,
                race_name: raceName,
                firm_horse: firmHorse,
                firm_horse_id: firmHorseId, // Send ID
                firm_horse_result: firmHorseResult,
                value_horse_1: valueHorse1,
                value_horse_1_id: valueHorse1Id,
                value_horse_1_result: valueHorse1Result,
                value_horse_2: valueHorse2,
                value_horse_2_id: valueHorse2Id,
                value_horse_2_result: valueHorse2Result,
                value_horse_3: valueHorse3,
                value_horse_3_id: valueHorse3Id,
                value_horse_3_result: valueHorse3Result
            };

            const res = await fetch('/api/predictions', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingId ? { ...body, id: editingId } : body),
            });

            if (res.ok) {
                setStatus('success');
                setEditingId(null); // Reset edit mode
                setRaceDate('');
                setRaceName('');
                setFirmHorse('');
                setFirmHorseId('');
                setFirmHorseResult('');
                setValueHorse1('');
                setValueHorse1Id('');
                setValueHorse1Result('');
                setValueHorse2('');
                setValueHorse2Id('');
                setValueHorse2Result('');
                setValueHorse3('');
                setValueHorse3Id('');
                setValueHorse3Result('');
                fetchPredictions(); // Refresh list
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('この予想を削除しますか？\n(Are you sure you want to delete this prediction?)')) return;

        try {
            const res = await fetch('/api/predictions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                fetchPredictions(); // Refresh list
            } else {
                alert('Delete failed');
            }
        } catch (e) {
            alert('Delete Error');
        }
    };

    return (
        <div className="pb-20">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto mb-16">
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">レース日付 (Date)</label>
                        <input
                            type="text"
                            name="race_date"
                            placeholder="2026年1月18日日曜日"
                            value={raceDate}
                            onChange={(e) => setRaceDate(e.target.value)}
                            required
                            className="w-full bg-black/40 border border-gray-700 rounded-lg p-4 text-lg text-white focus:border-antigravity-accent focus:ring-1 focus:ring-antigravity-accent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1">レース名 (Race Name)</label>
                        <input
                            type="text"
                            name="race_name"
                            placeholder="中山11R カーバンクルS"
                            value={raceName}
                            onChange={(e) => setRaceName(e.target.value)}
                            required
                            className="w-full bg-black/40 border border-gray-700 rounded-lg p-4 text-lg text-white focus:border-antigravity-accent focus:ring-1 focus:ring-antigravity-accent outline-none"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                        <h3 className="text-antigravity-purple font-bold mb-3">予想内容 (Predictions)</h3>

                        <div className="mb-8 p-4 border border-antigravity-purple/30 rounded-lg bg-antigravity-purple/5">
                            <h3 className="text-antigravity-purple font-bold mb-4 flex items-center">
                                <span className="bg-antigravity-purple text-black text-xs px-2 py-1 rounded mr-2">MAIN</span>
                                堅軸馬 (Firm Horse)
                            </h3>
                            <div className="flex gap-4">
                                <div className="flex-grow">
                                    <HorseAutocomplete
                                        label="馬名"
                                        value={firmHorse}
                                        onChange={setFirmHorse}
                                        onSelectId={setFirmHorseId}
                                        required
                                    />
                                </div>
                                {/* Result Input (Only if editing or explicitly adding result) */}
                                <div className="w-1/4">
                                    <label className="block text-gray-400 text-sm font-bold mb-2">結果</label>
                                    <input
                                        type="text"
                                        value={firmHorseResult}
                                        onChange={(e) => setFirmHorseResult(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-600 text-white p-3 rounded"
                                        placeholder="1着"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-8 p-4 border border-antigravity-accent/30 rounded-lg bg-antigravity-accent/5">
                            <h3 className="text-antigravity-accent font-bold mb-4 flex items-center">
                                <span className="bg-antigravity-accent text-black text-xs px-2 py-1 rounded mr-2">SUB</span>
                                妙味馬 (Value Horses)
                            </h3>

                            {/* Val 1 */}
                            <div className="flex gap-4 mb-4">
                                <div className="flex-grow">
                                    <HorseAutocomplete
                                        label="妙味馬 1"
                                        value={valueHorse1}
                                        onChange={setValueHorse1}
                                        onSelectId={setValueHorse1Id}
                                        required
                                    />
                                </div>
                                <div className="w-1/4">
                                    <label className="block text-gray-400 text-sm font-bold mb-2">結果</label>
                                    <input
                                        type="text"
                                        value={valueHorse1Result}
                                        onChange={(e) => setValueHorse1Result(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-600 text-white p-3 rounded"
                                    />
                                </div>
                            </div>

                            {/* Val 2 */}
                            <div className="flex gap-4 mb-4">
                                <div className="flex-grow">
                                    <HorseAutocomplete
                                        label="妙味馬 2 (任意)"
                                        value={valueHorse2}
                                        onChange={setValueHorse2}
                                        onSelectId={setValueHorse2Id}
                                    />
                                </div>
                                <div className="w-1/4">
                                    <label className="block text-gray-400 text-sm font-bold mb-2">結果</label>
                                    <input
                                        type="text"
                                        value={valueHorse2Result}
                                        onChange={(e) => setValueHorse2Result(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-600 text-white p-3 rounded"
                                    />
                                </div>
                            </div>

                            {/* Val 3 */}
                            <div className="flex gap-4 mb-4">
                                <div className="flex-grow">
                                    <HorseAutocomplete
                                        label="妙味馬 3 (任意)"
                                        value={valueHorse3}
                                        onChange={setValueHorse3}
                                        onSelectId={setValueHorse3Id}
                                    />
                                </div>
                                <div className="w-1/4">
                                    <label className="block text-gray-400 text-sm font-bold mb-2">結果</label>
                                    <input
                                        type="text"
                                        value={valueHorse3Result}
                                        onChange={(e) => setValueHorse3Result(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-600 text-white p-3 rounded"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={`w - full py - 4 rounded - xl font - bold text - lg shadow - lg transition - all ${
    status === 'success' ? 'bg-green-500 text-black' :
        status === 'error' ? 'bg-red-500 text-white' :
            editingId ? 'bg-orange-500 text-white hover:bg-orange-400' : // Edit mode style
                'bg-antigravity-accent text-black hover:bg-cyan-400 shadow-[0_0_25px_rgba(0,243,255,0.4)]'
} `}
                >
                    {status === 'loading' ? 'Sending...' :
                        status === 'success' ? 'Success!' :
                            status === 'error' ? 'Failed - Try Again' :
                                editingId ? '変更を保存 (Save Changes)' : 'Update (更新)'}
                </button>
                {editingId && (
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="w-full mt-4 py-3 rounded-lg border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-colors"
                    >
                        編集をキャンセル (Cancel Edit)
                    </button>
                )}
            </form>

            {/* Existing Predictions List */}
            <div className="max-w-lg mx-auto border-t border-gray-800 pt-8">
                <h3 className="text-xl font-bold text-white mb-6">投稿済みの予想一覧</h3>
                <div className="space-y-4">
                    {predictions.map((p) => (
                        <div key={p.id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex justify-between items-center group hover:border-gray-700">
                            <div>
                                <p className="text-xs text-antigravity-accent mb-1">{p.race_date}</p>
                                <p className="text-white font-bold">{p.race_name}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(p)}
                                    className="bg-antigravity-accent/20 text-antigravity-accent border border-antigravity-accent/50 px-4 py-2 rounded text-sm hover:bg-antigravity-accent hover:text-black transition-colors"
                                >
                                    編集
                                </button>
                                <button
                                    onClick={() => handleDelete(p.id)}
                                    className="bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded text-sm hover:bg-red-500 hover:text-white transition-colors"
                                >
                                    削除
                                </button>
                            </div>
                        </div>
                    ))}
                    {predictions.length === 0 && (
                        <p className="text-gray-600 text-center py-4">No predictions found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
