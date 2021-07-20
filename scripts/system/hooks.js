import AOS_MacroUtil from "./macro.js"

import * as chat from "./chat.js";
import Migration from "./migrations.js";

export default function registerHooks() {
    Hooks.once("init", () => {
        game.settings.register("age-of-sigmar-soulbound", "initiativeRule", {
            name: "SETTING.INIT_RULE",
            hint: "SETTING.INIT_HINT",
            scope: "world",
            config: true,
            default: "default",
            type: String,
            restricted: true,
            choices: {
                "default": "SETTING.INIT_DEFAULT",
                "roll1d6": "SETTING.INIT_ROLL1d",
                "roll2d6": "SETTING.INIT_ROLL2d"
            },
            onChange: rule => {
                _registerInitiative(rule);
            }
        });

        game.settings.register("age-of-sigmar-soulbound", "systemMigrationVersion", {
            scope: "world",
            config: false,
            default: "",
            type: String
        });

        game.macro = AOS_MacroUtil;

        _registerInitiative(game.settings.get("age-of-sigmar-soulbound", "initiativeRule"));
    });

    Hooks.on("getChatLogEntryContext", chat.addChatMessageContextOptions);

    /**
     * Create a macro when dropping an entity on the hotbar
     * Item      - open roll dialog for item
     */
    Hooks.on("hotbarDrop", async (bar, data, slot) => {
        // Create item macro if rollable item - weapon, spell, prayer, trait, or skill
        if (data.type == "Item") {
            let item = data.data
            let command = `game.macro.rollItemMacro("${item.name}", "${item.type}");`;
            let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
            if (!macro) {
                macro = await Macro.create({
                    name: item.name,
                    type: "script",
                    img: item.img,
                    command: command
                }, { displaySheet: false })
            }
            game.user.assignHotbarMacro(macro, slot);
        } else {
            return;
        }
    });

    /** Helpers  */

    function _registerInitiative(rule) {
        switch (rule) {
            case "default":
                CONFIG.Combat.initiative = { formula: "@combat.initiative.total", decimals: 0 };
                break;
            case "roll1d6":
                CONFIG.Combat.initiative = { formula: "1d6 + @combat.initiative.total", decimals: 0 };
                break;
            case "roll2d6":
                CONFIG.Combat.initiative = { formula: "2d6 + @combat.initiative.total", decimals: 0 };
                break;
        }
    }

    Hooks.on("ready", () => {
        Migration.checkMigration()

        for (let key in game.aos.config) {
            for (let prop in game.aos.config[key]) {
                if (typeof game.aos.config[key][prop] == "string")
                    game.aos.config[key][prop] = game.i18n.localize(game.aos.config[key][prop])
            }
        }
    })

    Hooks.on("preCreateItem", (data, options, user) => {
        if (data.type == "wound")
        {
            ui.notifications.warn("The Wound Type item is deprecated")
            return false
        }
    })
}