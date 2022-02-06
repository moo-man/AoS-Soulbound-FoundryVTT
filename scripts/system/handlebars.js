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
        "systems/age-of-sigmar-soulbound/template/chat/base/base-result.html",
        "systems/age-of-sigmar-soulbound/template/chat/base/base-targets.html",
        "systems/age-of-sigmar-soulbound/template/chat/base/dice-container.html",
        "systems/age-of-sigmar-soulbound/template/chat/weapon/weapon-result.html",
        "systems/age-of-sigmar-soulbound/template/chat/weapon/weapon-buttons.html",
        "systems/age-of-sigmar-soulbound/template/chat/weapon/secondary-weapon-buttons.html",
        "systems/age-of-sigmar-soulbound/template/chat/spell/spell-result.html",
        "systems/age-of-sigmar-soulbound/template/chat/spell/spell-buttons.html",
        "systems/age-of-sigmar-soulbound/template/chat/miracle/miracle-result.html",
        "systems/age-of-sigmar-soulbound/template/chat/miracle/miracle-buttons.html"
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

    Handlebars.registerHelper("lookup", function (obj, key) {
        return getProperty(obj, key)
    })


    Handlebars.registerHelper("enrich", function (string) {
        return TextEditor.enrichHTML(string)
    })

    Handlebars.registerHelper("arrayDisplay", function (array, cls) {
        if (typeof cls == "string")
            return array.map(i => `<a class="${cls}">${i}</a>`).join(`,`)
        else
            return array.join(", ")
    })

    Handlebars.registerHelper("isNoneSystemCondition", function(string) {
        return string === "dead";
    })
}