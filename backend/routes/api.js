const express = require('express');
const router = express.Router();
const db = require('../db');
const rulesEngine = require('../rulesEngine');

// AUTH (Simplified for demo)
router.post('/auth/login', async (req, res) => {
    const { email } = req.body;
    try {
        // Check if user exists, otherwise create (demo shortcut)
        let user = await db.get('SELECT * FROM users WHERE email = $1', [email]);
        if (!user) {
            const result = await db.run('INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id', [email, 'demo-hash']);
            user = { id: result.lastInsertRowid, email };
        }
        // Ensure hub exists for user
        let hub = await db.get('SELECT * FROM hubs WHERE user_id = $1', [user.id]);
        if (!hub) {
            await db.run('INSERT INTO hubs (user_id, slug, title) VALUES ($1, $2, $3)', [user.id, `hub-${user.id}`, `${email}'s Hub`]);
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('Auth login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/auth/signup', async (req, res) => {
    const { email } = req.body;
    try {
        const result = await db.run('INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id', [email, 'demo-hash']);
        const user = { id: result.lastInsertRowid, email };
        await db.run('INSERT INTO hubs (user_id, slug, title) VALUES ($1, $2, $3)', [user.id, `hub-${user.id}`, `${email}'s Hub`]);
        res.json({ success: true, user });
    } catch (e) {
        console.error('Auth signup error:', e);
        res.status(400).json({ error: 'User already exists or DB error' });
    }
});

// Helper to ensure a hub exists for Demo/Dev purposes
const ensureHubExists = async () => {
    let hub = await db.get('SELECT id FROM hubs LIMIT 1');
    if (!hub) {
        console.log('No hub found, creating a default demo hub...');
        // Create a default user first if none exists
        let user = await db.get('SELECT id FROM users LIMIT 1');
        if (!user) {
            const userResult = await db.run('INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id', ['demo@example.com', 'demo-hash']);
            user = { id: userResult.lastInsertRowid };
        }
        const result = await db.run('INSERT INTO hubs (user_id, slug, title) VALUES ($1, $2, $3) RETURNING id', [user.id, 'demo-hub', 'Demo Hub']);
        hub = { id: result.lastInsertRowid };
    }
    return hub;
};

// LINKS CRUD
router.get('/links', async (req, res) => {
    try {
        const hub = await ensureHubExists();
        const links = await db.query('SELECT * FROM links WHERE hub_id = $1 ORDER BY position ASC', [hub.id]);
        res.json(links);
    } catch (error) {
        console.error('Error fetching links:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/links', async (req, res) => {
    try {
        const { title, url } = req.body;
        const hub = await ensureHubExists();

        if (!title || !url) {
            console.warn('Bad Request: Missing title or url');
            return res.status(400).json({ error: 'Title and URL are required' });
        }

        const result = await db.run('INSERT INTO links (hub_id, title, url) VALUES ($1, $2, $3) RETURNING id', [hub.id, title, url]);
        res.json({ id: result.lastInsertRowid, title, url, clicks: 0 });
    } catch (error) {
        console.error('Error adding link:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/links/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, url } = req.body;

        if (!title || !url) {
            return res.status(400).json({ error: 'Title and URL are required' });
        }

        await db.run('UPDATE links SET title = $1, url = $2 WHERE id = $3', [title, url, id]);
        const updated = await db.get('SELECT * FROM links WHERE id = $1', [id]);
        res.json(updated);
    } catch (error) {
        console.error('Error updating link:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/links/reorder', async (req, res) => {
    try {
        const { linkId, newPosition } = req.body;

        if (linkId === undefined || newPosition === undefined) {
            return res.status(400).json({ error: 'linkId and newPosition are required' });
        }

        // Update the position of the target link
        await db.run('UPDATE links SET position = $1 WHERE id = $2', [newPosition, linkId]);

        // Get all links to return updated list
        const hub = await ensureHubExists();
        const links = await db.query('SELECT * FROM links WHERE hub_id = $1 ORDER BY position ASC', [hub.id]);

        res.json({ success: true, links });
    } catch (error) {
        console.error('Error reordering links:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/links/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // First delete associated analytics to avoid foreign key constraint issues
        await db.run('DELETE FROM analytics WHERE link_id = $1', [id]);
        // Then delete the link
        await db.run('DELETE FROM links WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting link:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// ANALYTICS & STATS
router.get('/stats', async (req, res) => {
    try {
        const hub = await ensureHubExists();

        const totalClicksRes = await db.get('SELECT SUM(clicks) as count FROM links WHERE hub_id = $1', [hub.id]);
        const totalClicks = totalClicksRes.count || 0;

        const uniqueVisitorsRes = await db.get('SELECT COUNT(DISTINCT visitor_id) as count FROM analytics WHERE hub_id = $1', [hub.id]);
        const uniqueVisitors = uniqueVisitorsRes.count || 0;

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

router.post('/analytics', async (req, res) => {
    try {
        const { link_id, event_type } = req.body;
        const hub = await db.get('SELECT hub_id FROM links WHERE id = $1', [link_id]);
        if (!hub) return res.status(404).json({ error: 'Link not found' });

        if (event_type === 'click') {
            await db.run('UPDATE links SET clicks = clicks + 1 WHERE id = $1', [link_id]);
        }

        await db.run('INSERT INTO analytics (hub_id, link_id, event_type, visitor_id) VALUES ($1, $2, $3, $4)',
            [hub.hub_id, link_id, event_type, req.ip]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error recording analytics:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// RULES MANAGEMENT
router.get('/rules', async (req, res) => {
    try {
        const hub = await ensureHubExists();
        const rules = await db.query('SELECT * FROM rules WHERE hub_id = $1 ORDER BY priority DESC', [hub.id]);
        res.json(rules);
    } catch (error) {
        console.error('Error fetching rules:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/rules', async (req, res) => {
    try {
        const { name, type, conditions, action, priority } = req.body;
        const hub = await ensureHubExists();

        if (!type || !conditions || !action) {
            return res.status(400).json({ error: 'Type, conditions, and action are required' });
        }

        // PostgreSQL JSONB handling - better to pass as objects
        const conditionsObj = typeof conditions === 'string' ? JSON.parse(conditions) : conditions;
        const actionObj = typeof action === 'string' ? JSON.parse(action) : action;

        const result = await db.run(
            'INSERT INTO rules (hub_id, name, type, conditions, action, priority, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [hub.id, name || `${type} rule`, type, conditionsObj, actionObj, priority || 0, true]
        );

        const newRule = await db.get('SELECT * FROM rules WHERE id = $1', [result.lastInsertRowid]);
        res.json(newRule);
    } catch (error) {
        console.error('Error creating rule:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/rules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, conditions, action, priority, is_active } = req.body;

        const conditionsObj = typeof conditions === 'string' ? JSON.parse(conditions) : conditions;
        const actionObj = typeof action === 'string' ? JSON.parse(action) : action;

        await db.run(
            'UPDATE rules SET name = $1, type = $2, conditions = $3, action = $4, priority = $5, is_active = $6 WHERE id = $7',
            [name, type, conditionsObj, actionObj, priority, is_active, id]
        );

        const updated = await db.get('SELECT * FROM rules WHERE id = $1', [id]);
        res.json(updated);
    } catch (error) {
        console.error('Error updating rule:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/rules/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM rules WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting rule:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUBLIC HUB VIEW
router.get('/hub/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const hub = await db.get('SELECT * FROM hubs WHERE slug = $1', [slug]);
        if (!hub) return res.status(404).json({ error: 'Hub not found' });

        const links = await db.query('SELECT * FROM links WHERE hub_id = $1 AND is_active = true ORDER BY position ASC', [hub.id]);
        const rules = await db.query('SELECT * FROM rules WHERE hub_id = $1 AND is_active = true', [hub.id]);

        const context = {
            device: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
            time: new Date()
        };

        const optimizedLinks = rulesEngine.evaluate(hub, links, rules, context);
        res.json({ ...hub, links: optimizedLinks });
    } catch (error) {
        console.error('Error fetching hub view:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
