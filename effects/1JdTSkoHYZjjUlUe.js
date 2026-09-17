if (!foundry.utils.hasProperty(args.testData, "aetherquartz"))
{
    if (args.succeeded && args.actor.system.combat.mettle.value)
    {
        args.testData.aetherquartz = await Dialog.confirm({title : this.effect.name, content : "Double damage and reduce Mettle by 1?"});
        if (args.testData.aetherquartz)
        {
            await args.actor.update(args.actor.combat.spendMettle())
            args.actor.applyEffect({effectData : [{name : "Aetherquartz Drain", img : this.effect.img, changes : [
                {
                    "key": "system.combat.mettle.bonus",
                    "value": "-1",
                    "mode": 2,
                }
            ], origin : this.item.uuid}]})
        }
    }
}

if (args.testData.aetherquartz && args.result.damage)
{
    args.result.damage.total *= 2;
    args.result.other.push({label : this.effect.name, description : "Damage Doubled"});
}