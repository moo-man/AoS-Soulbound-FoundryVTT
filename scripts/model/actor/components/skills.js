let fields = foundry.data.fields;

export class SkillsModel extends foundry.abstract.DataModel
{
    static defineSchema() 
    {
        let schema = {};
        schema.arcana = new fields.EmbeddedDataField(SkillModel);
        schema.athletics = new fields.EmbeddedDataField(SkillModel);
        schema.awareness = new fields.EmbeddedDataField(SkillModel);
        schema.ballisticSkill = new fields.EmbeddedDataField(SkillModel);
        schema.beastHandling = new fields.EmbeddedDataField(SkillModel);
        schema.channelling = new fields.EmbeddedDataField(SkillModel);
        schema.crafting = new fields.EmbeddedDataField(SkillModel);
        schema.determination = new fields.EmbeddedDataField(SkillModel);
        schema.devotion = new fields.EmbeddedDataField(SkillModel);
        schema.dexterity = new fields.EmbeddedDataField(SkillModel);
        schema.entertain = new fields.EmbeddedDataField(SkillModel);
        schema.fortitude = new fields.EmbeddedDataField(SkillModel);
        schema.guile = new fields.EmbeddedDataField(SkillModel);
        schema.intimidation = new fields.EmbeddedDataField(SkillModel);
        schema.intuition = new fields.EmbeddedDataField(SkillModel);
        schema.lore = new fields.EmbeddedDataField(SkillModel);
        schema.medicine = new fields.EmbeddedDataField(SkillModel);
        schema.might = new fields.EmbeddedDataField(SkillModel);
        schema.nature = new fields.EmbeddedDataField(SkillModel);
        schema.reflexes = new fields.EmbeddedDataField(SkillModel);
        schema.stealth = new fields.EmbeddedDataField(SkillModel);
        schema.survival = new fields.EmbeddedDataField(SkillModel);
        schema.theology = new fields.EmbeddedDataField(SkillModel);
        schema.weaponSkill = new fields.EmbeddedDataField(SkillModel);
        return schema;
    }
}

export class SkillModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let schema = {};
        schema.training = new fields.NumberField({min: 0, initial: 0});
        schema.bonus = new fields.NumberField({min: 0, initial: 0});
        schema.focus = new fields.NumberField({min: 0, initial: 0});
        schema.attribute = new fields.StringField();
        return schema;
    }

    get value() 
    {
        return this.training + this.parent.parent.attributes[this.attribute].value + this.bonus;
    }
}