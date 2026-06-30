const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

async function main() {
    const parser = new Parser();
    const feedsPath = path.join(__dirname, 'feeds.json');
    let feeds = [];
    try {
        feeds = JSON.parse(fs.readFileSync(feedsPath, 'utf8'));
    } catch (e) {
        console.error('Cannot read feeds.json:', e.message);
        process.exit(1);
    }

    const items = [];
    for (const f of feeds) {
        try {
            const feed = await parser.parseURL(f.url);
            const source = f.name || feed.title || '';
            (feed.items || []).forEach(it => {
                items.push({
                    title: it.title || '',
                    link: it.link || '',
                    isoDate: it.isoDate || it.pubDate || null,
                    source
                });
            });
        } catch (err) {
            console.error('Failed to fetch', f.url, err.message);
        }
    }

    // remove duplicates by link or title
    const seen = new Set();
    const unique = items.filter(i => {
        const key = i.link || i.title;
        if (!key) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    unique.sort((a, b) => {
        const da = a.isoDate ? Date.parse(a.isoDate) : 0;
        const db = b.isoDate ? Date.parse(b.isoDate) : 0;
        return db - da;
    });

    const top = unique.slice(0, 5);
    const out = { generated: new Date().toISOString(), count: top.length, items: top };

    const docsDir = path.join(__dirname, '..', 'docs');
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
    const outPath = path.join(docsDir, 'news.json');
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
    console.log('Wrote', outPath);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
