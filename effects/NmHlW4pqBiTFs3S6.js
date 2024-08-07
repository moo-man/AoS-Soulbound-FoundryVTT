if (this.actor.sameSideAs(this.effect.sourceActor))
{
    this.actor.applyHealing({toughness: 3});
}
else 
{
    this.actor.applyDamage(3, {ignoreArmour: true});
    this.actor.addCondition("blinded");
    this.effect.updateSource({"changes" : []}); // Remove accuracy bonus
}