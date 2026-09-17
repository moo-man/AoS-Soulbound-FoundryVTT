if (args.item.system.isMelee && !args.item.system.traits.find(i => i.name == "rend"))
{
  args.item.system.traits.push({name: "rend"})
}