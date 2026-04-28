if (args.context.flags.pathToPower) 
{
  args.dice.dice[0].results.forEach(i => {
    i.result = Math.min(6, i.result + 1);
  })
  
  args.computeResult();
  args.result.other.push({label : this.effect.name, description : "Dice values increased by 1"});
  this.effect.delete();
}