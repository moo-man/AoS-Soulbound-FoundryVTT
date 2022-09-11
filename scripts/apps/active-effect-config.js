import EffectScriptConfig from "./effect-script.js"

export default class AgeOfSigmarEffectSheet extends ActiveEffectConfig {
    getData() {
        let data = super.getData()
        data.equippableItem = this.object.item && this.object.item.equippable
        data.modes[6] = "Dialog Effect"
        data.modes[7] = "Targeter's Dialog Effect"
        return data
    }

    activateListeners(html) {
        super.activateListeners(html)

        // find the "dialog" effect changes and add a config button
        html.find(".changes-list .effect-controls").each((index, element) => {
            let change = this.object.changes[index];
            if (change.mode > 5)
            {
                element.append($(`<a class="effect-script-config"><i class="fas fa-cog"></i></a>`)[0])
            }
        })


        html.find(".effect-script-config").click(ev => {
            let index = parseInt($(ev.currentTarget).parents(".effect-change").attr("data-index"))
            new EffectScriptConfig({effect : this.object, index}).render(true)
        })

        html.find(".mode select").change(ev => {
                this.submit({preventClose: true})
        })
    }
}