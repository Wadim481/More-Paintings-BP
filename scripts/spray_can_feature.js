import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import * as main from './hp4_paint_index'
//AFANDIv5 - membuat fitur spray can
// Mapping dye colors ke concrete powder, concrete block, spray texture, dan item ID
const dyeColorMap = {
    'minecraft:white_dye': { concrete: 'minecraft:white_concrete_powder', concreteBlock: 'minecraft:white_concrete', item: 'hp4_paint:spray_can_white', displayName: '§fWhite' },
    'minecraft:light_gray_dye': { concrete: 'minecraft:light_gray_concrete_powder', concreteBlock: 'minecraft:light_gray_concrete', item: 'hp4_paint:spray_can_light_gray', displayName: '§7Light Gray' },
    'minecraft:gray_dye': { concrete: 'minecraft:gray_concrete_powder', concreteBlock: 'minecraft:gray_concrete', item: 'hp4_paint:spray_can_gray', displayName: '§8Gray' },
    'minecraft:black_dye': { concrete: 'minecraft:black_concrete_powder', concreteBlock: 'minecraft:black_concrete', item: 'hp4_paint:spray_can_black', displayName: '§0Black' },
    'minecraft:brown_dye': { concrete: 'minecraft:brown_concrete_powder', concreteBlock: 'minecraft:brown_concrete', item: 'hp4_paint:spray_can_brown', displayName: '§6Brown' },
    'minecraft:red_dye': { concrete: 'minecraft:red_concrete_powder', concreteBlock: 'minecraft:red_concrete', item: 'hp4_paint:spray_can_red', displayName: '§cRed' },
    'minecraft:orange_dye': { concrete: 'minecraft:orange_concrete_powder', concreteBlock: 'minecraft:orange_concrete', item: 'hp4_paint:spray_can_orange', displayName: '§6Orange' },
    'minecraft:yellow_dye': { concrete: 'minecraft:yellow_concrete_powder', concreteBlock: 'minecraft:yellow_concrete', item: 'hp4_paint:spray_can_yellow', displayName: '§eYellow' },
    'minecraft:lime_dye': { concrete: 'minecraft:lime_concrete_powder', concreteBlock: 'minecraft:lime_concrete', item: 'hp4_paint:spray_can_lime', displayName: '§aLime' },
    'minecraft:green_dye': { concrete: 'minecraft:green_concrete_powder', concreteBlock: 'minecraft:green_concrete', item: 'hp4_paint:spray_can_green', displayName: '§2Green' },
    'minecraft:cyan_dye': { concrete: 'minecraft:cyan_concrete_powder', concreteBlock: 'minecraft:cyan_concrete', item: 'hp4_paint:spray_can_cyan', displayName: '§bCyan' },
    'minecraft:light_blue_dye': { concrete: 'minecraft:light_blue_concrete_powder', concreteBlock: 'minecraft:light_blue_concrete', item: 'hp4_paint:spray_can_light_blue', displayName: '§9Light Blue' },
    'minecraft:blue_dye': { concrete: 'minecraft:blue_concrete_powder', concreteBlock: 'minecraft:blue_concrete', item: 'hp4_paint:spray_can_blue', displayName: '§1Blue' },
    'minecraft:purple_dye': { concrete: 'minecraft:purple_concrete_powder', concreteBlock: 'minecraft:purple_concrete', item: 'hp4_paint:spray_can_purple', displayName: '§5Purple' },
    'minecraft:magenta_dye': { concrete: 'minecraft:magenta_concrete_powder', concreteBlock: 'minecraft:magenta_concrete', item: 'hp4_paint:spray_can_magenta', displayName: '§dMagenta' },
    'minecraft:pink_dye': { concrete: 'minecraft:pink_concrete_powder', concreteBlock: 'minecraft:pink_concrete', item: 'hp4_paint:spray_can_pink', displayName: '§dPink' }
};

// Mapping dari item spray can berwarna ke dye type
const sprayCanToDye = {};
Object.keys(dyeColorMap).forEach(dyeType => {
    sprayCanToDye[dyeColorMap[dyeType].item] = dyeType;
});

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

// Fungsi untuk membuka UI pilih warna
function openColorSelectionUI(player, sprayCanSlot) {
    const availableDyes = getAvailableDyes(player);
    
    if (availableDyes.length === 0) {
        player.sendMessage('§cYou need dye in your inventory to select a color!');
        return;
    }
    
    const form = new ui.ActionFormData()
        .title('Spray Can Color Selection')
        .body('Choose a color for your spray can:');
    
    availableDyes.forEach(dye => {
        form.button(`${dye.color.displayName}§r\n(Uses 1 dye)`);
    });
    
    form.show(player).then(response => {
        if (response.canceled) return;
        
        const selectedDye = availableDyes[response.selection];
        if (consumeDye(player, selectedDye.typeId)) {
            // Ganti spray can biasa dengan spray can berwarna
            const inventory = player.getComponent('minecraft:inventory').container;
            const coloredSprayCan = new mc.ItemStack(selectedDye.color.item, 1);
            inventory.setItem(sprayCanSlot, coloredSprayCan);
            
            player.sendMessage(`§aYou now have ${selectedDye.color.displayName}§r §aSpray Can!`);
            main.playSound(player, `random.orb`)
        } else {
            player.sendMessage('§cFailed to consume dye!');
        }
    });
}

// Script untuk spray can - mengubah sand menjadi concrete powder sesuai warna
mc.world.afterEvents.itemUse.subscribe(arg => {
    const player = arg.source;
    const item = arg.itemStack;
    
    // Cek apakah item yang digunakan adalah spray can tool atau berwarna
    const isPlainSprayTool = item.typeId === 'hp4_paint:spray_can_tool';
    const isColoredSprayCan = sprayCanToDye[item.typeId];
    
    if (isPlainSprayTool || isColoredSprayCan) {
        
        // Cari slot spray can di inventory
        const inventory = player.getComponent('minecraft:inventory').container;
        let sprayCanSlot = -1;
        for (let i = 0; i < inventory.size; i++) {
            const slotItem = inventory.getItem(i);
            if (slotItem && slotItem.typeId === item.typeId) {
                sprayCanSlot = i;
                break;
            }
        }
        
        // Jika spray can tool dan sedang SNEAK = buka UI pilih warna
        if (isPlainSprayTool && player.isSneaking) {
            if (sprayCanSlot !== -1) {
                openColorSelectionUI(player, sprayCanSlot);
            }
        }
        // Jika spray can berwarna dan TIDAK sneak = spray pada block
        else if (isColoredSprayCan && !player.isSneaking) {
            const dyeType = sprayCanToDye[item.typeId];
            
            // Dapatkan block yang dilihat player
            const blockHit = player.getBlockFromViewDirection({
                maxDistance: 5
            });
            
            if (blockHit) {
                const block = blockHit.block;
                
                // Cek apakah block tersebut adalah sand, concrete powder, atau concrete block
                const isSandOrPowder = block.typeId === 'minecraft:sand' || block.typeId.endsWith('_concrete_powder');
                const isConcreteBlock = block.typeId.endsWith('_concrete') && !block.typeId.endsWith('_concrete_powder');
                
                if (isSandOrPowder || isConcreteBlock) {
                    // Ubah ke concrete powder atau concrete block sesuai tipe aslinya
                    const newBlockType = isConcreteBlock ? dyeColorMap[dyeType].concreteBlock : dyeColorMap[dyeType].concrete;
                    block.setType(newBlockType);
                    
                    // Tambahkan efek suara dan partikel
                    main.playSound(player, `random.fizz`, block.location)
                    
                    // Kurangi durability
                    const currentItem = inventory.getItem(sprayCanSlot);
                    if (currentItem) {
                        const durabilityComp = currentItem.getComponent('minecraft:durability');
                        if (durabilityComp) {
                            // Damage item by 1
                            durabilityComp.damage += 1;
                            
                            // Cek jika durability habis
                            if (durabilityComp.damage >= durabilityComp.maxDurability) {
                                // Ganti dengan spray can tool kosong
                                const plainSprayTool = new mc.ItemStack('hp4_paint:spray_can_tool', 1);
                                inventory.setItem(sprayCanSlot, plainSprayTool);
                                player.sendMessage('§eSpray can empty! Select a new color.');
                                main.playSound(player, `random.break`)
                            } else {
                                // Update item
                                inventory.setItem(sprayCanSlot, currentItem);
                                
                                // Show remaining uses
                                const remaining = durabilityComp.maxDurability - durabilityComp.damage;
                                player.onScreenDisplay.setActionBar(`§e${remaining} uses remaining`);
                            }
                        }
                    }
                }
            }
        }
        // Jika colored spray can dengan SNEAK = ganti warna
        else if (isColoredSprayCan && player.isSneaking) {
            if (sprayCanSlot !== -1) {
                // Ganti colored spray can dengan plain spray tool
                const plainSprayTool = new mc.ItemStack('hp4_paint:spray_can_tool', 1);
                inventory.setItem(sprayCanSlot, plainSprayTool);
                player.sendMessage('§eConverted to spray tool. Sneak + right-click to select new color!');
            }
        }
    }
});
