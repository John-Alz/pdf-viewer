// /api/feedback.js
export default async function handler(req, res) {
    try {
        const { sid, cid, tid, gas } = req.query;
        if (!sid || !cid || !tid || !gas) {
            return res.status(400).json({ ok: false, error: 'missing_params' });
        }

        const url =
            `https://script.google.com/macros/s/${encodeURIComponent(gas)}/exec` +
            `?path=feedback-jsonp&callback=__x` +
            `&studentId=${encodeURIComponent(sid)}` +
            `&courseId=${encodeURIComponent(cid)}` +
            `&stageId=${encodeURIComponent(tid)}`;

        const r = await fetch(url);
        const text = await r.text(); // viene como "__x({...});"

        const m = text.match(/__x\((.*)\);?$/s);
        if (!m) {
            return res.status(502).json({ ok: false, error: 'bad_jsonp', raw: text.slice(0, 200) });
        }

        const data = JSON.parse(m[1]);
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ ok: false, error: 'proxy_error', detail: String(err) });
    }
}
