const targetSize = args.target?.system.bio?.size;
const selfSize = args.actor.system.bio?.size;
return !args.weapon || targetSize == null || selfSize == null || targetSize <= selfSize;