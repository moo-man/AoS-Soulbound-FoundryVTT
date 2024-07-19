let fields = foundry.data.fields;

export class SoulboundAvoidTestModel extends AvoidTestModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.dn = new fields.StringField({});
        schema.attibute = new fields.StringField({});
        schema.skill = new fields.StringField({});

        return schema;
    }
}

export class SoulboundActiveEffectModel extends WarhammerActiveEffectModel {
    static _avoidTestModel = SoulboundAvoidTestModel;
}