let roll = await this.script.roll("1d6");

let effects = {
  1: "DYbG2zW2wXDoFdgW",
  2: "hF2Qo1411R6byE5a",
  3: "xo7Y226ldDsDZ3fe",
  4: "XRPeABh9tdHOgChT",
  5: "JPTNVr7Rx5KUYbZj",
  6: "YxPDRoY3XRfe3jDx"
}

this.actor.applyEffect({effects: this.item.effects.get(effects[roll])})