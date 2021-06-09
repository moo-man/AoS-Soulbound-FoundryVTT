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
}