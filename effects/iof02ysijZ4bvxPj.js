if (args.item.system.isRanged && !args.item.system.traits.find(i => i.name == "penetrating"))
{
  args.item.system.traits.push({name: "penetrating"})
}