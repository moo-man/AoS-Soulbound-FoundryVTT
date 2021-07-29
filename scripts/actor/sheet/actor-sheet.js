import { prepareCustomRoll, prepareCommonRoll, prepareCombatRoll, preparePowerRoll } from "../../system/dialog.js";
import ActorConfigure from "../../apps/actor-configure.js";

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
            skill.total = skill.training;
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
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        if (this.actor.isOwner) {
            buttons = [
                {
                    label: "BUTTON.ROLL",
                    class: "custom-roll",
                    icon: "fas fa-dice",
                    onclick: async (ev) => await prepareCustomRoll()
                },
                {
                    label: "CONFIGURE.LABEL",
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
             name : `New ${game.i18n.localize("ITEM.Type" + header.type.toLowerCase().capitalize())}`,
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

    _prepareRollAttribute(event) {
        event.preventDefault();
        const attributeName = $(event.currentTarget).data("attribute");
        const attributes = this._setSelectedAttribute(attributeName)
        const skills = this._setSelectedSkill(null)
        return prepareCommonRoll(attributes, skills);
    }

    _prepareRollSkill(event) {
        event.preventDefault();
        const skillName = $(event.currentTarget).data("skill");
        const attribute = this.actor.skills[skillName].attribute
        const attributes = this._setSelectedAttribute(attribute)
        const skills = this._setSelectedSkill(skillName)
        return prepareCommonRoll(attributes, skills);
    }

    _prepareRollWeapon(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const weapon = this.actor.items.get(div.data("itemId"));
        let attributeName, skillName;
        if (weapon.category === "melee") {
            attributeName = "body";
            skillName = "weaponSkill"
        } else {
            attributeName = "body";
            skillName = "ballisticSkill"
        }
        const attributes = this._setSelectedAttribute(attributeName)
        const skills = this._setSelectedSkill(skillName)
        const combat = this._getCombat(weapon);
        return prepareCombatRoll(attributes, skills, combat);
    }

    _prepareRollPower(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const power = this.actor.items.get(div.data("itemId"));
        let attributes, skills;
        if (power.data.type === "spell") {
            attributes = this._setSelectedAttribute("mind")
            skills = this._setSelectedSkill("channelling")
        } else {
            attributes = this._setSelectedAttribute("soul")
            skills = this._setSelectedSkill("devotion")
        }
        return preparePowerRoll(attributes, skills, power);
    }
	
	_prepareShowPower(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const power = this.actor.items.get(div.data("itemId"));
        power.sendToChat()
    }

    _setSelectedAttribute(attributeName) {
        let attributes = foundry.utils.deepClone(this.actor.attributes);
        for (let attribute of Object.values(attributes)) {
            attribute.selected = false;
        }
        if (attributeName) attributes[attributeName].selected = true;
        return attributes
    }

    _setSelectedSkill(skillName) {
        let skills = foundry.utils.deepClone(this.actor.skills);
        for (let skill of Object.values(skills)) {
            skill.selected = false;
        }
        if (skillName) skills[skillName].selected = true;
        return skills
    }

    _getCombat(weapon) {
        return {
            melee: this.actor.combat.melee.relative,
            accuracy: this.actor.combat.accuracy.relative,
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
}