import { BaseItemModel } from "./base";
let fields = foundry.data.fields;

export class ArchetypeModel extends BaseItemModel
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

    resetGroups()
    {
        this.parent.update({ "system.groups": {type: "and", groupId: "root", items : Array.fromRange(this.equipment.length).map(i => {return {type: "item", index : i, groupId : randomID()}})} }) // Reset item groupings
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
