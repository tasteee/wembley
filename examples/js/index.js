// src/refactor/wembley.ts
var Wembley = class {
  constructor() {
    this.id = crypto.randomUUID();
    this.gears = {};
    this.settings = DEFAULT_SETTINGS;
    this.playingNotes = [];
    this.initialize = async (config) => {
      if (config.minVelocity) this.settings.minVelocity = config.minVelocity;
      if (config.maxVelocity) this.settings.maxVelocity = config.maxVelocity;
      if (config.velocity) this.settings.velocity = config.velocity;
      if (config.gain) this.settings.gain = config.gain;
      if (config.pan) this.settings.pan = config.pan;
      const gear = new Gear(config, this);
      this.gears[gear.id] = gear;
    };
    // Dispatch the stop request to all gears, and as a
    // result, to all instruments.
    this.stop = (target) => {
      console.log(`[Wembley.stop target]:`, target);
      Object.values(this.gears).forEach((gear) => gear.stop(target));
    };
    // Update the global settings.
    // These are the last fallback for when
    // neither a note, instrument, or gear are missing a value.
    // wembley.set({ minVelocity: 22 })
    this.set = (settings) => {
      Object.assign(this.settings, settings);
    };
  }
};
var wembley = new Wembley();

// src/index.ts
var wembley2 = (void 0)();
export {
  wembley2 as default,
  wembley2 as wembley
};
