import { AgeOfSigmarActor } from "./scripts/actor/actor-aos.js";
import { AgeOfSigmarItem } from "./scripts/item/item-aos.js";
import { PlayerSheet } from "./scripts/actor/sheet/player-sheet.js";
import { NpcSheet } from "./scripts/actor/sheet/npc-sheet.js";
import { PartySheet } from "./scripts/actor/sheet/party-sheet.js";
import { ArmourSheet } from "./scripts/item/sheet/armour.js";
import { ConnectionSheet } from "./scripts/item/sheet/connection.js";
import { EquipmentSheet } from "./scripts/item/sheet/equipment.js";
import { GoalSheet } from "./scripts/item/sheet/goal.js";
import { MiracleSheet } from "./scripts/item/sheet/miracle.js";
import { PartyItemSheet } from "./scripts/item/sheet/party-item.js";
import { RuneSheet } from "./scripts/item/sheet/rune.js";
import { SpellSheet } from "./scripts/item/sheet/spell.js";
import { TalentSheet } from "./scripts/item/sheet/talent.js";
import { WeaponSheet } from "./scripts/item/sheet/weapon.js";
import { WoundSheet } from "./scripts/item/sheet/wound.js";
import { AethericDeviceSheet } from "./scripts/item/sheet/aetheric-device.js";
import { initializeHandlebars } from "./scripts/system/handlebars.js";
import hooks from "./scripts/system/hooks.js"
import AOS from "./scripts/system/config.js"
import Migration from "./scripts/system/migrations.js";
import AOSUtility from "./scripts/system/utility.js";
import Test from "./scripts/system/tests/test.js";
import CombatTest from "./scripts/system/tests/combat-test.js";
import PowerTest from "./scripts/system/tests/power-test.js";

Hooks.once("init", () => {
    CONFIG.Actor.documentClass = AgeOfSigmarActor;
    CONFIG.Item.documentClass = AgeOfSigmarItem;
    CONFIG.fontFamilies.push("Alegreya Sans SC");
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("age-of-sigmar-soulbound", PlayerSheet, { types: ["player"], makeDefault: true });
    Actors.registerSheet("age-of-sigmar-soulbound", NpcSheet, { types: ["npc"], makeDefault: true });
    Actors.registerSheet("age-of-sigmar-soulbound", PartySheet, { types: ["party"], makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("age-of-sigmar-soulbound", AethericDeviceSheet, { types: ["aethericDevice"], makeDefault: true });
    Items.registerSheet("age-of-sigmar-soulbound", ArmourSheet, { types: ["armour"], makeDefault: true });
    Items.registerSheet("age-of-sigmar-soulbound", ConnectionSheet, { types: ["connection"], makeDefault: true });
    Items.registerSheet("age-of-sigmar-soulbound", EquipmentSheet, { types: ["equipment"], makeDefault: true });
    Items.registerSheet("age-of-sigmar-soulbound", GoalSheet, { types: ["goal"], makeDefault: true });
    Items.registerSheet("age-of-sigmar-soulbound", MiracleSheet, { types: ["miracle"], makeDefault: true });
    Items.registerSheet("age-of-sigmar-soulbound", PartyItemSheet, { types: ["ally", "enemy", "fear", "resource", "rumour", "threat"], makeDefault: true });
    Items.registerSheet("age-of-sigmar-soulbound", RuneSheet, { types: ["rune"], makeDefault: true });
    Items.registerSheet("age-of-sigmar-soulbound", SpellSheet, { types: ["spell"], makeDefault: true });
    Items.registerSheet("age-of-sigmar-soulbound", TalentSheet, { types: ["talent"], makeDefault: true });
    Items.registerSheet("age-of-sigmar-soulbound", WeaponSheet, { types: ["weapon"], makeDefault: true });
    Items.registerSheet("age-of-sigmar-soulbound", WoundSheet, { types: ["wound"], makeDefault: true });
    initializeHandlebars();

    game.aos = {
        config : AOS,
        migration : Migration,
        utility : AOSUtility,
        rollClass : {
            Test,
            CombatTest,
            PowerTest
        }
    };

});

hooks();