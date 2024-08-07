for(let spell of this.actor.itemTypes.spell)
{
    if (spell.hasTest)
    {
        let dn = spell.system.test.dn.split(":");
        dn[0] = Math.min(6, parseInt(dn[0]) + 1);
        spell.system.test.dn = dn[0] + ":" + dn[1];
    }
}