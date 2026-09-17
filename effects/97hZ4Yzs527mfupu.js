let target = args.targets[0]?.actor;
if (target)
{
	return target.system.bio?.faction == "Corrupted by Chaos" || target.system.bio.role == "Daemon"
}