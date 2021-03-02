export class AgeOfSigmarActor extends Actor {
    prepareData() {
        super.prepareData();
        if (this.data.type === "player" || this.data.type === "npc") {
            this._initializeData(this.data);
            this._computeSkillOrder(this.data);
            this._computeItems(this.data);
            this._computeAttack(this.data);
            this._computeSecondary(this.data);
        } else if (this.data.type === "party") {
            this._computePartyItems(this.data);
        }
    }

    _initializeData(data) {
        data.data.attributes.body.total = data.data.attributes.body.value;
        data.data.attributes.mind.total = data.data.attributes.mind.value;
        data.data.attributes.soul.total = data.data.attributes.soul.value;
        data.data.combat.melee.total = 0;
        data.data.combat.accuracy.total = 0;
        data.data.combat.defense.total = 0;
        data.data.combat.armour.total = 0;
        data.data.combat.health.toughness.max = 0;
        data.data.combat.health.wounds.value = 0;
        data.data.combat.health.wounds.max = 0;
        data.data.combat.initiative.total = 0;
        data.data.combat.naturalAwareness.total = 0;
        data.data.combat.mettle.total = 0;
        data.data.combat.damage = 0;
        data.data.power = {
            consumed: 0,
            capacity: 0,
            isUndercharge: false
        }
    }

    _computeSkillOrder(data) {
        let middle = Object.values(data.data.skills).length / 2;
        let i = 0;
        for (let skill of Object.values(data.data.skills)) {
            skill.isLeft = i < middle;
            skill.isRight = i >= middle;
            skill.total = skill.training;
            i++;
        }
    }

    _computeItems(data) {
        for (let item of Object.values(data.items)) {
            item.isGoal = item.type === "goal";
            item.isConnection = item.type === "connection";
            item.isWound = item.type === "wound";
            if (item.isWound) this._computeWounds(data, item);
            item.isSpell = item.type === "spell";
            item.isMiracle = item.type === "miracle";
            item.isPower = item.isSpell || item.isMiracle;
            item.isTalent = item.type === "talent";
            if (item.data.state) this._computeGear(data, item);
        }
    }

    _computePartyItems(data) {
        for (let item of Object.values(data.items)) {
            item.isShortGoal = item.type === "goal" && item.data.type === "short";
            item.isLongGoal = item.type === "goal"  && item.data.type === "long";
            item.isAlly = item.type === "ally";
            item.isEnemy = item.type === "enemy";
            item.isResource = item.type === "resource";
            item.isRumour = item.type === "rumour";
            item.isFear = item.type === "fear";
            item.isThreat = item.type === "threat";
            item.isActive = item.data.state === "active";
        }
    }

    _computeWounds(data, item) {
        data.data.combat.health.wounds.value += item.data.damage;
    }

    _computeGear(data, item) {
        item.isActive = item.data.state === "active";
        item.isEquipped = item.data.state === "equipped";
        item.isArmour = item.type === "armour";
        item.isWeapon = item.type === "weapon";
        item.isAethericDevice = item.type === "aethericDevice";
        item.isAttack = item.isWeapon || (item.isAethericDevice && item.data.damage);
        item.isRune = item.type === "rune";
        item.isEquipment = item.type === "equipment";
        if (item.isActive) {
            this._computeAttributes(data, item.data.bonus.attributes);
            this._computeSkills(data, item.data.bonus.skills);
            this._computeCombat(data, item.data.bonus.combat);
            if (item.isArmour) this._computeArmour(data, item);
            if (item.isAethericDevice) this._computeAethericDevice(data, item);
        }
    }

    _computeAttributes(data, attributes) {
        data.data.attributes.body.total += attributes.body;
        data.data.attributes.mind.total += attributes.mind;
        data.data.attributes.soul.total += attributes.soul;
    }

    _computeSkills(data, skills) {
        data.data.skills.arcana.total += skills.arcana;
        data.data.skills.athletics.total += skills.athletics;
        data.data.skills.awareness.total += skills.awareness;
        data.data.skills.ballisticSkill.total += skills.ballisticSkill;
        data.data.skills.beastHandling.total += skills.beastHandling;
        data.data.skills.channelling.total += skills.channelling;
        data.data.skills.crafting.total += skills.crafting;
        data.data.skills.determination.total += skills.determination;
        data.data.skills.devotion.total += skills.devotion;
        data.data.skills.dexterity.total += skills.dexterity;
        data.data.skills.entertain.total += skills.entertain;
        data.data.skills.fortitude.total += skills.fortitude;
        data.data.skills.guile.total += skills.guile;
        data.data.skills.intimidation.total += skills.intimidation;
        data.data.skills.intuition.total += skills.intuition;
        data.data.skills.lore.total += skills.lore;
        data.data.skills.medicine.total += skills.medicine;
        data.data.skills.might.total += skills.might;
        data.data.skills.nature.total += skills.nature;
        data.data.skills.reflexes.total += skills.reflexes;
        data.data.skills.stealth.total += skills.stealth;
        data.data.skills.survival.total += skills.survival;
        data.data.skills.theology.total += skills.theology;
        data.data.skills.weaponSkill.total += skills.weaponSkill;
    }

    _computeCombat(data, combat) {
        data.data.combat.mettle.total += combat.mettle;
        data.data.combat.health.toughness.max += combat.health.toughness;
        data.data.combat.health.wounds.max += combat.health.wounds;
        data.data.combat.health.wounds.deadly = data.data.combat.health.wounds.value >= data.data.combat.health.wounds.max;
        data.data.combat.initiative.total += combat.initiative;
        data.data.combat.naturalAwareness.total += combat.naturalAwareness;
        data.data.combat.melee.total += (combat.melee * 2);
        data.data.combat.accuracy.total += (combat.accuracy * 2);
        data.data.combat.defense.total += (combat.defense * 2);
        data.data.combat.armour.total += combat.armour;
        data.data.combat.damage += combat.damage;
    }

    _computeArmour(data, item) {
        if (item.data.type === "shield") {
            // Like below treat shield benefit as an step increase
            data.data.combat.defense.total += (item.data.benefit * 2);
        } else {
            data.data.combat.armour.total += item.data.benefit;
        }
    }

    _computeAethericDevice(data, item) {
        data.data.power.consumed += item.data.power.consumption;
        data.data.power.capacity += item.data.power.capacity;
    }

    _computeAttack(data) {
        for (let item of Object.values(data.items)) {
            if (item.isAttack) {
                if (item.data.category === "melee") {
                    item.data.pool = data.data.attributes.body.total + data.data.skills.weaponSkill.total;
                    item.data.focus = data.data.skills.weaponSkill.focus;
                } else {
                    item.data.pool = data.data.attributes.mind.total + data.data.skills.ballisticSkill.total;
                    item.data.focus = data.data.skills.ballisticSkill.focus;
                }
            }
        }
    }

    _computeSecondary(data) {
        // melee, accuracy and defense bonus is doubled to represent a one step increase
        data.data.combat.melee.total += data.data.attributes.body.value + data.data.skills.weaponSkill.total + (data.data.combat.melee.bonus * 2);
        data.data.combat.accuracy.total += data.data.attributes.mind.value + data.data.skills.ballisticSkill.total + (data.data.combat.accuracy.bonus * 2);
        data.data.combat.defense.total += data.data.attributes.body.total + data.data.skills.reflexes.total + (data.data.combat.defense.bonus * 2);
        data.data.combat.health.toughness.max += data.data.attributes.body.total + data.data.attributes.mind.total + data.data.attributes.soul.total + data.data.combat.health.toughness.bonus;
        data.data.combat.health.wounds.max += Math.ceil((data.data.attributes.body.total + data.data.attributes.mind.total + data.data.attributes.soul.total) / 2) + data.data.combat.health.wounds.bonus;
        data.data.combat.health.wounds.deadly = data.data.combat.health.wounds.value >= data.data.combat.health.wounds.max;
        data.data.combat.initiative.total += data.data.attributes.mind.total + data.data.skills.awareness.total + data.data.skills.reflexes.total + data.data.combat.initiative.bonus;
        data.data.combat.naturalAwareness.total += Math.ceil((data.data.attributes.mind.total + data.data.skills.awareness.total) / 2) + data.data.combat.naturalAwareness.bonus;
        data.data.combat.mettle.total += Math.ceil(data.data.attributes.soul.total / 2) + data.data.combat.mettle.bonus;
        data.data.power.isUndercharge = data.data.power.consumed > data.data.power.capacity;
    }
}