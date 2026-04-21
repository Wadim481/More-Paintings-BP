import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
//AFANDIv5 - membuat fitur spray can
// Mapping dye colors ke concrete powder, concrete block, spray texture, dan item ID
const dyeColorMap = {
    'minecraft:white_dye':      { concrete: 'minecraft:white_concrete_powder',      concreteBlock: 'minecraft:white_concrete',      wool: 'minecraft:white_wool',      sheepColor: 0,  item: 'hp4_paint:spray_can_white',      icon: 'textures/hp/mp/items/spray_can_white',      displayName: '§fWhite' },
    'minecraft:light_gray_dye': { concrete: 'minecraft:light_gray_concrete_powder', concreteBlock: 'minecraft:light_gray_concrete', wool: 'minecraft:light_gray_wool', sheepColor: 8,  item: 'hp4_paint:spray_can_light_gray', icon: 'textures/hp/mp/items/spray_can_lightgray', displayName: '§7Light Gray' },
    'minecraft:gray_dye':       { concrete: 'minecraft:gray_concrete_powder',       concreteBlock: 'minecraft:gray_concrete',       wool: 'minecraft:gray_wool',       sheepColor: 7,  item: 'hp4_paint:spray_can_gray',       icon: 'textures/hp/mp/items/spray_can_gray',      displayName: '§8Gray' },
    'minecraft:black_dye':      { concrete: 'minecraft:black_concrete_powder',      concreteBlock: 'minecraft:black_concrete',      wool: 'minecraft:black_wool',      sheepColor: 15, item: 'hp4_paint:spray_can_black',      icon: 'textures/hp/mp/items/spray_can_black',     displayName: '§0Black' },
    'minecraft:brown_dye':      { concrete: 'minecraft:brown_concrete_powder',      concreteBlock: 'minecraft:brown_concrete',      wool: 'minecraft:brown_wool',      sheepColor: 12, item: 'hp4_paint:spray_can_brown',      icon: 'textures/hp/mp/items/spray_can_brown',     displayName: '§6Brown' },
    'minecraft:red_dye':        { concrete: 'minecraft:red_concrete_powder',        concreteBlock: 'minecraft:red_concrete',        wool: 'minecraft:red_wool',        sheepColor: 14, item: 'hp4_paint:spray_can_red',        icon: 'textures/hp/mp/items/spray_can_red',       displayName: '§cRed' },
    'minecraft:orange_dye':     { concrete: 'minecraft:orange_concrete_powder',     concreteBlock: 'minecraft:orange_concrete',     wool: 'minecraft:orange_wool',     sheepColor: 1,  item: 'hp4_paint:spray_can_orange',     icon: 'textures/hp/mp/items/spray_can_orange',    displayName: '§6Orange' },
    'minecraft:yellow_dye':     { concrete: 'minecraft:yellow_concrete_powder',     concreteBlock: 'minecraft:yellow_concrete',     wool: 'minecraft:yellow_wool',     sheepColor: 4,  item: 'hp4_paint:spray_can_yellow',     icon: 'textures/hp/mp/items/spray_can_yellow',    displayName: '§eYellow' },
    'minecraft:lime_dye':       { concrete: 'minecraft:lime_concrete_powder',       concreteBlock: 'minecraft:lime_concrete',       wool: 'minecraft:lime_wool',       sheepColor: 5,  item: 'hp4_paint:spray_can_lime',       icon: 'textures/hp/mp/items/spray_can_lime',      displayName: '§aLime' },
    'minecraft:green_dye':      { concrete: 'minecraft:green_concrete_powder',      concreteBlock: 'minecraft:green_concrete',      wool: 'minecraft:green_wool',      sheepColor: 13, item: 'hp4_paint:spray_can_green',      icon: 'textures/hp/mp/items/spray_can_green',     displayName: '§2Green' },
    'minecraft:cyan_dye':       { concrete: 'minecraft:cyan_concrete_powder',       concreteBlock: 'minecraft:cyan_concrete',       wool: 'minecraft:cyan_wool',       sheepColor: 9,  item: 'hp4_paint:spray_can_cyan',       icon: 'textures/hp/mp/items/spray_can_cyan',      displayName: '§bCyan' },
    'minecraft:light_blue_dye': { concrete: 'minecraft:light_blue_concrete_powder', concreteBlock: 'minecraft:light_blue_concrete', wool: 'minecraft:light_blue_wool', sheepColor: 3,  item: 'hp4_paint:spray_can_light_blue', icon: 'textures/hp/mp/items/spray_can_lightblue', displayName: '§9Light Blue' },
    'minecraft:blue_dye':       { concrete: 'minecraft:blue_concrete_powder',       concreteBlock: 'minecraft:blue_concrete',       wool: 'minecraft:blue_wool',       sheepColor: 11, item: 'hp4_paint:spray_can_blue',       icon: 'textures/hp/mp/items/spray_can_blue',      displayName: '§1Blue' },
    'minecraft:purple_dye':     { concrete: 'minecraft:purple_concrete_powder',     concreteBlock: 'minecraft:purple_concrete',     wool: 'minecraft:purple_wool',     sheepColor: 10, item: 'hp4_paint:spray_can_purple',     icon: 'textures/hp/mp/items/spray_can_purple',    displayName: '§5Purple' },
    'minecraft:magenta_dye':    { concrete: 'minecraft:magenta_concrete_powder',    concreteBlock: 'minecraft:magenta_concrete',    wool: 'minecraft:magenta_wool',    sheepColor: 2,  item: 'hp4_paint:spray_can_magenta',    icon: 'textures/hp/mp/items/spray_can_magenta',  displayName: '§dMagenta' },
    'minecraft:pink_dye':       { concrete: 'minecraft:pink_concrete_powder',       concreteBlock: 'minecraft:pink_concrete',       wool: 'minecraft:pink_wool',       sheepColor: 6,  item: 'hp4_paint:spray_can_pink',       icon: 'textures/hp/mp/items/spray_can_pink',      displayName: '§dPink' }
};

// =============================================================
// DATA GRADIENT BRIGHTNESS
// Setiap warna punya 'brighter' (lebih cerah) dan 'darker' (lebih gelap)
// Berdasarkan luminansi perseptual & hubungan warna Minecraft
// =============================================================
const brightnessGradient = {
    //  nama warna       brighter            darker
    'black':       { brighter: 'gray',        darker: null        },
    'gray':        { brighter: 'light_gray',  darker: 'black'     },
    'light_gray':  { brighter: 'white',       darker: 'gray'      },
    'white':       { brighter: null,          darker: 'light_gray'},
    // Warm earth tones
    'brown':       { brighter: 'orange',      darker: 'black'     },
    'red':         { brighter: 'orange',      darker: 'brown'     },
    'orange':      { brighter: 'yellow',      darker: 'red'       },
    'yellow':      { brighter: 'white',       darker: 'orange'    },
    // Greens
    'green':       { brighter: 'lime',        darker: 'black'     },
    'lime':        { brighter: 'yellow',      darker: 'green'     },
    // Blues / Cyans
    'blue':        { brighter: 'cyan',        darker: 'purple'    },
    'cyan':        { brighter: 'light_blue',  darker: 'blue'      },
    'light_blue':  { brighter: 'white',       darker: 'cyan'      },
    // Purples / Pinks
    'purple':      { brighter: 'magenta',     darker: 'blue'      },
    'magenta':     { brighter: 'pink',        darker: 'purple'    },
    'pink':        { brighter: 'white',       darker: 'magenta'   },
};

// Nama tampilan warna untuk pesan
const colorDisplayNames = {
    'black': '§0Black', 'gray': '§8Gray', 'light_gray': '§7Light Gray', 'white': '§fWhite',
    'brown': '§6Brown', 'red': '§cRed', 'orange': '§6Orange', 'yellow': '§eYellow',
    'green': '§2Green', 'lime': '§aLime',
    'blue': '§1Blue', 'cyan': '§bCyan', 'light_blue': '§9Light Blue',
    'purple': '§5Purple', 'magenta': '§dMagenta', 'pink': '§dPink',
};

// Ekstrak nama warna dari typeId blok
// Contoh: 'minecraft:red_wool' → 'red', 'minecraft:light_gray_concrete_powder' → 'light_gray'
function extractColorFromBlock(typeId) {
    const id = typeId.replace('minecraft:', '');
    if (id.endsWith('_concrete_powder')) return id.slice(0, -'_concrete_powder'.length);
    if (id.endsWith('_concrete'))        return id.slice(0, -'_concrete'.length);
    if (id.endsWith('_wool'))            return id.slice(0, -'_wool'.length);
    return null;
}

// Terapkan perubahan brightness ke blok
// direction: 'brighter' | 'darker'
function applyBrightness(block, direction) {
    const colorName = extractColorFromBlock(block.typeId);
    if (!colorName || !brightnessGradient[colorName]) return 'no_color';

    const targetColor = brightnessGradient[colorName][direction];
    if (!targetColor) return 'at_limit'; // sudah paling cerah/gelap

    const id = block.typeId.replace('minecraft:', '');
    let suffix;
    if (id.endsWith('_concrete_powder')) suffix = '_concrete_powder';
    else if (id.endsWith('_concrete'))   suffix = '_concrete';
    else if (id.endsWith('_wool'))       suffix = '_wool';
    else return 'no_color';

    block.setType(`minecraft:${targetColor}${suffix}`);
    return targetColor; // nama warna hasil
}

// ID item brightness spray can
const SPRAY_BRIGHTEN = 'hp4_paint:spray_can_brightness'; // item sudah ada
const SPRAY_DARKEN   = 'hp4_paint:spray_can_darken';     // item baru

// Konfigurasi penggunaan spray can
const MAX_USES     = 256; // maksimal total penggunaan spray can
const USES_PER_DYE = 2;  // setiap 1 dye mengisi 2 penggunaan

// Cek apakah player punya item tertentu
function hasItem(player, typeId) {
    const inv = player.getComponent('minecraft:inventory').container;
    for (let i = 0; i < inv.size; i++) {
        const slot = inv.getItem(i);
        if (slot && slot.typeId === typeId) return true;
    }
    return false;
}

// Konsumsi 1 item dari inventory
function consumeItem(player, typeId) {
    const inv = player.getComponent('minecraft:inventory').container;
    for (let i = 0; i < inv.size; i++) {
        const slot = inv.getItem(i);
        if (slot && slot.typeId === typeId) {
            if (slot.amount > 1) { slot.amount--; inv.setItem(i, slot); }
            else inv.setItem(i, undefined);
            return true;
        }
    }
    return false;
}

// =============================================================
// SHAPE SYSTEM — ukuran & pola area yang di-spray
// =============================================================

const MIN_BRUSH_SIZE = 1;
const MAX_BRUSH_SIZE = 16;
const LEGACY_SPRAY_SETTINGS_LORE_PREFIX = '[SCFG]';
const SPRAY_SETTINGS_LORE_PREFIX = 'Heropixel Games';
const SPRAY_SETTINGS_DISPLAY_PREFIX = '[Spray]';
const DEFAULT_SHAPE_SETTINGS = Object.freeze({ shape: 'square', size: MIN_BRUSH_SIZE });
const SHAPE_LORE_LABELS = {
    square: 'Square',
    hollow_square: 'Hollow Square',
    circle: 'Circle',
    hollow_circle: 'Hollow Circle',
    star: 'Star',
    abstract: 'Abstract',
    fill: 'Fill',
    line: 'Line'
};

function stripFormattingCodes(str) {
    return (str ?? '').replace(/§./g, '');
}

function normalizeLoreLine(str) {
    return stripFormattingCodes(str).trim();
}

function clampBrushSize(size) {
    const n = Number(size);
    if (!Number.isFinite(n)) return MIN_BRUSH_SIZE;
    return Math.min(MAX_BRUSH_SIZE, Math.max(MIN_BRUSH_SIZE, Math.round(n)));
}

function readShapeSettingsFromItem(itemStack) {
    if (!itemStack) return { ...DEFAULT_SHAPE_SETTINGS };
    const lore = itemStack.getLore?.() ?? [];
    const line = lore.find(l => {
        const plain = normalizeLoreLine(l);
        return plain.startsWith(SPRAY_SETTINGS_LORE_PREFIX) || plain.startsWith(LEGACY_SPRAY_SETTINGS_LORE_PREFIX);
    });
    if (!line) return { ...DEFAULT_SHAPE_SETTINGS };

    const normalized = normalizeLoreLine(line);
    const isLegacy = normalized.startsWith(LEGACY_SPRAY_SETTINGS_LORE_PREFIX);
    const prefixLen = isLegacy ? LEGACY_SPRAY_SETTINGS_LORE_PREFIX.length : SPRAY_SETTINGS_LORE_PREFIX.length;
    const payload = normalized.slice(prefixLen).trim();
    const pairs = payload.split(';').map(x => x.trim()).filter(Boolean);
    const data = {};
    for (const p of pairs) {
        const [k, ...rest] = p.split('=');
        if (!k || rest.length === 0) continue;
        data[k.trim()] = rest.join('=').trim();
    }

    const shapeFromLore = data.shape ?? data.s;
    const sizeFromLore = data.size ?? data.z;

    const shape = typeof shapeFromLore === 'string' && shapeFromLore.length > 0
        ? shapeFromLore
        : DEFAULT_SHAPE_SETTINGS.shape;
    const size = clampBrushSize(sizeFromLore ?? DEFAULT_SHAPE_SETTINGS.size);
    return { shape, size };
}

function writeShapeSettingsToItem(itemStack, settings) {
    if (!itemStack) return;
    const next = {
        shape: settings?.shape ?? DEFAULT_SHAPE_SETTINGS.shape,
        size: clampBrushSize(settings?.size ?? DEFAULT_SHAPE_SETTINGS.size)
    };
    const lore = (itemStack.getLore?.() ?? []).filter(l => {
        const plain = normalizeLoreLine(l);
        return !plain.startsWith(SPRAY_SETTINGS_LORE_PREFIX)
            && !plain.startsWith(LEGACY_SPRAY_SETTINGS_LORE_PREFIX)
            && !plain.startsWith(SPRAY_SETTINGS_DISPLAY_PREFIX);
    });

    const shapeLabel = SHAPE_LORE_LABELS[next.shape] ?? next.shape;
    lore.push(`§3${SPRAY_SETTINGS_DISPLAY_PREFIX} ${shapeLabel} ${next.size}x${next.size}`);
    lore.push(`§8${SPRAY_SETTINGS_LORE_PREFIX} s=${next.shape};z=${next.size}`);
    itemStack.setLore?.(lore);
}

function copyShapeSettings(sourceItem, targetItem) {
    const settings = readShapeSettingsFromItem(sourceItem);
    writeShapeSettingsToItem(targetItem, settings);
}

function getShapeSettings(player, sprayCanSlot) {
    const inv = player.getComponent('minecraft:inventory').container;
    const item = inv.getItem(sprayCanSlot);
    return readShapeSettingsFromItem(item);
}

function setShapeSettings(player, sprayCanSlot, settings) {
    const inv = player.getComponent('minecraft:inventory').container;
    const item = inv.getItem(sprayCanSlot);
    if (!item) return;
    writeShapeSettingsToItem(item, settings);
    inv.setItem(sprayCanSlot, item);
}

function getActiveSpraySlot(player, typeId) {
    const inv = player.getComponent('minecraft:inventory').container;
    const selectedSlot = player.selectedSlotIndex;
    if (selectedSlot >= 0 && selectedSlot < inv.size) {
        const selectedItem = inv.getItem(selectedSlot);
        if (selectedItem && selectedItem.typeId === typeId) return selectedSlot;
    }
    for (let i = 0; i < inv.size; i++) {
        const slotItem = inv.getItem(i);
        if (slotItem && slotItem.typeId === typeId) return i;
    }
    return -1;
}

function getShapeBounds(size) {
    const clampedSize = clampBrushSize(size);
    const min = -Math.floor((clampedSize - 1) / 2);
    const max = min + clampedSize - 1;
    return {
        min,
        max,
        center: (min + max) / 2,
        radius: clampedSize / 2
    };
}

function getSheepSprayRadius(size) {
    const n = clampBrushSize(size);
    if (n <= 1) return 0;
    return Math.floor((n - 1) / 2) * 3;
}

// Generate pola abstrak acak (splatter/cat semprot) — berbeda setiap pemakaian
// Menggunakan BFS random growth + drip luar untuk hasil organik & bervariasi
function generateAbstractOffsets(size) {
    const clampedSize = clampBrushSize(size);
    if (clampedSize <= 1) return [[0, 0]];

    const radius = Math.max(1, clampedSize / 2);
    const minTarget = Math.max(4, Math.floor(clampedSize * clampedSize * 0.22));
    const maxTarget = Math.max(minTarget + 2, Math.floor(clampedSize * clampedSize * 0.38));
    const target = minTarget + Math.floor(Math.random() * (maxTarget - minTarget + 1));
    const maxDrips = Math.min(8, Math.max(1, Math.floor(clampedSize / 4)));

    const offsets = [];
    const visited = new Set();
    const dirs8 = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];

    // BFS acak dari titik tengah — pertumbuhan organik
    const queue = [[0, 0]];
    visited.add('0,0');

    while (offsets.length < target && queue.length > 0) {
        // Ambil elemen acak dari queue (bukan selalu depan) → bentuk tidak rata
        const idx = Math.floor(Math.random() * Math.min(queue.length, 8));
        const [u, v] = queue.splice(idx, 1)[0];

        // Probabilitas penerimaan menurun mendekati tepi → pinggiran tidak rata
        const dist = Math.sqrt(u * u + v * v);
        const prob = 0.92 - (dist / radius) * 0.45;
        if (Math.random() >= prob) continue;

        offsets.push([u, v]);

        // Tambahkan tetangga dalam urutan acak untuk arah pertumbuhan tak terduga
        const shuffled = dirs8.slice().sort(() => Math.random() - 0.5);
        for (const [du, dv] of shuffled) {
            const nu = u + du, nv = v + dv;
            const key = `${nu},${nv}`;
            if (!visited.has(key) && Math.sqrt(nu * nu + nv * nv) <= radius) {
                visited.add(key);
                queue.push([nu, nv]);
            }
        }
    }

    // Pastikan titik tengah selalu tercat
    if (!offsets.some(([u, v]) => u === 0 && v === 0)) offsets.unshift([0, 0]);

    // Tambahkan 'drip' — titik/cluster kecil di luar blob utama
    const numDrips = Math.floor(Math.random() * (maxDrips + 1));
    for (let i = 0; i < numDrips; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dripDist = radius + 0.6 + Math.random() * 1.8;
        const du = Math.round(Math.cos(angle) * dripDist);
        const dv = Math.round(Math.sin(angle) * dripDist);
        const key = `${du},${dv}`;
        if (!visited.has(key)) {
            offsets.push([du, dv]);
            visited.add(key);
            // Drip bisa punya 1 blok satelit kecil di sekitarnya
            if (Math.random() < 0.45) {
                const [sdu, sdv] = dirs8[Math.floor(Math.random() * 8)];
                const sk = `${du + sdu},${dv + sdv}`;
                if (!visited.has(sk)) {
                    offsets.push([du + sdu, dv + sdv]);
                    visited.add(sk);
                }
            }
        }
    }

    return offsets;
}

// Hitung daftar offset 2D berdasarkan shape & size
function getAffectedOffsets(shape, size) {
    const clampedSize = clampBrushSize(size);
    const { min, max, center, radius } = getShapeBounds(clampedSize);
    const offsets = [];
    if (shape === 'circle') {
        for (let u = min; u <= max; u++)
            for (let v = min; v <= max; v++) {
                const dist = Math.hypot(u - center, v - center);
                if (dist <= radius) offsets.push([u, v]);
            }
    } else if (shape === 'square') {
        for (let u = min; u <= max; u++)
            for (let v = min; v <= max; v++)
                offsets.push([u, v]);
    } else if (shape === 'hollow_square') {
        if (clampedSize <= 1) {
            offsets.push([0, 0]);
        } else {
            for (let u = min; u <= max; u++)
                for (let v = min; v <= max; v++)
                    if (u === min || u === max || v === min || v === max)
                        offsets.push([u, v]);
        }
    } else if (shape === 'star') {
        for (let u = min; u <= max; u++)
            for (let v = min; v <= max; v++) {
                const du2 = (2 * u) - (min + max);
                const dv2 = (2 * v) - (min + max);
                const onAxis = Math.abs(du2) <= 1 || Math.abs(dv2) <= 1;
                const onDiag = clampedSize >= 3 && Math.abs(Math.abs(du2) - Math.abs(dv2)) <= 1;
                if (onAxis || onDiag)
                    offsets.push([u, v]);
            }
    } else if (shape === 'hollow_circle') {
        if (clampedSize <= 1) {
            offsets.push([0, 0]);
        } else {
            for (let u = min - 1; u <= max + 1; u++)
                for (let v = min - 1; v <= max + 1; v++) {
                    const dist = Math.hypot(u - center, v - center);
                    if (Math.abs(dist - radius) <= 0.85) offsets.push([u, v]);
                }
        }
    } else if (shape === 'abstract') {
        return generateAbstractOffsets(clampedSize);
    }
    return offsets;
}

// Konversi offset 2D [u,v] → delta 3D berdasarkan face blok yang terkena
// Up/Down (lantai/langit) → u=X, v=Z (horizontal)
// North/South (dinding Z) → u=X, v=Y (vertikal)
// East/West (dinding X)  → u=Z, v=Y (vertikal)
function offsetToWorld(face, u, v) {
    if (face === mc.Direction.Up || face === mc.Direction.Down) {
        return { x: u, y: 0, z: v };
    } else if (face === mc.Direction.North || face === mc.Direction.South) {
        return { x: u, y: v, z: 0 };
    } else { // East / West
        return { x: 0, y: v, z: u };
    }
}

// Terapkan fungsi ke semua blok dalam area sesuai shape/size/face
// applyFn(block): boolean — return true jika blok berhasil diubah
// Mengembalikan jumlah blok yang berhasil diubah
function applyToShape(dimension, originBlock, face, shape, size, applyFn) {
    const offsets = getAffectedOffsets(shape, size);
    let count = 0;
    for (const [u, v] of offsets) {
        const d = offsetToWorld(face, u, v);
        try {
            const b = dimension.getBlock({
                x: originBlock.location.x + d.x,
                y: originBlock.location.y + d.y,
                z: originBlock.location.z + d.z
            });
            if (b && applyFn(b)) count++;
        } catch (_) { /* di luar batas dunia */ }
    }
    return count;
}

// Konversi lokasi world ke koordinat UV pada face tertentu
function worldToFaceUV(loc, face) {
    if (face === mc.Direction.Up || face === mc.Direction.Down)     return [loc.x, loc.z];
    if (face === mc.Direction.North || face === mc.Direction.South) return [loc.x, loc.y];
    return [loc.z, loc.y]; // East / West
}

// Algoritma garis Bresenham dalam 2D (u/v)
function bresenhamLine(u1, v1, u2, v2) {
    const points = [];
    const du =  Math.abs(u2 - u1);
    const dv = -Math.abs(v2 - v1);
    const su = u1 < u2 ? 1 : -1;
    const sv = v1 < v2 ? 1 : -1;
    let err = du + dv;
    let u = u1, v = v1;
    while (true) {
        points.push([u, v]);
        if (u === u2 && v === v2) break;
        const e2 = 2 * err;
        if (e2 >= dv) { err += dv; u += su; }
        if (e2 <= du) { err += du; v += sv; }
    }
    return points;
}

// Flood fill — BFS ke blok sejenis pada bidang face
function applyFill(dimension, originBlock, face, size, applyFn) {
    const clampedSize = clampBrushSize(size);
    const maxBlocks = clampedSize * clampedSize;
    const targetType = originBlock.typeId;
    const visited = new Set();
    const queue = [[0, 0]];
    visited.add('0,0');
    let count = 0;
    while (queue.length > 0 && count < maxBlocks) {
        const [u, v] = queue.shift();
        const d = offsetToWorld(face, u, v);
        try {
            const b = dimension.getBlock({
                x: originBlock.location.x + d.x,
                y: originBlock.location.y + d.y,
                z: originBlock.location.z + d.z
            });
            if (!b || b.typeId !== targetType) continue;
            if (applyFn(b)) count++;
            for (const [du, dv] of [[1,0],[-1,0],[0,1],[0,-1]]) {
                const nu = u + du, nv = v + dv;
                const key = `${nu},${nv}`;
                if (!visited.has(key)) { visited.add(key); queue.push([nu, nv]); }
            }
        } catch (_) {}
    }
    return count;
}

// State titik awal garis per player
const playerLineStart = new Map();

// Alat garis — spray pertama set titik awal, spray kedua gambar garis Bresenham
// Mengembalikan -1 jika hanya set titik awal (belum melukis blok)
function applyLine(player, dimension, originBlock, face, applyFn) {
    const start  = playerLineStart.get(player.id);
    const endLoc = originBlock.location;

    if (!start || start.face !== face) {
        playerLineStart.set(player.id, { x: endLoc.x, y: endLoc.y, z: endLoc.z, face });
        // Cat blok titik pertama sekaligus
        let painted = 0;
        try { if (applyFn(originBlock)) painted = 1; } catch (_) {}
        // Jadwalkan pesan setelah tick ini agar tidak tertimpa update action bar durability
        mc.system.run(() => {
            player.onScreenDisplay.setActionBar('§eLine start set! Spray again for end point.');
        });
        return painted; // konsumsi durability jika blok berhasil dicat
    }

    playerLineStart.delete(player.id);
    const [u1, v1] = worldToFaceUV(start,  face);
    const [u2, v2] = worldToFaceUV(endLoc, face);
    const linePoints = bresenhamLine(u1, v1, u2, v2);

    let count = 0;
    // Lewati titik pertama (start point) — sudah dicat saat klik pertama
    for (const [u, v] of linePoints.slice(1)) {
        let bx, by, bz;
        if (face === mc.Direction.Up || face === mc.Direction.Down) {
            bx = u; by = start.y; bz = v;
        } else if (face === mc.Direction.North || face === mc.Direction.South) {
            bx = u; by = v; bz = start.z;
        } else { // East / West
            bx = start.x; by = v; bz = u;
        }
        try {
            const b = dimension.getBlock({ x: bx, y: by, z: bz });
            if (b && applyFn(b)) count++;
        } catch (_) {}
    }
    return count;
}

// Dispatcher — pilih metode berdasarkan shape
// Return: jumlah blok diubah, atau -1 jika line start baru dikunci
function applySprayToBlocks(player, dimension, originBlock, face, shape, size, applyFn) {
    if (shape === 'fill') return applyFill(dimension, originBlock, face, size, applyFn);
    if (shape === 'line') return applyLine(player, dimension, originBlock, face, applyFn);
    return applyToShape(dimension, originBlock, face, shape, size, applyFn);
}

// Mapping sheep color index ↔ nama warna (untuk brightness)
const sheepColorIndexToName = {
    0: 'white', 1: 'orange', 2: 'magenta', 3: 'light_blue',
    4: 'yellow', 5: 'lime',  6: 'pink',   7: 'gray',
    8: 'light_gray', 9: 'cyan', 10: 'purple', 11: 'blue',
    12: 'brown', 13: 'green', 14: 'red', 15: 'black'
};
const colorNameToSheepIndex = Object.fromEntries(
    Object.entries(sheepColorIndexToName).map(([k, v]) => [v, Number(k)])
);

// Terapkan brightness ke satu sheep, return true jika berhasil
function applyBrightnessToSheep(sheep, direction) {
    const colorComp = sheep.getComponent('minecraft:color');
    if (colorComp === undefined) return false;
    const currentName = sheepColorIndexToName[colorComp.value];
    if (!currentName || !brightnessGradient[currentName]) return false;
    const targetName = brightnessGradient[currentName][direction];
    if (!targetName) return 'at_limit';
    const targetIdx = colorNameToSheepIndex[targetName];
    if (targetIdx === undefined) return false;
    colorComp.value = targetIdx;
    return true;
}

// Dapatkan semua sheep dalam radius (blok) dari posisi pusat
function getSheepInRadius(dimension, center, radius) {
    if (radius <= 0) return [];
    return dimension.getEntities({
        type: 'minecraft:sheep',
        location: center,
        maxDistance: radius
    });
}

// Mapping dari item spray can berwarna ke dye type
const sprayCanToDye = {};
Object.keys(dyeColorMap).forEach(dyeType => {
    sprayCanToDye[dyeColorMap[dyeType].item] = dyeType;
});

function extractColorFromDyeType(dyeTypeId) {
    return dyeTypeId.replace('minecraft:', '').replace(/_dye$/, '');
}

const sprayCanParticleByItem = {};
Object.entries(sprayCanToDye).forEach(([sprayItemId, dyeTypeId]) => {
    const colorName = extractColorFromDyeType(dyeTypeId);
    sprayCanParticleByItem[sprayItemId] = `hp4_paint:spray_${colorName}`;
});

function getFrontRightSprayLocation(player) {
    const view = player.getViewDirection();
    let forwardX = view.x;
    let forwardY = view.y;
    let forwardZ = view.z;
    let len = Math.hypot(forwardX, forwardY, forwardZ);
    if (len < 0.0001) {
        forwardX = 0;
        forwardY = 0;
        forwardZ = 1;
        len = 1;
    }
    forwardX /= len;
    forwardY /= len;
    forwardZ /= len;

    // Right vector projected on XZ plane, with fallback for near-vertical look.
    let rightX = -forwardZ;
    let rightZ = forwardX;
    let rightLen = Math.hypot(rightX, rightZ);
    if (rightLen < 0.0001) {
        rightX = 1;
        rightZ = 0;
        rightLen = 1;
    }
    rightX /= rightLen;
    rightZ /= rightLen;

    const base = player.location;
    return {
        x: base.x + (forwardX * 1.5) + (rightX * 0.3),
        y: base.y + 1.3 + (forwardY * 1.5),
        z: base.z + (forwardZ * 1.5) + (rightZ * 0.3)
    };
}

function spawnSprayParticleAtBlock(player, dimension, blockLocation, particleId) {
    if (!player || !particleId || !dimension || !blockLocation) return;
    try {
        const frontRight = getFrontRightSprayLocation(player);
        dimension.spawnParticle(particleId, {
            x: blockLocation.x + 0.5,
            y: blockLocation.y + 0.6,
            z: blockLocation.z + 0.5
        });
        dimension.spawnParticle(particleId, frontRight);
    } catch (_) {
        // Ignore invalid particle identifier or transient engine errors.
    }
}

function spawnSprayParticleAtEntity(player, dimension, entityLocation, particleId) {
    if (!player || !particleId || !dimension || !entityLocation) return;
    try {
        const frontRight = getFrontRightSprayLocation(player);
        dimension.spawnParticle(particleId, {
            x: entityLocation.x,
            y: entityLocation.y + 1.0,
            z: entityLocation.z
        });
        dimension.spawnParticle(particleId, frontRight);
    } catch (_) {
        // Ignore invalid particle identifier or transient engine errors.
    }
}

// Fungsi untuk mendapatkan dye yang ada di inventory
function getAvailableDyes(player) {
    const inventory = player.getComponent('minecraft:inventory').container;
    const availableDyes = [];
    
    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item && dyeColorMap[item.typeId]) {
            if (!availableDyes.find(d => d.typeId === item.typeId)) {
                availableDyes.push({
                    typeId: item.typeId,
                    color: dyeColorMap[item.typeId]
                });
            }
        }
    }
    
    return availableDyes;
}

// Fungsi untuk mengurangi dye dari inventory
function consumeDye(player, dyeTypeId) {
    const inventory = player.getComponent('minecraft:inventory').container;
    
    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item && item.typeId === dyeTypeId) {
            if (item.amount > 1) {
                item.amount--;
                inventory.setItem(i, item);
            } else {
                inventory.setItem(i, undefined);
            }
            return true;
        }
    }
    return false;
}

// Hitung total jumlah dye tertentu di inventory (gabungkan semua stack)
function getDyeCount(player, typeId) {
    const inv = player.getComponent('minecraft:inventory').container;
    let total = 0;
    for (let i = 0; i < inv.size; i++) {
        const slot = inv.getItem(i);
        if (slot && slot.typeId === typeId) total += slot.amount;
    }
    return total;
}

// Konsumsi sejumlah dye dari inventory (bisa mengambil dari beberapa stack)
function consumeMultipleDye(player, typeId, amount) {
    const inv = player.getComponent('minecraft:inventory').container;
    let remaining = amount;
    for (let i = 0; i < inv.size && remaining > 0; i++) {
        const slot = inv.getItem(i);
        if (slot && slot.typeId === typeId) {
            const take = Math.min(slot.amount, remaining);
            if (slot.amount - take === 0) inv.setItem(i, undefined);
            else { slot.amount -= take; inv.setItem(i, slot); }
            remaining -= take;
        }
    }
    return remaining === 0;
}

// Strip §x color codes from string (for dropdown labels)
function stripCodes(str) { return str.replace(/§./g, ''); }

// Helper: cek spray can setting player
function getPlayerSpraySetting(player, settingKey) {
    const stored = player?.getDynamicProperty?.("hp4_paint:spray_settings");
    if (!stored) {
        // Default jika belum ada setting
        const defaults = {
            spray_to_sheep: true,
            sound_enabled: true,
            particles_enabled: true,
            spray_to_stencil: true,
            preview_shape: false
        };
        return defaults[settingKey] ?? true;
    }
    try {
        const settings = JSON.parse(stored);
        return settings[settingKey] !== undefined ? settings[settingKey] : true;
    } catch (_) {
        return true;
    }
}

// Main menu UI — entry point when sneak + use any spray can
function openMainUI(player, sprayCanSlot) {
    if (uiOpenPlayers.has(player.id)) return;
    uiOpenPlayers.add(player.id);

    const inv = player.getComponent('minecraft:inventory').container;
    const currentItem = inv.getItem(sprayCanSlot);
    const isLoaded = currentItem && currentItem.typeId !== 'hp4_paint:spray_can_tool';

    const { shape, size } = getShapeSettings(player, sprayCanSlot);
    const sizeLabel  = `${size}x${size}`;

    const form = new ui.ActionFormData()
        .title('§0§l Spray Can')
        .body(
            
            `§7Shape: §e${shape}  §7Size: §e${sizeLabel}\n` 
            
        )
        .button('§0 Color', 'textures/hp/mp/items/variant_paint_bottle')
        .button('§0 Shape', 'textures/hp/mp/items/settings_gear')
        .button('§0 Settings', 'textures/hp/mp/items/settings_gear');

    if (isLoaded) {
        form.button('§c§l Empty Spray Can', 'textures/hp/mp/items/color_bucket');
    }

    form.show(player).then(response => {
        uiOpenPlayers.delete(player.id);
        if (response.canceled) return;
        if (response.selection === 0) openColorPageUI(player, sprayCanSlot);
        else if (response.selection === 1) openShapePageUI(player, sprayCanSlot);
        else if (response.selection === 2) openSpraySettingsUI(player);
        else if (response.selection === 3 && isLoaded) {
            // Confirm empty
            new ui.MessageFormData()
                .title('§0 Empty Spray Can')
                .body('Are you sure you want to empty the spray can?\n§cThis cannot be undone.')
                .button1('§4Yes, empty it')
                .button2('§0Cancel')
                .show(player).then(confirm => {
                    if (confirm.canceled || confirm.selection === 1) {
                        openMainUI(player, sprayCanSlot);
                        return;
                    }
                    const emptied = new mc.ItemStack('hp4_paint:spray_can_tool', 1);
                    copyShapeSettings(currentItem, emptied);
                    inv.setItem(sprayCanSlot, emptied);
                    player.sendMessage('§eSpray Can emptied.');
                    player.playSound('random.break');
                });
        }
    });
}

// Color page — step 1: amount slider; step 2: color buttons
function openColorPageUI(player, sprayCanSlot) {
    const isCreative = player.getGameMode() === mc.GameMode.creative;
    const availableDyes = getAvailableDyes(player);
    const hasGlowDust   = isCreative || hasItem(player, 'minecraft:glowstone_dust');

    // Di creative, tampilkan semua warna; di survival harus punya dye
    const allDyes = Object.keys(dyeColorMap).map(typeId => ({
        typeId,
        color: dyeColorMap[typeId]
    }));
    const displayDyes = isCreative ? allDyes : availableDyes;

    if (displayDyes.length === 0 && !hasGlowDust) {
        player.sendMessage('§cYou need dye or glowstone dust in your inventory!');
        openMainUI(player, sprayCanSlot);
        return;
    }

    // Count glowstone dust
    let dustCount = 0;
    if (isCreative) {
        dustCount = Math.floor(MAX_USES / USES_PER_DYE); // simulasi unlimited
    } else if (hasGlowDust) {
        const inv = player.getComponent('minecraft:inventory').container;
        for (let i = 0; i < inv.size; i++) {
            const s = inv.getItem(i);
            if (s && s.typeId === 'minecraft:glowstone_dust') dustCount += s.amount;
        }
    }

    const maxSlider = Math.max(1, Math.floor(MAX_USES / USES_PER_DYE));

    // Step 1: color buttons
    const entries = [];
    const colorForm = new ui.ActionFormData()
        .title('§l§0Select Color')
        .body(isCreative
            ? `§bCreative Mode §7— All colors available, no items consumed.`
            : `§7Pick a color, then set the amount.`
        );

    displayDyes.forEach(dye => {
        const count = isCreative
            ? maxSlider
            : getDyeCount(player, dye.typeId);
        const countLabel = isCreative ? '∞' : `${count}x`;
        colorForm.button(`${dye.color.displayName}§0§o (${countLabel})`, dye.color.icon);
        entries.push({ type: 'color', dye });
    });

    // Brightness: tampilkan di creative selalu, di survival hanya jika punya glowstone
    if (isCreative || hasGlowDust) {
        const dustLabel = isCreative ? '∞' : `${dustCount}x`;
        colorForm.button(`§e§lBrighten§r §0§o(${dustLabel})`, 'textures/hp/mp/items/spray_can_white');
        entries.push({ type: 'brightness', direction: 'brighter' });
        colorForm.button(`§8§lDarken§r §0§o(${dustLabel})`, 'textures/hp/mp/items/spray_can_black');
        entries.push({ type: 'brightness', direction: 'darker' });
    }

    colorForm.show(player).then(colorResp => {
        if (colorResp.canceled) { mc.system.run(() => openMainUI(player, sprayCanSlot)); return; }

        const entry = entries[colorResp.selection];

        // Tentukan stok untuk slider
        const stockMax = isCreative
            ? maxSlider
            : (entry.type === 'brightness'
                ? dustCount
                : getDyeCount(player, entry.dye.typeId));
        const sliderMax = Math.min(maxSlider, stockMax);

        if (!isCreative && sliderMax === 0) {
            player.sendMessage('§cNot enough items in inventory!');
            return;
        }

        // Step 2: amount slider
        const entryLabel = entry.type === 'brightness'
            ? (entry.direction === 'brighter' ? '§eBrighten' : '§8Darken')
            : entry.dye.color.displayName;

        const sliderNote = isCreative
            ? `§bCreative: items won't be consumed.\namount to load §e`
            : `§7${entryLabel}§r  (1 item = ${USES_PER_DYE} uses)\namount dye you want to use §e`;

        new ui.ModalFormData()
            .title(`§l§0Amount`)
            .slider(sliderNote, 1, sliderMax, 1, 1)
            .show(player).then(sliderResp => {
                if (sliderResp.canceled) { mc.system.run(() => openColorPageUI(player, sprayCanSlot)); return; }

                const amount    = Math.round(sliderResp.formValues[0]);
                const inventory = player.getComponent('minecraft:inventory').container;

                if (entry.type === 'brightness') {
                    const uses     = Math.min(amount * USES_PER_DYE, MAX_USES);
                    const startDmg = MAX_USES - uses;

                    // Hanya konsumsi glowstone di survival
                    const canProceed = isCreative || consumeMultipleDye(player, 'minecraft:glowstone_dust', amount);

                    if (canProceed) {
                        const brightnessItem = entry.direction === 'brighter' ? SPRAY_BRIGHTEN : SPRAY_DARKEN;
                        const newItem = new mc.ItemStack(brightnessItem, 1);
                        copyShapeSettings(inventory.getItem(sprayCanSlot), newItem);
                        const durComp = newItem.getComponent('minecraft:durability');
                        if (durComp) durComp.damage = startDmg;
                        inventory.setItem(sprayCanSlot, newItem);
                        const label = entry.direction === 'brighter' ? '§eBrighten' : '§8Darken';
                        player.sendMessage(`§aSpray Can set to ${label}§a mode! §7(${uses} uses)`);
                        player.playSound('random.orb');
                    } else {
                        player.sendMessage('§cFailed to consume glowstone dust!');
                    }
                } else {
                    // Color dye
                    const dyeEntry = entry.dye;
                    const uses     = Math.min(amount * USES_PER_DYE, MAX_USES);
                    const startDmg = MAX_USES - uses;

                    // Hanya konsumsi dye di survival
                    const canProceed = isCreative || consumeMultipleDye(player, dyeEntry.typeId, amount);

                    if (canProceed) {
                        const coloredSprayCan = new mc.ItemStack(dyeEntry.color.item, 1);
                        copyShapeSettings(inventory.getItem(sprayCanSlot), coloredSprayCan);
                        const durComp = coloredSprayCan.getComponent('minecraft:durability');
                        if (durComp) durComp.damage = startDmg;
                        inventory.setItem(sprayCanSlot, coloredSprayCan);
                        player.sendMessage(`§aSpray Can ${dyeEntry.color.displayName}§a ready! §7(${uses} uses)`);
                        player.playSound('random.orb');
                    } else {
                        player.sendMessage(`§cNo ${dyeEntry.color.displayName}§c dye in inventory!`);
                    }
                }
            }); // end sliderForm.show
    }); // end colorForm.show
}

// Shape page — shape and size in a single ModalFormData (renamed from openSettingsPageUI)
function openShapePageUI(player, sprayCanSlot) {
    const { shape, size } = getShapeSettings(player, sprayCanSlot);
    const shapeOptions = ['Square', 'Hollow Square', 'Circle', 'Hollow Circle', 'Star', 'Abstract', 'Fill', 'Line'];
    const shapeKeys    = ['square', 'hollow_square', 'circle', 'hollow_circle', 'star', 'abstract', 'fill', 'line'];
    const shapeIndex   = Math.max(0, shapeKeys.indexOf(shape));

    const form = new ui.ModalFormData()
        .title('§0Shape Settings')
        .dropdown('§7Shape:', shapeOptions, shapeIndex)
        .slider('§7Size (Line: ignored)', MIN_BRUSH_SIZE, MAX_BRUSH_SIZE, 1, clampBrushSize(size));

    form.show(player).then(response => {
        if (response.canceled) { openMainUI(player, sprayCanSlot); return; }

        const newShape = shapeKeys[response.formValues[0]];
        const newSize  = clampBrushSize(response.formValues[1]);
        setShapeSettings(player, sprayCanSlot, { shape: newShape, size: newSize });

        const sl = SHAPE_LORE_LABELS[newShape] ?? newShape;
        const szl = `${newSize}x${newSize}`;
        player.sendMessage(`§aShape saved! §7Shape: §e${sl}§7  Size: §e${szl}`);
        player.playSound('random.orb');
        openMainUI(player, sprayCanSlot);
    });
}

// New comprehensive spray can settings menu
function openSpraySettingsUI(player) {
    if (uiOpenPlayers.has(player.id)) return;
    uiOpenPlayers.add(player.id);

    const settings = getSprayCanSettings(player);
    const blockFilter = getEffectiveBlockFilter(settings);

    const currentTrigger = getTriggerSetting(player);
    const triggerOptions = [
        'Right-click Spray Table',
        'Right-click Crafting Table',
        'Sneak + Right-click',
        'Left-click',
    ];
    const triggerKeys  = ['spray_table', 'crafting_table', 'sneak_use', 'left_click'];
    const triggerIndex = Math.max(0, triggerKeys.indexOf(currentTrigger));

    const form = new ui.ModalFormData()
        .title('§0Spray Settings')
        .toggle('§7Spray to Stencil', settings.spray_to_stencil)
        .toggle('§7Particles', settings.particles_enabled)
        .toggle('§7Sound Effect', settings.sound_enabled)
        .toggle('§7Spray to Sheep', settings.spray_to_sheep)
        .toggle('§7SpraySand', blockFilter.sand)
        .toggle('§7SprayConcrete Powder', blockFilter.concrete_powder)
        .toggle('§7SprayConcrete Block', blockFilter.concrete_block)
        .toggle('§7SprayWool', blockFilter.wool)
        .dropdown('§7Open UI with:', triggerOptions, triggerIndex);

    form.show(player).then(response => {
        uiOpenPlayers.delete(player.id);
        if (response.canceled) { return; }

        const newSettings = {
            spray_to_stencil: response.formValues[0],
            particles_enabled: response.formValues[1],
            sound_enabled: response.formValues[2],
            preview_shape: settings.preview_shape,
            spray_to_sheep: response.formValues[3],
            block_filter: {
                sand: response.formValues[4],
                concrete_powder: response.formValues[5],
                concrete_block: response.formValues[6],
                wool: response.formValues[7]
            }
        };

        setSprayCanSettings(player, newSettings);
        const triggerIdx = response.formValues[8];
        playerTriggerSettings.set(player.id, triggerKeys[triggerIdx]);
        player.sendMessage('§aSpray settings saved!');
        player.playSound('random.orb');
    });
}

// =============================================================
// TRIGGER SETTINGS — konfigurasi input untuk membuka UI spray can
// Options: 'spray_table' | 'crafting_table' | 'sneak_use' | 'left_click'
// =============================================================
const playerTriggerSettings = new Map();

// Guard: cegah UI dibuka lebih dari sekali per player dalam waktu bersamaan
const uiOpenPlayers = new Set();

function getTriggerSetting(player) {
    return playerTriggerSettings.get(player.id) ?? 'spray_table';
}

// Default spray can settings per player
const DEFAULT_SPRAY_SETTINGS = Object.freeze({
    spray_to_stencil: true,
    particles_enabled: true,
    sound_enabled: true,
    preview_shape: false,
    spray_to_sheep: true,
    block_filter: { sand: true, concrete_powder: true, concrete_block: true, wool: true }
});

function getEffectiveBlockFilter(settings) {
    return {
        sand: settings?.block_filter?.sand !== false,
        concrete_powder: settings?.block_filter?.concrete_powder !== false,
        concrete_block: settings?.block_filter?.concrete_block !== false,
        wool: settings?.block_filter?.wool !== false
    };
}

function getSprayableBlockCategory(typeId) {
    if (typeId === 'minecraft:sand') return 'sand';
    if (typeId.endsWith('_concrete_powder')) return 'concrete_powder';
    if (typeId.endsWith('_concrete') && !typeId.endsWith('_concrete_powder')) return 'concrete_block';
    if (typeId.endsWith('_wool')) return 'wool';
    return null;
}

function isBlockAllowedByFilter(typeId, blockFilter) {
    const category = getSprayableBlockCategory(typeId);
    if (!category) return false;
    return blockFilter?.[category] !== false;
}

function getSprayCanSettings(player) {
    const stored = player.getDynamicProperty('hp4_paint:spray_settings');
    if (!stored) {
        return {
            ...DEFAULT_SPRAY_SETTINGS,
            block_filter: { ...DEFAULT_SPRAY_SETTINGS.block_filter }
        };
    }
    try {
        const parsed = JSON.parse(stored);
        return {
            spray_to_stencil: parsed?.spray_to_stencil !== false,
            particles_enabled: parsed?.particles_enabled !== false,
            sound_enabled: parsed?.sound_enabled !== false,
            preview_shape: parsed?.preview_shape === true,
            spray_to_sheep: parsed?.spray_to_sheep !== false,
            block_filter: getEffectiveBlockFilter(parsed)
        };
    } catch (_) {
        return {
            ...DEFAULT_SPRAY_SETTINGS,
            block_filter: { ...DEFAULT_SPRAY_SETTINGS.block_filter }
        };
    }
}

function setSprayCanSettings(player, settings) {
    player.setDynamicProperty('hp4_paint:spray_settings', JSON.stringify(settings));
}

function updateSprayCanSetting(player, key, value) {
    const settings = getSprayCanSettings(player);
    settings[key] = value;
    setSprayCanSettings(player, settings);
}

// UI pengaturan trigger — dibuka lewat art_bench
function openTriggerSettingsUI(player) {
    if (uiOpenPlayers.has(player.id)) return;
    uiOpenPlayers.add(player.id);

    const current  = getTriggerSetting(player);
    const options  = [
        'Right-click Spray Table',
        'Right-click Crafting Table',
        'Sneak + Right-click',
        'Left-click',
    ];
    const keys     = ['spray_table', 'crafting_table', 'sneak_use', 'left_click'];
    const curIndex = Math.max(0, keys.indexOf(current));

    const descriptions = [
        '§7Open the UI by right-clicking the Spray Table entity while holding a spray can.',
        '§7Open the UI by right-clicking a Crafting Table while holding a spray can.',
        '§7Open the UI by Sneaking + right-clicking while holding a spray can.',
        '§7Open the UI by left-clicking (attack) a block while holding a spray can.',
    ];

    new ui.ModalFormData()
        .title('§0§l Spray Can — Input Settings')
        .dropdown('§7Open UI with:', options, curIndex)
        .show(player).then(response => {
            uiOpenPlayers.delete(player.id);
            if (response.canceled) return;
            const idx      = response.formValues[0];
            const selected = keys[idx];
            playerTriggerSettings.set(player.id, selected);
            player.sendMessage(`§aSpray Can trigger: §e${options[idx]}\n${descriptions[idx]}`);
            player.playSound('random.orb');
        });
}

// Script untuk spray can - mengubah sand menjadi concrete powder sesuai warna
mc.world.afterEvents.itemUse.subscribe(arg => {
    const player = arg.source;
    const item = arg.itemStack;
    
    // Cek tipe spray can
    const isPlainSprayTool    = item.typeId === 'hp4_paint:spray_can_tool';
    const isColoredSprayCan   = !!sprayCanToDye[item.typeId];
    const isBrightnessSpray   = item.typeId === SPRAY_BRIGHTEN || item.typeId === SPRAY_DARKEN;

    if (isPlainSprayTool || isColoredSprayCan || isBrightnessSpray) {
        
        // Cari slot spray can aktif di tangan player
        const inventory = player.getComponent('minecraft:inventory').container;
        const sprayCanSlot = getActiveSpraySlot(player, item.typeId);
        const shapeSettings = sprayCanSlot !== -1
            ? getShapeSettings(player, sprayCanSlot)
            : { ...DEFAULT_SHAPE_SETTINGS };

        // Handle trigger: sneak_use — buka main UI saat sneak + klik kanan
        if (player.isSneaking && getTriggerSetting(player) === 'sneak_use') {
            if (sprayCanSlot !== -1) mc.system.run(() => openMainUI(player, sprayCanSlot));
            return;
        }
        
        // Jika spray can berwarna dan TIDAK sneak = spray pada entity atau block
        if (isColoredSprayCan && !player.isSneaking) {
            const dyeType = sprayCanToDye[item.typeId];
            const colorData = dyeColorMap[dyeType];
            let sprayUsed = false;
            let sprayCount = 0; // jumlah blok/entitas yang berhasil diwarnai

            // --- 1. Cek entity dari arah pandang ---
            const canSprayToSheep = getPlayerSpraySetting(player, 'spray_to_sheep');
            const entityHits = player.getEntitiesFromViewDirection({ maxDistance: 5 });
            if (entityHits && entityHits.length > 0) {
                const hitEntity = entityHits[0].entity;

                // Mewarnai Sheep (area sesuai shape/size)
                if (canSprayToSheep && hitEntity.typeId === 'minecraft:sheep') {
                    const { shape, size } = shapeSettings;
                    // fill/line tidak berlaku untuk sheep — gunakan target tunggal
                    const effectiveSize = (shape === 'fill' || shape === 'line') ? 1 : size;
                    const radius = getSheepSprayRadius(effectiveSize);

                    // Kumpulkan semua sheep: hanya yang di-hit, atau semua di area
                    const sheepList = effectiveSize <= 1
                        ? [hitEntity]
                        : [hitEntity, ...getSheepInRadius(player.dimension, hitEntity.location, radius).filter(e => e.id !== hitEntity.id)];

                    let count = 0;
                    for (const sheep of sheepList) {
                        const colorComp = sheep.getComponent('minecraft:color');
                        if (colorComp !== undefined) {
                            colorComp.value = colorData.sheepColor;
                            count++;
                        }
                    }
                    if (count > 0) {
                        if (getPlayerSpraySetting(player, 'sound_enabled')) {
                            player.dimension.playSound('hp4_paint:spray_can_use', hitEntity.location);
                        }
                        if (getPlayerSpraySetting(player, 'particles_enabled')) {
                            spawnSprayParticleAtEntity(player, player.dimension, hitEntity.location, sprayCanParticleByItem[item.typeId]);
                        }
                        const msg = count === 1
                            ? `§aSheep dyed ${colorData.displayName}§a!`
                            : `§a${count} sheep dyed ${colorData.displayName}§a!`;
                        player.sendMessage(msg);
                        sprayUsed = true;
                        sprayCount = count;
                    }
                }
            }

            // --- 2. Jika tidak ada entity yang kena, cek block ---
            if (!sprayUsed) {
                const blockHit = player.getBlockFromViewDirection({ maxDistance: 5 });

                if (blockHit) {
                    const originBlock = blockHit.block;
                    const face = blockHit.face;
                    const { shape, size } = shapeSettings;
                    const blockFilter = getEffectiveBlockFilter(getSprayCanSettings(player));

                    const count = applySprayToBlocks(player, player.dimension, originBlock, face, shape, size, (b) => {
                        const category = getSprayableBlockCategory(b.typeId);
                        if (!category || !isBlockAllowedByFilter(b.typeId, blockFilter)) return false;
                        const newType = (category === 'concrete_block') ? colorData.concreteBlock
                            : (category === 'wool') ? colorData.wool
                            : colorData.concrete;
                        b.setType(newType);
                        return true;
                    });

                    if (count > 0) {
                        if (getPlayerSpraySetting(player, 'sound_enabled')) {
                            player.dimension.playSound('hp4_paint:spray_can_use', originBlock.location);
                        }
                        if (getPlayerSpraySetting(player, 'particles_enabled')) {
                            spawnSprayParticleAtBlock(player, player.dimension, originBlock.location, sprayCanParticleByItem[item.typeId]);
                        }
                        sprayUsed = true;
                        sprayCount = count;
                    }
                }
            }

            // --- 3. Kurangi durability hanya jika spray berhasil digunakan ---
            if (sprayUsed && sprayCanSlot !== -1 && player.getGameMode() !== mc.GameMode.creative) {
                const currentItem = inventory.getItem(sprayCanSlot);
                if (currentItem) {
                    const durabilityComp = currentItem.getComponent('minecraft:durability');
                    if (durabilityComp) {
                        const newDamage = durabilityComp.damage + Math.max(1, sprayCount);

                        if (newDamage >= durabilityComp.maxDurability) {
                            // Jangan set damage >= max (engine akan destroy otomatis),
                            // jadwalkan penggantian ke tick berikutnya
                            player.sendMessage('§eSpray can empty! Select a new color.');
                            if (getPlayerSpraySetting(player, 'sound_enabled')) {
                                player.playSound('random.break');
                            }
                            mc.system.run(() => {
                                const emptySpray = new mc.ItemStack('hp4_paint:spray_can_tool', 1);
                                copyShapeSettings(currentItem, emptySpray);
                                inventory.setItem(sprayCanSlot, emptySpray);
                            });
                        } else {
                            durabilityComp.damage = newDamage;
                            inventory.setItem(sprayCanSlot, currentItem);
                            const remaining = durabilityComp.maxDurability - newDamage;
                            player.onScreenDisplay.setActionBar(`§e${remaining} uses remaining`);
                        }
                    }
                }
            }
        }
        // Brightness spray can — gunakan (tidak sneak)
        else if (isBrightnessSpray && !player.isSneaking) {
            const direction = item.typeId === SPRAY_BRIGHTEN ? 'brighter' : 'darker';
            let sprayUsed = false;
            let brightnessCount = 0; // jumlah entitas/blok yang berhasil diubah brightness

            // --- 1. Cek apakah mengarah ke sheep ---
            const canSprayToSheepBrightness = getPlayerSpraySetting(player, 'spray_to_sheep');
            const entityHits = player.getEntitiesFromViewDirection({ maxDistance: 5 });
            if (canSprayToSheepBrightness && entityHits && entityHits.length > 0 && entityHits[0].entity.typeId === 'minecraft:sheep') {
                const hitEntity = entityHits[0].entity;
                const { shape: bShape, size } = shapeSettings;
                // fill/line tidak berlaku untuk sheep
                const effectiveSize = (bShape === 'fill' || bShape === 'line') ? 1 : size;
                const radius = getSheepSprayRadius(effectiveSize);

                const sheepList = effectiveSize <= 1
                    ? [hitEntity]
                    : [hitEntity, ...getSheepInRadius(player.dimension, hitEntity.location, radius).filter(e => e.id !== hitEntity.id)];

                let count = 0;
                let atLimit = false;
                let lastTargetName = null;
                for (const sheep of sheepList) {
                    const result = applyBrightnessToSheep(sheep, direction);
                    if (result === 'at_limit') atLimit = true;
                    else if (result === true) {
                        count++;
                        const colorComp = sheep.getComponent('minecraft:color');
                        if (colorComp) lastTargetName = sheepColorIndexToName[colorComp.value];
                    }
                }
                if (count > 0) {
                    const colorLabel = lastTargetName ? (colorDisplayNames[lastTargetName] ?? `§7${lastTargetName}`) : '';
                    if (getPlayerSpraySetting(player, 'sound_enabled')) {
                        player.dimension.playSound('hp4_paint:spray_can_use', hitEntity.location);
                    }
                    if (getPlayerSpraySetting(player, 'particles_enabled')) {
                        const brightnessParticle = direction === 'brighter' ? 'hp4_paint:spray_white' : 'hp4_paint:spray_black';
                        spawnSprayParticleAtEntity(player, player.dimension, hitEntity.location, brightnessParticle);
                    }
                    const actionMsg = direction === 'brighter'
                        ? `§e${count} sheep brightened → ${colorLabel}`
                        : `§8${count} sheep darkened → ${colorLabel}`;
                    player.onScreenDisplay.setActionBar(actionMsg);
                    sprayUsed = true;
                    brightnessCount = count;
                } else if (atLimit) {
                    player.sendMessage(direction === 'brighter'
                        ? '§eSheep are already the brightest color!'
                        : '§8Sheep are already the darkest color!');
                }
            }

            // --- 2. Jika tidak ada sheep yang kena, cek block ---
            if (!sprayUsed) {
                const blockHit = player.getBlockFromViewDirection({ maxDistance: 5 });
                if (blockHit) {
                    const originBlock = blockHit.block;
                    const face = blockHit.face;
                    const { shape, size } = shapeSettings;
                    const blockFilter = getEffectiveBlockFilter(getSprayCanSettings(player));
                    const originCategory = getSprayableBlockCategory(originBlock.typeId);

                    // Cek apakah blok asal memang bisa di-brightness (untuk feedback)
                    const originColorable =
                        !!originCategory
                        && originCategory !== 'sand'
                        && isBlockAllowedByFilter(originBlock.typeId, blockFilter);

                    if (originColorable) {
                        let lastResult = 'no_color';
                        let atLimit = false;

                        const count = applySprayToBlocks(player, player.dimension, originBlock, face, shape, size, (b) => {
                            const category = getSprayableBlockCategory(b.typeId);
                            const isColorable = !!category && category !== 'sand';
                            if (!isColorable || !isBlockAllowedByFilter(b.typeId, blockFilter)) return false;
                            const result = applyBrightness(b, direction);
                            if (result === 'at_limit') { atLimit = true; return false; }
                            if (result !== 'no_color') { lastResult = result; return true; }
                            return false;
                        });

                        if (count > 0) {
                            const colorLabel = colorDisplayNames[lastResult] ?? `§7${lastResult}`;
                            if (getPlayerSpraySetting(player, 'sound_enabled')) {
                                player.dimension.playSound('hp4_paint:spray_can_use', originBlock.location);
                            }
                            const brightnessParticle = direction === 'brighter' ? 'hp4_paint:spray_white' : 'hp4_paint:spray_black';
                            if (getPlayerSpraySetting(player, 'particles_enabled')) {
                                spawnSprayParticleAtBlock(player, player.dimension, originBlock.location, brightnessParticle);
                            }
                            player.onScreenDisplay.setActionBar(
                                direction === 'brighter'
                                    ? `§eBrightened → ${colorLabel}`
                                    : `§8Darkened → ${colorLabel}`
                            );
                            sprayUsed = true;
                            brightnessCount = count;
                        } else if (atLimit) {
                            const limitMsg = direction === 'brighter'
                                ? '§eThis block is already the brightest color!'
                                : '§8This block is already the darkest color!';
                            player.sendMessage(limitMsg);
                        }
                    }
                } // end if (blockHit)
            } // end if (!sprayUsed)

            if (sprayUsed && sprayCanSlot !== -1 && player.getGameMode() !== mc.GameMode.creative) {
                const currentItem = inventory.getItem(sprayCanSlot);
                if (currentItem) {
                    const durabilityComp = currentItem.getComponent('minecraft:durability');
                    if (durabilityComp) {
                        const newDamage = durabilityComp.damage + Math.max(1, brightnessCount);
                        if (newDamage >= durabilityComp.maxDurability) {
                            player.sendMessage('\u00a7eSpray can empty! Select a new mode.');
                            if (getPlayerSpraySetting(player, 'sound_enabled')) {
                                player.playSound('random.break');
                            }
                            mc.system.run(() => {
                                const emptySpray = new mc.ItemStack('hp4_paint:spray_can_tool', 1);
                                copyShapeSettings(currentItem, emptySpray);
                                inventory.setItem(sprayCanSlot, emptySpray);
                            });
                        } else {
                            durabilityComp.damage = newDamage;
                            inventory.setItem(sprayCanSlot, currentItem);
                        }
                    }
                }
            }
        }
    }
});

// Buka UI saat interaksi block sambil pegang spray can
mc.world.beforeEvents.itemUseOn.subscribe(arg => {
    const blockType = arg.block.typeId;
    const item      = arg.itemStack;
    const player    = arg.source;

    // --- Crafting Table: buka spray can UI jika trigger = crafting_table ---
    if (blockType !== 'minecraft:crafting_table') return;

    // Sneak + right-click: Bedrock already suppresses block UI when sneaking,
    // so cancelling here causes a stuck/unresponsive form — skip entirely.
    if (player.isSneaking) return;

    const isAnySprayCan =
        item.typeId === 'hp4_paint:spray_can_tool' ||
        !!sprayCanToDye[item.typeId] ||
        item.typeId === SPRAY_BRIGHTEN ||
        item.typeId === SPRAY_DARKEN;

    if (!isAnySprayCan) return;
    if (getTriggerSetting(player) !== 'crafting_table') return;

    arg.cancel = true; // prevent crafting table UI from opening

    const sprayCanSlot = getActiveSpraySlot(player, item.typeId);

    if (sprayCanSlot !== -1) {
        mc.system.run(() => openMainUI(player, sprayCanSlot));
    }
});

// Buka UI saat left-click blok dengan trigger = left_click
mc.world.beforeEvents.playerBreakBlock.subscribe(arg => {
    const item = arg.itemStack;
    if (!item) return;

    const isAnySprayCan =
        item.typeId === 'hp4_paint:spray_can_tool' ||
        !!sprayCanToDye[item.typeId] ||
        item.typeId === SPRAY_BRIGHTEN ||
        item.typeId === SPRAY_DARKEN;

    if (!isAnySprayCan) return;

    const player = arg.player;
    if (getTriggerSetting(player) !== 'left_click') return;

    arg.cancel = true;

    const sprayCanSlot = getActiveSpraySlot(player, item.typeId);

    if (sprayCanSlot !== -1) {
        mc.system.run(() => openMainUI(player, sprayCanSlot));
    }
});

// Buka UI saat klik kanan entity spray_table dengan trigger = spray_table
mc.world.afterEvents.playerInteractWithEntity.subscribe(arg => {
    const player = arg.player;
    const target = arg.target;

    if (target.typeId !== 'hp4_paint:spray_table') return;

    const inv = player.getComponent('minecraft:inventory').container;
    const selectedSlot = player.selectedSlotIndex;
    const item = inv.getItem(selectedSlot);

    if (!item) return;

    const isAnySprayCan =
        item.typeId === 'hp4_paint:spray_can_tool' ||
        !!sprayCanToDye[item.typeId] ||
        item.typeId === SPRAY_BRIGHTEN ||
        item.typeId === SPRAY_DARKEN;

    if (!isAnySprayCan) return;
    if (getTriggerSetting(player) !== 'spray_table') return;

    
    const sprayCanSlot = getActiveSpraySlot(player, item.typeId);
    if (sprayCanSlot !== -1) {
        mc.system.run(() => openMainUI(player, sprayCanSlot));
    }
});
