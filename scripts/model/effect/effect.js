let fields = foundry.data.fields;

export class SoulboundAvoidTestModel extends AvoidTestModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.value = new fields.StringField({initial : "none"}),
        schema.opposed = new fields.BooleanField({initial : false});
        schema.prevention = new fields.BooleanField({initial : true});
        schema.reversed = new fields.BooleanField({initial : false});
        schema.manual = new fields.BooleanField({initial : false});
        schema.script = new fields.StringField({});

        schema.dn = new fields.StringField({});
        schema.attibute = new fields.StringField({});
        schema.skill = new fields.StringField({});

        return schema;
    }
}

export class SoulboundActiveEffectModel extends WarhammerActiveEffectModel {
    static _avoidTestModel = SoulboundAvoidTestModel;
}