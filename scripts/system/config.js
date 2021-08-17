let AOS = {}


AOS.attributes = {
    body :  "ATTRIBUTE.BODY",
    mind :  "ATTRIBUTE.MIND",
    soul :  "ATTRIBUTE.SOUL"
  }

AOS.skills = {
    arcana : "SKILL.ARCANA",
    athletics : "SKILL.ATHLETICS",
    awareness : "SKILL.AWARENESS",
    ballisticSkill : "SKILL.BALLISTIC_SKILL",
    beastHandling : "SKILL.BEAST_HANDLING",
    channelling : "SKILL.CHANNELLING",
    crafting : "SKILL.CRAFTING",
    determination : "SKILL.DETERMINATION",
    devotion : "SKILL.DEVOTION",
    dexterity : "SKILL.DEXTERITY",
    entertain : "SKILL.ENTERTAIN",
    fortitude : "SKILL.FORTITUDE",
    guile : "SKILL.GUILE",
    intimidation : "SKILL.INTIMIDATION",
    intuition : "SKILL.INTUITION",
    lore : "SKILL.LORE",
    medicine : "SKILL.MEDICINE",
    might : "SKILL.MIGHT",
    nature : "SKILL.NATURE",
    reflexes : "SKILL.REFLEXES",
    stealth : "SKILL.STEALTH",
    survival : "SKILL.SURVIVAL",
    theology : "SKILL.THEOLOGY",
    weaponSkill : "SKILL.WEAPON_SKILL"
}

AOS.availability = {
    "common" : "AVAILABILITY.COMMON",
    "rare" : "AVAILABILITY.RARE",
    "exotic" : "AVAILABILITY.EXOTIC",
    "special" : "AVAILABILITY.SPECIAL"
}

AOS.armourType = {
   "light" : "TYPE.LIGHT",
   "medium" : "TYPE.MEDIUM",
   "heavy" : "TYPE.HEAVY",
   "shield" : "TYPE.SHIELD"
}

AOS.range = {
    "self" : "RANGE.SELF",
    "close" : "RANGE.CLOSE",
    "short" : "RANGE.SHORT",
    "medium" : "RANGE.MEDIUM",
    "long" : "RANGE.LONG"
}

AOS.actorSize = {
    0 : "ACTOR.NPC_SIZE_TINY",
    1 : "ACTOR.NPC_SIZE_SMALL",
    2 : "ACTOR.NPC_SIZE_MEDIUM",
    3 : "ACTOR.NPC_SIZE_LARGE",
    4 : "ACTOR.NPC_SIZE_ENOURMOUS",
    5 : "ACTOR.NPC_SIZE_MONSTROUS"
}

AOS.npcType = {
   0 : "ACTOR.NPC_SWARM",
   1 : "ACTOR.NPC_MINION",
   2 : "ACTOR.NPC_WARRIOR",
   3 : "ACTOR.NPC_CHAMPION",
   4 : "ACTOR.NPC_CHOSEN"
}

AOS.speed = {
    "none" : "ACTOR.SPEED_NONE",
    "slow" : "ACTOR.SPEED_SLOW",
    "normal" : "ACTOR.SPEED_NORMAL",
    "fast" : "ACTOR.SPEED_FAST"
}

AOS.woundType = {
    "minor" : "WOUND.LIGHT",
    "serious" : "WOUND.SERIOUS",
    "deadly" : "WOUND.DEADLY"
}

AOS.woundDamage = {
    "minor" : 1,
    "serious" : 2,
    "deadly" : 3
}

AOS.ratings = {
    1 : "ABILITIES.POOR_NUM",
    2 : "ABILITIES.AVERAGE_NUM",
    3 : "ABILITIES.GOOD_NUM",
    4 : "ABILITIES.GREAT_NUM",
    5 : "ABILITIES.SUPERB_NUM",
    6 : "ABILITIES.EXTRAORDINARY_NUM"
}

export default AOS