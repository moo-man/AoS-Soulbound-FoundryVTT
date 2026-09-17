for(let trait of ["magical", "penetrating"])
{
  if (!args.item.system.traits.find(i => i.name == trait))
  {
    args.item.system.traits.push({name: trait})
  }
}

args.item.system.damage += " + 1";