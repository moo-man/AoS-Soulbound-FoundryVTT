if (!args.damage)
{
    return;
}

let complexity = Math.min(Math.floor(args.damage / 2), 1);
let test = await args.actor.setupCommonTest({attribute : "soul", skill : "determination"}, {difficulty : 4, complexity, appendTitle : ` - ${this.effect.name}`})

if (test.failed)
{
    args.actor.addCondition("frightened");
}