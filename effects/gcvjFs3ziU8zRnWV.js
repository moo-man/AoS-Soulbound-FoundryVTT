if (!args.damage)
{
    return;
}

if (await Dialog.confirm({title : this.effect.name, content: "Ignore AP and delay damage?"}))
{

    args.abort = `<strong>${this.effect.name}</strong>: Damage Delayed`;
    let damageEffect = {
        name : `${this.effect.name} Delayed Damage`,
        img : this.effect.img,
        system: {
            scriptData : [{
                label : "Damage",
                script : `this.actor.applyDamage(${args.damage}, {ignoreArmour : true}); return false;`,
                trigger : "immediate",
            }]
        }
    }

    let delayEffect = {
        name : `${this.effect.name} Damage Delayed`,
        img : this.effect.img,
        flags : {damageEffect},
        statuses : ["celestiumDelayDamage"],
            duration : {
            turns: 1
        },
        origin : this.effect.uuid,
        system: {
            scriptData : [{
                label : "Turn Start",
                script : `fromUuid("${args.actor.uuid}").then(actor => actor.applyEffect({effectData : [this.effect.flags.damageEffect]})); this.effect.delete()`,
                trigger : "startTurn"
            }]
        }
    }
    this.actor.applyEffect({effectData : [delayEffect]})
}