let attributeSkill = {
    mind : "channelling",
    body : "reflexes"
}

let attribute = (await Dialog.wait({
    title : this.effect.name,
    content : "Which Attribute and Skill do you want to use?",
    buttons : {
        mind : {
            label : "Mind (Channelling"
        },
        body : {
            label : "Body (Reflexes)"
        }
    }
})) || "mind"

let test = await this.actor.setupCommonTest({attribute, skill : attributeSkill[attribute]}, {appendTitle : ` - ${this.effect.name}`, dn : "5:4"})
if (test.failed)
{
    await this.actor.applyDamage(5);
    await this.actor.addCondition("prone");
    this.effect.delete();
}