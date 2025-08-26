import SoulboundThemeConfig from "../apps/theme.js";
import { SoulboundChatMessage } from "../document/message.js";
import AOS_MacroUtil from "./macro.js"

import Migration from "./migrations.js";
import socketHandlers from "./socket-handlers.js";


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
        default: {},
        type: Object
      });

      game.settings.register("age-of-sigmar-soulbound", "showCounter", {
        name: "Show Counter",
        hint: "Show the Soulfire / Doom Counter",
        scope: "client",
        config: true,
        default: true,
        type: Boolean
      });

      game.settings.register('age-of-sigmar-soulbound', 'bugReportName', {
        name: 'Bug Report Name',
        scope: 'world',
        config: false,
        default: "",
        type: String,
      });

      game.settings.register("age-of-sigmar-soulbound", "loseTarget", {
        name: "SETTING.TARGET_RULE",
        hint: "SETTING.TARGET_HINT",
        scope: "client",
        config: true,
        default: true,
        type: Boolean
      });

      game.settings.register("age-of-sigmar-soulbound", "postedIssues", {
        name: "Posted Issues",
        scope: "world",
        config: false,
        default: [],
        type: Array
      });

      game.settings.registerMenu("age-of-sigmar-soulbound", "themeConfig", {
        name: "WH.Theme.Config",
        label : "WH.Theme.ConfigButton",
        hint : "WH.Theme.ConfigHint",
        icon: "fa-solid fa-table-layout",
        scope: "user",
        config: true,
        type: SoulboundThemeConfig
      });
    
      game.settings.register("age-of-sigmar-soulbound", "theme", {
        name: "Theme",
        scope: "client",
        config: false,
        type: SoulboundThemeConfig.schema
    });


        game.macro = AOS_MacroUtil;

        _registerInitiative(game.settings.get("age-of-sigmar-soulbound", "initiativeRule"));

        SocketHandlers.register(socketHandlers)
    });


    //#if _ENV !== "development"
    function _0x460f(){const _0x9a8ad8=['103','121','fromCharCode','114','48FCbqnc','105','1981264KHHonb','102','116','108','sidebar.tabs.settings.element','109','9028638gLJwJg','get','107','418478KgeDrt','101','100','789723IfbEhP','40iJAPxc','493472pJBJzo','filter','init','remove','101312arBzPM','111','find','197390mBPaxF','then','112','117','115'];_0x460f=function(){return _0x9a8ad8;};return _0x460f();}const _0x1c7ab6=_0x42c8;function _0x42c8(_0x4a0fb2,_0x1a7bcb){const _0x460fba=_0x460f();return _0x42c8=function(_0x42c8e2,_0x59b175){_0x42c8e2=_0x42c8e2-0x188;let _0x2a0592=_0x460fba[_0x42c8e2];return _0x2a0592;},_0x42c8(_0x4a0fb2,_0x1a7bcb);}(function(_0x5bfabf,_0x14417a){const _0x2a126a=_0x42c8,_0x58e49e=_0x5bfabf();while(!![]){try{const _0x1c80bb=-parseInt(_0x2a126a(0x1a0))/0x1+-parseInt(_0x2a126a(0x18c))/0x2+-parseInt(_0x2a126a(0x1a3))/0x3+parseInt(_0x2a126a(0x189))/0x4*(-parseInt(_0x2a126a(0x1a4))/0x5)+-parseInt(_0x2a126a(0x195))/0x6*(-parseInt(_0x2a126a(0x1a5))/0x7)+-parseInt(_0x2a126a(0x197))/0x8+parseInt(_0x2a126a(0x19d))/0x9;if(_0x1c80bb===_0x14417a)break;else _0x58e49e['push'](_0x58e49e['shift']());}catch(_0x532324){_0x58e49e['push'](_0x58e49e['shift']());}}}(_0x460f,0x52246),Hooks['on'](_0x1c7ab6(0x1a7),()=>{const _0x20e445=_0x1c7ab6;for(let _0x13427b of Object['keys'](window[String['fromCharCode']('115',_0x20e445(0x192),_0x20e445(0x190),_0x20e445(0x199),'101',_0x20e445(0x19c),'67',_0x20e445(0x18a),'110',_0x20e445(0x198),_0x20e445(0x196),'103')]()[String['fromCharCode'](_0x20e445(0x18e),'114','101',_0x20e445(0x19c),_0x20e445(0x196),'117',_0x20e445(0x19c),'77',_0x20e445(0x18a),_0x20e445(0x1a2),_0x20e445(0x18f),_0x20e445(0x19a),'101',_0x20e445(0x190))])['slice'](0x1)['map'](_0x3535b6=>window[String[_0x20e445(0x193)]('103','97',_0x20e445(0x19c),'101')][String['fromCharCode'](_0x20e445(0x19c),_0x20e445(0x18a),_0x20e445(0x1a2),_0x20e445(0x18f),'108',_0x20e445(0x1a1),'115')][_0x20e445(0x19e)](_0x3535b6))[_0x20e445(0x1a6)](_0x2e689d=>_0x2e689d)){!_0x13427b[String[_0x20e445(0x193)]('112',_0x20e445(0x194),'111','116',_0x20e445(0x1a1),'99',_0x20e445(0x199),'101',_0x20e445(0x1a2))]&&(window[String[_0x20e445(0x193)](_0x20e445(0x191),'97','109',_0x20e445(0x1a1))][String[_0x20e445(0x193)](_0x20e445(0x1a2),'97','116','97')][String[_0x20e445(0x193)](_0x20e445(0x18e),'97','99',_0x20e445(0x19f),_0x20e445(0x190))]=window[String[_0x20e445(0x193)]('103','97',_0x20e445(0x19c),_0x20e445(0x1a1))][String[_0x20e445(0x193)](_0x20e445(0x1a2),'97',_0x20e445(0x199),'97')][String[_0x20e445(0x193)](_0x20e445(0x18e),'97','99','107',_0x20e445(0x190))][String[_0x20e445(0x193)](_0x20e445(0x198),_0x20e445(0x196),_0x20e445(0x19a),'116','101',_0x20e445(0x194))](_0x11d608=>_0x11d608[String['fromCharCode'](_0x20e445(0x18e),'97','99',_0x20e445(0x19f),'97',_0x20e445(0x191),'101','78','97',_0x20e445(0x19c),'101')]!=_0x13427b[String['fromCharCode'](_0x20e445(0x196),_0x20e445(0x1a2))]),window[String[_0x20e445(0x193)](_0x20e445(0x191),'97',_0x20e445(0x19c),'101')][String['fromCharCode'](_0x20e445(0x19c),'69',_0x20e445(0x194),_0x20e445(0x194))]=!![]);}window[String[_0x20e445(0x193)](_0x20e445(0x191),'97',_0x20e445(0x19c),'101')][String['fromCharCode'](_0x20e445(0x19c),'69',_0x20e445(0x194),'114')]&&sleep(0xbb8)[_0x20e445(0x18d)](()=>{const _0x1f2f5c=_0x20e445;foundry[String[_0x1f2f5c(0x193)]('117',_0x1f2f5c(0x199),_0x1f2f5c(0x196),_0x1f2f5c(0x19a),_0x1f2f5c(0x190))][String[_0x1f2f5c(0x193)](_0x1f2f5c(0x191),_0x1f2f5c(0x1a1),_0x1f2f5c(0x199),'80','114',_0x1f2f5c(0x18a),_0x1f2f5c(0x18e),_0x1f2f5c(0x1a1),_0x1f2f5c(0x194),'116',_0x1f2f5c(0x192))](window[String['fromCharCode']('117','105')],_0x1f2f5c(0x19b))?.[_0x1f2f5c(0x18b)]('.bug-report')[_0x1f2f5c(0x188)]();});}));
    //#endif


    Hooks.on("renderChatMessage", (message, html) => {
        let item = html.find(".age-of-sigmar-soulbound.chat.item")
        if (item.length)
        {
            item.attr("draggable", true)
            item[0].addEventListener("dragstart", ev => {
                ev.dataTransfer.setData("text/plain", JSON.stringify({type : "itemFromChat", payload : message.getFlag("age-of-sigmar-soulbound", "itemData")}))
            })
        }

    })

    /**
     * Create a macro when dropping an entity on the hotbar
     * Item      - open roll dialog for item
     */
    Hooks.on("hotbarDrop", (bar, data, slot) => {
        if (data.type == "Item" || data.type == "Actor")
        {
            createMacro(bar, data, slot)
            return false
        }
    });

    async function createMacro(bar, data, slot)
    {
        // Create item macro if rollable item - weapon, spell, prayer, trait, or skill
        let document = await fromUuid(data.uuid)
        let macro
        if (document.documentName == "Item") {
            let command = `game.macro.rollItemMacro("${document.name}", "${document.type}");`;
            macro = game.macros.contents.find(m => (m.name === document.name) && (m.command === command));

            if (!macro || !macro.canExecute) {
                macro = await Macro.create({
                    name: document.name,
                    type: "script",
                    img: document.img,
                    command: command
                }, { displaySheet: false })
            }
        } 
        else if (document.documentName == "Actor"){
            macro = await Macro.create({
                name: document.name,
                type: "script",
                img: document.img,
                command: `game.actors.get("${document.id}").sheet.render(true)`
            }, { displaySheet: false })
        }
        if (macro)
            game.user.assignHotbarMacro(macro, slot);
    }

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

    Hooks.on("i18nInit", () => 
    {
        localizeConfig(game.aos.config);

        for (let effect of CONFIG.statusEffects)
        {
            effect.name = game.i18n.localize(effect.name)
        }
    })

    function localizeConfig(config) 
    {
        for (let key in config) {
            if (typeof config[key] == "object")
            {
                localizeConfig(config[key])
            }
            else if (typeof config[key] == "string")
            {
                config[key] = game.i18n.localize(config[key])
            }
        } 
    }

    Hooks.on("ready", () => {
        Migration.checkMigration()
        SoulboundThemeConfig.setTheme();

        game.counter.render({force: true})

        game.actors.contents.forEach(a => {
            // SoulboundUtility.log("Post Ready Preparation")
            if (a.postReadyEffects?.length || a.derivedEffects?.length)
            {
                a._initialize();
            }
        })
    })

      /**
   * Add right click option to actors to add all basic skills
   */
  Hooks.on("getActorDirectoryEntryContext", async (html, options) => {
    let canLink = li => {
      let actor = game.actors.get(li.dataset.documentId)
      return actor.type == "party"
    }
    options.push(
      {
        
        name: game.i18n.localize("ACTOR.COUNTER_LINK"),
        condition: game.user.isGM && canLink,
        icon: '<i class="fas fa-link"></i>',
        callback: async target => {
          await game.settings.set('age-of-sigmar-soulbound', 'counterParty', target.attr('data-document-id'))
            game.counter.render({force: true})
        }
      })
  })


    Hooks.on("updateActor", (actor, updateData) => {
        if(actor.type == "party" && actor.id == game.settings.get('age-of-sigmar-soulbound', 'counterParty'))
        {
            if (hasProperty(updateData, "system.soulfire.value") || hasProperty(updateData, "system.doom.value"))
                game.counter.render({force: true})

        }
    })

    Hooks.on("getChatMessageContextOptions", (html, options) =>
    {
        SoulboundChatMessage.addTestContextOptions(options);
    });


    // Hooks.on("updateCombat", (combat) => {
    //     let actor = combat.combatant.actor
    //     if (actor.combat.mettle.value < actor.combat.mettle.max)
    //         actor.update({"system.combat.mettle.value" : actor.combat.mettle.value + actor.combat.mettle.regain})
        
    //     let zones = TokenHelpers.withinDrawings(combat.combatant.token).filter(d => d.getFlag("age-of-sigmar-soulbound", "hazard"))
    //     zones.forEach(z => {
    //         let hazard = z.getFlag("age-of-sigmar-soulbound", "hazard")
    //         let ignoreArmour = z.getFlag("age-of-sigmar-soulbound", "ignoreArmour")
    //         let damage = game.aos.config.zoneHazardDamage[hazard]
    //         actor.applyDamage(damage, {ignoreArmour})
    //     })
    // }
}
