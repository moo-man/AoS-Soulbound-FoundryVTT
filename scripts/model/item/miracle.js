import { TestDataModel } from "./components/test";
import { StandardItemModel } from "./standard";

let fields = foundry.data.fields;


export class MiracleModel extends StandardItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.protection = new fields.NumberField();
        schema.target = new fields.StringField();
        schema.range = new fields.StringField({initial: "self"});
        schema.duration = new fields.StringField();
        schema.effect = new fields.StringField();
        schema.god = new fields.StringField();
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        schema.cost = new fields.NumberField();

        return schema;
    }

    async toEmbed(config, options)
    {
        let html = `
        <h4>@UUID[${this.parent.uuid}]{${config.label || this.parent.name}}</h4>
        ${"<p><strong>Target</strong>: " + this.target + "</p>"}
        ${"<p><strong>Range</strong>: " + game.aos.config.range[this.range] + "</p>"}
        ${"<p><strong>Duration</strong>: " + this.duration + "</p>"}
        ${this.description}`

        let div = document.createElement("div");
        div.style = config.style;
        div.innerHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(html, {relativeTo : this, async: true, secrets : options.secrets})
        return div;
    }
}