let test = await this.actor.setupTestFromItem(this.effect.sourceItem)

if (test.failed)
{ 
  this.actor.addCondition("poisoned");
}