let bonus = this.effect.getFlag(game.system.id, "memories");

if (bonus)
{
    let skill = this.actor.system.skills[bonus.skill];
    if (skill[bonus.type] <= 2)
    {
        skill[bonus.type]++;
    }
}