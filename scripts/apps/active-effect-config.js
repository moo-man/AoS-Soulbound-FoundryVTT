import EffectScriptConfig from "./effect-script.js"

export default class AgeOfSigmarEffectSheet extends ActiveEffectConfig {
    get template() {
        return "systems/age-of-sigmar-soulbound/template/apps/active-effect-config.html"
    }

    getData() {
        let data = super.getData()
        data.equippableItem = this.object.item && this.object.item.equippable
        data.modes[6] = "Dialog Effect"
        data.modes[7] = "Targeter's Dialog Effect"
        return data
    }

    activateListeners(html) {
        super.activateListeners(html)

        html.find(".effect-script-config").click(ev => {
            let index = parseInt($(ev.currentTarget).parents(".effect-change").attr("data-index"))
            new EffectScriptConfig({effect : this.object, index}).render(true)
        })

        html.find(".mode select").change(ev => {
                this.submit({preventClose: true})
        })
    }
}