import { SoulboundActor } from "./document/actor.js";
import { SoulboundItem } from "./document/item.js";
import { initializeHandlebars } from "./system/handlebars.js";
import hooks from "./system/hooks.js"
import AOS from "./system/config.js"
import Migration from "./system/migrations.js";
import SoulboundUtility from "./system/utility.js";
import SoulboundCounter from "./apps/counter.js";
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
import { PlayerSheet } from "./sheet/actor/player.js";
import { NPCSheet } from "./sheet/actor/npc.js";
import { PartySheet } from "./sheet/actor/party.js";
import AethericDeviceSheet from "./sheet/item/types/aethericDevice.js";
import ArchetypeSheet from "./sheet/item/types/archetype.js";
import ArmourSheet from "./sheet/item/types/armour.js";
import EquipmentSheet from "./sheet/item/types/equipment.js";
import MiracleSheet from "./sheet/item/types/miracle.js";
import SpellSheet from "./sheet/item/types/spell.js";
import TalentSheet from "./sheet/item/types/talent.js";
import WeaponSheet from "./sheet/item/types/weapon.js";
import PartyItemSheet from "./sheet/item/types/party.js";
import RuneSheet from "./sheet/item/types/rune.js";
import { SoulboundTestMessageModel } from "./model/message/test.js";
import { PostedItemMessageModel } from "./model/message/item.js";
import { SoulboundChatMessage } from "./document/message.js";
import ZoneConfig from "./apps/zone-config.js";

Hooks.once("init", () => {


  // #if _ENV === "development"
  CONFIG.debug.soulbound = true;
  SoulboundUtility.log("Development Mode: Logs on")
  //#endif

    CONFIG.Actor.documentClass = SoulboundActor;
    CONFIG.Item.documentClass = SoulboundItem;
    CONFIG.ActiveEffect.documentClass = SoulboundEffect
    CONFIG.ChatMessage.documentClass = SoulboundChatMessage;

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
    CONFIG.ChatMessage.dataModels["test"] = SoulboundTestMessageModel;
    CONFIG.ChatMessage.dataModels["item"] = PostedItemMessageModel;

    const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig

    DocumentSheetConfig.registerSheet(Actor, "age-of-sigmar-soulbound", PlayerSheet, { types: ["player"], makeDefault: true, label : "Character Sheet" });
    DocumentSheetConfig.registerSheet(Actor, "age-of-sigmar-soulbound", PartySheet, { types: ["party"], makeDefault: true, label : "Party Sheet" });
    DocumentSheetConfig.registerSheet(Actor, "age-of-sigmar-soulbound", NPCSheet, { types: ["npc"], makeDefault: true, label : "NPC Sheet" });
    
    DocumentSheetConfig.registerSheet(Item, "age-of-sigmar-soulbound", AethericDeviceSheet, { types: ["aethericDevice"], makeDefault: true, label : "Aetheric Device Sheet" });
    DocumentSheetConfig.registerSheet(Item, "age-of-sigmar-soulbound", ArchetypeSheet, { types: ["archetype"], makeDefault: true, label : "Archetype Sheet" });
    DocumentSheetConfig.registerSheet(Item, "age-of-sigmar-soulbound", ArmourSheet, { types: ["armour"], makeDefault: true, label : "Armour Sheet" });
    DocumentSheetConfig.registerSheet(Item, "age-of-sigmar-soulbound", EquipmentSheet, { types: ["equipment"], makeDefault: true, label : "Equipment Sheet" });
    DocumentSheetConfig.registerSheet(Item, "age-of-sigmar-soulbound", MiracleSheet, { types: ["miracle"], makeDefault: true, label : "Miracle Sheet" });
    DocumentSheetConfig.registerSheet(Item, "age-of-sigmar-soulbound", SpellSheet, { types: ["spell"], makeDefault: true, label : "Spell Sheet" });
    DocumentSheetConfig.registerSheet(Item, "age-of-sigmar-soulbound", TalentSheet, { types: ["talent"], makeDefault: true, label : "Talent Sheet" });
    DocumentSheetConfig.registerSheet(Item, "age-of-sigmar-soulbound", WeaponSheet, { types: ["weapon"], makeDefault: true, label : "Weapon Sheet" });
    DocumentSheetConfig.registerSheet(Item, "age-of-sigmar-soulbound", PartyItemSheet, { types: ["partyItem"], makeDefault: true, label : "Party Item Sheet" });
    DocumentSheetConfig.registerSheet(Item, "age-of-sigmar-soulbound", RuneSheet, { types: ["rune"], makeDefault: true, label : "Rune Sheet" });
    DocumentSheetConfig.registerSheet(Item, "age-of-sigmar-soulbound", TalentSheet, { types: ["talent"], makeDefault: true, label : "Talent Sheet" });

    DocumentSheetConfig.registerSheet(ActiveEffect, "age-of-sigmar-soulbound", SoulboundActiveEffectConfig, { makeDefault: true, label : "Soulbound Active Effect Config" });
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
    
    warhammer.utility.registerPremiumModuleInitialization()
    
  });

hooks();
loadEffects();
ZoneConfig.addRegionControls();
