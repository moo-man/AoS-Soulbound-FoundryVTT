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
            rollTest : this._onRollTest,
            toggleSummary : this._toggleSummary,
            configureActor : this._onConfigureActor,
            toggleCondition: this._onToggleCondition,
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

    constructItemLists(context) 
    {
        context.items.equipped = {
            weapons : this.actor.itemTypes.weapon.filter(i => i.equipped),
            armour : this.actor.itemTypes.armour.filter(i => i.equipped),
        }
        context.items.attacks = context.items.equipped.weapons.concat(context.items.aethericDevice.filter(i => i.damage && i.equipped))
    }



    activateListeners(html) {
        super.activateListeners(html);
        html.find(".item-create").click(this._onItemCreate.bind(this));
        html.find(".item-edit").click(this._onEditItem.bind(this));
        html.find(".item-edit-right").contextmenu(this._onEditItem.bind(this));
        html.find(".item-delete").click(this._onItemDelete.bind(this));
        html.find(".item-post").click(this._onItemPost.bind(this));
        html.find(".state").click(ev => this._onStateClick(ev));
        //html.find(".item-property").click(this._onChangeItemProperty.bind(this));
        html.find("input").focusin(this._onFocusIn.bind(this));
        html.find(".item-state").click(this._onItemStateUpdate.bind(this));
        html.find(".item-toggle").click(this._onItemToggle.bind(this));
        html.find(".roll-attribute").click(this._onAttributeClick.bind(this));
        html.find(".roll-skill").click(this._onSkillClick.bind(this));
        html.find(".roll-weapon").click(this._onWeaponClick.bind(this));
        html.find(".roll-power").click(this._onSpellMiracleClick.bind(this));
        html.find(".show-power").click(this._prepareShowPower.bind(this));
        html.find(".wound-create").click(this._onWoundCreate.bind(this));
        html.find(".wound-delete").click(this._onWoundDelete.bind(this));
        html.find(".wound-edit").change(this._onWoundEdit.bind(this));
        html.find(".speed-config").click(this._onSpeedConfigClick.bind(this));
        html.find(".condition-toggle").click(this._onConditionToggle.bind(this));
        html.find(".condition-click").click(this._onConditionClick.bind(this));
        html.find(".item-dropdown").click(this._onDropdownClick.bind(this))
        html.find(".item-dropdown-right").contextmenu(this._onDropdownClick.bind(this))
        html.find(".item-trait").click(this._onTraitClick.bind(this))
        html.find(".transfer-effect").click(this._onTransferEffectClick.bind(this))
        html.find(".quantity-click").mousedown(this._onQuantityClick.bind(this))
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        if (this.actor.isOwner) {
            buttons = [
                {
                    class: "configure",
                    icon: "fas fa-wrench",
                    onclick: async (ev) => new ActorConfigure(this.actor).render(true)
                }
            ].concat(buttons);
        }
        return buttons;
    }


    _onItemStateUpdate(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(div.data("itemId"));
        let data;
        switch (item.state) {
            case "active":
                data = { _id: item.id, "system.state": "equipped"};
                break;
            case "equipped":
                data = { _id: item.id, "system.state": "other"};
                break;
            default:
                data = { _id: item.id, "system.state": "active"};
                break;
        }
        return this.actor.updateEmbeddedDocuments("Item", [data]);
    }


    _onRollTest(ev)
    {
        "attribute"
        "skill"
        "weapon"
        "spell"
        "miracle"
    }

    _onAttributeClick(event) {
        event.preventDefault();
        const attribute = $(event.currentTarget).data("attribute");
        this.actor.setupCommonTest({attribute})
    }

    async _onSkillClick(event) {
        event.preventDefault();
        const skill = $(event.currentTarget).data("skill");
        this.actor.setupCommonTest({skill})
    }

    async _onWeaponClick(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const weaponId = div.data("itemId");
        this.actor.setupCombatTest(weaponId)
    }

    async _onSpellMiracleClick(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const powerId = div.data("itemId");
        let item = this.actor.items.get(powerId)

        if (item.type == "spell")
            this.actor.setupSpellTest(powerId)
        else if (item.type == "miracle")
            this.actor.setupMiracleTest(powerId)
    }
	
	_prepareShowPower(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const power = this.actor.items.get(div.data("itemId"));
        power.sendToChat()
    }
    
    _onSpeedConfigClick(ev) {
        new SpeedConfig(this.actor).render(true)
    }

    
    _onConditionClick(ev)
    {
        let key = $(ev.currentTarget).parents(".condition").data("key")
        let effect = CONFIG.statusEffects.find(i => i.id == key)
        if (effect)
        {
            let journal = game.journal.getName(effect.name)
            if (journal)
                journal.sheet.render(true)
        }
    }

    _onDropdownClick(ev)
    {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(div.data("itemId"));
        return this._dropdown(ev, item.dropdownData())
    }
}