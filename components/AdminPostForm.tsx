"use client";

import { useState, useEffect } from 'react';

export default function AdminPostForm() {
    const [formData, setFormData] = useState({
        race_date: '',
        race_name: '',
        firm_horse: '',
        value_horse_1: '',
        value_horse_2: '',
        value_horse_3: '',
    });
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (prediction: any) => {
        setEditingId(prediction.id);
        setFormData({
            race_date: prediction.race_date,
            race_name: prediction.race_name,
            firm_horse: prediction.firm_horse,
            value_horse_1: prediction.value_horse_1 || '',
            value_horse_2: prediction.value_horse_2 || '',
            value_horse_3: prediction.value_horse_3 || '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            race_date: '',
            race_name: '',
            firm_horse: '',
            value_horse_1: '',
            value_horse_2: '',
            value_horse_3: '',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { ...formData, id: editingId } : formData;

            const res = await fetch('/api/predictions', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setStatus('success');
                setEditingId(null); // Reset edit mode
                setFormData({
                    race_date: '',
                    race_name: '',
                    firm_horse: '',
                    value_horse_1: '',
                    value_horse_2: '',
                    value_horse_3: '',
                });
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
                            value={formData.race_date}
                            onChange={handleChange}
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
                            value={formData.race_name}
                            onChange={handleChange}
                            required
                            className="w-full bg-black/40 border border-gray-700 rounded-lg p-4 text-lg text-white focus:border-antigravity-accent focus:ring-1 focus:ring-antigravity-accent outline-none"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                        <h3 className="text-antigravity-purple font-bold mb-3">予想内容 (Predictions)</h3>

                        <div className="mb-4">
                            <label className="block text-gray-400 text-sm mb-1">堅軸 (Firm Axis)</label>
                            <input
                                type="text"
                                name="firm_horse"
                                placeholder="14 モリノドリーム"
                                value={formData.firm_horse}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-900 border border-antigravity-purple/50 rounded-lg p-4 text-lg text-white focus:border-antigravity-purple outline-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-gray-400 text-sm mb-1">妙味 (Value Horses)</label>
                            <input
                                type="text"
                                name="value_horse_1"
                                placeholder="2 ティニア"
                                value={formData.value_horse_1}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-900 border border-antigravity-accent/50 rounded-lg p-4 text-lg text-white focus:border-antigravity-accent outline-none"
                            />
                            <input
                                type="text"
                                name="value_horse_2"
                                placeholder="10 ウイングレイテスト"
                                value={formData.value_horse_2}
                                onChange={handleChange}
                                className="w-full bg-gray-900 border border-antigravity-accent/30 rounded-lg p-4 text-lg text-white focus:border-antigravity-accent outline-none"
                            />
                            <input
                                type="text"
                                name="value_horse_3"
                                placeholder="5 ユキマル"
                                value={formData.value_horse_3}
                                onChange={handleChange}
                                className="w-full bg-gray-900 border border-antigravity-accent/30 rounded-lg p-4 text-lg text-white focus:border-antigravity-accent outline-none"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${status === 'success' ? 'bg-green-500 text-black' :
                        status === 'error' ? 'bg-red-500 text-white' :
                            editingId ? 'bg-orange-500 text-white hover:bg-orange-400' : // Edit mode style
                                'bg-antigravity-accent text-black hover:bg-cyan-400 shadow-[0_0_25px_rgba(0,243,255,0.4)]'
                        }`}
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
