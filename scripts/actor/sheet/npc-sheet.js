import { AgeOfSigmarActorSheet } from "./actor-sheet.js";

export class NpcSheet extends AgeOfSigmarActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["age-of-sigmar-soulbound", "sheet", "actor"],
            template: "systems/age-of-sigmar-soulbound/template/sheet/npc.html",
            width: 420,
            height: 830,
            resizable: false,
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "main",
                },
            ]
        });
    }

    getData() {
        const data = super.getData();
        return data;
    }


    activateListeners(html) {
        super.activateListeners(html);
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
