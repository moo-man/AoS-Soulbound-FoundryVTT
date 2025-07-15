import ActorConfigure from "../../apps/actor-configure.js";
import SpeedConfig from "../../apps/speed-config.js";

export class SoulboundActorSheet extends WarhammerActorSheetV2 {

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
            rollTest : this._onRollTest,
            toggleSummary : this._toggleSummary,
            configureActor : this._onConfigureActor,
            configureSpeed : this._configureSpeed,
            toggleCondition: this._onToggleCondition,
            changeState : this._onChangeState
        },
        defaultTab : "main"
      }   

    async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return context;
    }

    async _handleEnrichment()
    {
        let enrichment = await super._handleEnrichment()
        enrichment["system.notes"] = await TextEditor.enrichHTML(this.actor.system.notes, {async: true, secrets: this.actor.isOwner, relativeTo: this.actor})
        enrichment.items = {}
        for(let item of this.actor.items)
        {
        enrichment.items[item.id] = await TextEditor.enrichHTML(item.system.description, {async: true, secrets: this.actor.isOwner, relativeTo: item})
        }

        return expandObject(enrichment)
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

    _getContextMenuOptions()
    { 
      let getParent = this._getParent.bind(this);
      return [
        {
          name: "Edit",
          icon: '<i class="fas fa-edit"></i>',
          condition: li => !!li.dataset.uuid || getParent(li, "[data-uuid]"),
          callback: async li => {
            let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
            const document = await fromUuid(uuid);
            document.sheet.render(true);
          }
        },
        {
          name: "Remove",
          icon: '<i class="fas fa-times"></i>',
          condition: li => {
            let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid
            if (uuid)
            {
              let parsed = foundry.utils.parseUuid(uuid);
              if (parsed.type == "ActiveEffect")
              {
                return parsed.primaryId == this.document.id; // If an effect's parent is not this document, don't show the delete option
              }
              else if (parsed.type)
              {
                return true;
              }
              return false;
            }
            else return false;
          },
          callback: async li => 
          {
            let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
            const document = await fromUuid(uuid);
            document.delete();
          }
        },
        {
          name: "Post to Chat",
          icon: '<i class="fas fa-comment"></i>',
          condition: li => {
            let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
            if (uuid)
            {
              let parsed = foundry.utils.parseUuid(uuid);
              return parsed.type == "Item"; // Can only post Items to chat
            }
            else return false;
          },
          callback: async li => 
          {
            let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
            const document = await fromUuid(uuid);
            document.postItem();
          }
        },
        {
          name: "Duplicate",
          icon: '<i class="fa-solid fa-copy"></i>',
          condition: li => {
            let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
            if (uuid && !uuid.includes("Compendium"))
            {
              let doc = fromUuidSync(uuid);
              return doc?.documentName == "Item" && doc.system.isPhysical; // Can only duplicate physical items
            }
            else return false;
          },
          callback: async li => 
          {
              let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
              const document = await fromUuid(uuid);
              this.actor.createEmbeddedDocuments("Item", [document.toObject()]);
          }
        },
        {
          name: "Split",
          icon: '<i class="fa-solid fa-split"></i>',
          condition: li => {
            let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
            if (uuid && !uuid.includes("Compendium"))
            {
              let doc = fromUuidSync(uuid);
              return doc?.documentName == "Item" && doc.system.isPhysical; // Can only split physical items
            }
            else return false;
          },
          callback: async li => 
          {
              let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
              if (uuid)
              {
                let doc = fromUuidSync(uuid);
                let amt = await ValueDialog.create({title : game.i18n.localize("SHEET.SplitTitle"), text : game.i18n.localize("SHEET.SplitPrompt")})
                doc.system.split(amt);
              }
          }
        }
      ];
    }

    constructItemLists(context) 
    {
        context.items.equipped = {
            weapons : this.actor.itemTypes["weapon"].filter(i => i.equipped),
            armour : this.actor.itemTypes["armour"].filter(i => i.equipped),
        }
        context.items.attacks = items.equipped.weapons.concat(items.aethericDevice.filter(i => i.damage && i.equipped))
    }

    static _onToggleCondition(ev, target)
    {
        let key = target.dataset.condition;
        if (this.actor.hasCondition(key))
            this.actor.removeCondition(key)
        else 
            this.actor.addCondition(key);
    }

    activateListeners(html) {
        super.activateListeners(html);
        
        html.find(".wound-create").click(this._onWoundCreate.bind(this));
        html.find(".wound-delete").click(this._onWoundDelete.bind(this));
        html.find(".wound-edit").change(this._onWoundEdit.bind(this));

        html.find(".speed-config").click(this._onSpeedConfigClick.bind(this));
   
        html.find(".item-trait").click(this._onTraitClick.bind(this))
    }


    static async _onChangeState(ev, target) {
        const item = await this._getDocumentAsync(ev, target);
        switch (item.system.state) {
            case "active":
                item.update({"system.state": "equipped"});
                break;
            case "equipped":
                item.update({"system.state": "other"});
                break;
            default:
                item.update({"system.state": "active"});
                break;
        }
    }


    static _onRollTest(ev, target)
    {
        switch(target.dataset.type)
        {
        
            case "attribute" : 
                return this.actor.setupCommonTest({attribute : target.dataset.attribute})
                case "skill" : 
                return this.actor.setupCommonTest({skill : target.dataset.skill})
            case "weapon" : 
                return this.actor.setupCombatTest(this._getId(ev, target))
            case "attack" : 
                return this.actor.setupCombatTest(this._getId(ev, target))
            case "spell" : 
                return this.actor.setupSpellTest(this._getId(ev, target))
            case "miracle" : 
                return this.actor.setupMiracleTest(this._getId(ev, target))
        }
    }

    static _configureSpeed(ev) {
        new SpeedConfig(this.actor).render(true)
    }    
}