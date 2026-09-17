if (!args.item.system.traits.find(i => i.name == "magical"))
{
  args.item.system.traits.push({name: "magical"});
}

args.item.system.damage += " + 1";