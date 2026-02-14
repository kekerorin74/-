'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface Horse {
    id: string;
    name: string;
    detail: string;
}

interface Props {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onSelectId: (id: string) => void;
    placeholder?: string;
    required?: boolean;
}

export default function HorseAutocomplete({ label, value, onChange, onSelectId, placeholder, required }: Props) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<Horse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync external value changes
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2 && showSuggestions) {
                setIsLoading(true);
                try {
                    const res = await fetch(`/api/search/horse?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    setSuggestions(data.horses || []);
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, showSuggestions]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        onChange(val);
        setShowSuggestions(true);
        // Reset ID if user types manually
        onSelectId('');
    };

    const handleSelect = (horse: Horse) => {
        setQuery(horse.name);
        onChange(horse.name);
        onSelectId(horse.id);
        setShowSuggestions(false);
    };

    return (
        <div className="relative mb-4" ref={wrapperRef}>
            <label className="block text-antigravity-text text-sm font-bold mb-2 tracking-wider">
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full bg-black/50 border border-antigravity-accent/30 text-white p-3 rounded focus:outline-none focus:border-antigravity-accent focus:shadow-[0_0_10px_rgba(0,243,255,0.3)] transition-all duration-300"
                    placeholder={placeholder || '馬名を入力 (2文字以上で検索)'}
                    required={required}
                />
                <div className="absolute right-3 top-3 text-antigravity-accent/50">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-gray-900 border border-antigravity-accent/50 rounded mt-1 max-h-60 overflow-y-auto shadow-xl">
                    {suggestions.map((horse) => (
                        <li
                            key={horse.id}
                            onClick={() => handleSelect(horse)}
                            className="p-3 hover:bg-antigravity-accent/20 cursor-pointer border-b border-gray-800 last:border-0 transition-colors"
                        >
                            <div className="font-bold text-white">{horse.name}</div>
                            <div className="text-xs text-gray-400">{horse.detail}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
