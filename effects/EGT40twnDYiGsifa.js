if (args.item.type == "weapon" && args.item.system.isEquipped && !args.item.system.traits.find(t => t.name == "magical"))
{
  args.item.system.traits.push({name: "magical"});
}

if (args.item.type == "weapon" && args.item.system.isEquipped && !args.item.system.traits.find(t => t.name == "penetrating"))
{
  args.item.system.traits.push({name: "penetrating"});
}