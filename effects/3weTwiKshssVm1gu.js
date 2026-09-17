if (args.test?.weapon?.system.isMelee) 
{
    let complexity = Number(this.item.system.benefit);
    if (this.item.system.type == "shield")
        complexity = 2;
    args.test?.actor.applyEffect({
        effectData: [{
            name: "Blinded",
            system: {
                scriptData: [{
                    label: "Blinded Test",
                    trigger: "immediate",
                    script: `let test = await this.actor.setupCommonTest({attribute : "body", skill : "reflexes"}, {fields : {difficulty : 4, complexity : ${complexity}}, appendTitle : " - " + this.effect.name}); if (test.failed) this.actor.addCondition("blinded");`
                }]
            }
        }]
    })
}