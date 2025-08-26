let test = await this.actor.setupTestFromItem(this.effect.sourceItem, {appendTitle : ` - Unconscious`});

if (test.failed)
{
  this.actor.addCondition("unconscious");
}