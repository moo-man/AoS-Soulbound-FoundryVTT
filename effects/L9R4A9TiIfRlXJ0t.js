let test = args.test;
if (test.actor.uuid == this.effect.sourceActor.uuid && test.weapon?.system.isRanged)
{
    args.ignoreArmour = true;
    this.script.notification("Armour Ignored");
    args.text.push({label : this.effect.name, description : "Armour ignored"})
    this.effect.delete();
}