import { AgeOfSigmarItemSheet } from "./item-sheet.js";

export class AethericDeviceSheet extends AgeOfSigmarItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["age-of-sigmar-soulbound", "sheet", "item"],
            template: "systems/age-of-sigmar-soulbound/template/sheet/aetheric-device.html",
            width: 500,
            height: 562,
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
