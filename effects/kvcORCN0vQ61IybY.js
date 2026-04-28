if (args.damage > args.actor.system.attributes.body.value) 
{
    args.actor.addCondition("prone");
}