import ActorConfigure from "../../apps/actor-configure.js";
import SpeedConfig from "../../apps/speed-config.js";

export class AgeOfSigmarActorSheet extends ActorSheet {

    getData() {
        const data = super.getData();
        data.data = data.data.data; // project system data so that handlebars has the same name and value paths
        this.constructEffectLists(data)
        this.constructItemLists(data)

        if (this.actor.type != "party")
        {
            this._addWoundImages(data)
            this._orderSkills(data)
        }
        return data;
      }

    _addWoundImages(sheetData)
    {
        sheetData.data.combat.wounds.map(i => {
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

    _orderSkills(sheetData)
    {
        let middle = Object.values(sheetData.data.skills).length / 2;
        let i = 0;
        for (let skill of Object.values(sheetData.data.skills)) {
            skill.isLeft = i < middle;
            skill.isRight = i >= middle;
            i++;
        }
    }

    constructItemLists(sheetData) 
    {
        let items = {}
        items.equipped = {}

        items.aethericDevices = this.actor.getItemTypes("aethericDevice")
        items.allies = this.actor.getItemTypes("ally")
        items.armour = this.actor.getItemTypes("armour")
        items.connections = this.actor.getItemTypes("connection")
        items.equipment = this.actor.getItemTypes("equipment")
        items.enemies = this.actor.getItemTypes("enemy")
        items.fears = this.actor.getItemTypes("fear")
        items.goals = this.actor.getItemTypes("goal")
        items.miracles = this.actor.getItemTypes("miracle")
        items.resources = this.actor.getItemTypes("resource")
        items.rumours = this.actor.getItemTypes("rumour")
        items.runes = this.actor.getItemTypes("rune")
        items.spells = this.actor.getItemTypes("spell")
        items.talents = this.actor.getItemTypes("talent")
        items.threats = this.actor.getItemTypes("threat")
        items.weapons = this.actor.getItemTypes("weapon")
        items.partyItems = this.actor.getItemTypes("partyItem")

        items.equipped.weapons = this.actor.getItemTypes("weapon").filter(i => i.state == "active")
        items.equipped.armour = this.actor.getItemTypes("armour").filter(i => i.state == "active")

        sheetData.items = items;

       // this.constructInventory(sheetData)
    }

    constructInventory(sheetData)
    {
        sheetData.inventory = {
            weapons : {
                header : "HEADER.WEAPON",
                items : this.actor.getItemTypes("weapon"),
                equippable : true,
                quantity : true,
                type : "weapon"
            },
            armour : {
                header : "HEADER.ARMOUR",
                items : this.actor.getItemTypes("armour"),
                equippable : true,
                quantity : true,
                type : "armour"
            },
            gear : {
                header : "HEADER.GEAR",
                items : this.actor.getItemTypes("gear"),
                equippable : false,
                quantity : true,
                type : "gear"
            },
            ammo : {
                header : "HEADER.AMMO",
                items : this.actor.getItemTypes("ammo"),
                equippable : false,
                quantity : true,
                type : "ammo"
            },
            weaponUpgrades : {
                header : "HEADER.WEAPON_UPGRADE",
                items : this.actor.getItemTypes("weaponUpgrade"),
                equippable : false,
                quantity : false,
                type : "weaponUpgrade"
            },
            augmentics : {
                header : "HEADER.AUGMENTIC",
                items : this.actor.getItemTypes("augmentic"),
                equippable : false,
                quantity : false,
                type : "augmentic"
            }
        }
    }

    
    constructEffectLists(sheetData) 
    {
        let effects = {}

        effects.temporary = sheetData.actor.effects.filter(i => i.isTemporary && !i.data.disabled)
        effects.disabled = sheetData.actor.effects.filter(i => i.data.disabled)
        effects.passive = sheetData.actor.effects.filter(i => !i.isTemporary && !i.data.disabled)

        sheetData.effects = effects;
    }

    _getSubmitData(updateData = {}) {
        this.actor.overrides = {}
        let data = super._getSubmitData(updateData);
        data = diffObject(flattenObject(this.actor.toObject(false)), data)
        return data
      }
    

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".item-create").click(this._onItemCreate.bind(this));
        html.find(".item-edit").click(this._onItemEdit.bind(this));
        html.find(".item-delete").click(this._onItemDelete.bind(this));
        //html.find(".item-property").click(this._onChangeItemProperty.bind(this));
        html.find(".effect-create").click(this._onEffectCreate.bind(this));  
        html.find(".effect-edit").click(this._onEffectEdit.bind(this));  
        html.find(".effect-delete").click(this._onEffectDelete.bind(this));  
        html.find(".effect-toggle").click(this._onEffectToggle.bind(this));  
        html.find("input").focusin(this._onFocusIn.bind(this));
        html.find(".item-state").click(this._onItemStateUpdate.bind(this));
        html.find(".roll-attribute").click(this._onAttributeClick.bind(this));
        html.find(".roll-skill").click(this._onSkillClick.bind(this));
        html.find(".roll-weapon").click(this._onWeaponClick.bind(this));
        html.find(".roll-power").click(this._onPowerClick.bind(this));
        html.find(".show-power").click(this._prepareShowPower.bind(this));
        html.find(".wound-create").click(this._onWoundCreate.bind(this));
        html.find(".wound-delete").click(this._onWoundDelete.bind(this));
        html.find(".wound-edit").change(this._onWoundEdit.bind(this));
        html.find(".speed-config").click(this._onSpeedConfigClick.bind(this));
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

    _onFocusIn(event) {
        $(event.currentTarget).select();
    }

    _onItemCreate(event) {
        event.preventDefault();
        let header = event.currentTarget.dataset
        
        let data = {
             name : `New ${game.i18n.localize(CONFIG.Item.typeLabels[header.type])}`,
             type : header.type
        };
        if (header.category)
            data["data.category"] = header.category
        this.actor.createEmbeddedDocuments("Item", [data], { renderSheet: true });
    }

    _onItemEdit(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(div.data("itemId"));
        item.sheet.render(true);
    }

    _onItemDelete(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        this.actor.deleteEmbeddedDocuments("Item", [div.data("itemId")]);
        div.slideUp(200, () => this.render(false));
    }

    _onChangeItemProperty(event) {
        const itemId = $(event.currentTarget).parents(".item").data("itemId");
        const target = $(event.currentTarget).data("target")
        let item = this.actor.items.get(itemId)
        return item.update({[target] : event.target.value})
    }

    _onEffectCreate(ev) {
        let type = ev.currentTarget.attributes["data-type"].value
        let effectData = { label: "New Effect" , icon: "icons/svg/aura.svg"}
        if (type == "temporary") {
          effectData["duration.rounds"] = 1;
        }
        this.actor.createEmbeddedDocuments("ActiveEffect", [effectData])
      }

    _onEffectEdit(ev)
    {
        let id = $(ev.currentTarget).parents(".item").attr("data-item-id")
        this.object.effects.get(id).sheet.render(true)
    }

    _onEffectDelete(ev)
    {
        let id = $(ev.currentTarget).parents(".item").attr("data-item-id")
        this.object.deleteEmbeddedDocuments("ActiveEffect", [id])
    }

    _onEffectToggle(ev)
    {
        let id = $(ev.currentTarget).parents(".item").attr("data-item-id")
        let effect = this.object.effects.get(id)

        effect.update({"disabled" : !effect.data.disabled})
    }

    _onItemStateUpdate(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(div.data("itemId"));
        let data;
        switch (item.state) {
            case "active":
                data = { _id: item.id, "data.state": "equipped"};
                break;
            case "equipped":
                data = { _id: item.id, "data.state": "other"};
                break;
            default:
                data = { _id: item.id, "data.state": "active"};
                break;
        }
        return this.actor.updateEmbeddedDocuments("Item", [data]);
    }

    async _onAttributeClick(event) {
        event.preventDefault();
        const attribute = $(event.currentTarget).data("attribute");
        let testData = await this.actor.setupAttributeTest(attribute)
        let test = new game.aos.rollClass.Test(testData)
        await test.rollTest()
        test.sendToChat()
    }

    async _onSkillClick(event) {
        event.preventDefault();
        const skill = $(event.currentTarget).data("skill");
        let testData = await this.actor.setupSkillTest(skill)
        let test = new game.aos.rollClass.Test(testData)
        await test.rollTest()
        test.sendToChat()
    }

    async _onWeaponClick(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const weaponId = div.data("itemId");
        let testData = await this.actor.setupCombatTest(weaponId)
        let test = new game.aos.rollClass.CombatTest(testData)
        await test.rollTest()
        test.sendToChat()
    }

    async _onPowerClick(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const powerId = div.data("itemId");
        let testData = await this.actor.setupPowerTest(powerId)
        let test = new game.aos.rollClass.PowerTest(testData)
        await test.rollTest()
        test.sendToChat()
    }
	
	_prepareShowPower(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const power = this.actor.items.get(div.data("itemId"));
        power.sendToChat()
    }

    _onWoundCreate(ev) { return this.actor.addWound("", 0) }

    _onWoundDelete(ev)
    {
        let wounds = duplicate(this.actor.combat.wounds)
        let index = $(ev.currentTarget).parents(".item").data("index")
        wounds.splice(index, 1)
        return this.actor.update({"data.combat.wounds" : wounds})
    }

    _onWoundEdit(ev)
    {
        let wounds = duplicate(this.actor.combat.wounds)
        let index = $(ev.currentTarget).parents(".item").data("index")
        wounds[index].type = ev.target.value
        wounds[index].damage = game.aos.config.woundDamage[ev.target.value] || 0
        return this.actor.update({"data.combat.wounds" : wounds})
    }
    
    _onSpeedConfigClick(ev) {
        new SpeedConfig(this.actor).render(true)
    }
}