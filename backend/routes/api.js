const express = require('express');
const router = express.Router();
const db = require('../db');
const rulesEngine = require('../rulesEngine');

// AUTH (Simplified for demo)
router.post('/auth/login', (req, res) => {
    const { email } = req.body;
    // Check if user exists, otherwise create (demo shortcut)
    let user = db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
        const result = db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, 'demo-hash']);
        user = { id: result.lastInsertRowid, email };
    }
    // Ensure hub exists for user
    let hub = db.get('SELECT * FROM hubs WHERE user_id = ?', [user.id]);
    if (!hub) {
        db.run('INSERT INTO hubs (user_id, slug, title) VALUES (?, ?, ?)', [user.id, `hub-${user.id}`, `${email}'s Hub`]);
    }
    res.json({ success: true, user });
});

router.post('/auth/signup', (req, res) => {
    const { email } = req.body;
    try {
        const result = db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, 'demo-hash']);
        const user = { id: result.lastInsertRowid, email };
        db.run('INSERT INTO hubs (user_id, slug, title) VALUES (?, ?, ?)', [user.id, `hub-${user.id}`, `${email}'s Hub`]);
        res.json({ success: true, user });
    } catch (e) {
        res.status(400).json({ error: 'User already exists or DB error' });
    }
});

// Helper to ensure a hub exists for Demo/Dev purposes
const ensureHubExists = () => {
    let hub = db.get('SELECT id FROM hubs LIMIT 1');
    if (!hub) {
        console.log('No hub found, creating a default demo hub...');
        // Create a default user first if none exists
        let user = db.get('SELECT id FROM users LIMIT 1');
        if (!user) {
            const userResult = db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', ['demo@example.com', 'demo-hash']);
            user = { id: userResult.lastInsertRowid };
        }
        const result = db.run('INSERT INTO hubs (user_id, slug, title) VALUES (?, ?, ?)', [user.id, 'demo-hub', 'Demo Hub']);
        hub = { id: result.lastInsertRowid };
    }
    return hub;
};

// LINKS CRUD
router.get('/links', (req, res) => {
    try {
        const hub = ensureHubExists();
        const links = db.query('SELECT * FROM links WHERE hub_id = ? ORDER BY position ASC', [hub.id]);
        res.json(links);
    } catch (error) {
        console.error('Error fetching links:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/links', (req, res) => {
    try {
        const { title, url } = req.body;
        const hub = ensureHubExists();

        if (!title || !url) {
            console.warn('Bad Request: Missing title or url');
            return res.status(400).json({ error: 'Title and URL are required' });
        }

        const result = db.run('INSERT INTO links (hub_id, title, url) VALUES (?, ?, ?)', [hub.id, title, url]);
        res.json({ id: result.lastInsertRowid, title, url, clicks: 0 });
    } catch (error) {
        console.error('Error adding link:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/links/:id', (req, res) => {
    try {
        db.run('DELETE FROM links WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting link:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ANALYTICS & STATS
router.get('/stats', (req, res) => {
    try {
        const hub = ensureHubExists();

        const totalClicks = db.get('SELECT SUM(clicks) as count FROM links WHERE hub_id = ?', [hub.id]).count || 0;
        const uniqueVisitors = db.get('SELECT COUNT(DISTINCT visitor_id) as count FROM analytics WHERE hub_id = ?', [hub.id]).count || 0;

        res.json({
            totalClicks: totalClicks.toString(),
            uniqueVisitors: uniqueVisitors.toString(),
            ctr: totalClicks > 0 ? '4.8%' : '0%' // Mock CTR calculation
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/analytics', (req, res) => {
    const { link_id, event_type } = req.body;
    const hub = db.get('SELECT hub_id FROM links WHERE id = ?', [link_id]);
    if (!hub) return res.status(404).json({ error: 'Link not found' });

    if (event_type === 'click') {
        db.run('UPDATE links SET clicks = clicks + 1 WHERE id = ?', [link_id]);
    }

    db.run('INSERT INTO analytics (hub_id, link_id, event_type, visitor_id) VALUES (?, ?, ?, ?)',
        [hub.hub_id, link_id, event_type, req.ip]);

    res.json({ success: true });
});

// PUBLIC HUB VIEW
router.get('/hub/:slug', async (req, res) => {
    const { slug } = req.params;
    const hub = db.get('SELECT * FROM hubs WHERE slug = ?', [slug]);
    if (!hub) return res.status(404).json({ error: 'Hub not found' });

    const links = db.query('SELECT * FROM links WHERE hub_id = ? AND is_active = 1 ORDER BY position ASC', [hub.id]);
    const rules = db.query('SELECT * FROM rules WHERE hub_id = ? AND is_active = 1', [hub.id]);

    const context = {
        device: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
        time: new Date()
    };

    const optimizedLinks = rulesEngine.evaluate(hub, links, rules, context);
    res.json({ ...hub, links: optimizedLinks });
});

module.exports = router;
