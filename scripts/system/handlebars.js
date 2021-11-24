export const initializeHandlebars = () => {
    registerHandlebarsHelpers();
    preloadHandlebarsTemplates();
};

function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/age-of-sigmar-soulbound/template/sheet/tab/player-stats.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/player-combat.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/player-talents.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/player-gear.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/player-bio.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/player-notes.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/actor-effects.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/party-main.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/party-members.html",
        "systems/age-of-sigmar-soulbound/template/sheet/tab/item-effects.html",
    ];
    return loadTemplates(templatePaths);
}

function registerHandlebarsHelpers() {
    Handlebars.registerHelper("removeMarkup", function (text) {
        const markup = /<(.*?)>/gi;
        return text.replace(markup, "");
    });

    Handlebars.registerHelper("ifIsGM", function (options) {
        return game.user.isGM ? options.fn(this) : options.inverse(this)
    })

    Handlebars.registerHelper("isGM", function (options) {
        return game.user.isGM
    })

    Handlebars.registerHelper("config", function (key) {
        return game.aos.config[key]
    })

    Handlebars.registerHelper("configLookup", function (obj, key) {
        return game.aos.config[obj][key]
    })

    Handlebars.registerHelper("arrayDisplay", function (array) {
        return array.join(", ")
    })

    Handlebars.registerHelper("enrich", function (string) {
        return TextEditor.enrichHTML(string)
    })
}