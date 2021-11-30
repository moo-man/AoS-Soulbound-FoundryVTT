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

        game.settings.register('age-of-sigmar-soulbound', 'soulfire', {
            name: "Soulfire",
            hint: "",
            scope: "world",
            config: false,
            default: 0,
            type: Number
        });
        game.settings.register('age-of-sigmar-soulbound', 'doom', {
            name: "Doom",
            hint: "",
            scope: "world",
            config: false,
            default: 0,
            type: Number
        });
        game.settings.register('age-of-sigmar-soulbound', 'playerCounterEdit', {
            name: "Player Counter Edit",
            hint: "",
            scope: "world",
            config: false,
            default: true,
            type: Boolean
        });
        game.settings.register('age-of-sigmar-soulbound', 'counterParty', {
            name: "Counter Party Link",
            hint: "",
            scope: "world",
            config: false,
            default: "",
            type: String
        });

      game.settings.register("age-of-sigmar-soulbound", "counterPosition", {
        name: "Counter Position",
        hint: "",
        scope: "client",
        config: false,
        default: undefined,
        type: Object
      })


        game.macro = AOS_MacroUtil;

        _registerInitiative(game.settings.get("age-of-sigmar-soulbound", "initiativeRule"));


        game.socket.on("system.age-of-sigmar-soulbound", async data => {
            if (data.type == "updateCounter") {
              game.counter.render(true)
            }
            else if (data.type == "setCounter" && game.user.isGM) {
              if (game.counter.party)
                game.counter.party.update({[`data.${data.payload.type}.value`] : parseInt(data.payload.value)})
              else
                await game.settings.set("age-of-sigmar-soulbound", data.payload.type, data.payload.value)
              game.counter.render(true)
            }
          })
    });

    Hooks.on("getChatLogEntryContext", SoulboundChat.addChatMessageContextOptions);

    Hooks.on("renderChatLog", (app, html) => SoulboundChat.activateListeners(html))


    Hooks.on("renderChatMessage", (message, html) => {
        let item = html.find(".age-of-sigmar-soulbound.chat.item")
        if (item.length)
        {
            item.attr("draggable", true)
            item[0].addEventListener("dragstart", ev => {
                ev.dataTransfer.setData("text/plain", JSON.stringify({type : "itemDrop", payload : message.getFlag("age-of-sigmar-soulbound", "itemData")}))
            })
        }

    })

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
        game.counter.render(true)

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

        for (let effect of CONFIG.statusEffects)
        {
            effect.label = game.i18n.localize(effect.label)
        }


        game.actors.contents.forEach(a => {
                a.prepareData()
        })
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
    let canLink = li => {
      let actor = game.actors.get(li.attr("data-entity-id"));
      return actor.type == "party"
    }
    options.push(
      {
        
        name: game.i18n.localize("ACTOR.COUNTER_LINK"),
        condition: game.user.isGM && canLink,
        icon: '<i class="fas fa-link"></i>',
        callback: async target => {
          await game.settings.set('age-of-sigmar-soulbound', 'counterParty', target.attr('data-entity-id'))
          game.counter.render(true)
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

    Hooks.on("updateActor", (actor, updateData) => {
        if(actor.type == "party" && actor.id == game.settings.get('age-of-sigmar-soulbound', 'counterParty'))
        {
            if (hasProperty(updateData, "data.soulfire.value") || hasProperty(updateData, "data.doom.value"))
                game.counter.render(true)

        }
    })

}