if (!args.weapon || args.weapon.system.category != 'melee') 
  return true; 
if (!args.targets || !args.targets[0]) 
  return true; 
if ((args.targets[0].actor?.system.bio?.size ?? 2) <= (this.actor?.system.bio?.size ?? 2)) 
  return true; 
return false;