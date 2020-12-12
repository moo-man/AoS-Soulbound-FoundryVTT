import { AgeOfSigmarActorSheet } from "./actor.js";

export class PartySheet extends AgeOfSigmarActorSheet {

    static get defaultOptions() {
        let dragDrop = [...super.defaultOptions.dragDrop];
        dragDrop.push({ dropSelector: '.party' });
        return mergeObject(super.defaultOptions, {
            classes: ["age-of-sigmar-soulbound", "sheet", "actor"],
            template: "systems/age-of-sigmar-soulbound/template/sheet/party.html",
            width: 700,
            height: 1000,
            resizable: false,
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "main",
                },
            ],
            dragDrop: dragDrop
        });
    }

    getData() {
        const data = super.getData();
        let ownedActorId;
        data.members = {};
        for (let i = 0; i < (data.actor.flags.members || []).length; i++) {
            ownedActorId = data.actor.flags.members[i];
            let actor = game.actors.get(ownedActorId);
            if (actor) data.members[ownedActorId] = actor;
        }
        console.log(data);
        return data;
    }


    activateListeners(html) {
        super.activateListeners(html);
        html.find(".member-delete").click(ev => this._onMemberDelete(ev));
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        if (this.actor.owner) {
            buttons = [
            ].concat(buttons);
        }
        return buttons;
    }

    async _onDrop(event) {
        super._onDrop(event);
        const json = event.dataTransfer.getData('text/plain');
        if (!json) return;
        let draggedItem = JSON.parse(json);
        if (draggedItem.type !== 'Actor') return;
        const actor = game.actors.get(draggedItem.id);
        if (actor.data.type !== 'player') return;
        await this._addMembers(actor);
        this.render(true);
    }

    async _onMemberDelete(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const memberId = div.data("itemId");
        let members = [...this._getMembers()];
        members.splice(members.indexOf(memberId), 1);
        let updateData = {
            'flags.members': members,
        };
        await this.actor.update(updateData);
        div.slideUp(200, () => this.render(false));
    }

    async _addMembers(actor) {
        let members = [...this._getMembers()];
        let initialCount = members.length;
        members.push(actor.data._id);
        members = [...new Set(members)];
        if (initialCount === members.length) return;
        await this.actor.update({ 'flags.members': members,});
    }

    _getMembers() {
        return this.actor.data.flags.members || [];
    }
}
