import { AgeOfSigmarActorSheet } from "./actor-sheet.js";

export class PartySheet extends AgeOfSigmarActorSheet {

    static get defaultOptions() {
        let dragDrop = [...super.defaultOptions.dragDrop];
        dragDrop.push({ dropSelector: '.party' });
        return mergeObject(super.defaultOptions, {
            classes: ["age-of-sigmar-soulbound", "sheet", "actor"],
            template: "systems/age-of-sigmar-soulbound/template/sheet/party.html",
            dragDrop: dragDrop
        });
    }

    getData() {
        const data = super.getData();
        this.costructPartyItemLists(data)
        data.members = {};
        for (let id of data.data.members) {
            let actor = game.actors.get(id);
            data.members[id] = actor;
        }
        return data;
    }

    
    costructPartyItemLists(sheetData)
    {
        sheetData.party = {
            longGoals : sheetData.items.partyItems.filter(i => i.category == "longGoal"),
            shortGoals : sheetData.items.partyItems.filter(i => i.category == "shortGoal"),
            allies : sheetData.items.partyItems.filter(i => i.category == "ally"),
            enemies : sheetData.items.partyItems.filter(i => i.category == "enemy"),
            resources : sheetData.items.partyItems.filter(i => i.category == "resource" || !i.category),
            rumours : sheetData.items.partyItems.filter(i => i.category == "rumour"),
            fears : sheetData.items.partyItems.filter(i => i.category == "fear"),
            threats : sheetData.items.partyItems.filter(i => i.category == "threat")
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".completed").click(ev => this._onStateClick(ev));
        html.find(".member-delete").click(ev => this._onMemberDelete(ev));
        html.find(".member-click").click(ev => this._onMemberClick(ev));
        html.find(".item-edit").mousedown(ev => this._onAllyEnemyClick(ev));
    }

    _onItemCreate(event) {
        event.preventDefault();
        let header = event.currentTarget.dataset
        
        let data = {
             name : `${game.i18n.localize("ITEM.NEW")} ${game.i18n.localize(CONFIG.Item.typeLabels[header.type])}`,
             type : header.type
        };
        if (header.category)
            data["data.category"] = header.category
        
        data.name = `${game.i18n.localize("ITEM.NEW")} ${game.aos.config.partyItemCategories[header.category]}`
        this.actor.createEmbeddedDocuments("Item", [data], { renderSheet: true });
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        if (this.actor.isOwner) {
            buttons = [
            ].concat(buttons);
        }
        return buttons;
    }

    _onStateClick(event) {
        const div = $(event.currentTarget).parents(".item");
        const id = div.data("itemId");
        let item = this.actor.items.get(id)
        return item.update({"data.state" : !item.state})
    }

    async _onDrop(event) {        
        const json = event.dataTransfer.getData('text/plain');
        if (!json) return;
        let draggedItem = JSON.parse(json);
        if (draggedItem.type == 'Item') return super._onDrop(event);

        const actor = game.actors.get(draggedItem.id);
        if (actor.type == "player" && actor.hasPlayerOwner)
            this._addMembers(actor);
        else if (actor.type != "party")
             this._addAllyOrEnemy(actor)
    }

    _onMemberClick(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const memberId = div.data("itemId");
        game.actors.get(memberId).sheet.render(true)
    }

    async _onMemberDelete(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const memberId = div.data("itemId");
        let members = this.actor.members.filter(i => i != memberId)
        await this.actor.update({ 'data.members': members,});
    }

    async _addMembers(actor) {
        let members = duplicate(this.actor.members)
        if (!members.includes(actor.id))
        {
            members.push(actor.id)
            await this.actor.update({ 'data.members': members});
        }
    }

    async _addAllyOrEnemy(actor) {
        let partyItem = {name : actor.name, type : "partyItem", "flags.age-of-sigmar-soulbound.actorId" : actor.id}
        new Dialog({
            title : `${game.i18n.localize("PARTY.AllyOrEnemy")}`,
            content : `<p>${game.i18n.localize("PARTY.AllyOrEnemy")}</p>`,
            buttons : {
                "ally" : {
                    label : game.i18n.localize("PARTY.ALLY"),
                    callback: () => {
                        partyItem["data.category"] = "ally"
                        this.actor.createEmbeddedDocuments("Item", [partyItem])
                    }
                },
                "enemy" : {
                    label : game.i18n.localize("PARTY.ENEMY"),
                    callback: () => {
                        partyItem["data.category"] = "enemy"
                        this.actor.createEmbeddedDocuments("Item", [partyItem])
                    }
                }
            }
        }).render(true)
    }

     _onAllyEnemyClick(event)
     {
        event.stopPropagation()
        const div = $(event.currentTarget).parents(".item");
        const id = div.data("itemId");
        let item = this.actor.items.get(id)
        let actor
        if (item.getFlag("age-of-sigmar-soulbound", "actorId"))
            actor = game.actors.get(item.getFlag("age-of-sigmar-soulbound", "actorId"))
        if (actor && event.button == 0)
            actor.sheet.render(true)
        else 
            item.sheet.render(true)
     }
}
