export default class SpeedConfig extends FormApplication 
{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "item-traits",
            template : "systems/age-of-sigmar-soulbound/template/apps/speed-config.html",
            height : "auto",
            width : "auto",
            title : "Speed Configuration"
            
        })
    }


    _updateObject(event, formData)
    {
        this.object.update(formData)
    }

    activateListeners(html) {
        super.activateListeners(html);


    }
}