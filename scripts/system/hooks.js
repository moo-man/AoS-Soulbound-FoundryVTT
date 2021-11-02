import AOS_MacroUtil from "./macro.js"

import SoulboundChat from "./chat.js";
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

    Hooks.on("getChatLogEntryContext", SoulboundChat.addChatMessageContextOptions);

    Hooks.on("renderChatLog", (app, html) => SoulboundChat.activateListeners(html))

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

        CONFIG.ChatMessage.documentClass.prototype.getTest = function() {
            let rollData = this.getFlag("age-of-sigmar-soulbound", "rollData")
            return game.aos.rollClass.Test.recreate(rollData)
        }

        for (let key in game.aos.config) {
            for (let prop in game.aos.config[key]) {
                if (typeof game.aos.config[key][prop] == "string")
                    game.aos.config[key][prop] = game.i18n.localize(game.aos.config[key][prop])
            }
        }
    })

    Hooks.on("preCreateItem", (data, options, user) => {
        if (data.type == "wound" 
         || data.type == "ally" 
         || data.type == "connection" 
         || data.type == "enemy" 
         || data.type == "fear" 
         || data.type == "goal" 
         || data.type == "resource" 
         || data.type == "rumour" 
         || data.type == "threat")
        {
            if (data.type == "wound")
                ui.notifications.warn("The Wound Type item is deprecated")
            else
                ui.notifications.warn("This item type is deprecated. Use the Party Item type instead")
            return false
        }
    })


    Hooks.on("renderDialog", (dialog, html) => {
        Array.from(html.find("#entity-create option")).forEach(i => {
            if (i.value == "wound" || i.value == "ally" || i.value == "connection" || i.value == "enemy" || i.value == "fear" || i.value == "goal" || i.value == "resource" || i.value == "rumour" || i.value == "threat")
            {
                i.remove()
            }
        })
    })

      /**
   * Add right click option to actors to add all basic skills
   */
  Hooks.on("getActorDirectoryEntryContext", async (html, options) => {
    options.push(
      {
        
        name: game.i18n.localize("ACTOR.ImportStatBlock"),
        condition: game.user.isGM,
        icon: '<i class="fa fa-download"></i>',
        callback: target => {
          const actor = game.actors.get(target.attr('data-entity-id'));
          if (game.system.data.name == "age-of-sigmar-soulbound")
          new StatBlockParser(actor).render(true)
        }
      })
  })

    Hooks.on("preCreateActiveEffect", (effect, data, options, user) => {
        if (effect.parent?.type == "spell" || effect.parent?.type == "miracle")
        {
            effect.data.update({"transfer" : false})
            //effect.data.update({"label" : effect.parent.name})
        }
    })

}