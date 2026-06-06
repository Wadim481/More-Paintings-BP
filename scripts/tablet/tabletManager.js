import {
  system,
  EntityComponentTypes,
  EquipmentSlot,
  InputPermissionCategory,
} from "@minecraft/server";

const TABLET_PROP_PREFIX = "hp4_paint:tabletv3_";

export class TabletManager {
  constructor(player) {
    this.INPUT_COOLDOWN_TICKS = 5;
    this.INPUT_THRESHOLD = 0.5;

    this.player = player;
    this.tabletOpen = false;
    this.runInterval = null;
    this.lastInputTick = 0;
    this._equippable = player.getComponent(EntityComponentTypes.Equippable) ?? null;

    this.pages = [
      {
        name: "Paintings",
        anim: "animation.hp4_paint.tabletv3.utils.page.paintings",
        categories: [
          { name: "Painting",    anim: "animation.hp4_paint.tabletv3.utils.category.painting" },
          { name: "Frame",       anim: "animation.hp4_paint.tabletv3.utils.category.frame" },
        ],
      },
      {
        name: "Furnitures",
        anim: "animation.hp4_paint.tabletv3.utils.page.furnitures",
        categories: [
          { name: "Display Case", anim: "animation.hp4_paint.tabletv3.utils.category.display_case" },
          { name: "Planter",      anim: "animation.hp4_paint.tabletv3.utils.category.planter" },
          { name: "Statue",       anim: "animation.hp4_paint.tabletv3.utils.category.statue" },
          { name: "Stencil",      anim: "animation.hp4_paint.tabletv3.utils.category.stencil" },
        ],
      },
      {
        name: "Tools",
        anim: "animation.hp4_paint.tabletv3.utils.page.tools",
        categories: [
          { name: "Hammer",    anim: "animation.hp4_paint.tabletv3.utils.category.hammer" },
          { name: "Brush",     anim: "animation.hp4_paint.tabletv3.utils.category.brush" },
          { name: "Spray Can", anim: "animation.hp4_paint.tabletv3.utils.category.spray_can" },
          { name: "Chisel",    anim: "animation.hp4_paint.tabletv3.utils.category.chisel" },
        ],
      },
      {
        name: "Mob",
        anim: "animation.hp4_paint.tabletv3.utils.page.mob",
        categories: [
          { name: "Artist Villager", anim: "animation.hp4_paint.tabletv3.utils.category.artist_villager" },
        ],
      },
    ];

    this.state = {
      focus: "tabs", // "tabs" | "categories"
      pageIdx: 0,
      categoryIdx: 0,
    };
  }

  // --- State Persistence --------------------------------------------------
  saveState() {
    this.player.setDynamicProperty(TABLET_PROP_PREFIX + "page",     this.state.pageIdx);
    this.player.setDynamicProperty(TABLET_PROP_PREFIX + "category", this.state.categoryIdx);
    this.player.setDynamicProperty(TABLET_PROP_PREFIX + "focus",    this.state.focus);
  }

  loadState() {
    const savedPage     = this.player.getDynamicProperty(TABLET_PROP_PREFIX + "page")     ?? null;
    const savedCategory = this.player.getDynamicProperty(TABLET_PROP_PREFIX + "category") ?? null;
    const savedFocus    = this.player.getDynamicProperty(TABLET_PROP_PREFIX + "focus")    ?? null;

    if (savedPage     !== null) this.state.pageIdx     = this.clamp(Number(savedPage),     0, this.getPageCount() - 1);
    if (savedCategory !== null) this.state.categoryIdx = this.clamp(Number(savedCategory), 0, this.getCategoryCount() - 1);
    if (savedFocus    !== null) this.state.focus       = savedFocus;
  }

  // --- Open / Close -------------------------------------------------------
  openTablet() {
    if (this.tabletOpen) return;
    this.tabletOpen = true;

    this.player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, false);
    this.player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera,   false);

    this.loadState();

    // Set v.tabletv3_open = 1 pada player entity -> attachable membaca via parent_setup/pre_animation
    this.player.playAnimation("animation.hp4_paint.tabletv3.utils.open", {
      blendOutTime: 0, nextState: "__null", stopExpression: "0", controller: "__TabletV3Open"
    });

    this.updateVisuals();
    this.player.playSound(`hp4_paint:tablet_start`, { volume: 0.18, pitch: 0.9 });

    this.runInterval = system.runInterval(() => {
      try {
        this.tick();
      } catch (e) {
        console.log(`§cTabletManager tick error: ${e}`);
        this.cleanup();
      }
    }, 2);
  }

  closeTablet() {
    try { this.saveState(); } catch (e) { console.log(`§cSave error: ${e}`); }
    try { this.cleanup();   } catch (e) { console.log(`§cCleanup error: ${e}`); }

  }

  cleanup() {
    if (this.runInterval) system.clearRun(this.runInterval);
    this.runInterval = null;
    this.tabletOpen  = false;

    this.player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, true);
    this.player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera,   true);

    // Set v.tabletv3_open = 0 -> attachable kembali ke first_person_hold / third_person_hold
    this.player.playAnimation("animation.hp4_paint.tabletv3.utils.close", {
      blendOutTime: 0, nextState: "__null", stopExpression: "0", controller: "__TabletV3Open"
    });
  }

  // --- Tick ---------------------------------------------------------------
  tick() {
    if (!this.tabletOpen) return;

    const heldItem = this._equippable?.getEquipment(EquipmentSlot.Mainhand)?.typeId;

    if (heldItem !== "hp4_paint:tabletv3") {
      this.closeTablet();
      return;
    }

    this.handleInput();
    this.updateActionbar();
  }

  // --- Input --------------------------------------------------------------
  readCardinalInput() {
    const currentTick = system.currentTick;
    if (currentTick - this.lastInputTick < this.INPUT_COOLDOWN_TICKS) return null;

    const input = this.player.inputInfo.getMovementVector();
    let direction = null;

    if (Math.abs(input.x) > Math.abs(input.y)) {
      if      (input.x >  this.INPUT_THRESHOLD) direction = "left";
      else if (input.x < -this.INPUT_THRESHOLD) direction = "right";
    } else if (Math.abs(input.y) > Math.abs(input.x)) {
      if      (input.y >  this.INPUT_THRESHOLD) direction = "up";
      else if (input.y < -this.INPUT_THRESHOLD) direction = "down";
    }

    if (direction) this.lastInputTick = currentTick;
    return direction;
  }

  handleInput() {
    const dir = this.readCardinalInput();
    if (!dir) return;

    switch (this.state.focus) {
      case "tabs":       this.handleTabsInput(dir);       break;
      case "categories": this.handleCategoriesInput(dir); break;
      default:           this.state.focus = "tabs";       break;
    }
  }

  handleExternalInput(inputKey) {
    const currentTick = system.currentTick;
    if (currentTick - this.lastInputTick < this.INPUT_COOLDOWN_TICKS) return;
    this.lastInputTick = currentTick;

    if (inputKey === "CLOSE") {
      this.player.playSound(`hp4_paint:tablet_start`, { volume: 0.18, pitch: 0.9 });
      this.closeTablet();
    } else if (inputKey === "BACK" && this.state.focus === "categories") {
      this.transitionFocus("tabs");
    }
  }

  // --- Focus --------------------------------------------------------------
  transitionFocus(target) {
    if (this.state.focus === target) return;
    this.state.focus = target;
    this.updateVisuals();
  }

  // --- Navigation ---------------------------------------------------------
  handleTabsInput(direction) {
    const maxPage = this.getPageCount() - 1;

    if (direction === "left") {
      if (this.state.pageIdx > 0) {
        this.state.pageIdx--;
        this.state.categoryIdx = 0;
        this.player.playSound(`hp4_paint:tablet_choose`, { volume: 0.18, pitch: 0.9 })
        this.updateVisuals();
      } else {
        this.player.playSound("note.bass", { volume: 0.18, pitch: 0.9 });
      }
    } else if (direction === "right") {
      if (this.state.pageIdx < maxPage) {
        this.state.pageIdx++;
        this.state.categoryIdx = 0;
        this.player.playSound(`hp4_paint:tablet_choose`, { volume: 0.18, pitch: 0.9 })
        this.updateVisuals();
      } else {
        this.player.playSound("note.bass", { volume: 0.18, pitch: 0.9 });
      }
    } else if (direction === "up" && this.getCategoryCount() > 0) {
      this.transitionFocus("categories");
      this.player.playSound(`hp4_paint:tablet_guide`, { volume: 0.18, pitch: 0.9 })
    }
  }

  handleCategoriesInput(direction) {
    const maxCat = this.getCategoryCount() - 1;

    if (direction === "left") {
      if (this.state.categoryIdx > 0) {
        this.state.categoryIdx--;
        this.player.playSound(`hp4_paint:tablet_choose`, { volume: 0.18, pitch: 0.9 })
        this.updateVisuals();
      } else {
        this.player.playSound("note.bass", { volume: 0.18, pitch: 0.9 });
      }
    } else if (direction === "right") {
      if (this.state.categoryIdx < maxCat) {
        this.state.categoryIdx++;
        this.player.playSound(`hp4_paint:tablet_choose`, { volume: 0.18, pitch: 0.9 })
        this.updateVisuals();
      } else {
        this.player.playSound("note.bass", { volume: 0.18, pitch: 0.9 });
      }
    } else if (direction === "down") {
      this.state.categoryIdx = 0;
      this.transitionFocus("tabs");
      this.player.playSound(`hp4_paint:tablet_back`, { volume: 0.18, pitch: 0.9 })
    }
  }

  // --- Queries ------------------------------------------------------------
  getCurrentCategory() {
    return this.pages[this.state.pageIdx]?.categories?.[this.state.categoryIdx] ?? null;
  }

  getPageCount() {
    return this.pages.length;
  }

  getCategoryCount() {
    return this.pages[this.state.pageIdx]?.categories?.length ?? 0;
  }

  clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // --- Actionbar ----------------------------------------------------------
  updateActionbar() {}

  // --- Visuals ------------------------------------------------------------
  updateVisuals() {
    this.saveState();
    this.updateActionbar();
    this.updateStateAnims();
  }

  // Mengirim state navigasi ke RP via utility animations (pola seperti guidebook).
  updateStateAnims() {
    const { pageIdx, categoryIdx, focus } = this.state;
    const page     = this.pages[pageIdx];
    const category = page?.categories?.[categoryIdx];
    const focusAnim = focus === "categories"
      ? "animation.hp4_paint.tabletv3.utils.focus.categories"
      : "animation.hp4_paint.tabletv3.utils.focus.tabs";

    const opts = { blendOutTime: 0, nextState: "__null", stopExpression: "0" };

    if (page?.anim)     this.player.playAnimation(page.anim,     { ...opts, controller: "__TabletV3Page" });
    if (category?.anim) this.player.playAnimation(category.anim, { ...opts, controller: "__TabletV3Category" });
    this.player.playAnimation(focusAnim,                          { ...opts, controller: "__TabletV3FocusState" });
  }

  // --- Debug --------------------------------------------------------------
  log(msg) {
    console.log(`[Tablet] ${msg}`);
  }

  printState() {
    const { focus, pageIdx, categoryIdx } = this.state;
    const page = this.pages[pageIdx];
    const cat  = page?.categories?.[categoryIdx] ?? null;
    this.player.sendMessage(`§b[${focus.toUpperCase()}] §8Page §f${pageIdx}:${page?.name ?? "?"} §8| Cat §f${categoryIdx}:${cat?.name ?? "?"}`);
  }
}