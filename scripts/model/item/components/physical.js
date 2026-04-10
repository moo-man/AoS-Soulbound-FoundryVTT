import { StandardItemModel } from "../standard";

let fields = foundry.data.fields;

export class PhysicalItemModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.cost = new fields.StringField();
        schema.quantity = new fields.NumberField({min: 0, initial: 1});
        schema.availability = new fields.StringField({});
        schema.state = new fields.StringField({initial : "other"});

        return schema;
    }

    get isPhysical()
    {
        return true;
    }

    async toEmbed(config, options)
    {
        let html = `
        <h4>@UUID[${this.parent.uuid}]{${config.label || this.parent.name}}</h4>
        ${this.description}`

        let div = document.createElement("div");
        div.style = config.style;
        div.innerHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(html, {relativeTo : this, async: true, secrets : options.secrets})
        return div;
    }
}