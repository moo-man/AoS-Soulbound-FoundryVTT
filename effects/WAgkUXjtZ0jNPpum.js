if (args.item.type == "weapon" && !args.item.system.traits.find(i => i.name == "reach"))
{
  args.item.system.traits.push({name: "reach"});
}