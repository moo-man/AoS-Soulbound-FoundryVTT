if (args.actor.system.bio.size <= this.actor.system.bio.size)
{
  if (args.test?.item?.effects.contents.find(i => i.name == "Prone"))
  {
    args.actor.addCondition("stunned");
  }
  else 
  {
    args.actor.addCondition("prone");
  }
}