let damage = 0;
if (this.actor.statuses.has("heavy"))
{
    damage = 10;
}
else if (this.actor.statuses.has("light"))
{
    damage = 6
}
else
{
    damage = 3;
}

this.actor.applyDamage(damage, {ignoreArmour : true})