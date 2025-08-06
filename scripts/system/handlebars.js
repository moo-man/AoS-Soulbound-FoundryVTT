export const initializeHandlebars = () => {
    Handlebars.registerHelper("arrayDisplay", function (array, cls) {
        if (typeof cls == "string")
            return array.map(i => `<a class="${cls}">${i}</a>`).join(`,`)
        else
            return array.join(", ")
    })

    const templatePaths = [
        "systems/age-of-sigmar-soulbound/templates/chat/base/base-other.hbs",
        "systems/age-of-sigmar-soulbound/templates/chat/base/base-result.hbs",
        "systems/age-of-sigmar-soulbound/templates/chat/base/base-targets.hbs",
        "systems/age-of-sigmar-soulbound/templates/chat/base/dice-container.hbs",
        "systems/age-of-sigmar-soulbound/templates/chat/weapon/weapon-result.hbs",
        "systems/age-of-sigmar-soulbound/templates/chat/weapon/weapon-buttons.hbs",
        "systems/age-of-sigmar-soulbound/templates/chat/weapon/secondary-weapon-buttons.hbs",
        "systems/age-of-sigmar-soulbound/templates/chat/spell/spell-result.hbs",
        "systems/age-of-sigmar-soulbound/templates/chat/spell/spell-buttons.hbs",
        "systems/age-of-sigmar-soulbound/templates/chat/miracle/miracle-result.hbs",
        "systems/age-of-sigmar-soulbound/templates/chat/miracle/miracle-buttons.hbs"
    ];
    loadTemplates(templatePaths);
    loadTemplates({
        listEffect : "systems/age-of-sigmar-soulbound/templates/partials/list-effect.hbs",
        itemTraits : "systems/age-of-sigmar-soulbound/templates/partials/item-traits.hbs",
        itemTest : "systems/age-of-sigmar-soulbound/templates/partials/item-test.hbs"
    });
};