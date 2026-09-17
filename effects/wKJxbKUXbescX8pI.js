for(let trait of ["magical", "restraining"])
{
  if (!args.item.system.traits.find(i => i.name == trait))
  {
    args.item.system.traits.push({name: trait})
  }
}