if (args.test.result.triggers > 0 && args.test.weapon?.system.traitList.piercing)
{
    args.armour -= args.test.result.triggers;
    this.script.notification("Armour reduced by " + args.test.result.triggers)
    args.text.push({label : this.effect.name, description : "Armour reduced by " + args.test.result.triggers})
}