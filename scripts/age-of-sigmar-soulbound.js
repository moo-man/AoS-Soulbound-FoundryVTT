import { SoulboundActor } from "./actor/actor-soulbound.js";
import { SoulboundItem } from "./item/item-soulbound.js";
import { PlayerSheet } from "./actor/sheet/player-sheet.js";
import { NpcSheet } from "./actor/sheet/npc-sheet.js";
import { PartySheet } from "./actor/sheet/party-sheet.js";
import { SoulboundItemSheet } from "./item/sheet/item-sheet.js";
import { initializeHandlebars } from "./system/handlebars.js";
import hooks from "./system/hooks.js"
import AOS from "./system/config.js"
import Migration from "./system/migrations.js";
import SoulboundUtility from "./system/utility.js";
import SoulboundCounter from "./apps/counter.js";
import { Level4TextPageSheet } from "./apps/journal-sheet.js";
import { PlayerModel } from "./model/actor/player.js";
import { NPCModel } from "./model/actor/npc.js";
import { PartyModel } from "./model/actor/party.js";
import { AethericDeviceModel } from "./model/item/aethericDevice.js";
import { ArmourModel } from "./model/item/armour.js";
import { EquipmentModel } from "./model/item/equipment.js";
import { MiracleModel } from "./model/item/miracle.js";
import { RuneModel } from "./model/item/rune.js";
import { SpellModel } from "./model/item/spell.js";
import { TalentModel } from "./model/item/talent.js";
import { WeaponModel } from "./model/item/weapon.js";
import { PartyItemModel } from "./model/item/partyItem.js";
import { ArchetypeModel } from "./model/item/archetype.js";
import SoulboundActiveEffectConfig from "./apps/active-effect-config.js";
import SoulboundEffect from "./system/effect.js";
import { SoulboundActiveEffectModel } from "./model/effect/effect.js";
import loadEffects from "./loadEffects.js"

Hooks.once("init", () => {


  // #if _ENV === "development"
  CONFIG.debug.soulbound = true;
  SoulboundUtility.log("Development Mode: Logs on")
  //#endif

    CONFIG.Actor.documentClass = SoulboundActor;
    CONFIG.Item.documentClass = SoulboundItem;
    CONFIG.ActiveEffect.documentClass = SoulboundEffect

    CONFIG.Actor.dataModels["player"] = PlayerModel;
    CONFIG.Actor.dataModels["npc"] = NPCModel;
    CONFIG.Actor.dataModels["party"] = PartyModel;

    
    CONFIG.Item.dataModels["aethericDevice"] = AethericDeviceModel;
    CONFIG.Item.dataModels["armour"] = ArmourModel;
    CONFIG.Item.dataModels["equipment"] = EquipmentModel;
    CONFIG.Item.dataModels["miracle"] = MiracleModel;
    CONFIG.Item.dataModels["rune"] = RuneModel;
    CONFIG.Item.dataModels["spell"] = SpellModel;
    CONFIG.Item.dataModels["talent"] = TalentModel;
    CONFIG.Item.dataModels["weapon"] = WeaponModel;
    CONFIG.Item.dataModels["partyItem"] = PartyItemModel;
    CONFIG.Item.dataModels["archetype"] = ArchetypeModel;
    
    CONFIG.ActiveEffect.dataModels["base"] = SoulboundActiveEffectModel
    CONFIG.ChatMessage.dataModels["test"] = WarhammerTestMessageModel;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("age-of-sigmar-soulbound", PlayerSheet, { types: ["player"], makeDefault: true });
    Actors.registerSheet("age-of-sigmar-soulbound", NpcSheet, { types: ["npc"], makeDefault: true });
    Actors.registerSheet("age-of-sigmar-soulbound", PartySheet, { types: ["party"], makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("age-of-sigmar-soulbound", SoulboundItemSheet, { makeDefault: true });
    DocumentSheetConfig.registerSheet(ActiveEffect, "age-of-sigmar-soulbound", SoulboundActiveEffectConfig, { makeDefault: true, label : "Soulbound Active Effect Config" });
    DocumentSheetConfig.registerSheet(JournalEntryPage, "age-of-sigmar-soulbound", Level4TextPageSheet, { types : ["text"], makeDefault: true, label : "Soulbound Journal Sheet" });
    initializeHandlebars();
    
    game.aos = {
        config : AOS,
        migration : Migration,
        utility : SoulboundUtility
    };
    
    game.counter = new SoulboundCounter()
    
    CONFIG.fontDefinitions["Quadrant-Regular"] = {editor : true, fonts : []};
    CONFIG.defaultFontFamily = "Quadrant-Regular";
    CONFIG.canvasTextStyle._fontFamily = "Quadrant-Regular";
    CONFIG.ActiveEffect.legacyTransferral = false;

});

hooks();
loadEffects();