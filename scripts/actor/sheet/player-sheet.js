import { SoulboundActorSheet } from "./actor-sheet.js";

export class PlayerSheet extends SoulboundActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/age-of-sigmar-soulbound/template/sheet/player.hbs",
        });
    }

    getData() {
        const data = super.getData();
        return data;
    }


    activateListeners(html) {
        super.activateListeners(html);

        html.find(".archetype-input").click(ev => {
            let archetype = this.actor.itemTypes["archetype"].find(i => i.name == ev.currentTarget.value);

            if (archetype)
                archetype.sheet.render(true)
            else   
                ui.notifications.error(game.i18n.localize("ERROR.NoArchetypeItem"))
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
