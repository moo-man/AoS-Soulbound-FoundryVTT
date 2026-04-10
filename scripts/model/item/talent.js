import { TestDataModel } from "./components/test";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

export class TalentModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.requirement = new fields.StringField({});
        schema.effect = new fields.StringField({});
        schema.free = new fields.BooleanField({initial: false});
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        return schema;
    }

    async toEmbed(config, options)
    {
        let html = `
        <h4>@UUID[${this.parent.uuid}]{${config.label || this.parent.name}}</h4>
        ${this.requirement ? "<p><strong>Requirement</strong>: " + this.requirement + "</p>" : ""}
        ${this.description}`

        let div = document.createElement("div");
        div.style = config.style;
        div.innerHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(html, {relativeTo : this, async: true, secrets : options.secrets})
        return div;
    }
}