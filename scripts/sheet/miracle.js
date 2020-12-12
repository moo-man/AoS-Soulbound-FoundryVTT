import { AgeOfSigmarItemSheet } from "./item.js";

export class MiracleSheet extends AgeOfSigmarItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["age-of-sigmar-soulbound", "sheet", "item"],
            template: "systems/age-of-sigmar-soulbound/template/sheet/miracle.html",
            width: 500,
            height: 454,
            resizable: false,
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "description",
                },
            ]
        });
    }

    getData() {
        const data = super.getData();
        return data;
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        return buttons;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }
}
