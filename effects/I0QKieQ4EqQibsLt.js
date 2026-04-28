if (args.equipped) 
{
    if (this.actor.system.bio.faction != "Flesh-eater Courts" && this.actor.system.species?.name != "Ghoul") 
    {
        this.actor.addCondition("poisoned");
    }
}