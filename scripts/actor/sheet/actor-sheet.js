import { prepareCommonRoll, prepareCombatRoll, preparePowerRoll } from "../../system/dialog.js";
import ActorConfigure from "../../apps/actor-configure.js";
import SpeedConfig from "../../apps/speed-config.js";

export class AgeOfSigmarActorSheet extends ActorSheet {

    getData() {
        const data = super.getData();
        data.data = data.data.data; // project system data so that handlebars has the same name and value paths

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

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".item-create").click(this._onItemCreate.bind(this));
        html.find(".item-edit").click(this._onItemEdit.bind(this));
        html.find(".item-delete").click(this._onItemDelete.bind(this));
        html.find(".item-property").click(this._onChangeItemProperty.bind(this));
        html.find("input").focusin(this._onFocusIn.bind(this));
        html.find(".item-state").click(this._onItemStateUpdate.bind(this));
        html.find(".roll-attribute").click(this._prepareRollAttribute.bind(this));
        html.find(".roll-skill").click(this._prepareRollSkill.bind(this));
        html.find(".roll-weapon").click(this._prepareRollWeapon.bind(this));
        html.find(".roll-power").click(this._prepareRollPower.bind(this));
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

    _onItemCreate(event) {
        event.preventDefault();
        let header = event.currentTarget.dataset
        
        let data = {
             name : `New ${game.i18n.localize(CONFIG.Item.typeLabels[header.type])}`,
             type : header.type
        };
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

    _onFocusIn(event) {
        $(event.currentTarget).select();
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

    async _prepareRollAttribute(event) {
        event.preventDefault();
        const attributeName = $(event.currentTarget).data("attribute");
        let rollData = await prepareCommonRoll(null, this.actor.attributes, this.actor.skills, attributeName);
        rollData.speaker = this.actor.speakerData
        let test = new game.aos.rollClass.Test(rollData)
        await test.rollTest()
        test.sendToChat()
    }

    async _prepareRollSkill(event) {
        event.preventDefault();
        const skill = $(event.currentTarget).data("skill");
        let rollData = await prepareCommonRoll(skill, this.actor.attributes, this.actor.skills);
        rollData.speaker = this.actor.speakerData
        let test = new game.aos.rollClass.Test(rollData)
        await test.rollTest()
        test.sendToChat()
    }

    async _prepareRollWeapon(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const weapon = this.actor.items.get(div.data("itemId"));
        const combat = this._getCombat(weapon);
        let rollData = await prepareCombatRoll(weapon, this.actor.attributes, this.actor.skills, combat);
        rollData.speaker = this.actor.speakerData
        let test = new game.aos.rollClass.CombatTest(rollData)
        await test.rollTest()
        test.sendToChat()
    }

    async _prepareRollPower(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const power = this.actor.items.get(div.data("itemId"));
        let skill = power.data.type === "spell" ? "channelling" : "devotion"
        let rollData = await preparePowerRoll(power, skill, this.actor.attributes, this.actor.skills);
        rollData.speaker = this.actor.speakerData
        let test = new game.aos.rollClass.PowerTest(rollData)
        await test.rollTest()
        test.sendToChat()
    }
	
	_prepareShowPower(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const power = this.actor.items.get(div.data("itemId"));
        power.sendToChat()
    }

    // TODO Maybe remove this too
    _getCombat(weapon) {
        return {
            melee: this.actor.combat.melee.relative,
            accuracy: this.actor.combat.accuracy.relative,
            attribute: "body" ,
            skill: weapon.category === "melee" ? "weaponSkill" : "ballisticSkill",
            swarmDice: this.actor.type === "npc" && this.actor.isSwarm ? this.actor.combat.health.toughness.value : 0, 
            weapon: {
                name: weapon.name,
                category: weapon.category,
                damage: weapon.damage,
                traits: weapon.traits
            }
            
        };
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