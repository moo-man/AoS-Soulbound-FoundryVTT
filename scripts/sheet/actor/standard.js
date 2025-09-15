import { SoulboundActorSheet } from "./actor";

export class StandardSoulboundActorSheet extends SoulboundActorSheet  {

    static DEFAULT_OPTIONS = {
        classes: ["soulbound"],
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
            configureActor : this._onConfigureActor,
        },
        defaultTab : "main"
      }   

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        // this.constructEffectLists(context)
        this.constructItemLists(context)

        if (this.actor.type != "party")
        {
            this._addWoundImages(context)
            this._addPowerBar(context)
        }

        return context;
      }

      async _handleEnrichment()
      {
          let enrichment = await super._handleEnrichment()
          enrichment["system.notes"] = await foundry.applications.ux.TextEditor.enrichHTML(this.actor.system.notes, {async: true, secrets: this.actor.isOwner, relativeTo: this.actor})
          enrichment.items = {}
          for(let item of this.actor.items)
          {
            enrichment.items[item.id] = await foundry.applications.ux.TextEditor.enrichHTML(item.system.description, {async: true, secrets: this.actor.isOwner, relativeTo: item})
          }
  
          return foundry.utils.expandObject(enrichment)
      }
  

    _addWoundImages(context)
    {
        context.system.combat.wounds.map(i => {
            switch (i.type) {
                case "minor": i.img = "icons/skills/wounds/blood-spurt-spray-red.webp"
                    break;
                case "serious": i.img = "icons/skills/wounds/injury-triple-slash-bleed.webp"
                    break;
                case "deadly": i.img = "icons/skills/wounds/injury-pain-body-orange.webp"
                    break;
                default: i.img = "icons/skills/wounds/blood-spurt-spray-red.webp"
                    break;
            }
            return i
        })
    }


    _addPowerBar(context)
    {
        context.system.power.pct = (context.system.power.consumed / context.system.power.capacity) * 100;
        if (context.system.power.pct <= 30)
            context.system.power.state = "low";
        else if (context.system.power.pct <= 70)
            context.system.power.state = "medium";
        else if (context.system.power.pct <= 100)
            context.system.power.state = "high";
        else if (context.system.power.pct > 100)
            context.system.power.state = "over";

        context.system.power.pct = Math.min(100, context.system.power.pct);

    }

    constructItemLists(context) 
    {
        context.items.equipped = {
            weapons : this.actor.itemTypes.weapon.filter(i => i.equipped),
            armour : this.actor.itemTypes.armour.filter(i => i.equipped),
        }
        context.items.attacks = context.items.equipped.weapons.concat(context.items.aethericDevice.filter(i => i.damage && i.equipped))
    }
}