import { AgeOfSigmarActorSheet } from "./actor-sheet.js";

export class PlayerSheet extends AgeOfSigmarActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/age-of-sigmar-soulbound/template/sheet/player.html",
        });
    }

    getData() {
        const data = super.getData();
        return data;
    }


    activateListeners(html) {
        super.activateListeners(html);

        html.find(".archetype-input").click(ev => {
            let archetype = this.actor.getItemTypes("archetype").find(i => i.name == ev.currentTarget.value);

            if (archetype)
                archetype.sheet.render(true)
            else   
                ui.notifications.error("No Archetype Item found.")
        })
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        if (this.actor.isOwner) {
            buttons = [
            ].concat(buttons);
        }
        return buttons;
    }
}
