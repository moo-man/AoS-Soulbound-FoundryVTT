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
}