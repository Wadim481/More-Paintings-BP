import { world, EquipmentSlot, MolangVariableMap, system } from "@minecraft/server";

// ============================================================
// brush_paint_fx.js
// Handles paint particle effect when brush (or other tools)
// is used on furniture entities.
//
// variable.rotation di particle diset via MolangVariableMap:
//   0  → furniture facing north/south (rotY 0° / ±180°)
//   90 → furniture facing east/west   (rotY ±90°)
// ============================================================

// Cooldown tracker: prevents duplicate particles from rapid event firing.
// Key = "playerId:entityId", value = game tick when the last particle was spawned.
const _paintCooldown = new Map();
const PAINT_COOLDOWN_TICKS = 5; // ~0.25 s — adjust if needed

// Tools that trigger the paint particle effect
const PAINT_TOOLS = [
    'hp4_paint:brush'
    // Add more tool IDs here in the future
];

// Maps furniture typeId → { p1, p2, vx, vy }
// p1   : ring particle dengan variable.rotation
// p2   : particle kedua, v.x/v.y mengikuti lebar furniture
// vx   : nilai v.x saat furniture hadap south/north (default axis)
// vy   : nilai v.y saat furniture hadap south/north (default axis)
// Saat furniture rotasi 90° (east/west), v.x dan v.y akan ditukar.
const FURNITURE_PARTICLE_MAP = {
    // Display Cases
    //                                      p1                              p2                   vx    vy
    'hp4_paint:easel_stand':        { p1: 'test:light_ring_bottom_yellow',   p2: 'test:hammer_emmit3b', vx: 1.0, vy: 0.5 },
    'hp4_paint:art_chair':          { p1: 'test:light_ring_bottom_yellow',   p2: 'test:hammer_emmit3b', vx: 1.0, vy: 0.5 },
    'hp4_paint:stool':              { p1: 'test:light_ring_bottom_yellow',   p2: 'test:hammer_emmit3b', vx: 1.0, vy: 0.5 },
    'hp4_paint:statue_painting':             { p1: 'test:light_ring_bottom_yellow',   p2: 'test:hammer_emmit3b', vx: 1.0, vy: 0.5 },
    'hp4_paint:display_case':       { p1: 'test:light_ring_bottom_yellow',   p2: 'test:hammer_emmit3b', vx: 1.0, vy: 0.5 },
    'hp4_paint:display_case_wide':  { p1: 'test:light_ring_bottom_yellow3b', p2: 'test:hammer_emmit3b', vx: 2.0, vy: 0.5 },
    'hp4_paint:cabinet':            { p1: 'test:light_ring_bottom_yellow3b', p2: 'test:hammer_emmit3b', vx: 2.0, vy: 0.5 },
    'hp4_paint:display_case_huge':  { p1: 'test:light_ring_bottom_yellow4b', p2: 'test:hammer_emmit3b', vx: 3.0, vy: 1.0 },
    'hp4_paint:display_case_tall':  { p1: 'test:light_ring_bottom_yellow3b', p2: 'test:hammer_emmit3b', vx: 2.0, vy: 0.5 },
    'hp4_paint:display_case_wide2': { p1: 'test:light_ring_bottom_yellow5b', p2: 'test:hammer_emmit3b', vx: 4.0, vy: 0.5 },
    'hp4_paint:display_case_big':   { p1: 'test:light_ring_bottom_yellow3b', p2: 'test:hammer_emmit3b', vx: 2.0, vy: 0.5 },
    // Planters & Vase
    'hp4_paint:round_planter':      { p1: 'test:light_ring_bottom_yellow',   p2: 'test:hammer_emmit3b', vx: 1.0, vy: 0.5 },
    'hp4_paint:large_planter':      { p1: 'test:light_ring_bottom_yellow', p2: 'test:hammer_emmit3b', vx: 2.0, vy: 0.5 },
    'hp4_paint:wide_planter':       { p1: 'test:light_ring_bottom_yellow3b', p2: 'test:hammer_emmit3b', vx: 2.0, vy: 0.5 },
    'hp4_paint:thin_planter':       { p1: 'test:light_ring_bottom_yellow',   p2: 'test:hammer_emmit3b', vx: 1.0, vy: 0.5 },
    'hp4_paint:vase':               { p1: 'test:light_ring_bottom_yellow',   p2: 'test:hammer_emmit3b', vx: 1.0, vy: 0.5 },
    // Windows
    'hp4_paint:window':             { p1: 'test:light_ring_bottom_yellow', p2: 'test:hammer_emmit3b', vx: 2.0, vy: 0.5 },
    'hp4_paint:window_big':         { p1: 'test:light_ring_bottom_yellow3b', p2: 'test:hammer_emmit3b', vx: 2.0, vy: 0.5 },
};

/**
 * Snaps Y rotation to the nearest 90-degree multiple.
 */
function snapRotation(rotY) {
    return Math.round(rotY / 90) * 90;
}

/**
 * Returns the particle rotation value (0 or 90) based on furniture Y-rotation.
 * rotY ±90 → facing east/west  → rotation = 90
 * rotY 0 / ±180 → facing north/south → rotation = 0
 */
function getParticleRotation(snapped) {
    return Math.abs(snapped) % 180 === 90 ? 90 : 0;
}

/**
 * Calculates the world-space offset toward the furniture's front face.
 * Minecraft Y-rotation convention:
 *   rotY =  0   → facing south (+Z)
 *   rotY =  90  → facing west  (-X)
 *   rotY = ±180 → facing north (-Z)
 *   rotY = -90  → facing east  (+X)
 */
function getFrontOffset(snapped, distance = 0.5) {
    const rad = snapped * (Math.PI / 180);
    return {
        dx: -Math.sin(rad) * distance,
        dz:  Math.cos(rad) * distance
    };
}

// ============================================================
// Event: playerInteractWithEntity
// ============================================================
world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const player = event.player;
    const target = event.target;

    // Get item from player's selected slot (more reliable than event.itemStack)
    const equip = player.getComponent('minecraft:equippable');
    const item  = equip ? equip.getEquipment(EquipmentSlot.Mainhand) : event.itemStack;

    // Guard: must be holding a paint tool
    if (!item || !PAINT_TOOLS.includes(item.typeId)) return;

    // Guard: target must be a mapped furniture
    const particleEntry = FURNITURE_PARTICLE_MAP[target.typeId];
    if (!particleEntry || !player.getDynamicProperty(`hp4_paint:particles`)) return;

    // Cooldown guard — prevent duplicate particles from rapid event firing
    const cooldownKey = `${player.id}:${target.id}`;
    const now = system.currentTick;
    if (_paintCooldown.has(cooldownKey) && now - _paintCooldown.get(cooldownKey) < PAINT_COOLDOWN_TICKS) return;
    _paintCooldown.set(cooldownKey, now);

    // Auto-clean the map entry after the cooldown expires to avoid memory leaks
    system.runTimeout(() => { _paintCooldown.delete(cooldownKey); }, PAINT_COOLDOWN_TICKS + 1);

    try {
        const rotY    = target.getRotation().y;
        const snapped = snapRotation(rotY);

        // Set variable.rotation ke 0 atau 90 sesuai orientasi furniture
        const molang = new MolangVariableMap();
        molang.setFloat('variable.rotation', getParticleRotation(snapped));

        // Spawn di tengah furniture, sedikit ke depan
        const { dx, dz } = getFrontOffset(snapped, 0.0);
        const loc = {
            x: target.location.x + dx,
            y: target.location.y + 0.01,
            z: target.location.z + dz
        };

        // v.x dan v.y untuk particle kedua — tukar nilainya jika furniture rotasi 90°
        const xAligned = Math.abs(snapped) % 180 === 90;
        const molang2 = new MolangVariableMap();
        molang2.setFloat('variable.x', xAligned ? particleEntry.vy : particleEntry.vx);
        molang2.setFloat('variable.y', xAligned ? particleEntry.vx : particleEntry.vy);

        // Particle 1: ring dengan variable.rotation
        target.dimension.spawnParticle(particleEntry.p1, loc, molang);
        // Particle 2: efek tambahan dengan v.x / v.y sesuai orientasi
        target.dimension.spawnParticle(particleEntry.p2, loc, molang2);

    } catch (error) {
        console.warn(`[BrushPaintFX] Error: ${error}`);
    }
});
