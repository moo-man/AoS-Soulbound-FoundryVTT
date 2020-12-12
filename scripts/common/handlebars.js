export const initializeHandlebars = () => {
    registerHandlebarsHelpers();
    preloadHandlebarsTemplates();
};

function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/age-of-sigmar-soulbound/template/sheet/player.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/player-stats.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/player-combat.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/player-talents.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/player-gear.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/player-bio.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/player-notes.html",
        "systems/age-of-sigmar-soulbound/template/sheet/npc.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/npc-stats.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/npc-combat.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/npc-talents.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/npc-gear.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/npc-notes.html",
        "systems/age-of-sigmar-soulbound/template/sheet/party.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/party-main.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/party-members.html",
        "systems/age-of-sigmar-soulbound/template/sheet/aetheric-device.html",
        "systems/age-of-sigmar-soulbound/template/sheet/armour.html",
        "systems/age-of-sigmar-soulbound/template/sheet/connection.html",
        "systems/age-of-sigmar-soulbound/template/sheet/equipment.html",
        "systems/age-of-sigmar-soulbound/template/sheet/goal.html",
        "systems/age-of-sigmar-soulbound/template/sheet/miracle.html",
        "systems/age-of-sigmar-soulbound/template/sheet/party-item.html",
        "systems/age-of-sigmar-soulbound/template/sheet/rune.html",
        "systems/age-of-sigmar-soulbound/template/sheet/spell.html",
        "systems/age-of-sigmar-soulbound/template/sheet/talent.html",
        "systems/age-of-sigmar-soulbound/template/sheet/weapon.html",
        "systems/age-of-sigmar-soulbound/template/sheet/wound.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/item-bonus.html",
        "systems/age-of-sigmar-soulbound/template/dialog/common-roll.html",
        "systems/age-of-sigmar-soulbound/template/dialog/custom-roll.html",
        "systems/age-of-sigmar-soulbound/template/dialog/combat-roll.html",
        "systems/age-of-sigmar-soulbound/template/chat/item.html",
        "systems/age-of-sigmar-soulbound/template/chat/roll.html"
    ];
    return loadTemplates(templatePaths);
}

function registerHandlebarsHelpers() {
    Handlebars.registerHelper("removeMarkup", function (text) {
        const markup = /<(.*?)>/gi;
        return text.replace(markup, "");
    });
    Handlebars.registerHelper("combatAbilities", function (value) {
        if (value <= 2) {
            return `${game.i18n.localize("ABILITIES.POOR")} (1)`;
        } else if (value >= 3 && value <= 4) {
            return `${game.i18n.localize("ABILITIES.AVERAGE")} (2)`;
        } else if (value >= 5 && value <= 6) {
            return `${game.i18n.localize("ABILITIES.GOOD")} (3)`;
        } else if (value >= 7 && value <= 8) {
            return `${game.i18n.localize("ABILITIES.GREAT")} (4)`;
        } else if (value >= 9 && value <= 10) {
            return `${game.i18n.localize("ABILITIES.SUPERB")} (5)`;
        } else if (value >= 11 && value <= 12) {
            return `${game.i18n.localize("ABILITIES.EXTRAORDINARY")} (6)`;
        } else {
            return `${game.i18n.localize("ABILITIES.EXTRAORDINARY")} (${value})`;
        }
    });
    Handlebars.registerHelper("localizeState", function (type) {
        switch (type) {
            case "ally":
                return game.i18n.localize("STATE.ALIVE");
            case "enemy":
                return game.i18n.localize("STATE.ALIVE");
            case "resource":
                return game.i18n.localize("STATE.ACTIVE");
            case "rumour":
                return game.i18n.localize("STATE.ACTIVE");
            case "fear":
                return game.i18n.localize("STATE.ACTIVE");
            case "threat":
                return game.i18n.localize("STATE.ACTIVE");
            default:
                return game.i18n.localize("HEADER.STATE");
        }
    });
}