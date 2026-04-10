import { TestDataModel } from "./components/test";
import { StandardItemModel } from "./standard";

let fields = foundry.data.fields;


export class SpellModel extends StandardItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.target = new fields.StringField();
        schema.dn = new fields.StringField();
        schema.attribute = new fields.StringField({initial : "mind"});
        schema.range = new fields.StringField({initial: "you"});
        schema.duration = new fields.SchemaField({
            value : new fields.StringField({nullable : true}),
            unit : new fields.StringField({initial : "instant"})
        });
        schema.damage = new fields.StringField();
        schema.overcast = new fields.StringField();
        schema.overcasts = new fields.ArrayField(new fields.SchemaField({
            ratio : new fields.SchemaField({
                success : new fields.NumberField({min: 0, initial : 1}),
                value : new fields.NumberField({initial : 1}),
            }),
            initial : new fields.NumberField(),
            property : new fields.StringField(),
            description : new fields.StringField(),
            title : new fields.StringField()
        }));
        schema.effect = new fields.StringField();
        schema.lore = new fields.StringField();
        schema.test = new fields.EmbeddedDataField(TestDataModel);

        return schema;
    }

    get difficulty()
    {
        return game.aos.utility.DNToObject(this.dn)
    }

    async toEmbed(config, options)
    {
        let overcastText = this.overcasts.map(i => i.description).join(", ");
        let html = `
        <h4>@UUID[${this.parent.uuid}]{${config.label || this.parent.name}}</h4>
        <div style="display: flex; justify-content: space-evenly; text-align: left">
            <div style="flex: 1">
                <p><strong>DN</strong>: ${this.dn}</p>
            </div>
            <div style="flex: 1">
                <p><strong>Target</strong>: ${this.target}</p>
            </div>
        </div>
        <div style="display: flex; justify-content: space-evenly; text-align: left">
            <div style="flex: 1">
                <p><strong>Range</strong>: ${game.aos.config.range[this.range]}</p>
            </div>
            <div style="flex: 1">
                <p><strong>Duration</strong>: ${this.duration.value} ${game.aos.config.durations[this.duration.unit]}</p>
            </div>
        </div>
        `
        if (overcastText)
        {
            html += `<p><strong>Overcast:</strong> ${this.overcasts.map(i => i.description)}</p>`;
        }
        html += this.description;

        let div = document.createElement("div");
        div.style = config.style;
        div.innerHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(html, {relativeTo : this, async: true, secrets : options.secrets})
        return div;
    }

}