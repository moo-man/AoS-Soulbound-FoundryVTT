export default class Reroller extends FormApplication
{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "reroller",
            title : "Reroller",
            template : "systems/age-of-sigmar-soulbound/template/apps/reroller.html",
            width:420
        })
    }

    
    async _updateObject(event) {
        let dice = Array.from($(event.currentTarget).find(".die")).map(i => i.classList.contains("selected"))

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