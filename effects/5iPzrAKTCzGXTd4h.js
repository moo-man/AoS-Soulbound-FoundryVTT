let skill = await ValueDialog.create({text: "Resist using Fortitude or Might?", title: this.effect.name}, "fortitude", {fortitude: "Fortitude", might: "Might"})

let test = await this.actor.setupCommonTest({attribute : "body", skill}, {fields : {difficulty : 4, complexity : 1}, appendTitle : ` - ${this.effect.name}`});

if (test.result.successes < this.effect.sourceTest.result.successes)
{
  let successDiff = this.effect.sourceTest.result.successes - test.result.successes;
  await this.actor.applyDamage(successDiff, {ignoreArmour: true})
}
else 
{
  this.script.notification("Resisted")
  return false;
}