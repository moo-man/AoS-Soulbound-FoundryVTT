const targetSize = args.target?.system.bio?.size;
const selfSize = args.actor.system.bio?.size;
if (targetSize != null && selfSize != null && targetSize > selfSize)
{
    args.fields.bonusDamage += targetSize - selfSize;
}