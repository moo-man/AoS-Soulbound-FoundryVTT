if (args.test?.weapon && !args.test?.weapon?.system.isMagical)
{
    args.abort = true;
    this.script.notification("Cannot be damaged by non-magical weapons.")
}