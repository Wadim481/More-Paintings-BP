import { system, world } from "@minecraft/server";

const STENCIL_ENTITY_ID = "hp4_paint:stencil";
const COLOR_SPLASH_WALL_ENTITY_ID = "hp4_paint:color_splash";
const COLOR_SPLASH_ENTITY_ID = "hp4_paint:stencil_spray1";
const COLOR_SPLASH_ENTITY_ID_ALT = "hp4_paint:stencil_spray2";
const ROTATION_SYNC_TICKS = 1;
const STENCIL_AUTO_ROTATION_TICKS = 2;
const COLOR_SPLASH_AUTO_ROTATION_TICKS = 5;
const STENCIL_COLLISION_SYNC_DELAY_TICKS = 1;
const STENCIL_VERTICAL_WALL_ROTATION_X = 90;
const STENCIL_WALL_ATTACH_OFFSET = 0.495;
const STENCIL_SPRAY_WALL_EXTRA_OFFSET = -0.01;
const activeRotationSyncByEntityId = new Map();
const activeStencilAutoRotationByEntityId = new Map();
const activeColorSplashAutoRotationByEntityId = new Map();
const activeStencilCollisionStateByEntityId = new Map();
const activeStencilHitboxModeByEntityId = new Map();
const activeColorSplashHitboxModeByEntityId = new Map();

const horizontalWallChecks = [
    { x: 1, z: 0 },
    { x: -1, z: 0 },
    { x: 0, z: 1 },
    { x: 0, z: -1 }
];

const wallFacingRotationByOffset = {
    "0,-1": 0,
    "1,0": 90,
    "0,1": 180,
    "-1,0": -90
};

const STENCIL_FLOOR_COLLISION_BLOCK_ID = "hp4_paint:collision.stencil";
const STENCIL_WALL_COLLISION_BLOCK_ID = "hp4_paint:collision.stencil_wall";
const STENCIL_HITBOX_EVENT_FLOOR = "hp4_paint:stencil_hitbox_floor";
const STENCIL_HITBOX_EVENT_WALL = "hp4_paint:stencil_hitbox_wall";
const COLOR_SPLASH_HITBOX_EVENT_FLOOR = "hp4_paint:color_splash_hitbox_floor";
const COLOR_SPLASH_HITBOX_EVENT_WALL = "hp4_paint:color_splash_hitbox_wall";

function getPlayerSpraySettings(player) {
    const stored = player?.getDynamicProperty?.("hp4_paint:spray_settings");
    if (!stored) return { spray_to_stencil: true, particles_enabled: true, sound_enabled: true };
    try {
        const parsed = JSON.parse(stored);
        return {
            spray_to_stencil: parsed?.spray_to_stencil !== false,
            particles_enabled: parsed?.particles_enabled !== false,
            sound_enabled: parsed?.sound_enabled !== false
        };
    } catch (_) {
        return { spray_to_stencil: true, particles_enabled: true, sound_enabled: true };
    }
}

const sprayCanColorToFurnitureColor = {
    "hp4_paint:spray_can_white": 14,
    "hp4_paint:spray_can_orange": 10,
    "hp4_paint:spray_can_magenta": 9,
    "hp4_paint:spray_can_light_blue": 3,
    "hp4_paint:spray_can_yellow": 15,
    "hp4_paint:spray_can_lime": 8,
    "hp4_paint:spray_can_pink": 11,
    "hp4_paint:spray_can_gray": 5,
    "hp4_paint:spray_can_light_gray": 7,
    "hp4_paint:spray_can_cyan": 6,
    "hp4_paint:spray_can_purple": 12,
    "hp4_paint:spray_can_blue": 1,
    "hp4_paint:spray_can_brown": 2,
    "hp4_paint:spray_can_green": 4,
    "hp4_paint:spray_can_red": 13,
    "hp4_paint:spray_can_black": 0
};

function getSprayCanColorValue(itemTypeId) {
    if (!itemTypeId) return undefined;
    return sprayCanColorToFurnitureColor[itemTypeId];
}

function getSprayCanParticleId(itemTypeId) {
    if (!itemTypeId || getSprayCanColorValue(itemTypeId) === undefined) return undefined;
    const colorName = itemTypeId.replace("hp4_paint:spray_can_", "");
    return `test:spray_${colorName}`;
}

function spawnStencilSprayParticle(player, dimension, stencilLocation, itemTypeId, particlesEnabled) {
    if (!dimension || !stencilLocation || !player) return;
    if (particlesEnabled === false) return;

    const particleId = getSprayCanParticleId(itemTypeId);
    if (!particleId) return;

    try {
        dimension.spawnParticle(particleId, {
            x: stencilLocation.x,
            y: stencilLocation.y + 0.15,
            z: stencilLocation.z
        });
    } catch (error) {
    }
}

function isSolidWallBlock(block) {
    return !!block && !block.isAir && block.typeId !== "minecraft:water";
}

function snapToCardinalRotationY(yRotation) {
    const cardinalRotations = [0, 90, 180, -90];
    let closest = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    for (const candidate of cardinalRotations) {
        const distance = Math.abs(candidate - yRotation);
        if (distance < minDistance) {
            minDistance = distance;
            closest = candidate;
        }
    }

    return yRotation <= -135 ? 180 : closest;
}

function getCardinalWallFacingRotation(wallOffset, fallbackYRotation) {
    if (!wallOffset) return snapToCardinalRotationY(fallbackYRotation);

    const key = `${wallOffset.x},${wallOffset.z}`;
    return wallFacingRotationByOffset[key] ?? snapToCardinalRotationY(fallbackYRotation);
}

function getCardinalDirectionFromRotationY(yRotation) {
    const snapped = snapToCardinalRotationY(yRotation);
    if (snapped === 0) return "north";
    if (snapped === 90) return "east";
    if (snapped === 180 || snapped === -180) return "south";
    if (snapped === -90 || snapped === 270) return "west";
    return "north";
}

function toBlockLocation(location) {
    return {
        x: Math.floor(location.x),
        y: Math.floor(location.y),
        z: Math.floor(location.z)
    };
}

function clearPlacedStencilCollision(state) {
    if (!state?.dimensionId || !state?.blockLocation) return;

    try {
        const dimension = world.getDimension(state.dimensionId);
        const block = dimension.getBlock(state.blockLocation);
        if (!block) return;

        if (
            block.typeId === STENCIL_FLOOR_COLLISION_BLOCK_ID ||
            block.typeId === STENCIL_WALL_COLLISION_BLOCK_ID
        ) {
            dimension.runCommand(
                `setblock ${state.blockLocation.x} ${state.blockLocation.y} ${state.blockLocation.z} air`
            );
        }
    } catch (_) {
    }
}

function syncStencilPhysicalCollision(stencil) {
    if (!stencil?.isValid()) return;

    const previousState = activeStencilCollisionStateByEntityId.get(stencil.id);
    if (previousState) {
        clearPlacedStencilCollision(previousState);
        activeStencilCollisionStateByEntityId.delete(stencil.id);
    }
}

function syncEntityCustomHitboxMode(entity, isWallMounted, modeMap, floorEvent, wallEvent) {
    if (!entity?.isValid()) return;

    const nextMode = isWallMounted ? "wall" : "floor";
    const prevMode = modeMap.get(entity.id);
    if (prevMode === nextMode) return;

    try {
        entity.triggerEvent(isWallMounted ? wallEvent : floorEvent);
        modeMap.set(entity.id, nextMode);
    } catch (_) {
    }
}

function getFloorCenteredLocation(location) {
    return {
        x: Math.floor(location.x) + 0.5,
        y: location.y,
        z: Math.floor(location.z) + 0.5
    };
}

function getWallAttachedLocation(location, wallOffset, attachOffset = STENCIL_WALL_ATTACH_OFFSET) {
    const centered = getFloorCenteredLocation(location);
    if (!wallOffset) return centered;

    return {
        x: centered.x + (wallOffset.x * attachOffset),
        // Lock to block-center vertically so wall stencil doesn't land on block seams.
        y: Math.floor(location.y) + 0.5,
        z: centered.z + (wallOffset.z * attachOffset)
    };
}

function hasSolidSupportBelow(stencil) {
    if (!stencil?.isValid()) return false;

    const loc = stencil.location;
    const dimension = stencil.dimension;

    try {
        const belowBlock = dimension.getBlock({
            x: Math.floor(loc.x),
            y: Math.floor(loc.y) - 1,
            z: Math.floor(loc.z)
        });
        return isSolidWallBlock(belowBlock);
    } catch (_) {
        return false;
    }
}

function getAdjacentWall(stencil) {
    if (!stencil?.isValid()) return false;

    const loc = stencil.location;
    const dimension = stencil.dimension;
    const baseX = Math.floor(loc.x);
    const baseY = Math.floor(loc.y);
    const baseZ = Math.floor(loc.z);

    let bestWall = null;
    let bestScore = 0;

    for (const offset of horizontalWallChecks) {
        let wallScore = 0;

        for (const yOffset of [0, 1]) {
            try {
                const block = dimension.getBlock({
                    x: baseX + offset.x,
                    y: baseY + yOffset,
                    z: baseZ + offset.z
                });
                if (isSolidWallBlock(block)) {
                    wallScore++;
                }
            } catch (_) {
            }
        }

        if (wallScore > bestScore) {
            bestScore = wallScore;
            bestWall = offset;
        }
    }

    return bestWall;
}

function applyAutoStencilWallRotation(stencil, syncPhysicalCollision = true) {
    if (!stencil?.isValid()) return;

    const currentRotation = stencil.getRotation();
    const adjacentWall = getAdjacentWall(stencil);
    const isWallMounted = !!adjacentWall && !hasSolidSupportBelow(stencil);
    const targetRotation = {
        x: isWallMounted ? STENCIL_VERTICAL_WALL_ROTATION_X : 0,
        y: isWallMounted
            ? getCardinalWallFacingRotation(adjacentWall, currentRotation.y)
            : snapToCardinalRotationY(currentRotation.y)
    };
    const targetLocation = isWallMounted
        ? getWallAttachedLocation(stencil.location, adjacentWall)
        : getFloorCenteredLocation(stencil.location);

    try {
        stencil.setProperty(
            "hp4_paint:stencil_vertical_rotation",
            isWallMounted ? STENCIL_VERTICAL_WALL_ROTATION_X : 0
        );
        stencil.setProperty("hp4_paint:stencil_y_rotation", targetRotation.y);
    } catch (_) {
    }

    try {
        stencil.setRotation(targetRotation);
    } catch (_) {
    }

    try {
        stencil.teleport(targetLocation, { rotation: targetRotation });
    } catch (_) {
    }

    syncEntityCustomHitboxMode(
        stencil,
        isWallMounted,
        activeStencilHitboxModeByEntityId,
        STENCIL_HITBOX_EVENT_FLOOR,
        STENCIL_HITBOX_EVENT_WALL
    );

    if (syncPhysicalCollision) {
        syncStencilPhysicalCollision(stencil);
    }
}

function syncAutoStencilWallRotation(stencil) {
    if (!stencil?.isValid()) return;

    const activeRunId = activeStencilAutoRotationByEntityId.get(stencil.id);
    if (activeRunId !== undefined) {
        system.clearRun(activeRunId);
        activeStencilAutoRotationByEntityId.delete(stencil.id);
    }

    applyAutoStencilWallRotation(stencil, false);

    let ticksElapsed = 0;
    const runId = system.runInterval(() => {
        ticksElapsed++;

        if (!stencil.isValid() || ticksElapsed >= STENCIL_AUTO_ROTATION_TICKS) {
            system.clearRun(runId);
            activeStencilAutoRotationByEntityId.delete(stencil.id);
            return;
        }

        applyAutoStencilWallRotation(
            stencil,
            ticksElapsed >= STENCIL_COLLISION_SYNC_DELAY_TICKS
        );
    }, 1);

    activeStencilAutoRotationByEntityId.set(stencil.id, runId);
}

function applyAutoColorSplashWallRotation(colorSplash) {
    if (!colorSplash?.isValid()) return;

    const currentRotation = colorSplash.getRotation();
    const adjacentWall = getAdjacentWall(colorSplash);
    const isWallMounted = !!adjacentWall && !hasSolidSupportBelow(colorSplash);
    const targetRotation = {
        x: isWallMounted ? STENCIL_VERTICAL_WALL_ROTATION_X : 0,
        y: isWallMounted
            ? getCardinalWallFacingRotation(adjacentWall, currentRotation.y)
            : snapToCardinalRotationY(currentRotation.y)
    };
    const targetLocation = isWallMounted
        ? getWallAttachedLocation(colorSplash.location, adjacentWall)
        : getFloorCenteredLocation(colorSplash.location);

    try {
        colorSplash.setProperty(
            "hp4_paint:stencil_vertical_rotation",
            isWallMounted ? STENCIL_VERTICAL_WALL_ROTATION_X : 0
        );
        colorSplash.setProperty("hp4_paint:stencil_y_rotation", targetRotation.y);
    } catch (_) {
    }

    try {
        colorSplash.setRotation(targetRotation);
    } catch (_) {
    }

    try {
        colorSplash.teleport(targetLocation, { rotation: targetRotation });
    } catch (_) {
    }

    syncEntityCustomHitboxMode(
        colorSplash,
        isWallMounted,
        activeColorSplashHitboxModeByEntityId,
        COLOR_SPLASH_HITBOX_EVENT_FLOOR,
        COLOR_SPLASH_HITBOX_EVENT_WALL
    );
}

function syncAutoColorSplashWallRotation(colorSplash) {
    if (!colorSplash?.isValid()) return;

    const activeRunId = activeColorSplashAutoRotationByEntityId.get(colorSplash.id);
    if (activeRunId !== undefined) {
        system.clearRun(activeRunId);
        activeColorSplashAutoRotationByEntityId.delete(colorSplash.id);
    }

    applyAutoColorSplashWallRotation(colorSplash);

    let ticksElapsed = 0;
    const runId = system.runInterval(() => {
        ticksElapsed++;

        if (!colorSplash.isValid() || ticksElapsed >= COLOR_SPLASH_AUTO_ROTATION_TICKS) {
            system.clearRun(runId);
            activeColorSplashAutoRotationByEntityId.delete(colorSplash.id);
            return;
        }

        applyAutoColorSplashWallRotation(colorSplash);
    }, 1);

    activeColorSplashAutoRotationByEntityId.set(colorSplash.id, runId);
}

function syncRotationWithStencil(entity, stencil) {
    if (!entity?.isValid() || !stencil?.isValid()) return;

    const activeRunId = activeRotationSyncByEntityId.get(entity.id);
    if (activeRunId !== undefined) {
        system.clearRun(activeRunId);
        activeRotationSyncByEntityId.delete(entity.id);
    }

    applyRotationFromStencil(entity, stencil);

    let ticksElapsed = 0;
    const runId = system.runInterval(() => {
        ticksElapsed++;

        if (!entity.isValid() || !stencil.isValid() || ticksElapsed >= ROTATION_SYNC_TICKS) {
            system.clearRun(runId);
            activeRotationSyncByEntityId.delete(entity.id);
            return;
        }

        applyRotationFromStencil(entity, stencil);
    }, 1);

    activeRotationSyncByEntityId.set(entity.id, runId);
}

function applyRotationFromStencil(entity, stencil) {
    if (!entity?.isValid() || !stencil?.isValid()) return;

    const stencilRotation = stencil.getRotation();
    let stencilVerticalRotation = 0;

    try {
        stencilVerticalRotation = stencil.getProperty("hp4_paint:stencil_vertical_rotation") ?? 0;
    } catch (_) {
    }

    try {
        entity.setProperty("hp4_paint:stencil_vertical_rotation", stencilVerticalRotation);
        entity.setProperty("hp4_paint:stencil_y_rotation", stencilRotation.y);
    } catch (_) {
    }

    try {
        entity.setRotation(stencilRotation);
    } catch (_) {
    }

    let targetLocation = entity.location;
    const isStencilSprayEntity = entity.typeId === COLOR_SPLASH_ENTITY_ID || entity.typeId === COLOR_SPLASH_ENTITY_ID_ALT;
    if (isStencilSprayEntity && stencilVerticalRotation === STENCIL_VERTICAL_WALL_ROTATION_X) {
        const adjacentWall = getAdjacentWall(stencil);
        if (adjacentWall) {
            targetLocation = {
                x: stencil.location.x + (adjacentWall.x * STENCIL_SPRAY_WALL_EXTRA_OFFSET),
                y: stencil.location.y,
                z: stencil.location.z + (adjacentWall.z * STENCIL_SPRAY_WALL_EXTRA_OFFSET)
            };
        }
    }

    // Teleport with rotation helps avoid first-render facing glitches on freshly spawned entities.
    try {
        entity.teleport(targetLocation, { rotation: stencilRotation });
    } catch (_) {
    }
}

world.afterEvents.entitySpawn.subscribe((event) => {
    const entity = event.entity;
    if (!entity) return;

    if (entity.typeId === STENCIL_ENTITY_ID) {
        // Hide stencil briefly on placement, then fade in.
        try {
            const scaleComp = entity.getComponent("minecraft:scale");
            if (scaleComp) scaleComp.value = 0;
        } catch (_) {}

        system.runTimeout(() => {
            if (entity.isValid()) {
                try {
                    const scaleComp = entity.getComponent("minecraft:scale");
                    if (scaleComp) scaleComp.value = 1;
                } catch (_) {}
            }
        }, 6); // ~0.3 s at 20 ticks/s

        // Delay one tick so the initial placement transform is available.
        system.runTimeout(() => {
            try {
                syncAutoStencilWallRotation(entity);
            } catch (_) {
            }
        }, 1);
    }

    if (entity.typeId === COLOR_SPLASH_WALL_ENTITY_ID) {
        system.runTimeout(() => {
            try {
                syncAutoColorSplashWallRotation(entity);
            } catch (_) {
            }
        }, 1);
    }
});

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const player = event.player;
    const target = event.target;
    if (!target || target.typeId !== STENCIL_ENTITY_ID) return;

    // Keep stencil vertical orientation in sync when it is attached to a wall.
    applyAutoStencilWallRotation(target);

    const settings = getPlayerSpraySettings(player);
    if (!settings.spray_to_stencil) {
        player.sendMessage("§cStencil spray is disabled in settings!");
        return;
    }

    const item = event.itemStack;
    const colorValue = getSprayCanColorValue(item?.typeId);
    if (colorValue === undefined) return;

    const stencilModel = target.getProperty("hp4_paint:furniture_model");
    const colorSplashEntityId = stencilModel === 1 ? COLOR_SPLASH_ENTITY_ID_ALT : COLOR_SPLASH_ENTITY_ID;

    const dimension = target.dimension;
    const stencilLocation = target.location;

    const existedSplash = dimension.getEntities({
        type: colorSplashEntityId,
        location: stencilLocation,
        maxDistance: 0.35,
        closest: 1
    })[0];

    const isNewSpawn = !existedSplash;
    const colorSplash = existedSplash ?? dimension.spawnEntity(colorSplashEntityId, stencilLocation);

    if (isNewSpawn) {
        // Newly spawned entities default to rotation y=0. If the stencil also faces y=0 (north/-z),
        // applyRotationFromStencil becomes a no-op and Bedrock's renderer never receives a state
        // change signal. Pre-jolt to y=1 so the correction to y=0 is always a real change.
        try { colorSplash.setRotation({ x: 0, y: 1 }); } catch (_) {}
    }

    // Force initial rotation before applying visual/state changes.
    applyRotationFromStencil(colorSplash, target);

    try {
        colorSplash.setProperty("hp4_paint:furniture_color", colorValue);
        if (settings.sound_enabled) {
            dimension.playSound("hp4_paint:spray_can_use", stencilLocation);
        }
        spawnStencilSprayParticle(player, dimension, stencilLocation, item?.typeId, settings.particles_enabled);
    } catch (error) {
    }

    try {
        syncRotationWithStencil(colorSplash, target);
    } catch (error) {
    }
});

world.afterEvents.entityDie.subscribe((event) => {
    const deadEntity = event.deadEntity;
    if (!deadEntity) return;

    if (deadEntity.typeId !== STENCIL_ENTITY_ID) {
        if (deadEntity.typeId === COLOR_SPLASH_WALL_ENTITY_ID) {
            activeColorSplashAutoRotationByEntityId.delete(deadEntity.id);
            activeColorSplashHitboxModeByEntityId.delete(deadEntity.id);
        }
        return;
    }

    const previousState = activeStencilCollisionStateByEntityId.get(deadEntity.id);
    if (previousState) {
        clearPlacedStencilCollision(previousState);
        activeStencilCollisionStateByEntityId.delete(deadEntity.id);
    }

    activeStencilHitboxModeByEntityId.delete(deadEntity.id);
});
