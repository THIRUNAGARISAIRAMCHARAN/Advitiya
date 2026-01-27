/**
 * Logic to apply smart rules to links.
 * Returns a re-ordered/modified list of links.
 */
class RulesEngine {
    constructor() {
        // In-memory cache or setup
    }

    evaluate(hub, links, rules, context) {
        // context: { time: Date, device: 'mobile'|'desktop', location: 'US', ... }

        let modifiedLinks = [...links];

        // Sort rules by priority
        const activeRules = rules.filter(r => r.is_active).sort((a, b) => b.priority - a.priority);

        for (const rule of activeRules) {
            if (this.checkCondition(rule, context)) {
                modifiedLinks = this.applyAction(rule, modifiedLinks);
            }
        }

        return modifiedLinks;
    }

    checkCondition(rule, context) {
        const { conditions } = rule;

        if (rule.type === 'time') {
            const now = new Date();
            const currentHour = now.getHours();
            // Simple time range check (HH:MM format assumed in conditions)
            // Implementation pending real condition parsing
            return true; // Placeholder
        }

        if (rule.type === 'device') {
            return context.device === conditions.device;
        }

        return false;
    }

    applyAction(rule, links) {
        const action = rule.action;

        if (action.type === 'reorder') {
            // Move specific link to top or new position
            // Placeholder
            return links;
        }

        if (action.type === 'hide') {
            return links.filter(l => l.id !== action.target_link_id);
        }

        if (action.type === 'highlight') {
            return links.map(l => l.id === action.target_link_id ? { ...l, highlight: true } : l);
        }

        return links;
    }
}

module.exports = new RulesEngine();
