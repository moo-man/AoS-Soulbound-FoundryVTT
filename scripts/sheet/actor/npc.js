import { StandardSoulboundActorSheet } from "./standard";

export class NPCSheet extends StandardSoulboundActorSheet {

    static DEFAULT_OPTIONS = {
        classes: ["npc"],
        defaultTab: "stats"
    }

    static PARTS = {
        header : {scrollable: [""], template : 'systems/age-of-sigmar-soulbound/templates/actor/npc/npc-header.hbs', classes: ["sheet-header"] },
        tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
        stats: { scrollable: [""], template: 'systems/age-of-sigmar-soulbound/templates/actor/actor-stats.hbs' },
        combat: { scrollable: [""], template: 'systems/age-of-sigmar-soulbound/templates/actor/actor-combat.hbs' },
        effects: { scrollable: [""], template: 'systems/age-of-sigmar-soulbound/templates/actor/actor-effects.hbs' },
        gear: { scrollable: [""], template: 'systems/age-of-sigmar-soulbound/templates/actor/actor-gear.hbs' },
        notes: { scrollable: [""], template: 'systems/age-of-sigmar-soulbound/templates/actor/actor-notes.hbs' },
      }

      
      static TABS = {
        stats : {
            id : "stats",
            group : "primary",
            label : "TAB.STATS"
        },
        combat : {
            id : "combat",
            group : "primary",
            label : "TAB.COMBAT"
        },
        effects : {
            id : "effects",
            group : "primary",
            label : "TAB.EFFECTS"
        },
        gear : {
            id : "gear",
            group : "primary",
            label : "TAB.GEAR"
        },
        notes : {
            id : "notes",
            group : "primary",
            label : "TAB.NOTES"
        }
      }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        return context;
    }

}