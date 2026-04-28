if (args.testData.attribute == "mind" && args.skill?.training == 3 &&  args.skill?.focus == 3)
{
  let bonus = args.dice.dice[0].results.filter(result => result.result == 6).length;
  args.testData.bonusSuccesses += bonus;
  
  if (bonus)
  {
    args.result.other.push({label: this.effect.name, description: `Added ${bonus} Successes`})
    args.computeResult();
  }
}