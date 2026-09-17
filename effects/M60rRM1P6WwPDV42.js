if (this.actor.system.attributes.mind.value >= 2)
{
    this.actor.update({"system.combat.mettle.value" : this.actor.system.combat.mettle.value + 1});
    this.script.notification("Gained 1 Mettle");
}