if (args.item.type != "weapon")
  return;

for(let trait of ["magical", "rend"])
{
  if (!args.item.system.traits.find(i => i.name == trait))
  {
    args.item.system.traits.push({name: trait})
  }
}