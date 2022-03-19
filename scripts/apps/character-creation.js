import { AgeOfSigmarActor } from "../actor/actor-aos.js";
import { AgeOfSigmarItem } from "../item/item-aos.js";
import ArchetypeGroups from "./archetype-groups.js";
import FilterResults from "./filter-results.js";

export default class CharacterCreation extends FormApplication {
    constructor(object) {
        super(object)
        this.actor = object.actor;
        this.archetype = object.archetype.clone();

        this.initializeCharacter();
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "character-creation",
            title: "Character Creation",
            template: "systems/age-of-sigmar-soulbound/template/apps/character-creation.html",
            width: 1400,
            height: 800,
            resizable: true
    })
    }


    initializeCharacter()
    {
        this.character = new AgeOfSigmarActor({type: "player", name : this.object.actor.name}) // Temporary actor 


        this.character.data.update({[`data.skills.${this.archetype.skills.core}.training`] : 1})
        this.character.data.update({[`data.skills.${this.archetype.skills.core}.focus`] : 1})

        this.character.prepareData();

        // Allows us to prevent user from going below base stats
    }

    async getData() {
        let data = super.getData();

        data.actor = this.actor;
        data.character = this.character
        data.archetype = this.archetype;
        data.coreTalents = this.archetype.talents.core.map(t => game.items.get(t.id))
        data.chooseTalents = this.archetype.talents.list.map(t => game.items.get(t.id))
        data.equipmentHTML = this.constructEquipmentHTML();
        return data
    }


    async _updateObject(event, formData) {
        this.object.update(formData)
    }

    constructEquipmentHTML() {
        let html = ""


        let groupToHTML = (group, { selector = false } = {}) => {
            let html = ""
            if (["and", "or"].includes(group.type)) {
                let connector = `<span class="connector">${group.type}</span>`
                html += `<div class='equipment-group ${group.type == "or" ? "choice" : ""} ${group.groupId == "root" ? "root" : ""}' data-id="${group.groupId}">`
                html += group.items.map(g => {
                    let groupHTML = groupToHTML(g)
                    if (group.type == "or") {
                        groupHTML = `<div class="equipment-selection" data-id="${g.groupId}">${groupHTML}<a class="equipment-selector"><i class="far fa-circle"></i></a></div>`
                    }
                    return groupHTML
                }).join(group.groupId == "root" ? "" : connector)
                html += "</div>"
                return html
            }
            else if (group.type == "item") {
                return `<div class="equipment-item" data-id='${group.groupId}'>${group.name}</div>`
            }
            else if (group.type == "generic") {
                return `<div class="equipment-item generic" data-id='${group.groupId}'><i class="fas fa-filter"></i> ${group.name}</div>`
            }
        }

        html += groupToHTML(ArchetypeGroups.groupIndexToObjects(this.archetype.groups, this.archetype), html)
        return html;
    }

    /**
     * Replace a filter html with an item
     * 
     * @param {Object} filter Filter details (to replace with object)
     * @param {String} id ID of item chosen
     */
    chooseEquipment(filter, id)
    {
        let element = this.element.find(`.generic[data-id=${filter.groupId}]`)[0]
        let group = ArchetypeGroups.search(filter.groupId, this.archetype.groups)
        let equipmentObject = this.archetype.equipment[group.index]
        let item = game.items.get(id)
        
        if (element && item) 
        {
            element.classList.remove("generic")
            element.textContent = item.name

            equipmentObject.type = "item"
            equipmentObject.name = item.name;
            equipmentObject.id = item.id;
        }
    }

    activateListeners(html) {
        super.activateListeners(html);



        html.find(".skill-button button").click(ev => {
            let direction = ev.target.dataset.type;
            let type = ev.target.parentElement.dataset.type;
            let skill = $(ev.currentTarget).parents(".skill").attr("data-skill")

            if (direction == "inc")
            {
                if (this.character.skills[skill][type] >= 3)
                    return

                this.character.data.update({[`data.skills.${skill}.${type}`] : this.character.skills[skill][type] + 1});
            }
            else
            {
                if (this.character.skills[skill][type] <= 0)
                    return
                if (this.archetype.skills.core == skill && this.character.skills[skill][type] <= 1)
                    return 

                this.character.data.update({[`data.skills.${skill}.${type}`] : this.character.skills[skill][type] - 1});
            }

            ev.target.parentElement.querySelector(".skill-value").textContent = this.character.skills[skill][type]

            this.updateExperience()
        })
        
        html.find(".talent input").change(ev => {
            let parent = $(ev.currentTarget).parents(".talents")
            let counter = parent.find(".talent-count input")[0];
            let counterValue = Number(counter.value)


            // Checked
            if (ev.target.checked)
            {
                // counter is 0, prevent check
                if (!counterValue)
                {
                    ev.target.checked = false;
                    return
                }

                counterValue--;
            }
            // Unchecked
            else if (!ev.target.checked)
            {
                counterValue++;
            }

            counter.value = counterValue

            // If counter is now 0, disable other talents, otherwise, enable them
            if (!counterValue)
                parent.find(".talent:not('.core')").each((i, e) => {
                    if(!$(e).find("input")[0].checked)
                    {
                        e.classList.add("disabled")
                    }
                })
            else 
                parent.find(".disabled").each((i, e) => e.classList.remove("disabled"))
        })


        html.find(".equipment-selector").click(ev => {

            if (this.isDisabled(ev.currentTarget))
                return

            let parent = $(ev.currentTarget).closest(".equipment-selection");
            let choice = parent.closest(".choice")

            // Cannot uncheck that which has checked descendents ( >1 to exclude self, kinda gross but whatever)
            if (!this.isDisabled(ev.currentTarget) && parent.find(".on").length > 1)
                return
                
            let isChecked = this.toggleSelector(ev.currentTarget);

            if (isChecked)
            {
                // Select all ancestors
                parent.parents(".equipment-selection").each((i, e) => {
                    $(e).children(".equipment-selector").each((j, selector) => {
                        this.setSelector(selector, "on")
                        this.disableSiblingChoices(selector)
                    })
                })

                // Disable siblings
                this.disableSiblingChoices(ev.currentTarget)
            }
            else // If unchecked
            {
                choice.find(".disabled").each((i, e) => {
                    this.enableElements(e)
                })
            }

        })

        html.find(".equipment-item").click(async ev => {
            let id = ev.currentTarget.dataset.id
            let group = ArchetypeGroups.search(id, this.archetype.groups)
            let equipment = this.archetype.equipment[group.index]

            if (equipment.type == "generic")
            {
                new FilterResults({equipment, app: this}).render(true)
            }
            else
              new AgeOfSigmarItem(game.items.get(equipment.id).toObject()).sheet.render(true, {editable: false})
        })
    }


    updateExperience()
    {
        this.character.prepareData();
        let availableXP = parseInt(this.element.find(".xp-total")[0].value)
        let spentInput = this.element.find(".xp-spent")[0];
        spentInput.value = this.character.experience.spent - 2; // -2 to account for the core skill already advanced
        if (parseInt(spentInput.value) > availableXP)
            spentInput.classList.add("error")
        else
            spentInput.classList.remove("error")
    }

    //#region equipment 


    _toggleGroupIcon(element, force) {
        $(element).find(".equipment-selector").each((i, el) => {
            this._toggleFAIcon($(el).children()[0], force)
        })
    }


    disableElements(element) 
    {
        element.classList.add("disabled")
        $(element).find(".equipment-selector").each((i, el) => {
            this.setSelector(el, "off")
        })
    }

    disableSiblingChoices(element)
    {
        let parent = $(element).closest(".equipment-selection");
        let group = parent.find(".equipment-group,.equipment-item")
        let groupId = group.attr("data-id")
        let choice = parent.closest(".choice")
        
        // Disable siblings
        choice.children().each((i, e) => {
            if (e.dataset.id != groupId) {
                this.disableElements(e)
            }
        })
    }


    enableElements(element)
    {
        element.classList.remove("disabled")
    }

    toggleSelector(element)
    {
        if (this.isOn(element))
            return this.setSelector(element, "off")
        else if(!this.isOn(element))
            return this.setSelector(element, "on")
    }

    setSelector(element, value)
    {
        if (value == "on")
        {
            element.classList.add(value)
            element.classList.remove("off")
            
        }
        else if (value == "off")
        {
            element.classList.add(value)
            element.classList.remove("on")
        }

        this._setFAIcon(element, value)

        return value == "on" // return true if on, otherwise false
    }

    isOn(element)
    {
        return element.classList.contains("on")
    }

    isDisabled(element)
    {
        return $(element).parents(".disabled").length
    }

    _setFAIcon(element, value)
    {
        let fa = element.children[0];
        if (value == "on")
        {
            fa.classList.remove("fa-circle")
            fa.classList.add("fa-check-circle")
        }
        else if (value == "off")
        {
            fa.classList.remove("fa-check-circle")
            fa.classList.add("fa-circle")
        }
    }
    //#endregion
}