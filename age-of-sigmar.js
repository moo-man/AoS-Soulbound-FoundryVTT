import { AgeOfSigmarActor } from "./scripts/actor/actor-aos.js";
import { AgeOfSigmarItem } from "./scripts/item/item-aos.js";
import { PlayerSheet } from "./scripts/actor/sheet/player-sheet.js";
import { NpcSheet } from "./scripts/actor/sheet/npc-sheet.js";
import { PartySheet } from "./scripts/actor/sheet/party-sheet.js";
import { AgeOfSigmarItemSheet } from "./scripts/item/sheet/item-sheet.js";
import { initializeHandlebars } from "./scripts/system/handlebars.js";
import hooks from "./scripts/system/hooks.js"
import AOS from "./scripts/system/config.js"
import Migration from "./scripts/system/migrations.js";
import AOSUtility from "./scripts/system/utility.js";
import Test from "./scripts/system/tests/test.js";
import CombatTest from "./scripts/system/tests/combat-test.js";
import PowerTest from "./scripts/system/tests/power-test.js";
import ItemTraits from "./scripts/apps/item-traits.js"
import AgeOfSigmarEffect from "./scripts/system/effect.js";
import AgeOfSigmarEffectSheet from "./scripts/apps/active-effect-config.js";
import SoulboundCounter from "./scripts/apps/counter.js";

Hooks.once("init", () => {
    CONFIG.Actor.documentClass = AgeOfSigmarActor;
    CONFIG.Item.documentClass = AgeOfSigmarItem;
    CONFIG.ActiveEffect.documentClass = AgeOfSigmarEffect
    CONFIG.ActiveEffect.sheetClass = AgeOfSigmarEffectSheet
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("age-of-sigmar-soulbound", PlayerSheet, { types: ["player"], makeDefault: true });
    Actors.registerSheet("age-of-sigmar-soulbound", NpcSheet, { types: ["npc"], makeDefault: true });
    Actors.registerSheet("age-of-sigmar-soulbound", PartySheet, { types: ["party"], makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("age-of-sigmar-soulbound", AgeOfSigmarItemSheet, { makeDefault: true });
    initializeHandlebars();
    
    game.aos = {
        config : AOS,
        migration : Migration,
        utility : AOSUtility,
        rollClass : {
            Test,
            CombatTest,
            PowerTest
        },
        apps: {
            ItemTraits
        }
    };
    
    game.counter = new SoulboundCounter()
    
    CONFIG.fontFamilies.push("Quadrant-Regular");
    CONFIG.defaultFontFamily = "Quadrant-Regular"
    CONFIG.canvasTextStyle._fontFamily = "Quadrant-Regular"

});

hooks();