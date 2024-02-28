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

        schema.damage = new fields.SchemaField({
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
            core : new fields.ArrayField(ArchetypeItem),
            list : new fields.ArrayField(ArchetypeItem),
            choose : new fields.NumberField(),
        }); 

        schema.equipment = new fields.ArrayField(ArchetypeItem),

        schema.groups = new fields.SchemaField({
            type : new fields.StringField({initial : "and"}),
            items : new fields.ArrayField(ArchetypeItem),
            groupId : new fields.StringField({initial : "root"}),
        });
        return schema;
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
        return schema;
    }
}
