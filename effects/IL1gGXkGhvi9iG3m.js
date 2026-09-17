let defence = this.effect.getFlag("age-of-sigmar-soulbound", "chamoniteDefence");
switch(defence)
{
    case "melee":
        if (args.test?.weapon.system.isMelee)
        {
            args.armour += 1;
            this.script.notification("Applied +1 Armour")
        }
        break;
    case "ranged" : 
        if (args.test?.weapon.system.isRanged)
        {
            args.armour += 1;
            this.script.notification("Applied +1 Armour")
        }
        break;
    case "spells" : 
        if (args.test?.spell)
        {
            args.armour += 1;
            this.script.notification("Applied +1 Armour")
        }
        break;
    case "target" :
        let uuid = this.effect.getFlag("age-of-sigmar-soulbound", "chamoniteDefenceTarget");
        if (args.test.actor.uuid == uuid)
        {
            args.armour += 1;
            this.script.notification("Applied +1 Armour")
        }
        break;
}