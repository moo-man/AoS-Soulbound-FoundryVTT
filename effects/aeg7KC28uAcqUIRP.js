if (!args.test?.weapon?.system.isMagical)
{
    args.damage = Math.ceil(args.damage / 2);
    this.script.notification("Halved damage taken.")
}