export default class ActorConfigure extends FormApplication
{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "actor-configure",
            template : "systems/age-of-sigmar-soulbound/template/apps/actor-configure.html",
            width:420
        })
    }

    
    async _updateObject(event, formData) {
        this.object.update(formData)
    }
}