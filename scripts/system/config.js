import CombatTest from "./tests/combat-test"
import SoulboundItemUseTest from "./tests/item-use"
import MiracleTest from "./tests/miracle-test"
import SpellTest from "./tests/spell-test"
import SoulboundTest from "./tests/test"

let AOS = defaultWarhammerConfig


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
    6 : "ABILITIES.EXTRAORDINARY_NUM",
    7 : "ABILITIES.INCALCULABLE_NUM"
}

AOS.durations = {
    "instant" : "DURATION.INSTANT",
    "round"  : "DURATION.ROUND",
    "minute" :  "DURATION.MINUTE",
    "hour" : "DURATION.HOUR",
    "day" : "DURATION.DAY",
    "permanent" : "DURATION.PERMANENT",
    "special" : "DURATION.SPECIAL"
}

AOS.zoneCover = {
    "partial" : "ZONE.PARTIAL",
    "total" : "ZONE.TOTAL",
}

AOS.zoneCoverBenefit = {
    "partial" : 1,
    "total" : 2
}

AOS.zoneHazard = {
    "minor" : "ZONE.MINOR",
    "major" : "ZONE.MAJOR",
    "deadly" : "ZONE.DEADLY",
}

AOS.zoneHazardDamage = {
    "minor" : 1,
    "major" : 3,
    "deadly" : 5
}


AOS.zoneObscured = {
    "light" : "ZONE.LIGHTLY_OBSCURED",
    "heavy" : "ZONE.HEAVILY_OBSCURED",
}


AOS.Expcost = {
    talentsAndMiracles : 2,
    attributes : [0, 2, 7, 14, 23, 34, 47, 62],
    skillAndFocus : [0, 1, 3, 7]
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
    aetheric : "TRAITS.AETHERIC",
    blast : "TRAITS.BLAST",
    cleave : "TRAITS.CLEAVE",
    close : "TRAITS.CLOSE",
    crushing : "TRAITS.CRUSHING",
    defensive : "TRAITS.DEFENSIVE",
    ineffective : "TRAITS.INEFFECTIVE",
    loud : "TRAITS.LOUD",
    magical : "TRAITS.MAGICAL",
    penetrating : "TRAITS.PENETRATING",
    piercing : "TRAITS.PIERCING",
    range : "TRAITS.RANGE",
    reach : "TRAITS.REACH",
    reload : "TRAITS.RELOAD",
    rend : "TRAITS.REND",
    restraining : "TRAITS.RESTRAINING",
    sigmarite : "TRAITS.SIGMARITE",
    slashing : "TRAITS.SLASHING",
    spread : "TRAITS.SPREAD",
    subtle : "TRAITS.SUBTLE",
    thrown : "TRAITS.THROWN",
    twohanded : "TRAITS.TWOHANDED"
}

AOS.dicePath = "systems/age-of-sigmar-soulbound/assets/image"
AOS.traitDescriptions = {}
AOS.conditionDescriptions = {}
AOS.traitsWithValue = ["range", "thrown", "blast"]

AOS.transferTypes = {
    document : "WH.TransferType.Document",
    damage : "WH.TransferType.Damage",
    target : "WH.TransferType.Target",
    zone : "WH.TransferType.Zone",
    other : "WH.TransferType.Other"
},

mergeObject(AOS.scriptTriggers, {

    equipToggle : "WH.Trigger.EquipToggle",

    takeDamageMod : "WH.Trigger.TakeDamageMod",
    applyDamageMod : "WH.Trigger.ApplyDamageMod",

    preRollTest : "WH.Trigger.PreRollTest",
    preRollCombatTest : "WH.Trigger.PreRollCombatTest",
    preRollSpellTest : "WH.Trigger.PreRollSpellTest",

    rollTest : "WH.Trigger.RollTest",
    rollCombatTest : "WH.Trigger.RollCombatTest",
    rollSpellTest : "WH.Trigger.RollSpellTest",
}),

AOS.effectKeysTemplate = "systems/age-of-sigmar-soulbound/templates/apps/effect-key-options.hbs",
AOS.avoidTestTemplate = "systems/age-of-sigmar-soulbound/templates/apps/effect-avoid-test.hbs",
AOS.effectScripts = {},

AOS.placeholderItemData = {
    type : "equipment",
    img : "modules/soulbound-core/assets/icons/equipment/equipment.webp"
}

AOS.logFormat = [`%cSoulbound` + `%c | @MESSAGE`, "color: gold", "color: unset"],

AOS.rollClasses = {
    SoulboundTest,
    CombatTest,
    SpellTest,
    MiracleTest,
    SoulboundItemUseTest
},

AOS.bugReporterConfig = {
    endpoint  : "https://aa5qja71ih.execute-api.us-east-2.amazonaws.com/Prod/soulbound",
    githubURL : "https://api.github.com/repos/moo-man/AoS-Soulbound-FoundryVTT/",
    successMessage : "Thank you for your submission. If you wish to monitor or follow up with additional details like screenshots, you can find your issue here: @URL",
    troubleshootingURL : "https://moo-man.github.io/AoS-Soulbound-FoundryVTT/pages/troubleshooting.html"
}

AOS.premiumModules = {
    "age-of-sigmar-soulbound" : "Age of Sigmar: Soulbound System",
    "soulbound-core" : "Core Rulebook",
    "soulbound-starter-set" : "Starter Set",
    "soulbound-order" : "Champions of Order",
    "soulbound-bestiary" : "Soulbound Bestiary",
    "soulbound-artefacts" : "Artefacts of Power",
    "soulbound-sitm" : "Shadows in the Mist",

}

AOS.copyrightText = `

<p>No part of this publication may be reproduced, distributed, stored in a retrieval system, or transmitted in any form by any means, electronic, mechanical, photocopying, recording or otherwise without the prior permission of the publishers.</p>        

<p>Warhammer Age of Sigmar Roleplay: Soulbound © Copyright Games Workshop Limited 2025. Warhammer Age of Sigmar Roleplay: Soulbound, the Warhammer Age of Sigmar Roleplay: Soulbound logo, GW, Games Workshop, Warhammer, Stormcast Eternals, and all associated logos, illustrations, images, names, creatures, races, vehicles, locations, weapons, characters, and the distinctive likenesses thereof, are either ® or TM, and/or © Games Workshop</p>

<div style="display: flex; justify-content: space-around;">
    <img src="modules/warhammer-lib/assets/c7.png" height=50 width=50/>   
    <img src="modules/warhammer-lib/assets/warhammer.png" height=50 width=50/>
</div>

<ul>
<li>Published by: <strong>Cubicle 7 Entertainment Ltd</strong></li>
<li>Foundry Edition by <strong>@AUTHORS@</strong></li>
<li>Special thanks to: <strong>Games Workshop, Fatshark</strong></li>
</ul>
`

AOS.badgeInfo = {
    img : "systems/age-of-sigmar-soulbound/assets/badge.webp",
    notes : "https://github.com/moo-man/AoS-Soulbound-FoundryVTT/releases",
    issues : "https://github.com/moo-man/AoS-Soulbound-FoundryVTT/issues",
    wiki : "https://moo-man.github.io/AoS-Soulbound-FoundryVTT/pages/home.html",
},

AOS.getZoneTraitEffects = (region, getGreatestTrait) => 
    {
        let effects = [];
        let systemEffects = game.aos.config.systemEffects;
        let flags = region.flags["age-of-sigmar-soulbound"] || {};

        let cover = getGreatestTrait([flags.traits?.cover].concat(flags.effects?.map(i => i.system.transferData.zone.traits.cover)).filter(i => i));
        let hazard = getGreatestTrait([flags.traits?.hazard].concat(flags.effects?.map(i => i.system.transferData.zone.traits.hazard)).filter(i => i));
        let obscured = getGreatestTrait([flags.obscured].concat(flags.effects?.map(i => i.system.transferData.zone.traits.obscured)).filter(i => i));
        let difficult = [flags.traits?.difficult].concat(flags.effects?.map(i => i.system.transferData.zone.traits.difficult)).some(i => i);
        let ignoreArmour = [flags.traits?.ignoreArmour].concat(flags.effects?.map(i => i.system.transferData.zone.traits.ignoreArmour)).some(i => i);

        if (cover)
        {
            effects.push(systemEffects[cover]);
        }
        if (difficult)
        {
            effects.push(systemEffects.difficult);
        }
        if (hazard)
        {
            let hazardEffect = foundry.utils.deepClone(systemEffects[hazard]);
            setProperty(hazardEffect, "flags.age-of-sigmar-soulbound.ignoreArmour", ignoreArmour)
            effects.push(hazardEffect);
        }
        if (obscured)
        {
            effects.push(systemEffects[obscured])
        }
        return effects;
    }

AOS.traitOrder = ["partial", "total", "light", "heavy", "minor", "major", "deadly"];
    

AOS.systemEffects = {
    "partial" : {
        id : "partial",
        statuses : ["partial"],
        name : "EFFECT.PartialCover",
        img : "icons/svg/tower.svg",
        system : {
                "scriptData": [
                    {
                        trigger: "dialog",
                        label: "+1 Defence against Ranged Attacks",
                        script: "args.fields.defence += 1",
                        options: {
                            targeter: true,
                            activateScript: "return args.weapon && args.weapon.traitList.range",
                            hideScript: "return !args.weapon || !args.weapon.traitList.range",
                        },
                    },
                    {
                        trigger: "dialog",
                        label: "Advantage against being detected",
                        script: "args.fields.difficulty += -1",
                        options: {
                            hideScript: "return args.fields.skill != 'stealth'",
                        }
                    }
                ]
        }
    },
    "total" : {
        id : "total",
        statuses : ["total"],
        name : "EFFECT.TotalCover",
        img : "icons/svg/tower.svg",
        system : {
            "scriptData": [
                {
                    trigger: "dialog",
                    label: "+2 Defence agaisnt Ranged Attacks",
                    script: "args.fields.defence += 2",
                    options: {
                        "targeter": true,
                        "activateScript": "return args.weapon && args.weapon.traitList.range",
                        "hideScript": "return !args.weapon || !args.weapon.traitList.range"
                    }
                },
                {
                    trigger: "dialog",
                    label: "Greater Advantage against being detected",
                    script: "args.fields.difficulty += -2",
                    options: {
                        "hideScript": "return args.fields.skill != 'stealth'",
                    }
                }
            ]
        }
    },
    "light" : {
        id : "light",
        statuses : ["light"],
        name : "EFFECT.LightlyObscured",
        img : "icons/svg/blind.svg",
        system : {
            scriptData : [
                {
                    trigger: "dialog",
                    label: "Mind (Awareness) Tests that rely on sight",
                    script: "args.fields.difficulty += 1",
                    options: {
                        hideScript: "return args.fields.attribute != 'mind' || args.fields.skill != 'awareness'",
                    }
                }
            ]
        }
    },
    "heavy" : {
        id : "heavy",
        statuses : ["heavy", "blinded"],
        name : "EFFECT.HeavilyObscured",
        img : "icons/svg/blind.svg",
        changes : [
            {key: "system.combat.melee.bonus", mode : 2, value : -1},
            {key: "system.combat.accuracy.bonus", mode : 2, value : -1},
            {key: "system.combat.defence.bonus", mode : 2, value : -1}
        ],
        system : {
            scriptData : [{
                label : "Mind (Awareness) Tests that rely on sight",
                script : "args.fields.difficulty -= 2",
                options : {
                    hideScript : "return args.fields.attribute != 'mind' || args.fields.skill != 'awareness'"
                }
            }]
        }
    },
    "difficult" : {
        id : "difficult",
        statuses : ["difficult"],
        name : "EFFECT.DifficultTerrain",
        img : "icons/svg/downgrade.svg",
        changes : [
            {
                mode : 2,
                key : "system.combat.speeds.modifier",
                value : "-1"
            }
        ],
        system : {
            scriptData : [
                {
                    "trigger": "dialog",
                    "label": "Body (Reflexes) Tests",
                    "script": "args.fields.difficulty += 1",
                    "options": {
                        "activateScript": "return args.fields.skill == 'reflexes' && args.fields.attribute == 'body'",
                        "hideScript": "return args.fields.attribute != 'body' || args.fields.skill != 'reflexes'",
                    },
                }
            ]
        }
    },
    "minor" : {
        name : "ZONE.MINOR_HAZARD",
        statuses : ["minor"],
        img : "icons/svg/hazard.svg",
        system : {
            scriptData : [
                {
                    "script": "this.actor.applyDamage(1, {tags : this.effect.zoneTags});",
                    "label": "Damage",
                    "trigger": "immediate",
                },
                {
                    "script": "this.actor.applyDamage(1, {tags : this.effect.zoneTags});",
                    "label": "Damage (Start Turn)",
                    "trigger": "startTurn",
                }
            ]
        }
    },
    "major" : {
        name : "ZONE.MAJOR_HAZARD",
        statuses : ["major"],
        img : "icons/svg/hazard.svg",
        system : {
            scriptData : [
                {
                    "script": "this.actor.applyDamage(3, {tags : this.effect.zoneTags});",
                    "label": "Damage",
                    "trigger": "immediate",
                },
                {
                    "script": "this.actor.applyDamage(3, {tags : this.effect.zoneTags});",
                    "label": "Damage (Start Turn)",
                    "trigger": "startTurn",
                }
            ]
        }
    },
    "deadly" : {
        name : "ZONE.DEADLY_HAZARD",
        statuses : ["deadly"],
        img : "icons/svg/hazard.svg",
        system : {
            scriptData : [
                {
                    "script": "this.actor.applyDamage(5, {tags : this.effect.zoneTags});",
                    "label": "Damage",
                    "trigger": "immediate",
                },
                {
                    "script": "this.actor.applyDamage(5, {tags : this.effect.zoneTags});",
                    "label": "Damage (Start Turn)",
                    "trigger": "startTurn",
                }
            ]
        }
    },
}

CONFIG.statusEffects = [
    {
        id : "blinded",
        statuses : ["blinded"],
        name : "CONDITION.BLINDED",
        img : "systems/age-of-sigmar-soulbound/assets/icons/blinded.svg",
        changes : [
            {key: "system.combat.melee.bonus", mode : 2, value : -1},
            {key: "system.combat.accuracy.bonus", mode : 2, value : -1},
            {key: "system.combat.defence.bonus", mode : 2, value : -1}
        ],
        system : {
            scriptData : [{
                label : "Mind (Awareness) Tests that rely on sight",
                script : "args.fields.difficulty -= 2",
                trigger : "dialog",
                options : {
                    hideScript : "return args.fields.attribute != 'mind' || args.fields.skill != 'awareness'"
                }
            }]
        }
    },
    {
        id : "charmed",
        statuses : ["charmed"],
        name : "CONDITION.CHARMED",
        img : "systems/age-of-sigmar-soulbound/assets/icons/charmed.svg"
    },
    {
        id : "deafened",
        statuses : ["deafened"],
        name : "CONDITION.DEAFENED",
        img : "systems/age-of-sigmar-soulbound/assets/icons/deafened.svg",
        system : {
            scriptData : [{
                label : "Tests that require hearing",
                script : "args.fields.bonusDice -= 1",
                trigger : "dialog"
            }]
        }
    },
    {
        id : "frightened",
        statuses : ["frightened"],
        name : "CONDITION.FRIGHTENED",
        img : "systems/age-of-sigmar-soulbound/assets/icons/frightened.svg",
        system : {
            scriptData : [{
                label : "Within line of sight of the source of fear",
                script : "args.fields.bonusDice -= 1",
                trigger : "dialog"
            }]
        }
    },
    {
        id : "incapacitated",
        statuses : ["incapacitated"],
        name : "CONDITION.INCAPACITATED",
        img : "systems/age-of-sigmar-soulbound/assets/icons/incapacitated.svg"
    },
    {
        id : "poisoned",
        statuses : ["poisoned"],
        name : "CONDITION.POISONED",
        img : "systems/age-of-sigmar-soulbound/assets/icons/poisoned.svg",
        system : {
            scriptData : [{
                label : "Penalty to all Tests",
                script : "args.fields.bonusDice -= 1",
                trigger : "dialog",
                options : {
                    activateScript : "return true;"
                }
            }]
        }
    },
    {
        id : "prone",
        statuses : ["prone"],
        name : "CONDITION.PRONE",
        img : "systems/age-of-sigmar-soulbound/assets/icons/prone.svg",
        changes : [
            {key: "system.combat.melee.bonus", mode : 2, value : -1},
            {key: "system.combat.accuracy.bonus", mode : 2, value : -1}
        ]
    },
    {
        id : "restrained",
        statuses : ["restrained"],
        name : "CONDITION.RESTRAINED",
        img : "systems/age-of-sigmar-soulbound/assets/icons/restrained.svg",
        changes : [
            {key: "system.combat.melee.bonus", mode : 2, value : -1},
            {key: "system.combat.accuracy.bonus", mode : 2, value : -1},
            {key: "system.combat.defence.bonus", mode : 2, value : -1}
        ]
    },
    {
        id : "stunned",
        statuses : ["stunned"],
        name : "CONDITION.STUNNED",
        img : "systems/age-of-sigmar-soulbound/assets/icons/stunned.svg",
        changes : [
            {key: "system.combat.speeds.foot", mode : 5, value : "slow"},
            {key: "system.combat.defence.bonus", mode : 2, value : -1}
        ]
    },
    {
        id : "unconscious",
        statuses : ["unconscious"],
        name : "CONDITION.UNCONSCIOUS",
        img : "systems/age-of-sigmar-soulbound/assets/icons/unconscious.svg"
    },
    {       
        id: "dead",
        name: "EFFECT.StatusDead", // Foundry Default Text Key
        img: "systems/age-of-sigmar-soulbound/assets/icons/dead.svg"
    }
]

export default AOS
