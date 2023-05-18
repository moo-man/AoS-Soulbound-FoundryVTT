import SoulboundCounter from "./counter.js"

export default class Reroller extends FormApplication
{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "reroller",
            title : game.i18n.localize("HEADER.REROLLER"),
            template : "systems/age-of-sigmar-soulbound/template/apps/reroller.hbs",
            width:420
        })
    }

    
    async _updateObject(event) {
        let dice = Array.from($(event.currentTarget).find(".die")).sort((a, b) => a.dataset.index - b.dataset.index).map(i => i.classList.contains("selected"))

        if (!game.user.isGM)
            SoulboundCounter.changeCounter(-1, "soulfire")
        this.object.reroll(dice)
    }

    activateListeners(html)
    {
        super.activateListeners(html)

        html.find(".diceClick").click(ev => {
            ev.currentTarget.classList.toggle("selected")
        })
    }
}