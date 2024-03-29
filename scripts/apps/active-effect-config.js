import EffectScriptConfig from "./effect-script.js"

export default class AgeOfSigmarEffectSheet extends ActiveEffectConfig {
    async getData() {
        let data = await super.getData()
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

       /**
         * Handle adding a new change to the changes array.
         * @private
         */
        async _addEffectChange() {
            const idx = this.document.changes.length;
            super._addEffectChange().then(sheet => {
                // Well this isn't good, forgot to fix the path here, I don't think I can change it without needing a migration
                // I will just wait until the effect refactor to handle this
                this.document.update({[`flags.wrath-and-glory.changeCondition.${idx}`] : {script : "", description : "", hide : ""}})
            })
        }

        /**
         * When deleting an active effect, make sure its change condition is deleted too
         */
        _onEffectControl(event) {
            event.preventDefault();
            if (event.currentTarget.dataset.action == "delete")
            {

                let index = $(event.currentTarget).parents(".effect-change")[0]?.dataset.index;
                let newConditionals = this.deleteChangeCondition(index);
                // Call normal operation, once done, delete change condition for deleted index
                super._onEffectControl(event).then(() => {
                    this.document.update({"flags.wrath-and-glory.changeCondition" : null}).then(() => { // Delete previous object so data doesn't get merged and produce duplicates
                        this.document.update({"flags.wrath-and-glory.changeCondition" : newConditionals})
                    })
                })
            }
            else 
            {
                return super._onEffectControl(event);
            }
        }

        /**
         *When deleting a change condition, all indices after must be adjusted  
         * 
         * @param {Number} index Index of change being deleted
         * @returns 
         */
        deleteChangeCondition(index)
        {
            let newConditionals = {};
            let conditionals = foundry.utils.deepClone(this.document.changeConditionals);
            delete conditionals[index];
            Object.values(conditionals).forEach((value, index) => {
                newConditionals[index] = value;
            })
            return newConditionals;
        }
}