import * as cheerio from 'cheerio';
import { get } from 'fast-levenshtein';

// Netkeiba Location Codes (Simplified map, might need expansion)
const LOCATION_CODES: { [key: string]: string } = {
    '札幌': '01', '函館': '02', '福島': '03', '新潟': '04',
    '東京': '05', '中山': '06', '中京': '07', '京都': '08',
    '阪神': '09', '小倉': '10'
};

interface RaceResult {
    race_id: string;
    horse_results: { [horseName: string]: { rank: string, payout_win?: number, payout_place?: number } };
}

export class RaceScraper {
    private async fetchHtml(url: string): Promise<string> {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } });
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
        return res.text();
    }

    // Helper: Fuzzy match horse name
    // Returns the best match from a list of candidates if distance is within threshold
    private findBestMatch(target: string, candidates: string[]): string | null {
        let bestMatch = null;
        let minDistance = Infinity;

        // Clean target (remove spaces, etc)
        const cleanTarget = target.replace(/\s+/g, '');

        for (const candidate of candidates) {
            const cleanCandidate = candidate.replace(/\s+/g, '');
            const distance = get(cleanTarget, cleanCandidate);

            // Threshold: Allow 1-2 char difference depending on length
            const threshold = cleanTarget.length > 5 ? 2 : 1;

            if (distance <= threshold && distance < minDistance) {
                minDistance = distance;
                bestMatch = candidate;
            }
        }
        return bestMatch;
    }

    public async scrapeRace(dateStr: string, location: string, raceName: string): Promise<RaceResult | null> {
        // 1. Search Logic (Simplified: Search by Race Name on Netkeiba/Yahoo? OR Construct ID)
        // Constructing ID is hard without knowing "Kai" (Event #) and "Nich" (Day #).
        // Better strategy: Search db.netkeiba.com

        // Format date: YYYYMMDD (e.g., 2026年1月25日 -> 20260125)
        // Japanese date parser
        const dateMatch = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (!dateMatch) return null;
        const yyyy = dateMatch[1];
        const mm = dateMatch[2].padStart(2, '0');
        const dd = dateMatch[3].padStart(2, '0');
        const dateQuery = `${yyyy}${mm}${dd}`;

        // Netkeiba DB Search URL (Search by Race Name)
        // Note: Netkeiba search is POST or complex query. 
        // Fallback A: Try to construct ID if we knew the event counts... we don't.
        // Fallback B: Google Search? No API.
        // Fallback C: Use the "Race List" page of the Date.
        // URL: https://db.netkeiba.com/race/list/{YYYYMMDD}/

        const listUrl = `https://db.netkeiba.com/race/list/${dateQuery}/`;
        // console.log("Fetching List: ", listUrl);

        try {
            const html = await this.fetchHtml(listUrl);
            const $ = cheerio.load(html);

            // Find race by Location and Name/Number
            // Verify Location Code presence in logic if needed, but text matching "中山 11R" is safer
            // The list page groups by Location.

            let targetRacePath = '';

            // Iterate all race cells
            $('dl.race_top_data').each((i, el) => {
                const raceData = $(el);
                const raceHeader = raceData.find('.race_top_data_info').text(); // e.g., "1回中山9日目"

                if (location && !raceHeader.includes(location)) return; // Skip if location mismatch

                raceData.find('tr').each((j, row) => {
                    const rowData = $(row);
                    const rName = rowData.find('.race_name a').text().trim();
                    const rNum = rowData.find('.r01').text().trim(); // "11R"
                    const href = rowData.find('.race_name a').attr('href');

                    // Match by rough name OR number if race_name provided is simplified
                    // User input: "中山11R カーバンクルS" -> we can extract "11R" or "カーバンクル"

                    // Simple logic: Does scraped name include user name? or vice versa?
                    // Or match R number if present in user string

                    // Extract R number from user input "中山11R..."
                    const userRNumMatch = raceName.match(/(\d{1,2})R/);
                    const userRNum = userRNumMatch ? userRNumMatch[1] + 'R' : null;

                    let match = false;
                    if (userRNum && rNum === userRNum) match = true;
                    // else if (rName === raceName) match = true; // Exact match rare
                    else if (get(raceName, rName) < 3) match = true; // Fuzzy name match

                    // console.log(`Checking: ${rNum} ${rName} vs User: ${userRNum} ${raceName} -> ${match}`);

                    if (match && href) {
                        targetRacePath = href;
                        return false; // Break loop
                    }
                });
                if (targetRacePath) return false;
            });

            if (!targetRacePath) {
                // console.log("Race not found in list.");
                return null;
            }

            // 2. Scrape Details
            const detailUrl = `https://db.netkeiba.com${targetRacePath}`;
            const detailHtml = await this.fetchHtml(detailUrl);
            const $d = cheerio.load(detailHtml);

            const results: RaceResult = {
                race_id: targetRacePath.replace('/race/', '').replace('/', ''),
                horse_results: {}
            };

            // Parse Arrival Order Table (rank, horse name)
            // Table class "raise_result_table" or similar
            $('table.race_table_01 tr').each((i, row) => {
                if (i === 0) return; // Header
                const tds = $(row).find('td');
                const rank = $(tds[0]).text().trim();
                const horseName = $(tds[3]).text().trim();

                // Save rank for now. Payout logic comes next.
                if (horseName) {
                    results.horse_results[horseName] = { rank: rank + '着' };
                }
            });

            // Parse Payout (Dividends) Table
            // Usually multiple tables: Win(単勝), Place(複勝), etc.
            // Class "pay_block" layout
            $('.pay_block tr').each((i, row) => {
                const type = $(row).find('th').text().trim();

                if (type === '単勝') {
                    // Parse Win
                    // Payout is in <td>, might contain multiple if dead heat (rare)
                    // Format: "100" (Yen)
                    // Horse Num is separate. We need to map Horse Num -> Name -> Result?
                    // Actually, the Result Table has Rank. 
                    // Simpler: 
                    // If a horse is 1st, look up Win Payout.
                    // If a horse is 1-3rd, look up Place Payout.
                    // BUT, to attribute correct Place payout to correct horse, we need Horse Number.
                    // Let's re-parse Result Table to get Horse Numbers.
                }
            });

            // Improved Logic:
            // 1. Map Horse Name -> Horse Number
            const nameToNum: { [name: string]: string } = {};
            $('table.race_table_01 tr').each((i, row) => {
                if (i === 0) return;
                const tds = $(row).find('td');
                const num = $(tds[2]).text().trim(); // Umaban usually 3rd col
                const name = $(tds[3]).text().trim();
                if (num && name) nameToNum[name] = num;
            });

            // 2. Parse Payouts
            // Structure is tricky. <tr class="consult">...
            // .pay_block usually has rows like: [Type][HorseNum][Money][Popularity]
            // Note: Place(複勝) has multiple rows/lines in same cell.

            // Extract Payout Data
            const winPayouts: { [num: string]: number } = {};
            const placePayouts: { [num: string]: number } = {};

            $('.pay_block tr').each((i, row) => {
                const th = $(row).find('th').text();
                const tds = $(row).find('td');

                if (th === '単勝') {
                    const nums = $(tds[0]).html()?.split('<br>') || [];
                    const moneys = $(tds[1]).html()?.split('<br>') || [];
                    nums.forEach((n, idx) => {
                        winPayouts[n.trim()] = parseInt(moneys[idx].replace(/,/g, ''));
                    });
                } else if (th === '複勝') {
                    const nums = $(tds[0]).html()?.split('<br>') || [];
                    const moneys = $(tds[1]).html()?.split('<br>') || [];
                    nums.forEach((n, idx) => {
                        placePayouts[n.trim()] = parseInt(moneys[idx].replace(/,/g, ''));
                    });
                }
            });

            // 3. Merge into results
            for (const [name, res] of Object.entries(results.horse_results)) {
                const num = nameToNum[name];
                if (num) {
                    if (winPayouts[num]) res.payout_win = winPayouts[num];
                    if (placePayouts[num]) res.payout_place = placePayouts[num];
                }
            }

            return results;

        } catch (e) {
            console.error("Scrape Error:", e);
            return null;
        }
    }

    public async searchHorse(query: string): Promise<{ id: string; name: string; detail: string }[]> {
        // Netkeiba Horse Search
        // URL: https://db.netkeiba.com/?pid=horse_list&word={query}
        // Note: encoding might be euc-jp, but let's try standard fetch first. 
        // If query is Japanese, we might need manual box search or handling.
        // Actually, simple GET works for many cases if browser handles it, but node fetch might need encoding.
        // Let's try basic first.

        const searchUrl = `https://db.netkeiba.com/?pid=horse_list&word=${encodeURIComponent(query)}`;
        try {
            // Netkeiba often requires EUC-JP for search queries... 
            // If standard fetch fails to find results for Japanese text, we might need `iconv-lite`.
            // For now, assume it works or use alternative if needed.
            // Actually, newer Netkeiba might accept UTF8 or we rely on the fact that sometimes it works.
            // Wait, standard `fetch` with URL params usually encodes as UTF-8. Netkeiba is old school.

            // To be safe, if we get 0 results for a known horse, we know it's encoding.
            // Let's implement scrambling.

            const html = await this.fetchHtml(searchUrl);
            const $ = cheerio.load(html);

            const horses: { id: string; name: string; detail: string }[] = [];

            // Selector: table summary="競走馬検索結果"
            // tr loop
            $('table tr').each((i, row) => {
                if (i === 0) return; // header
                const tds = $(row).find('td');
                const nameLink = $(tds[1]).find('a');
                const name = nameLink.text().trim();
                const href = nameLink.attr('href');

                // details: sex/age, trainer, parents etc. structure varies
                // Let's just grab the whole row text or specific cells
                const sexAge = $(tds[2]).text().trim();
                const father = $(tds[6]).text().trim();
                const mother = $(tds[7]).text().trim();
                const detail = `${sexAge} / 父:${father} / 母:${mother}`;

                if (name && href) {
                    // href="/horse/2021105432/"
                    const id = href.replace('/horse/', '').replace('/', '');
                    horses.push({ id, name, detail });
                }
            });

            return horses.slice(0, 10); // Limit to 10
        } catch (e) {
            console.error("Horse Search Error:", e);
            return [];
        }
    }
}
