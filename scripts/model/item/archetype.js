import { BaseSoulboundItemModel } from "./base";

let fields = foundry.data.fields;

export class ArchetypeModel extends BaseSoulboundItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.journal = new fields.StringField();
        schema.species = new fields.StringField();
        schema.aqua = new fields.NumberField();

        schema.attributes = new fields.SchemaField({
            body : new fields.NumberField(),
            mind : new fields.NumberField(),
            soul : new fields.NumberField(),
        });

        schema.skills = new fields.SchemaField({
            core : new fields.StringField(),
            xp : new fields.NumberField(),
            list : new fields.ArrayField(new fields.StringField()),
        });

        schema.talents = new fields.SchemaField({
            core : new fields.ArrayField(new fields.EmbeddedDataField(ArchetypeItem)),
            list : new fields.ArrayField(new fields.EmbeddedDataField(ArchetypeItem)),
            choose : new fields.NumberField(),
        }); 

        schema.equipment = new fields.ArrayField(new fields.EmbeddedDataField(ArchetypeItem)),

        schema.groups = new fields.ObjectField({});
        return schema;
    }

    addToGroup(object)
    {
        let groups = duplicate(this.groups)
        object.groupId = randomID()
        groups.items.push(object)
        return groups
    }

    resetGroups(newEquipment)
    {
        let equipment = newEquipment || this.equipment;
        return { "system.groups": {type: "and", groupId: "root", items : Array.fromRange(equipment.length).map(i => {return {type: "item", index : i, groupId : randomID()}})} } // Reset item groupings
    }

    async _onCreate(data, options, user)
    {   
        await super._onCreate(data, options, user);
        if (this.parent.isOwned)
        {
            await Dialog.confirm({
                title: game.i18n.localize(this.parent.actor.type == "player" ? "HEADER.CHARGEN" : "HEADER.ARCHETYPE_APPLY"),
                content: `<p>${game.i18n.localize(this.parent.actor.type == "player" ? "CHARGEN.PROMPT" : "ARCHETYPE.PROMPT")}</p>`,
                yes: () => this.parent.actor.system.applyArchetype(this.parent, true),
                no: () => this.parent.actor.system.applyArchetype(this.parent, false)
            })
        }
    }

}

export class ArchetypeItem extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.id = new fields.StringField(),
        schema.name = new fields.StringField(),
        schema.type = new fields.StringField({nullable: true, choices : ["generic", "item"]}),
        schema.groupId = new fields.StringField(),
        schema.index = new fields.NumberField(),
        schema.diff = new fields.ObjectField({})
        schema.filters = new fields.ArrayField(new fields.SchemaField({
            test : new fields.StringField(),
            property : new fields.StringField(),
            value : new fields.StringField(),
        }))
        return schema;
    }
}
