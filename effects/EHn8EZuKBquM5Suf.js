if (args.item?.isWeapon && !args.item.traitList.aetheric && !args.item.traitList.magical) {
  args.damage = Math.ceil(args.damage / 2);
}