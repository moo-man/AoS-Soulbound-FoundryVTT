import { StandardSoulboundActorSheet } from "./standard";

export class PlayerSheet extends StandardSoulboundActorSheet  {


    static DEFAULT_OPTIONS = {
        classes: ["player"],
        window : {
          controls : [
            {
              icon : 'fa-solid fa-wrench',
              label : "Actor Settings",
              action : "configureActor"
            }
          ],
        },
        actions : {
            rollTest : this._onRollTest,
            toggleSummary : this._toggleSummary,
            configureActor : this._onConfigureActor,
            toggleCondition: this._onToggleCondition,
        },
        defaultTab : "stats"
      }  
      
      
      static PARTS = {
        header : {scrollable: [""], template : 'systems/age-of-sigmar-soulbound/templates/actor/player/player-header.hbs', classes: ["sheet-header"] },
        tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
        stats: { scrollable: [""], template: 'systems/age-of-sigmar-soulbound/templates/actor/actor-stats.hbs' },
        combat: { scrollable: [""], template: 'systems/age-of-sigmar-soulbound/templates/actor/actor-combat.hbs' },
        effects: { scrollable: [""], template: 'systems/age-of-sigmar-soulbound/templates/actor/actor-effects.hbs' },
        gear: { scrollable: [""], template: 'systems/age-of-sigmar-soulbound/templates/actor/actor-gear.hbs' },
        bio: { scrollable: [""], template: 'systems/age-of-sigmar-soulbound/templates/actor/actor-bio.hbs' },
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
        bio : {
            id : "bio",
            group : "primary",
            label : "TAB.BIO"
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

      async _handleEnrichment()
      {
          let enrichment = await super._handleEnrichment()
          enrichment["system.bio.background"] = await TextEditor.enrichHTML(this.actor.system.bio.background, {async: true, secrets: this.actor.isOwner, relativeTo: this.actor})
          enrichment["system.bio.connections"] = await TextEditor.enrichHTML(this.actor.system.bio.connections, {async: true, secrets: this.actor.isOwner, relativeTo: this.actor})
          return expandObject(enrichment)
      }
}