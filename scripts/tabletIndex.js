import { world, system } from "@minecraft/server";
import { TabletManager } from "./tablet/tabletManager.js";

// Open tablet when the player uses (right-clicks) the item
world.afterEvents.itemUse.subscribe((event) => {
  const player = event.source;
  if (event.itemStack.typeId !== "hp4_paint:tabletv3") return;

  if (!player.tabletManager) {
    player.tabletManager = new TabletManager(player);
  }

  if (!player.tabletManager.tabletOpen) {
    player.tabletManager.openTablet();
  }
});

// Sneak = Close, Jump = Back
world.afterEvents.playerButtonInput.subscribe(
  (event) => {
    if (!event.player?.tabletManager?.tabletOpen) return;

    if (event.button === "Sneak" && event.newButtonState === "Pressed")
      event.player.tabletManager.handleExternalInput("CLOSE");
    if (event.button === "Jump" && event.newButtonState === "Pressed")
      event.player.tabletManager.handleExternalInput("BACK");
  },
  { buttons: ["Sneak", "Jump"] }
);

// Cleanup when player leaves
world.beforeEvents.playerLeave.subscribe((e) => {
  if (e.player?.tabletManager?.tabletOpen === true) {
    try {
      e.player.tabletManager.handleExternalInput("CLOSE");
    } catch (err) {
      console.log(`§cTablet leave-cleanup error: ${err}`);
    }
  }
});
