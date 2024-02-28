let fields = foundry.data.fields;

export class AttributesModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.body = new fields.EmbeddedDataField(AttributeModel);
        schema.mind = new fields.EmbeddedDataField(AttributeModel);
        schema.soul = new fields.EmbeddedDataField(AttributeModel);
        return schema;
    }
}

class AttributeModel extends foundry.abstract.DataModel
{
    static defineSchema() 
    {
        let schema = {};
        schema.value = new fields.NumberField({min: 0, initial: 1});
        return schema;
    }
}