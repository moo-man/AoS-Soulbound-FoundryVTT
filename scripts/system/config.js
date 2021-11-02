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

AOS.skillAttributes = {
    arcana : "mind",
    athletics : "body",
    awareness : "mind",
    ballisticSkill : "body",
    beastHandling : "soul",
    channelling : "mind",
    crafting : "mind",
    determination : "soul",
    devotion : "soul",
    dexterity : "body",
    entertain : "soul",
    fortitude : "body",
    guile : "mind",
    intimidation : "soul",
    intuition : "mind",
    lore : "mind",
    medicine : "mind",
    might : "body",
    nature : "mind",
    reflexes : "body",
    stealth : "body",
    survival : "mind",
    theology : "mind",
    weaponSkill : "body"
}

AOS.availability = {
    "" : "-",
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

AOS.durations = {
    "instant" : "Instant",
    "round"  : "Round",
    "minute" :  "Minute",
    "hour" : "Hour",
    "day" : "Day",
    "permanent" : "Permanent"
}

AOS.partyItemCategories = {
    longGoal : "PARTY.LONG_TERM_GOAL",
    shortGoal : "PARTY.SHORT_TERM_GOAL",
    ally : "PARTY.ALLY",
    enemy : "PARTY.ENEMY",
    resource : "PARTY.RESOURCE",
    rumour : "PARTY.RUMOUR",
    fear : "PARTY.FEAR",
    threat : "PARTY.THREAT",
}
AOS.partyItemCategoryLabels = {
    longGoal : "PARTY.COMPLETED",
    shortGoal : "PARTY.COMPLETED",
    ally : "PARTY.ALIVE",
    enemy : "PARTY.ALIVE",
    resource : "PARTY.ACTIVE",
    rumour : "PARTY.ACTIVE",
    fear : "PARTY.ACTIVE",
    threat : "PARTY.ACTIVE",
}


AOS.traits = {
    aetheric : "Aetheric",
    blast : "Blast",
    cleave : "Cleave",
    close : "Close",
    crushing : "Crushing",
    defensive : "Defensive",
    ineffective : "Ineffective",
    loud : "Loud",
    magical : "Magical",
    penetrating : "Penetrating",
    piercing : "Piercing",
    range : "Range",
    reach : "Reach",
    reload : "Reload",
    rend : "Rend",
    restraining : "Restraining",
    sigmarite : "Sigmarite",
    slashing : "Slashing",
    spread : "Spread",
    subtle : "Subtle",
    thrown : "Thrown",
    twohanded : "Two-handed"
}

AOS.traitsWithValue = ["range", "thrown"]

CONFIG.statusEffects = [
    {
        id : "blinded",
        label : "Blinded",
        icon : "systems/age-of-sigmar-soulbound/asset/icons/blinded.svg",
        changes : [
            {key: "difficulty", mode : 0, value : 2},
            {key: "data.combat.melee.bonus", mode : 2, value : -1},
            {key: "data.combat.accuracy.bonus", mode : 2, value : -1},
            {key: "data.combat.defence.bonus", mode : 2, value : -1}
        ],
        flags : { "age-of-sigmar-soulbound.description" : "Difficulty of Mind (Awareness) Tests that rely on sight are increased by 2"}
    },
    {
        id : "charmed",
        label : "Charmed",
        icon : "systems/age-of-sigmar-soulbound/asset/icons/charmed.svg"
    },
    {
        id : "deafened",
        label : "Deafened",
        icon : "systems/age-of-sigmar-soulbound/asset/icons/deafened.svg",
        changes : [{key: "bonusDice", mode : 0, value : -1}],
        flags : { "age-of-sigmar-soulbound.description" : "The dice pool for any Tests that require hearing is reduced by 1"}
    },
    {
        id : "frightened",
        label : "Frightened",
        icon : "systems/age-of-sigmar-soulbound/asset/icons/frightened.svg",
        changes : [{key: "bonusDice", mode : 0, value : -1}],
        flags : { "age-of-sigmar-soulbound.description" : "While the source of fear is within line of sight, roll one less die for all Tests"}
    },
    {
        id : "incapacitated",
        label : "Incapacitated",
        icon : "systems/age-of-sigmar-soulbound/asset/icons/incapacitated.svg"
    },
    {
        id : "poisoned",
        label : "Poisoned",
        icon : "systems/age-of-sigmar-soulbound/asset/icons/poisoned.svg",
        changes : [{key: "bonusDice", mode : 0, value : -1}],
        flags : { "age-of-sigmar-soulbound.description" : "The dice pool for all Tests are reduced by 1"}
    },
    {
        id : "prone",
        label : "Prone",
        icon : "systems/age-of-sigmar-soulbound/asset/icons/prone.svg",
        changes : [
            {key: "data.combat.melee.bonus", mode : 2, value : -1},
            {key: "data.combat.accuracy.bonus", mode : 2, value : -1}
        ]
    },
    {
        id : "restrained",
        label : "Restrained",
        icon : "systems/age-of-sigmar-soulbound/asset/icons/restrained.svg",
        changes : [
            {key: "data.combat.melee.bonus", mode : 2, value : -1},
            {key: "data.combat.accuracy.bonus", mode : 2, value : -1},
            {key: "data.combat.defence.bonus", mode : 2, value : -1}
        ]
    },
    {
        id : "stunned",
        label : "Stunned",
        icon : "systems/age-of-sigmar-soulbound/asset/icons/stunned.svg",
        changes : [
            {key: "data.combat.speeds.foot", mode : 5, value : "slow"},
            {key: "data.combat.defence.bonus", mode : 2, value : -1}
        ]
    },
    {
        id : "unconscious",
        label : "Unconscious",
        icon : "systems/age-of-sigmar-soulbound/asset/icons/unconscious.svg"
    }
]

export default AOS