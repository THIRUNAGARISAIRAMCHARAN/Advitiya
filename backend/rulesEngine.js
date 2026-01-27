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
            const now = context.time || new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // Parse start and end time from conditions (format: "HH:MM")
            if (conditions.start_time && conditions.end_time) {
                const [startHour, startMin] = conditions.start_time.split(':').map(Number);
                const [endHour, endMin] = conditions.end_time.split(':').map(Number);

                const currentTimeInMinutes = currentHour * 60 + currentMinute;
                const startTimeInMinutes = startHour * 60 + startMin;
                const endTimeInMinutes = endHour * 60 + endMin;

                return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
            }
            return false;
        }

        if (rule.type === 'device') {
            return context.device === conditions.device;
        }

        if (rule.type === 'performance') {
            // Check if link meets performance threshold
            const threshold = conditions.min_clicks || 0;
            return true; // Will be applied in action phase
        }

        if (rule.type === 'location') {
            return context.location === conditions.country;
        }

        return false;
    }

    applyAction(rule, links) {
        const action = rule.action;

        if (action.type === 'reorder') {
            // Move specific link to top or new position
            const targetLinkId = action.target_link_id;
            const newPosition = action.new_position || 0;

            const linkIndex = links.findIndex(l => l.id === targetLinkId);
            if (linkIndex !== -1) {
                const [link] = links.splice(linkIndex, 1);
                links.splice(newPosition, 0, link);
            }
            return links;
        }

        if (action.type === 'hide') {
            return links.filter(l => l.id !== action.target_link_id);
        }

        if (action.type === 'highlight') {
            return links.map(l => l.id === action.target_link_id ? { ...l, highlight: true } : l);
        }

        if (action.type === 'promote_top_performers') {
            // Auto-promote links with high click counts
            const threshold = rule.conditions.min_clicks || 10;
            const topPerformers = links.filter(l => l.clicks >= threshold);
            const others = links.filter(l => l.clicks < threshold);

            // Sort top performers by clicks descending
            topPerformers.sort((a, b) => b.clicks - a.clicks);

            return [...topPerformers, ...others];
        }

        return links;
    }
}

module.exports = new RulesEngine();
