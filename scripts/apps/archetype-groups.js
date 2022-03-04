/**
 * Welcome to my incredibly over-engineered concept for archetype equipment
 * 
 * "groups" is the concept to convey how an archetype gets equipment A, B, C, and D (such as (A or B) and (C or D))
 * 
 * An archetype's equipment list is flat, however their "groups" object stores the instructions on how to distribute those items
 * 
 * Within the groups object are objects of type "and", "or", "item". 
 * 
 * "and/or" objects have an "items" property that can store "and/or/item" type objects
 * "item" type objects exist at the bottom of the structure, and they store the index of the item in the equipment array
 * 
 * So this structure can go arbitraritly deep (ands storing ors storing ands storing ors ... to finally storing items). Absolutely overkill, but whatever
 * 
 * Example:
 * (0 AND 1 AND 2 AND (3 OR 4)) AND (5 OR 6 OR (7 AND 8)) 
 * {
       type: "and", 
       items : [
           {type : 'and', items : [
               {type: 'item', index: 0},
               {type: 'item', index: 1},
               {type: 'item', index: 2},
               {type: 'or', items: [
                   {type: 'item', index: 3},
                   {type: 'item', index: 4},
               ]}
           ]},
           {type: "or", items : [
               {type: 'item', index: 5},
               {type: 'item', index: 6},
               {type: "and", items : [
                   {type: 'item', index: 7},
                   {type: 'item', index: 8}
               ]}
           ]}
       ]
   }

 * 
 */


export default class ArchetypeGroups extends Application {

    constructor(object) {
        super()
        this.object = object
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "archetype-groups",
            template: "systems/age-of-sigmar-soulbound/template/apps/archetype-groups.html",
            height: "auto",
            width: 285,
            title: "Archetype Groups",
            resizable: true,
            dragDrop: [{ dragSelector: ".equipment", dropSelector: ".group", permissions: { dragstart: true, drop: true } }]
        })
    }

    getData() {
        let data = super.getData();
        data.equipment = this.object.equipment;
        data.groups = this.object.groups

        data.groupHtml = this._constructHTML(data.displayGroups)
        return data
    }


    _groupIndexToObjects() {
        return ArchetypeGroups.groupIndexToObjects(this.object.groups, this.object)
    }

    _constructHTML()
    {
        return ArchetypeGroups.constructHTML(this.object)
    }

    

    // Recursive function to convert group index arrays into their corresponding objects objects
    static groupIndexToObjects(groupObject, item) {
            if (["and", "or"].includes(groupObject.type))
            {
                return {
                    type: groupObject.type, 
                    items : groupObject.items.map(i => this.groupIndexToObjects(i, item))
                }
            }
            
            // Base case
            else if (["item", "generic"].includes(groupObject.type))
            {
                return mergeObject(item.equipment[groupObject.index], {index : groupObject.index})
            }
        }
    /**
     * Construct html to display the groups in a readable format
     * 
     * @param {Object} displayGroups Group object that has been processed with actual items (gone through groupIndexToObjects)
     * @returns 
     */
    static constructHTML(item, parentheses=false) {
        let displayGroups = this.groupIndexToObjects(item.groups, item)
        let html = `
        <div class="group-wrapper">
        `

        let groupToHtml = (groupObject) => {
            let html = ``
            if (["and", "or"].includes(groupObject.type))
            {
                html += `<div class="group">`
                html += `<div class="group-list">${parentheses ? "<span class='parentheses'> ( </span>" : "" }${groupObject.items.map(groupToHtml).join(`<span> ${groupObject.type.toUpperCase()} </span>`)}${parentheses ? " <span class='parentheses'> ) </span> " : ""}</div>`
                html += `</div>`
            }
            else
                html += `<div class="equipment" draggable=true data-path="data.equipment" data-index="${groupObject.index}" data-id="${groupObject.id}">${groupObject.name}</div>`
            return html
        }


        html += groupToHtml(displayGroups)

        html += "</div>"
        return html
    }


    static parseGroupString(string)
    {
        string = "(0 AND 1 AND 2 AND (3 OR 4)) AND (5 OR 6 OR (7 AND 8))"


    }

}