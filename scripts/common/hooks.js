import { AgeOfSigmarActor } from "./actor.js";
import { AgeOfSigmarItem } from "./item.js";
import { PlayerSheet } from "../sheet/player.js";
import { NpcSheet } from "../sheet/npc.js";
import { PartySheet } from "../sheet/party.js";
import { ArmourSheet } from "../sheet/armour.js";
import { ConnectionSheet } from "../sheet/connection.js";
import { EquipmentSheet } from "../sheet/equipment.js";
import { GoalSheet } from "../sheet/goal.js";
import { MiracleSheet } from "../sheet/miracle.js";
import { PartyItemSheet } from "../sheet/party-item.js";
import { RuneSheet } from "../sheet/rune.js";
import { SpellSheet } from "../sheet/spell.js";
import { TalentSheet } from "../sheet/talent.js";
import { WeaponSheet } from "../sheet/weapon.js";
import { WoundSheet } from "../sheet/wound.js";
import { AethericDeviceSheet } from "../sheet/aetheric-device.js";
import { initializeHandlebars } from "./handlebars.js";
import { prepareCustomRoll } from "./dialog.js";

Hooks.once("init", () => {
    game.settings.register("age-of-sigmar", "initiativeRule", {
        name: "SETTING.INIT_RULE",
        hint: "SETTING.INIT_HINT",
        scope: "world",
        config: true,
        default: "default",
        type: String,
        choices: {
            "default": "SETTING.INIT_DEFAULT",
            "roll": "SETTING.INIT_ROLL"
        },
        onChange: rule => {
            switch (rule) {
                case "default":
                    CONFIG.Combat.initiative = { formula: "@combat.initiative.total", decimals: 0 };
                    break;
                case "roll":
                    CONFIG.Combat.initiative = { formula: "2d6 + @combat.initiative.total", decimals: 0 };
                    break;
            }
        }
    });
    CONFIG.Actor.entityClass = AgeOfSigmarActor;
    CONFIG.Item.entityClass = AgeOfSigmarItem;
    CONFIG.fontFamilies.push("Alegreya Sans SC");
    CONFIG.roll = prepareCustomRoll;
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("age-of-sigmar", PlayerSheet, { types: ["player"], makeDefault: true });
    Actors.registerSheet("age-of-sigmar", NpcSheet, { types: ["npc"], makeDefault: true });
    Actors.registerSheet("age-of-sigmar", PartySheet, { types: ["party"], makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("age-of-sigmar", AethericDeviceSheet, { types: ["aethericDevice"], makeDefault: true });
    Items.registerSheet("age-of-sigmar", ArmourSheet, { types: ["armour"], makeDefault: true });
    Items.registerSheet("age-of-sigmar", ConnectionSheet, { types: ["connection"], makeDefault: true });
    Items.registerSheet("age-of-sigmar", EquipmentSheet, { types: ["equipment"], makeDefault: true });
    Items.registerSheet("age-of-sigmar", GoalSheet, { types: ["goal"], makeDefault: true });
    Items.registerSheet("age-of-sigmar", MiracleSheet, { types: ["miracle"], makeDefault: true });
    Items.registerSheet("age-of-sigmar", PartyItemSheet, { types: ["ally", "enemy", "fear", "resource", "rumour", "threat"], makeDefault: true });
    Items.registerSheet("age-of-sigmar", RuneSheet, { types: ["rune"], makeDefault: true });
    Items.registerSheet("age-of-sigmar", SpellSheet, { types: ["spell"], makeDefault: true });
    Items.registerSheet("age-of-sigmar", TalentSheet, { types: ["talent"], makeDefault: true });
    Items.registerSheet("age-of-sigmar", WeaponSheet, { types: ["weapon"], makeDefault: true });
    Items.registerSheet("age-of-sigmar", WoundSheet, { types: ["wound"], makeDefault: true });
    initializeHandlebars();
});

Hooks.on("preCreateActor", (createData) => {
    mergeObject(createData, {
        "token.bar1" :{ "attribute" : "combat.health.toughness" },
        "token.bar2" :{ "attribute" : "combat.health.wounds" },
        "token.displayName" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
        "token.displayBars" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
        "token.disposition" : CONST.TOKEN_DISPOSITIONS.NEUTRAL,
        "token.name" : createData.name
    });
    if (createData.type === "player") {
        createData.token.vision = true;
        createData.token.actorLink = true;
    }
});