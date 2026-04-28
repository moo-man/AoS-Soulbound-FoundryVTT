if (args.test?.spell || args.item?.isMagical || args.item?.traitList?.aetheric) 
{
      args.armour *= 2;
      this.script.notification("Ebon-wrought Armour: Armour doubled")
}