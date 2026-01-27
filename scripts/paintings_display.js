import { system, world, EquipmentSlot, ItemStack } from "@minecraft/server";
import { ActionFormData, FormCancelationReason } from "@minecraft/server-ui";
import * as main from "./hp4_paint_index.js";
import * as colorData from "./color_painting_data.js"

const type = [
        "eightBit",
        "alien",
        "biomes",
        "candy1",
        "candy2",
        "circus",
        "cyberpunk",
        "dino",
        "dino_dragons",
        "dragon",
        "egypt",
        "fantasy",
        "fog",
        "forest",
        "halloween",
        "horror",
        "kawaii",
        "magic",
        "medieval",
        "modern",
        "music",
        "nature",
        "ninja",
        "ocean",
        "pirates",
        "robot",
        "scifi",
        "snow",
        "steampunk",
        "superheroes",
        "tiny",
        "zombies",
        "animated"
]
const displays = [
    `hp4_paint:easel_stand`,
    `hp4_paint:display_case`,
    `hp4_paint:display_case_wide`,
    `hp4_paint:display_case_huge`,
    `hp4_paint:display_case_tall`,
    `hp4_paint:display_case_wide2`,
    `hp4_paint:display_case_big`
]
const furnitures = [
    `hp4_paint:statue_painting`,
    `hp4_paint:cabinet`,
    `hp4_paint:stool`,
    `hp4_paint:sack_of_beton`,
    `hp4_paint:lying_bottle_color`,
    `hp4_paint:variant_paint_bottle`,
    `hp4_paint:color_splash`,
    `hp4_paint:canvas`,
    `hp4_paint:brush_on_shelf`,
    `hp4_paint:art_chair`,
    `hp4_paint:jewellery_components`,
    `hp4_paint:powderjar`,
    `hp4_paint:sewing_kit`,
    `hp4_paint:unfinished_wooden_block`,
    `hp4_paint:stencil`,
    `hp4_paint:spray_can`,
    `hp4_paint:soft_pastel_box`,
    `hp4_paint:sculpture_stand`,
    `hp4_paint:pencil_set`,
    `hp4_paint:painting_brush`,
    `hp4_paint:paint_tubes`,
    `hp4_paint:marker_set`,
    `hp4_paint:eraser_sharpener`,
    `hp4_paint:drawing_tube`,
    `hp4_paint:drafting_tools`,
    `hp4_paint:color_swatch`,
    `hp4_paint:brush_holder_cup`,
    `hp4_paint:brush_cleaner_cup`,
    `hp4_paint:artist_box`,
    `hp4_paint:art_knives`,
    `hp4_paint:brush_cleaner_jar`,
    `hp4_paint:chalk_and_charcoal`,
    `hp4_paint:tube_paint`,
    `hp4_paint:spatula`,
    `hp4_paint:sketchbook`,
    `hp4_paint:brushes_set`,
    `hp4_paint:art_bench`,
    `hp4_paint:large_planter`,
    `hp4_paint:round_planter`,
    `hp4_paint:thin_planter`,
    `hp4_paint:vase`,
    `hp4_paint:wide_planter`,
    `hp4_paint:color_bucket`,
]
const flowers = [
    "crimson_roots",
	"warped_roots",
	"dandelion",
	"poppy",
	"blue_orchid",
	"allium",
	"azure_bluet",
	"red_tulip",
	"orange_tulip",
	"white_tulip",
	"pink_tulip",
	"oxeye_daisy",
	"cornflower",
	"lily_of_the_valley",
	"wither_rose",
	"torchflower",
	"cactus_flower",
	"closed_eyeblossom",
	"open_eyeblossom"
], doublePlants = [
	"lilac",
	"rose_bush",
	"peony",
	"pitcher_plant"
], customPlants = [
	"sunflower",
	"wildflowers",
	"pink_petals"
]
world.afterEvents.entitySpawn.subscribe(arg=>{//
    if(furnitures.includes(arg.entity.typeId) || displays.includes(arg.entity.typeId)) {
        const spawner = arg.entity.dimension.getPlayers({closest:1, location: arg.entity.location}).filter(p=>(p.getDynamicProperty(`hp4_paint:additionalFurniture`) && p.getComponent("minecraft:inventory").container.getItem(p.selectedSlotIndex).typeId == arg.entity.typeId))
        if(spawner.length >= 1) {
            system.runTimeout(() => {
                getEntitySize(arg.entity)
            },1)
        } else if (spawner.length == 0) {
            //kontol.warn('anjay')
            arg.entity.runCommand(`title @p actionbar Activate Additional Furnitures in settings\nto put this furniture`)
            arg.entity.dimension.getPlayers({closest:1, location:arg.entity.location}).forEach(p=>{
                p.getGameMode() != 'creative' ? entity.runCommand(`loot spawn ${p.location.x} ${p.location.y} ${p.location.z}  loot "heropixels/more_paintings/${arg.entity.typeId.replace('hp4_paint:', '')}"`) : null;
            })
            arg.entity.remove()
        }
    }
})
world.afterEvents.playerInteractWithEntity.subscribe(arg=>{
    const player = arg.player;
    const item = arg.itemStack;
    const target = arg.target;

    const frontTarget = getFrontPos(target, 1)
    //Inisiasi
    if(displays.includes(target.typeId)) {
        if(item) {
            if(item.typeId.includes('hp4_paint')&&(item.typeId.endsWith('painting'))){
                // Handle painting spawn egg interaction
                type.forEach((tipe, index)=>{
                    let jenis = tipe == 'eightBit' ? '8bit' : tipe;
                    if(item.typeId==`hp4_paint:${jenis}_painting`) {
                        if(target.getProperty(`hp4_paint:paint_installed`)) {
                            target.dimension.getEntities().forEach(entity=>{
                                if(entity.id==target.getDynamicProperty(`hp4_paint:babu`)) {
                                    {
                                        target.setDynamicProperty(`hp4_paint:babu`, null)
                                        target.setProperty(`hp4_paint:paint_installed`, false)
                                        //kontol.warn('remove')
                                        player.getGameMode() != 'creative' ? entity.triggerEvent('death') : entity.remove();
                                    }
                                }
                            })
                        }
                        //contol.warn(jenis)
                        //contol.warn('interact dengan painting')
                        let buttonList = []
                        {
                            const gambar = {
                                typeId: `hp4_paint:${jenis}_painting`
                            }
                            let maxSize
                            main.paintingTypeChoose(gambar).models.sort((a,b)=>{
                                return (a.width + a.height) - (b.width + b.height)
                            }).forEach(model=>{
                                const width = model.width
                                const height = model.height
                                switch (target.typeId) {
                                    case `hp4_paint:easel_stand`:
                                        maxSize = {
                                            width: 2,
                                            height: 2
                                        }
                                        break;
                                    case `hp4_paint:display_case`:
                                        maxSize = {
                                            width: 1,
                                            height: 2
                                        }
                                        break;
                                    case `hp4_paint:display_case_wide`:
                                        maxSize = {
                                            width: 2,
                                            height: 1
                                        }
                                        break;
                                    case `hp4_paint:display_case_big`:
                                        maxSize = {
                                            width: 2,
                                            height: 2
                                        }
                                        break;
                                    case `hp4_paint:display_case_tall`:
                                        maxSize = {
                                            width: 3,
                                            height: 4
                                        }
                                        break;
                                    case `hp4_paint:display_case_huge`:
                                        maxSize = {
                                            width: 4,
                                            height: 4
                                        }
                                        break;
                                    case `hp4_paint:display_case_wide2`:
                                        maxSize = {
                                            width: 4,
                                            height: 2
                                        }
                                        break;
                                    default:
                                        break;
                                }
                                const button = {
                                    text: `${width}x${height}`,
                                    image: ``,
                                    command: () => {
                                        const delay = 1.5
                                        const painting = target.dimension.spawnEntity(`hp4_paint:${jenis}_painting`, target.location);
                                        if(player.getDynamicProperty(`hp4_paint:particles`)) {
                                            painting.runCommand(`playsound hp4_paint:display.painting_install @a ~~~`)
                                            painting.runCommand(`function hp/more_paintings/place_painting_start`)
                                            system.runTimeout(()=>{painting.runCommand(`function hp/more_paintings/place_painting_finish`)},1*20)
                                        }
                                        try {
                                            const displayModel = target.getProperty(`hp4_paint:furniture_model`)
                                            painting.setProperty(`hp4_paint:furniture_model`, displayModel)
                                        } catch (error) {}
                                        // painting.runCommand(`particle hp4_paint:dust2 ~~1~`)
                                        // painting.runCommand(`particle hp4_paint:dust ~~2~`)
                                        painting.addEffect('invisibility',delay*20,{showParticles:false})
                                        painting.setRotation({y:target.getRotation().y, x:0})
                                        painting.setProperty(`hp4_paint:displayer`, target.typeId.replace('hp4_paint:', ''));
                                        painting.setProperty(`hp4_paint:paint_models`, model.id)
                                        const listColor = colorData.colorPaintingData[jenis][model.id]
                                        const min = Math.min(...listColor), max = Math.max(...listColor)
                                        painting.setProperty(`hp4_paint:paint_colors`, min);
                                        target.setDynamicProperty(`hp4_paint:babu`, painting.id)
                                        player.getGameMode() != 'creative' ? player.runCommand(`clear @s hp4_paint:${jenis}_painting 0 1`) : null;
                                        system.runTimeout(()=>{
                                            target.setProperty(`hp4_paint:paint_installed`, true)
                                            painting.setProperty(`hp4_paint:visible`, true)
                                        },delay*20);
                                        try {
                                            painting.setProperty(`hp4_paint:furniture_color`, target.getProperty(`hp4_paint:furniture_color`))
                                        } catch (error) {

                                        }
                                    }
                                }
                                const isAvailable = (width <= maxSize.width) && (height <= maxSize.height)
                                if (isAvailable){
                                    buttonList.push(button);
                                }
                            });
                        }
                        main.instanceMenu(
                            player,
                            {translate: 'Size Option'},
                            {translate: 'Choose the size you want of the painting\n\navailable size:'},
                            buttonList ? buttonList : [],
                            () => {
                            }
                        )
                    }
                })
            }
            if(item.typeId==`minecraft:painting`) {
                if(target.getProperty(`hp4_paint:paint_installed`)) {
                    target.dimension.getEntities().forEach(entity=>{
                        if(entity.id==target.getDynamicProperty(`hp4_paint:babu`)) {
                            {
                                target.setDynamicProperty(`hp4_paint:babu`, null)
                                target.setProperty(`hp4_paint:paint_installed`, false)
                                player.getGameMode() != 'creative' ? entity.triggerEvent('death') : entity.remove();
                            }
                        }
                    })
                }
                //contol.warn(jenis)
                //contol.warn('interact dengan painting')
                let buttonList = []
                {
                    const gambar = {
                        typeId: `hp4_paint:vanilla_pack_painting`
                    }
                    let maxSize
                    main.paintingTypeChoose(gambar).models.forEach(model=>{
                        const width = model.width
                        const height = model.height
                        switch (target.typeId) {
                            case `hp4_paint:easel_stand`:
                                maxSize = {
                                    width: 2,
                                    height: 2
                                }
                                break;
                            case `hp4_paint:display_case`:
                                maxSize = {
                                    width: 1,
                                    height: 2
                                }
                                break;
                            case `hp4_paint:display_case_wide`:
                                maxSize = {
                                    width: 2,
                                    height: 1
                                }
                                break;
                            case `hp4_paint:display_case_big`:
                                maxSize = {
                                    width: 2,
                                    height: 2
                                }
                                break;
                            case `hp4_paint:display_case_tall`:
                                maxSize = {
                                    width: 3,
                                    height: 4
                                }
                                break;
                            case `hp4_paint:display_case_huge`:
                                maxSize = {
                                    width: 4,
                                    height: 4
                                }
                                break;
                            case `hp4_paint:display_case_wide2`:
                                maxSize = {
                                    width: 4,
                                    height: 2
                                }
                                break;
                            default:
                                break;
                        }
                        const button = {
                            text: `${width}x${height}`,
                            image: ``,
                            command: () => {
                                const delay = 1.5
                                const painting = target.dimension.spawnEntity(`hp4_paint:vanilla_pack`, target.location);
                                if(player.getDynamicProperty(`hp4_paint:particles`)) {
                                    painting.runCommand(`playsound hp4_paint:display.painting_install @a ~~~`)
                                    painting.runCommand(`function hp/more_paintings/place_painting_start`)
                                    system.runTimeout(()=>{painting.runCommand(`function hp/more_paintings/place_painting_finish`)},1*20)
                                }
                                // painting.runCommand(`particle hp4_paint:dust2 ~~1~`)
                                // painting.runCommand(`particle hp4_paint:dust ~~2~`)
                                painting.addEffect('invisibility',delay*20,{showParticles:false})
                                painting.setRotation({y:target.getRotation().y, x:0})
                                painting.setProperty(`hp4_paint:displayer`, target.typeId.replace('hp4_paint:', ''));
                                painting.setProperty(`hp4_paint:paint_models`, model.id)
                                const listColor = colorData.colorPaintingData['vanilla_pack'][model.id]
                                const min = Math.min(...listColor), max = Math.max(...listColor)
                                painting.setProperty(`hp4_paint:paint_colors`, min);
                                target.setDynamicProperty(`hp4_paint:babu`, painting.id)
                                player.getGameMode() != 'creative' ? player.runCommand(`clear @s minecraft:painting 0 1`) : null;
                                system.runTimeout(()=>{
                                    target.setProperty(`hp4_paint:paint_installed`, true)
                                    painting.setProperty(`hp4_paint:visible`, true)
                                },delay*20);
                                try {
                                    painting.setProperty(`hp4_paint:furniture_color`, target.getProperty(`hp4_paint:furniture_color`))
                                } catch (error) {
                                    
                                }
                            }
                        }
                        const isAvailable = (width <= maxSize.width) && (height <= maxSize.height)
                        if (isAvailable){
                            buttonList.push(button);
                        }
                    });
                }
                main.instanceMenu(
                    player,
                    {translate: 'Size Option'},
                    {translate: 'Choose the size you want of the painting\n\navailable size:'},
                    buttonList ? buttonList : [],
                    () => {
                    }
                )
            }
            if(item.typeId == 'minecraft:glow_ink_sac') {
                target.dimension.getEntities().forEach(entity=>{
                    if(entity.id==target.getDynamicProperty(`hp4_paint:babu`)) {
                        if(!entity.getProperty(`hp4_paint:paint_materials`)) {
                            player.runCommand(`clear @s minecraft:glow_ink_sac 0 1`);
                            entity.setProperty(`hp4_paint:paint_materials`, true);
                            entity.runCommand(`playsound sign.ink_sac.use @a ~~~`)
                        }
                    }
                })
            }
            if(item.typeId == 'minecraft:shears') {
                target.dimension.getEntities().forEach(entity=>{
                    if(entity.id==target.getDynamicProperty(`hp4_paint:babu`)) {
                        if(entity.getProperty(`hp4_paint:paint_materials`)) {
                            entity.setProperty(`hp4_paint:paint_materials`, false);
                            entity.runCommand(`playsound mob.sheep.shear @a ~~~`);
                            player.getGameMode() != 'creative' ? entity.runCommand(`loot spawn ${frontTarget.x} ${frontTarget.y} ${frontTarget.z} loot "heropixels/more_paintings/glow_ink_sac"`) : null;
                        }
                    }
                })
            }
            if(item.typeId === 'hp4_paint:special_tool' && !main.checkOutlineFilter(target, 'hp4_paint:special_tool')) {
                try {
                    if(player.getDynamicProperty(`hp4_paint:particles`)) {
                        target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                        // target.runCommand(`particle hp4_paint:dust ~~1~`)
                        // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                        
                        target.dimension.getEntities({type:`hp4_paint:particle_objects`, closest:1}).some(e=>{
                            e.remove()
                        })
                        const objectLoc = {
                            x: target.location.x,
                            y: target.location.y + getEntityHeight(target) - 1,
                            z: target.location.z
                        }
                        const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, objectLoc)
                        object.setProperty(`hp4_paint:model`, 0)
                        system.runTimeout(()=>{
                            try {
                                object.remove()
                            } catch (error) {
                            }
                        },5*20
                        )
                        target.runCommand(`function hp/more_paintings/hammer_start`)
                        system.runTimeout(()=>{
                            try {
                                target.runCommand(`function hp/more_paintings/hammer_finish_wood`)
                            } catch (error) {
                                
                            }
                        },1*20)
                    }
                    target.setProperty(`hp4_paint:furniture_model`, target.getProperty(`hp4_paint:furniture_model`) + 1)
                    target.dimension.getEntities().forEach(arg=>{
                        if(arg.id == target.getDynamicProperty(`hp4_paint:babu`)) {
                            system.runTimeout(()=>{
                                arg.setProperty(`hp4_paint:furniture_model`, target.getProperty(`hp4_paint:furniture_model`))
                            },1)
                        }
                    })
                } catch (error) {
                    try {
                        if(player.getDynamicProperty(`hp4_paint:particles`)) {
                            target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                            // target.runCommand(`particle hp4_paint:dust ~~1~`)
                            // target.runCommand(`particle hp4_paint:dust2 ~~1~`)

                            target.dimension.getEntities({type:`hp4_paint:particle_objects`, closest:1}).some(e=>{
                                e.remove()
                            })
                            const objectLoc = {
                                x: target.location.x,
                                y: target.location.y + getEntityHeight(target) - 1,
                                z: target.location.z
                            }
                            const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, objectLoc)
                            object.setProperty(`hp4_paint:model`, 0)
                            system.runTimeout(()=>{
                                try {
                                    object.remove()
                                } catch (error) {
                                }
                            },5*20
                            )
                            target.runCommand(`function hp/more_paintings/hammer_start`)
                            system.runTimeout(()=>{
                                try {
                                    target.runCommand(`function hp/more_paintings/hammer_finish_wood`)
                                } catch (error) {

                                }
                            },1*20)
                        }
                        target.setProperty(`hp4_paint:furniture_model`, 0)
                        target.dimension.getEntities().forEach(arg=>{
                            if(arg.id == target.getDynamicProperty(`hp4_paint:babu`)) {
                                system.runTimeout(()=>{
                                    arg.setProperty(`hp4_paint:furniture_model`, 0)
                                },1)
                            }
                        })
                    } catch (error) {
                        
                    }
                }
            }
            if(item.typeId == 'hp4_paint:brush' && !main.checkOutlineFilter(target, 'hp4_paint:brush')) {
                // target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                // target.runCommand(`particle hp4_paint:dust ~~1~`)
                // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                try {
                    if(player.getDynamicProperty(`hp4_paint:particles`)) {
                        target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                        // target.runCommand(`particle hp4_paint:dust ~~1~`)
                        // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                        
                        target.dimension.getEntities({type:`hp4_paint:particle_objects`, closest:1}).some(e=>{
                            e.remove()
                        })
                        const objectLoc = {
                            x: target.location.x,
                            y: target.location.y + getEntityHeight(target) - 1,
                            z: target.location.z
                        }
                        const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, objectLoc)
                        object.setProperty(`hp4_paint:model`, 2)
                        system.runTimeout(()=>{
                            try {
                                object.remove()
                            } catch (error) {
                            }
                        },5*20
                        )
                        target.runCommand(`function hp/more_paintings/brush_start`)
                        system.runTimeout(()=>{
                            try {
                                target.runCommand(`function hp/more_paintings/brush_finish`)
                            } catch (error) {
                                
                            }
                        },1*20)
                    }
                    target.setProperty(`hp4_paint:furniture_color`, target.getProperty(`hp4_paint:furniture_color`) + 1)
                    target.dimension.getEntities().forEach(arg=>{
                        if(arg.id == target.getDynamicProperty(`hp4_paint:babu`)) {
                            system.runTimeout(()=>{
                                arg.setProperty(`hp4_paint:furniture_color`, target.getProperty(`hp4_paint:furniture_color`))
                            },1)
                        }
                    })
                } catch (error) {
                    try {
                        if(player.getDynamicProperty(`hp4_paint:particles`)) {
                            target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                            // target.runCommand(`particle hp4_paint:dust ~~1~`)
                            // target.runCommand(`particle hp4_paint:dust2 ~~1~`)

                            target.dimension.getEntities({type:`hp4_paint:particle_objects`, closest:1}).some(e=>{
                                e.remove()
                            })
                            const objectLoc = {
                                x: target.location.x,
                                y: target.location.y + getEntityHeight(target) - 1,
                                z: target.location.z
                            }
                            const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, objectLoc)
                            object.setProperty(`hp4_paint:model`, 2)
                            system.runTimeout(()=>{
                                try {
                                    object.remove()
                                } catch (error) {
                                }
                            },5*20
                            )
                            target.runCommand(`function hp/more_paintings/brush_start`)
                            system.runTimeout(()=>{
                                try {
                                    target.runCommand(`function hp/more_paintings/brush_finish`)
                                } catch (error) {

                                }
                            },1*20)
                        }
                        target.setProperty(`hp4_paint:furniture_color`, 0)
                        target.dimension.getEntities().forEach(arg=>{
                            if(arg.id == target.getDynamicProperty(`hp4_paint:babu`)) {
                                system.runTimeout(()=>{
                                    arg.setProperty(`hp4_paint:furniture_color`, 0)
                                },1)
                            }
                        })
                    } catch (error) {
                        
                    }
                }
            }
            // main.frames.forEach(frame=>{
            //     if(item.typeId==`hp4_paint:${frame}.frame`) {
            //         target.dimension.getEntities().forEach(entity=>{
            //             if(entity.id==target.getDynamicProperty(`hp4_paint:babu`)) {
            //                 if(entity.getProperty(`hp4_paint:frame_type`) != frame) {
            //                     player.getGameMode() != 'creative' ? entity.runCommand(`loot spawn ^^^1 loot "heropixels/more_paintings/frames/${entity.getProperty('hp4_paint:frame_type')}"`) : null;
            //                     entity.setProperty(`hp4_paint:frame_type`, frame);
            //                     player.getGameMode() != 'creative' ? player.runCommand(`clear @s hp4_paint:${frame}.frame 0 1`) : null;
            //                     entity.runCommand(`playsound dig.wood @a ~~~`)
            //                 }
            //             }
            //         })
            //     }
            // })
        }
        else {
            target.dimension.getEntities().forEach(entity=>{
                if(entity.id==target.getDynamicProperty(`hp4_paint:babu`)) {
                    if(player.isSneaking) {
                        target.setDynamicProperty(`hp4_paint:babu`, null)
                        target.setProperty(`hp4_paint:paint_installed`, false)
                        entity.triggerEvent('death');
                    } else {
                        const model = entity.getProperty(`hp4_paint:paint_models`)
                        //FUNCTION GANTI GAMBAR
                        main.gantiGambar(entity, model)
                        entity.runCommand(`playsound dig.wood @a ~~~`)
                    }
                }
            })
        }
    }
    furnitures.forEach(furniture=>{
        if(item && target.typeId == furniture && (furniture.includes('planter') || furniture.includes('vase'))) {
            {
                const height = getHeight(furniture, item.typeId)
                const slot0 = target.getDynamicProperty(`hp4_paint:slot0`), slot1 = target.getDynamicProperty(`hp4_paint:slot1`), slot2 = target.getDynamicProperty(`hp4_paint:slot2`), slot3 = target.getDynamicProperty(`hp4_paint:slot3`), slot4 = target.getDynamicProperty(`hp4_paint:slot4`)
                flowers.forEach(flower=>{
                    if(item.typeId==`minecraft:${flower}`) {
                        const itemNumber = flowers.indexOf(flower);
                        //kontol.warn(itemNumber)
                        target.runCommand(`playsound use.grass @a ~~~`)
                        if(slot0 != undefined && slot1 != undefined && slot2 != undefined && slot3 != undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 4, 'flower', height, player, item)
                        }
                        if(slot0 != undefined && slot1 != undefined && slot2 != undefined && slot3 == undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 3, 'flower', height, player, item)
                        }
                        if(slot0 != undefined && slot1 != undefined && slot2 == undefined && slot3 == undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 2, 'flower', height, player, item)
                        }
                        if(slot0 != undefined && slot1 == undefined && slot2 == undefined && slot3 == undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 1, 'flower', height, player, item)
                        }
                        if(slot0 == undefined && slot1 == undefined && slot2 == undefined && slot3 == undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 0, 'flower', height, player, item)
                        }
                    }
                })
                doublePlants.forEach(flower=>{
                    if(item.typeId==`minecraft:${flower}`) {
                        const itemNumber = doublePlants.indexOf(flower);
                        //kontol.warn(itemNumber)
                        target.runCommand(`playsound use.grass @a ~~~`)
                        if(slot0 != undefined && slot1 != undefined && slot2 != undefined && slot3 != undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 4, 'double_plant', height, player, item)
                        }
                        if(slot0 != undefined && slot1 != undefined && slot2 != undefined && slot3 == undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 3, 'double_plant', height, player, item)
                        }
                        if(slot0 != undefined && slot1 != undefined && slot2 == undefined && slot3 == undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 2, 'double_plant', height, player, item)
                        }
                        if(slot0 != undefined && slot1 == undefined && slot2 == undefined && slot3 == undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 1, 'double_plant', height, player, item)
                        }
                        if(slot0 == undefined && slot1 == undefined && slot2 == undefined && slot3 == undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 0, 'double_plant', height, player, item)
                        }
                    }
                })
                customPlants.forEach(flower=>{
                    if(item.typeId==`minecraft:${flower}`) {
                        const itemNumber = customPlants.indexOf(flower);
                        //kontol.warn(itemNumber)
                        target.runCommand(`playsound use.grass @a ~~~`)
                        if(slot0 != undefined && slot1 != undefined && slot2 != undefined && slot3 != undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 4, 'custom_plant', height, player, item)
                        }
                        if(slot0 != undefined && slot1 != undefined && slot2 != undefined && slot3 == undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 3, 'custom_plant', height, player, item)
                        }
                        if(slot0 != undefined && slot1 != undefined && slot2 == undefined && slot3 == undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 2, 'custom_plant', height, player, item)
                        }
                        if(slot0 != undefined && slot1 == undefined && slot2 == undefined && slot3 == undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 1, 'custom_plant', height, player, item)
                        }
                        if(slot0 == undefined && slot1 == undefined && slot2 == undefined && slot3 == undefined && slot4 == undefined) {
                            plantsHolderAddProperty(target, itemNumber, 0, 'custom_plant', height, player, item)
                        }
                    }
                })
            }
        }

        //NEW FURNITURE VARIANT MANAGER
        if(target.typeId == furniture) {
            if(item.typeId == 'hp4_paint:special_tool' && !main.checkOutlineFilter(target, 'hp4_paint:special_tool')) {
                try {
                    if(player.getDynamicProperty(`hp4_paint:particles`)) {
                        target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                        // target.runCommand(`particle hp4_paint:dust ~~1~`)
                        // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                        
                        target.dimension.getEntities({type:`hp4_paint:particle_objects`, closest:1}).some(e=>{
                            e.remove()
                        })
                        const objectLoc = {
                            x: target.location.x,
                            y: target.location.y + getEntityHeight(target) - 1,
                            z: target.location.z
                        }
                        const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, objectLoc)
                        object.setProperty(`hp4_paint:model`, 0)
                        system.runTimeout(()=>{
                            try {
                                object.remove()
                            } catch (error) {
                            }
                        },5*20
                        )
                        target.runCommand(`function hp/more_paintings/hammer_start`)
                        system.runTimeout(()=>{
                            try {
                                target.runCommand(`function hp/more_paintings/hammer_finish_wood`)
                            } catch (error) {
                                
                            }
                        },1*20)
                    }
                    target.setProperty(`hp4_paint:furniture_model`, target.getProperty(`hp4_paint:furniture_model`) + 1)

                    //Place Collision
                    getEntitySize(target, true)
                } catch (error) {
                    try {
                        if(player.getDynamicProperty(`hp4_paint:particles`)) {
                            target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                            // target.runCommand(`particle hp4_paint:dust ~~1~`)
                            // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                            
                            target.dimension.getEntities({type:`hp4_paint:particle_objects`, closest:1}).some(e=>{
                                e.remove()
                            })
                            const objectLoc = {
                                x: target.location.x,
                                y: target.location.y + getEntityHeight(target) - 1,
                                z: target.location.z
                            }
                            const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, objectLoc)
                            object.setProperty(`hp4_paint:model`, 0)
                            system.runTimeout(()=>{object.remove()},5*20)
                            target.runCommand(`function hp/more_paintings/hammer_start`)
                            system.runTimeout(()=>{
                                target.runCommand(`function hp/more_paintings/hammer_finish_wood`)
                            },1*20)
                            target.setProperty(`hp4_paint:furniture_model`, 0)
                        }

                        //Place Collision
                        getEntitySize(target, true)
                    } catch (error) {
                        
                    }
                }
            }
            if(item.typeId == 'hp4_paint:brush' && !main.checkOutlineFilter(target, 'hp4_paint:brush')) {
                try {
                    if(player.getDynamicProperty(`hp4_paint:particles`)) {
                        target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                        // target.runCommand(`particle hp4_paint:dust ~~1~`)
                        // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                        
                        target.dimension.getEntities({type:`hp4_paint:particle_objects`, closest:1}).some(e=>{
                            e.remove()
                        })
                        const objectLoc = {
                            x: target.location.x,
                            y: target.location.y + getEntityHeight(target) - 1,
                            z: target.location.z
                        }
                        const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, objectLoc)
                        object.setProperty(`hp4_paint:model`, 2)
                        system.runTimeout(()=>{
                            try {
                                object.remove()
                            } catch (error) {
                            }
                        },5*20
                        )
                        target.runCommand(`function hp/more_paintings/brush_start`)
                        system.runTimeout(()=>{
                            try {
                                target.runCommand(`function hp/more_paintings/brush_finish`)
                            } catch (error) {
                                
                            }
                        },1*20)
                    }
                    target.setProperty(`hp4_paint:furniture_color`, target.getProperty(`hp4_paint:furniture_color`) + 1)
                } catch (error) {
                    try {
                        if(player.getDynamicProperty(`hp4_paint:particles`)) {
                            target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                            // target.runCommand(`particle hp4_paint:dust ~~1~`)
                            // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                            
                            target.dimension.getEntities({type:`hp4_paint:particle_objects`, closest:1}).some(e=>{
                                e.remove()
                            })
                            const objectLoc = {
                                x: target.location.x,
                                y: target.location.y + getEntityHeight(target) - 1,
                                z: target.location.z
                            }
                            const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, objectLoc)
                            object.setProperty(`hp4_paint:model`, 2)
                            system.runTimeout(()=>{
                                try {
                                    object.remove()
                                } catch (error) {
                                }
                            },5*20
                            )
                            target.runCommand(`function hp/more_paintings/brush_start`)
                            system.runTimeout(()=>{
                                try {
                                    target.runCommand(`function hp/more_paintings/brush_finish`)
                                } catch (error) {
                                    
                                }
                            },1*20)
                        }
                        target.setProperty(`hp4_paint:furniture_color`, 0)
                    } catch (error) {
                        
                    }
                }
            }
            if(item.typeId == 'hp4_paint:chisel' && main.checkOutlineFilter(target, 'hp4_paint:chisel')) {
                try {
                    if(player.getDynamicProperty(`hp4_paint:particles`)) {
                        target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                        // target.runCommand(`particle hp4_paint:dust ~~1~`)
                        // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                        
                        system.runTimeout(()=>{object.remove()},5*20)
                        target.runCommand(`function hp/more_paintings/hammer_start`)
                        system.runTimeout(()=>{target.runCommand(`function hp/more_paintings/hammer_finish_stone`)},1*20)

                        
                        target.dimension.getEntities({type:`hp4_paint:particle_objects`, closest:1}).some(e=>{
                            e.remove()
                        })
                        const objectLoc = {
                            x: target.location.x,
                            y: target.location.y + getEntityHeight(target) - 1,
                            z: target.location.z
                        }
                        const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, objectLoc)
                        object.setProperty(`hp4_paint:model`, 1)
                        system.runTimeout(()=>{object.remove()},5*20)
                    }
                    target.setProperty(`hp4_paint:statue_pose`, target.getProperty(`hp4_paint:statue_pose`) + 1)
                } catch (error) {
                    try {
                        if(player.getDynamicProperty(`hp4_paint:particles`)) {
                            target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                            // target.runCommand(`particle hp4_paint:dust ~~1~`)
                            // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                            
                            system.runTimeout(()=>{object.remove()},5*20)
                            target.runCommand(`function hp/more_paintings/hammer_start`)
                            system.runTimeout(()=>{target.runCommand(`function hp/more_paintings/hammer_finish_stone`)},1*20)

                            target.dimension.getEntities({type:`hp4_paint:particle_objects`, closest:1}).some(e=>{
                                e.remove()
                            })
                            const objectLoc = {
                                x: target.location.x,
                                y: target.location.y + getEntityHeight(target) - 1,
                                z: target.location.z
                            }
                            const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, objectLoc)
                            object.setProperty(`hp4_paint:model`, 1)
                            system.runTimeout(()=>{object.remove()},5*20)
                        }
                        target.setProperty(`hp4_paint:statue_pose`, 0)
                    } catch (error) {
                        
                    }
                }
            }
        }

        //OLD FURNITURE VARIANT MANAGER
        // if(item && target.typeId == furniture && (furniture == 'hp4_paint:art_bench' || furniture.includes('color_bucket') || furniture == 'hp4_paint:spatula' || furniture == 'hp4_paint:brush_cleaner_jar' || furniture == 'hp4_paint:brushes_set' || furniture == 'hp4_paint:tube_paint')) {
        ////     console.warn('script masuk')
        //     if(item.typeId === 'hp4_paint:special_tool') {
        //         try {
        //             let maxModel
        //             furnitureMaxModel.forEach(f=>{
        //                 if(furniture.includes(f.nama)) {
        //                     maxModel = f.max
        //                 }
        //             })
        //             target.setProperty(`hp4_paint:furniture_model`, target.getProperty(`hp4_paint:furniture_model`) >= maxModel ? 0 : target.getProperty(`hp4_paint:furniture_model`) + 1)
        //             target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
        //             target.runCommand(`particle hp4_paint:dust ~~1~`)
        //             target.runCommand(`particle hp4_paint:dust2 ~~1~`)
        //             target.dimension.getEntities().forEach(arg=>{
        //                 if(arg.id == target.getDynamicProperty(`hp4_paint:babu`)) {
        //                     arg.setProperty(`hp4_paint:furniture_model`, arg.getProperty(`hp4_paint:furniture_model`) >= maxModel ? 0 : arg.getProperty(`hp4_paint:furniture_model`) + 1)
        //                 }
        //             })
        //         } catch (error) {
                    
        //         }
        //     }
        // }
    })
})
function getHeight(furniture, item) {
    let height
    switch (furniture) {
        case 'hp4_paint:vase_planter':
            height = 9
            break;
        case 'hp4_paint:round_planter':
            height = 9
            break;
        case 'hp4_paint:large_planter':
            height = 16
            break;
        case 'hp4_paint:wide_planter':
            height = 13
            break;
        case 'hp4_paint:thin_planter':
            height = 16
            break;
        case 'hp4_paint:vase':
            height = 8
            break;
        default:
            break;
    }
    return item == 'minecraft:pitcher_plant' ? height-5 : height
}
function plantsHolderAddProperty(entity, itemNumber, slot, type, height, player, item) {
    let loc
    if(entity.getDynamicProperty('hp4_paint:slot') < slot) return;
    loc = getSlotLocations(entity, slot)
    const plantsHolder = entity.dimension.spawnEntity(`hp4_paint:plants_holder`, loc)
    entity.setDynamicProperty(`hp4_paint:slot${slot}`, plantsHolder.id)
    plantsHolder.setProperty('hp4_paint:height', height)
    //kontol.warn(`slot${slot} id: ${entity.getDynamicProperty(`hp4_paint:slot${slot}`)}`)
    try {plantsHolder.setProperty(`hp4_paint:${type}`, itemNumber);} catch (error) {}
    player.getGameMode() != 'creative' ? player.runCommand(`clear @s ${item.typeId} 0 1`) : null;
}
function getSlotLocations(entity, slot) {
    let loc
    if(entity.typeId == 'hp4_paint:large_planter') {
        switch (slot) {
            case 0:
                loc = {
                    x: entity.location.x,
                    y: entity.location.y,
                    z: entity.location.z
                }
                break;
            case 1:
                loc = {
                    x: entity.location.x + 0.51,
                    y: entity.location.y - 0.001,
                    z: entity.location.z + 0.52
                }
                break;
            case 2:
                loc = {
                    x: entity.location.x + 0.53,
                    y: entity.location.y - 0.002,
                    z: entity.location.z - 0.541
                }
                break;
            case 3:
                loc = {
                    x: entity.location.x - 0.512,
                    y: entity.location.y - 0.003,
                    z: entity.location.z + 0.541
                }
                break;
            case 4:
                loc = {
                    x: entity.location.x - 0.5412,
                    y: entity.location.y - 0.004,
                    z: entity.location.z - 0.551
                }
                break;
            default:
                break;
        }
    }
    if(entity.typeId == 'hp4_paint:round_planter') {
        switch (slot) {
            case 0:
                loc = {
                    x: entity.location.x,
                    y: entity.location.y,
                    z: entity.location.z
                }
                break;
        
            default:
                break;
        }
    }
    if(entity.typeId == 'hp4_paint:vase') {
        switch (slot) {
            case 0:
                loc = {
                    x: entity.location.x,
                    y: entity.location.y,
                    z: entity.location.z
                }
                break;
        
            default:
                break;
        }
    }
    if(entity.typeId == 'hp4_paint:wide_planter') {
        switch (slot) {
            case 0:
                loc = {
                    x: entity.location.x + getXZfromRotation(entity, 'x', 'center', 0) * 0.814,
                    y: entity.location.y - 0.005,
                    z: entity.location.z + getXZfromRotation(entity, 'z', 'center', 0) * 0.823
                }
                break;
            case 1:
                loc = {
                    x: entity.location.x + getXZfromRotation(entity, 'x', 'left', 0) * 0.831,
                    y: entity.location.y - 0.003,
                    z: entity.location.z + getXZfromRotation(entity, 'z', 'left', 0) * 0.842
                }
                break;
            case 2:
                loc = {
                    x: entity.location.x + getXZfromRotation(entity, 'x', 'right', 0) * 0.851,
                    y: entity.location.y - 0.001,
                    z: entity.location.z + getXZfromRotation(entity, 'z', 'right', 0) * 0.853
                }
                break;
        
            default:
                break;
        }
    }
    if(entity.typeId == 'hp4_paint:thin_planter') {
        switch (slot) {
            case 0:
                loc = {
                    x: entity.location.x + getXZfromRotation(entity, 'x', 'center', -0.3) * 0.613,
                    y: entity.location.y - 0.004,
                    z: entity.location.z + getXZfromRotation(entity, 'z', 'center', -0.3) * 0.6421
                }
                break;
            case 1:
                loc = {
                    x: entity.location.x + getXZfromRotation(entity, 'x', 'left', -0.3) * 0.651,
                    y: entity.location.y - 0.001,
                    z: entity.location.z + getXZfromRotation(entity, 'z', 'left', -0.3) * 0.635
                }
                break;
            case 2:
                loc = {
                    x: entity.location.x + getXZfromRotation(entity, 'x', 'right', -0.3) * 0.6142,
                    y: entity.location.y - 0.003,
                    z: entity.location.z + getXZfromRotation(entity, 'z', 'right', -0.3) * 0.615
                }
                break;
        
            default:
                break;
        }
    }
    return loc
}
function getXZfromRotation(entity, xz, direction, offset = 0) {
    let newRotation = entity.getRotation().y+(-entity.getRotation().y+(Math.round(entity.getRotation().y/90)*90))
    if(newRotation == 0) {
        //kontol.warn(newRotation)
        if(xz == 'x') {
            return direction == 'left' ? -1 : direction == 'right' ? 1 : 0;
        } else if(xz == 'z') {
            return offset;
        }
    } else if(newRotation == 180 || newRotation == -180) {
        //kontol.warn(newRotation)
        if(xz == 'x') {
            return direction == 'left' ? 1 : direction == 'right' ? -1 : 0;
        } else if(xz == 'z') {
            return Math.abs(offset);
        }
    } else if(newRotation == 90) {
        //kontol.warn(newRotation)
        if(xz == 'x') {
            return Math.abs(offset);
        } else if(xz == 'z') {
            return direction == 'left' ? -1 : direction == 'right' ? 1 : 0;
        }
    } else if(newRotation == -90) {
        //kontol.warn(newRotation)
        if(xz == 'x') {
            return offset;
        } else if(xz == 'z') {
            return direction == 'left' ? 1 : direction == 'right' ? -1 : 0;
        }
    }
    return 0;
}
world.afterEvents.entityHitEntity.subscribe((arg)=>{
    const player = arg.damagingEntity
    const entity = arg.hitEntity
    const gamemode = player.getGameMode()

    const targetFront = getFrontPos(entity, 1)
    const slot0 = entity.getDynamicProperty(`hp4_paint:slot0`), slot1 = entity.getDynamicProperty(`hp4_paint:slot1`), slot2 = entity.getDynamicProperty(`hp4_paint:slot2`), slot3 = entity.getDynamicProperty(`hp4_paint:slot3`), slot4 = entity.getDynamicProperty(`hp4_paint:slot4`)
    if(furnitures.includes(entity.typeId) || displays.includes(entity.typeId)) {
        {
            let cancelRemove = false
            
            entity.dimension.getEntities().forEach(paint=>{
                if(entity.getDynamicProperty(`hp4_paint:slot0`)!=undefined) {
                    cancelRemove = true
                }
                try {
                    if(paint.id==entity.getDynamicProperty(`hp4_paint:babu`)) {
                        cancelRemove = true
                        if(paint.getProperty('hp4_paint:frame_type')=='none') {
                            //kontol.warn('hit')
                            gamemode != 'creative' ? (paint.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/${paint.typeId.replace('hp4_paint:', '').replace('_painting', '')}"`), paint.remove()) : paint.remove();
                            entity.setProperty(`hp4_paint:paint_installed`, false)
                        } else {
                            player.getGameMode() != 'creative' ? paint.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/frames/${paint.getProperty('hp4_paint:frame_type')}"`) : null;
                            paint.setProperty('hp4_paint:frame_type', 'none')
                        }
                    }
                } catch (error) {}
            })
            if(!cancelRemove) {
                const folder = `heropixels/more_paintings/${entity.typeId.replace('hp4_paint:', '')}`
                gamemode != 'creative' ? entity.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "${folder}"`) : null;
                resetCollision(entity, true, false, false)
                entity.remove()
            }
        }
        if(entity.typeId.includes(`planter`) || entity.typeId.includes(`vase`)){
            if(slot0 == undefined && slot1 == undefined && slot2 == undefined && slot3 == undefined && slot4 == undefined)  {
                entity.runCommand(`playsound hp4_paint:display.furniture_remove @a ~~~`)
                player.getGameMode() != 'creative' ? entity.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/${entity.typeId.replace('hp4_paint:', '')}"`) : null;
                resetCollision(entity, true)
                entity.remove()
                return
            }
            entity.dimension.getEntities().filter(plant => 
                plant.typeId == 'hp4_paint:plants_holder'
            ).forEach(plant=>{
                if(slot0 != undefined && slot1 == undefined && slot2 == undefined && slot3 == undefined && slot4 == undefined) {
                    //slot0
                    if(plant.id == slot0) {
                        plant.getProperty('hp4_paint:flower') >= 0 ? flowers[plant.getProperty('hp4_paint:flower')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${flowers[plant.getProperty('hp4_paint:flower')]}"`) : null : null : null
                        plant.getProperty('hp4_paint:double_plant') >= 0 ? doublePlants[plant.getProperty('hp4_paint:double_plant')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${doublePlants[plant.getProperty('hp4_paint:double_plant')]}"`) : null : null : null
                        plant.getProperty('hp4_paint:custom_plant') >= 0 ? customPlants[plant.getProperty('hp4_paint:custom_plant')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${customPlants[plant.getProperty('hp4_paint:custom_plant')]}"`) : null : null : null
                        plant.remove()
                        entity.setDynamicProperty(`hp4_paint:slot0`, undefined)
                        entity.runCommand(`playsound use.grass @a ~~~`)
                    }
                }
                if(slot0 != undefined && slot1 != undefined && slot2 == undefined && slot3 == undefined && slot4 == undefined) {
                    //slot1
                    if(plant.id == slot1) {
                        plant.getProperty('hp4_paint:flower') >= 0 ? flowers[plant.getProperty('hp4_paint:flower')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${flowers[plant.getProperty('hp4_paint:flower')]}"`) : null : null : null
                        plant.getProperty('hp4_paint:double_plant') >= 0 ? doublePlants[plant.getProperty('hp4_paint:double_plant')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${doublePlants[plant.getProperty('hp4_paint:double_plant')]}"`) : null : null : null
                        plant.getProperty('hp4_paint:custom_plant') >= 0 ? customPlants[plant.getProperty('hp4_paint:custom_plant')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${customPlants[plant.getProperty('hp4_paint:custom_plant')]}"`) : null : null : null
                        plant.remove()
                        entity.setDynamicProperty(`hp4_paint:slot1`, undefined)
                        entity.runCommand(`playsound use.grass @a ~~~`)
                    }
                }
                if(slot0 != undefined && slot1 != undefined && slot2 != undefined && slot3 == undefined && slot4 == undefined) {
                    //slot2
                    if(plant.id == slot2) {
                        plant.getProperty('hp4_paint:flower') >= 0 ? flowers[plant.getProperty('hp4_paint:flower')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${flowers[plant.getProperty('hp4_paint:flower')]}"`) : null : null : null
                        plant.getProperty('hp4_paint:double_plant') >= 0 ? doublePlants[plant.getProperty('hp4_paint:double_plant')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${doublePlants[plant.getProperty('hp4_paint:double_plant')]}"`) : null : null : null
                        plant.getProperty('hp4_paint:custom_plant') >= 0 ? customPlants[plant.getProperty('hp4_paint:custom_plant')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${customPlants[plant.getProperty('hp4_paint:custom_plant')]}"`) : null : null : null
                        plant.remove()
                        entity.setDynamicProperty(`hp4_paint:slot2`, undefined)
                        entity.runCommand(`playsound use.grass @a ~~~`)
                    }
                }
                if(slot0 != undefined && slot1 != undefined && slot2 != undefined && slot3 != undefined && slot4 == undefined) {
                    //slot3
                    if(plant.id == slot3) {
                        plant.getProperty('hp4_paint:flower') >= 0 ? flowers[plant.getProperty('hp4_paint:flower')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${flowers[plant.getProperty('hp4_paint:flower')]}"`) : null : null : null
                        plant.getProperty('hp4_paint:double_plant') >= 0 ? doublePlants[plant.getProperty('hp4_paint:double_plant')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${doublePlants[plant.getProperty('hp4_paint:double_plant')]}"`) : null : null : null
                        plant.getProperty('hp4_paint:custom_plant') >= 0 ? customPlants[plant.getProperty('hp4_paint:custom_plant')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${customPlants[plant.getProperty('hp4_paint:custom_plant')]}"`) : null : null : null
                        plant.remove()
                        entity.setDynamicProperty(`hp4_paint:slot3`, undefined)
                        entity.runCommand(`playsound use.grass @a ~~~`)
                    }
                }
                if(slot0 != undefined && slot1 != undefined && slot2 != undefined && slot3 != undefined && slot4 != undefined) {
                    //slot4
                    if(plant.id == slot4) {
                        plant.getProperty('hp4_paint:flower') >= 0 ? flowers[plant.getProperty('hp4_paint:flower')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${flowers[plant.getProperty('hp4_paint:flower')]}"`) : null : null : null
                        plant.getProperty('hp4_paint:double_plant') >= 0 ? doublePlants[plant.getProperty('hp4_paint:double_plant')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${doublePlants[plant.getProperty('hp4_paint:double_plant')]}"`) : null : null : null
                        plant.getProperty('hp4_paint:custom_plant') >= 0 ? customPlants[plant.getProperty('hp4_paint:custom_plant')] ? player.getGameMode() != 'creative' ? plant.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/plants/${customPlants[plant.getProperty('hp4_paint:custom_plant')]}"`) : null : null : null
                        plant.remove()
                        entity.setDynamicProperty(`hp4_paint:slot4`, undefined)
                        entity.runCommand(`playsound use.grass @a ~~~`)
                    }
                }
            })
            
        }
    }
})
function getFrontPos(entity, distance) {
    let newRotation = entity.getRotation().y+(-entity.getRotation().y+(Math.round(entity.getRotation().y/90)*90))
    //kontol.warn(newRotation)
    if(newRotation == 0) {
        return {
            x: Math.floor(entity.location.x) + 0.5,
            y: Math.floor(entity.location.y),
            z: Math.floor(entity.location.z + distance)
        }
    } else if(newRotation == 90) {
        return {
            x: Math.floor(entity.location.x - distance),
            y: Math.floor(entity.location.y),
            z: Math.floor(entity.location.z)
        }
    } else if(newRotation == 180 || newRotation == -180) {
        return {
            x: Math.floor(entity.location.x),
            y: Math.floor(entity.location.y),
            z: Math.floor(entity.location.z - distance)
        }
    } else if(newRotation == -90) {
        return {
            x: Math.floor(entity.location.x + distance),
            y: Math.floor(entity.location.y),
            z: Math.floor(entity.location.z)
        }
    }
}
function getEntitySize(entity, isNext = false) {
    system.runTimeout(()=>{
        resetCollision(entity, true, false, isNext)
        let newRotation = entity.getRotation().y+(-entity.getRotation().y+(Math.round(entity.getRotation().y/90)*90))
        switch (entity.typeId) {
            //Display
            case `hp4_paint:easel_stand`:
                blockDetect(entity, newRotation, {radius: 1, height: 2})
                break;
            case `hp4_paint:display_case`:
                blockDetect(entity, newRotation, {radius: 1, height: 3})
                break;
            case `hp4_paint:display_case_wide`:
                blockDetect(entity, newRotation, {radius: 3, height: 2})
                break;
            case `hp4_paint:display_case_big`:
                blockDetect(entity, newRotation, {radius: 3, height: 4})
                break;
            case `hp4_paint:display_case_tall`:
                blockDetect(entity, newRotation, {radius: 3, height: 6})
                break;
            case `hp4_paint:display_case_huge`:
                blockDetect(entity, newRotation, {radius: 5, height: 6})
                break;
            case `hp4_paint:display_case_wide2`:
                blockDetect(entity, newRotation, {radius: 7, height: 4})
                break;
            //Furnitures
            case `hp4_paint:cabinet`:
                blockDetect(entity, newRotation, {radius: 3, height: 3})
                break;
            case `hp4_paint:statue_painting`:
                blockDetect(entity, newRotation, {radius: 1, height: 3})
                break;
            case `hp4_paint:brush_on_shelf`:
                if(entity.getProperty(`hp4_paint:furniture_model`) == 0) {
                    blockDetect(entity, newRotation, {radius: 1, height: 1})
                } else if(entity.getProperty(`hp4_paint:furniture_model`) == 1) {
                    blockDetect(entity, newRotation, {radius: 2, height: 1})
                }
                break;
            case `hp4_paint:jewellery_components`:
            case `hp4_paint:variant_paint_bottle`:
            case `hp4_paint:sack_of_beton`:
            case `hp4_paint:lying_bottle_color`:
            case `hp4_paint:stool`:
            case `hp4_paint:sketchbook`:
            case `hp4_paint:chalk_and_charcoal`:
            case `hp4_paint:spatula`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:art_chair`:
                blockDetect(entity, newRotation, {radius: 1, height: 2})
                break;
            case `hp4_paint:canvas`:
                if(entity.getProperty(`hp4_paint:furniture_model`) == 0) {
                    blockDetect(entity, newRotation, {radius: 1, height: 1})
                } else if(entity.getProperty(`hp4_paint:furniture_model`) == 1) {
                    blockDetect(entity, newRotation, {radius: 2, height: 1})
                } else if(entity.getProperty(`hp4_paint:furniture_model`) == 2) {
                    blockDetect(entity, newRotation, {radius: 1, height: 2})
                }
                break;
            case `hp4_paint:powderjar`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:sewing_kit`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:unfinished_wooden_block`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:stencil`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:spray_can`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:soft_pastel_box`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:sculpture_stand`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:pencil_set`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:painting_brush`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:paint_tubes`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:marker_set`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:eraser_sharpener`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:drawing_tube`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:drafting_tools`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_swatch`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:brush_holder_cup`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:brush_cleaner_cup`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:artist_box`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:art_knives`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:brush_cleaner_jar`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:tube_paint`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:brushes_set`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:art_bench`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_black`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_blue`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_brown`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_cyan`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_gray`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_green`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_light_blue`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_light_gray`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_lime`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_magenta`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_orange`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_pink`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_purple`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_red`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_white`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket_yellow`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:color_bucket`:
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            //Planters
            case `hp4_paint:large_planter`:
                entity.setDynamicProperty('hp4_paint:slot', 4)
                blockDetect(entity, newRotation, {radius: 3, height: 1}, true)
                break;
            case `hp4_paint:round_planter`:
                entity.setDynamicProperty('hp4_paint:slot', 0)
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:thin_planter`:
                entity.setDynamicProperty('hp4_paint:slot', 2)
                blockDetect(entity, newRotation, {radius: 3, height: 1})
                break;
            case `hp4_paint:vase`:
                entity.setDynamicProperty('hp4_paint:slot', 0)
                blockDetect(entity, newRotation, {radius: 1, height: 1})
                break;
            case `hp4_paint:wide_planter`:
                entity.setDynamicProperty('hp4_paint:slot', 2)
                blockDetect(entity, newRotation, {radius: 3, height: 1})
                break;
            default:
                break;
        }
    },1)
}
function getEntityHeight(entity) {
    const type = entity.typeId
    const model = entity.getProperty?.(`hp4_paint:furniture_model`)

    switch (type) {
        // Display
        case `hp4_paint:easel_stand`: return 2
        case `hp4_paint:display_case`: return 3
        case `hp4_paint:display_case_wide`: return 2
        case `hp4_paint:display_case_big`: return 4
        case `hp4_paint:display_case_tall`: return 6
        case `hp4_paint:display_case_huge`: return 6
        case `hp4_paint:display_case_wide2`: return 4

        // Furnitures
        case `hp4_paint:cabinet`: return 3
        case `hp4_paint:statue_painting`: return 3

        case `hp4_paint:brush_on_shelf`:
            if (model === 1) return 1
            return 1

        case `hp4_paint:canvas`:
            if (model === 2) return 2
            return 1

        case `hp4_paint:art_chair`: return 2

        // Small items (height 1 gang)
        case `hp4_paint:jewellery_components`:
        case `hp4_paint:variant_paint_bottle`:
        case `hp4_paint:sack_of_beton`:
        case `hp4_paint:lying_bottle_color`:
        case `hp4_paint:stool`:
        case `hp4_paint:sketchbook`:
        case `hp4_paint:chalk_and_charcoal`:
        case `hp4_paint:spatula`:
        case `hp4_paint:powderjar`:
        case `hp4_paint:sewing_kit`:
        case `hp4_paint:unfinished_wooden_block`:
        case `hp4_paint:stencil`:
        case `hp4_paint:spray_can`:
        case `hp4_paint:soft_pastel_box`:
        case `hp4_paint:sculpture_stand`:
        case `hp4_paint:pencil_set`:
        case `hp4_paint:painting_brush`:
        case `hp4_paint:paint_tubes`:
        case `hp4_paint:marker_set`:
        case `hp4_paint:eraser_sharpener`:
        case `hp4_paint:drawing_tube`:
        case `hp4_paint:drafting_tools`:
        case `hp4_paint:color_swatch`:
        case `hp4_paint:brush_holder_cup`:
        case `hp4_paint:brush_cleaner_cup`:
        case `hp4_paint:artist_box`:
        case `hp4_paint:art_knives`:
        case `hp4_paint:brush_cleaner_jar`:
        case `hp4_paint:tube_paint`:
        case `hp4_paint:brushes_set`:
        case `hp4_paint:art_bench`:
        case `hp4_paint:color_bucket`:
        case `hp4_paint:color_bucket_black`:
        case `hp4_paint:color_bucket_blue`:
        case `hp4_paint:color_bucket_brown`:
        case `hp4_paint:color_bucket_cyan`:
        case `hp4_paint:color_bucket_gray`:
        case `hp4_paint:color_bucket_green`:
        case `hp4_paint:color_bucket_light_blue`:
        case `hp4_paint:color_bucket_light_gray`:
        case `hp4_paint:color_bucket_lime`:
        case `hp4_paint:color_bucket_magenta`:
        case `hp4_paint:color_bucket_orange`:
        case `hp4_paint:color_bucket_pink`:
        case `hp4_paint:color_bucket_purple`:
        case `hp4_paint:color_bucket_red`:
        case `hp4_paint:color_bucket_white`:
        case `hp4_paint:color_bucket_yellow`:
             return 1
        // Planters
        case `hp4_paint:large_planter`: return 1
        case `hp4_paint:round_planter`: return 1
        case `hp4_paint:thin_planter`: return 1
        case `hp4_paint:vase`: return 1
        case `hp4_paint:wide_planter`: return 1

        default:
            return 0
    }
}
function blockDetect(entity, rot, requiredSpace, isRound) {
    const radius = requiredSpace.radius
    const height = requiredSpace.height
    let rightSide
    let leftSide
    let upSide
    let downSide

    let forWard
    let BackWard

    let radiusCheck = true
    let heightCheck = true

    let availableRadius = rightSide + leftSide - 1
    
    //Fix Position
    if(radius != 2) {
        try {
            if(isRound) {
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x + index,
                        y: entity.location.y,
                        z: entity.location.z
                    }
                    rightSide = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x - index,
                        y: entity.location.y,
                        z: entity.location.z
                    }
                    leftSide = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x,
                        y: entity.location.y,
                        z: entity.location.z + index
                    }
                    forWard = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x,
                        y: entity.location.y,
                        z: entity.location.z - index
                    }
                    BackWard = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
            } else {
                if(rot == 0 || rot == 180 || rot == -180) {
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x + index,
                        y: entity.location.y,
                        z: entity.location.z
                    }
                    rightSide = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x - index,
                        y: entity.location.y,
                        z: entity.location.z
                    }
                    leftSide = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                }
                if(rot == 90 || rot == 270 || rot == -90 || rot == -270) {
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x,
                        y: entity.location.y,
                        z: entity.location.z + index
                    }
                    rightSide = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x,
                        y: entity.location.y,
                        z: entity.location.z - index
                    }
                    leftSide = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                }
            }
            availableRadius = rightSide + leftSide - 1
            if(isRound) {
                if((rightSide < radius/2)) {
                    entity.teleport({
                        x: entity.location.x - 1,
                        y: entity.location.y,
                        z: entity.location.z
                    })
                    blockDetect(entity, rot, requiredSpace)
                    return;
                }
                if((leftSide < radius/2)) {
                    entity.teleport({
                        x: entity.location.x + 1,
                        y: entity.location.y,
                        z: entity.location.z
                    })
                    blockDetect(entity, rot, requiredSpace)
                    return;
                }
                if((forWard < radius/2)) {
                    entity.teleport({
                        x: entity.location.x,
                        y: entity.location.y,
                        z: entity.location.z - 1
                    })
                    blockDetect(entity, rot, requiredSpace)
                    return;
                }
                if((BackWard < radius/2)) {
                    entity.teleport({
                        x: entity.location.x,
                        y: entity.location.y,
                        z: entity.location.z + 1
                    })
                    blockDetect(entity, rot, requiredSpace)
                    return;
                }
            } else {
                if(availableRadius >= radius){
                    if(rot == 0 || rot == 180 || rot == -180) {
                        if((rightSide < radius/2)) {
                            entity.teleport({
                                x: entity.location.x - 1,
                                y: entity.location.y,
                                z: entity.location.z
                            })
                            blockDetect(entity, rot, requiredSpace)
                            return;
                        }
                        if((leftSide < radius/2)) {
                            entity.teleport({
                                x: entity.location.x + 1,
                                y: entity.location.y,
                                z: entity.location.z
                            })
                            blockDetect(entity, rot, requiredSpace)
                            return;
                        }
                    }
                    if(rot == 90 || rot == 270 || rot == -90 || rot == -270) {
                        if((rightSide < radius/2)) {
                            entity.teleport({
                                x: entity.location.x,
                                y: entity.location.y,
                                z: entity.location.z - 1
                            })
                            blockDetect(entity, rot, requiredSpace)
                            return;
                        }
                        if((leftSide < radius/2)) {
                            entity.teleport({
                                x: entity.location.x,
                                y: entity.location.y,
                                z: entity.location.z + 1
                            })
                            blockDetect(entity, rot, requiredSpace)
                            return;
                        }
                    }
                } else {
                    radiusCheck = false;
                }
            }
        } catch (error) {
            radiusCheck = false
        }
    } else {
        try {
        {
            if(rot == 0) {
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x + index,
                        y: entity.location.y,
                        z: entity.location.z
                    }
                    rightSide = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x - index,
                        y: entity.location.y,
                        z: entity.location.z
                    }
                    leftSide = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                //kontol.warn(`rightSide: ${rightSide}, leftSide: ${leftSide}`)
            }
            if(rot == 90) {
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x,
                        y: entity.location.y,
                        z: entity.location.z + index
                    }
                    rightSide = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x,
                        y: entity.location.y,
                        z: entity.location.z - index
                    }
                    leftSide = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                //kontol.warn(`rightSide: ${rightSide}, leftSide: ${leftSide}`)
            }
            if(rot == -90) {
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x,
                        y: entity.location.y,
                        z: entity.location.z - index
                    }
                    rightSide = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x,
                        y: entity.location.y,
                        z: entity.location.z + index
                    }
                    leftSide = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                //kontol.warn(`rightSide: ${rightSide}, leftSide: ${leftSide}`)
            }
            if(rot == 180 || rot == -180) {
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x - index,
                        y: entity.location.y,
                        z: entity.location.z
                    }
                    rightSide = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                for (let index = 0; index < 10; index++) {
                    const loc = {
                        x: entity.location.x + index,
                        y: entity.location.y,
                        z: entity.location.z
                    }
                    leftSide = index;
                    const block = entity.dimension.getBlock(loc);
                    if (!block.isAir) {
                        break;
                    }
                }
                //kontol.warn(`rightSide: ${rightSide}, leftSide: ${leftSide}`)
            }
        }
        availableRadius = rightSide + leftSide - 1
        if(availableRadius >= radius){
            if(rot == 0) {
                if((rightSide < radius)) {
                    entity.teleport({
                        x: entity.location.x - 1,
                        y: entity.location.y,
                        z: entity.location.z
                    })
                    blockDetect(entity, rot, requiredSpace)
                    return;
                }
            } else if(rot == 90) {
                if((rightSide < radius)) {
                    entity.teleport({
                        x: entity.location.x,
                        y: entity.location.y,
                        z: entity.location.z - 1
                    })
                    blockDetect(entity, rot, requiredSpace)
                    return;
                }
            } else if(rot == -90) {
                if((rightSide < radius)) {
                    entity.teleport({
                        x: entity.location.x,
                        y: entity.location.y,
                        z: entity.location.z + 1
                    })
                    blockDetect(entity, rot, requiredSpace)
                    return;
                }
            } else if(rot == 180 || rot == -180) {
                if((rightSide < radius)) {
                    entity.teleport({
                        x: entity.location.x + 1,
                        y: entity.location.y,
                        z: entity.location.z
                    })
                    blockDetect(entity, rot, requiredSpace)
                    return;
                }
            }
        } else {
            radiusCheck = false;
        }
            
        } catch (error) {
            
        }
    }
    //Height Control
    {
        try {
        for (let index = 0; index < 10; index++) {
            const loc = {
                x: entity.location.x,
                y: entity.location.y + index,
                z: entity.location.z
            }
            upSide = index;
            const block = entity.dimension.getBlock(loc);
            if (!block.isAir) {
                break;
            }
        }
        for (let index = 0; index < 10; index++) {
            const loc = {
                x: entity.location.x,
                y: entity.location.y - index,
                z: entity.location.z
            }
            downSide = index;
            const block = entity.dimension.getBlock(loc);
            if (!block.isAir) {
                break;
            }
        }
        } catch (error) {
            radiusCheck = false
        }
    }
    const availableHeight = upSide + downSide - 1;
    
    if (availableHeight >= height) {
        if (upSide < height) {
            entity.teleport({
                x: entity.location.x,
                y: entity.location.y - 1,
                z: entity.location.z
            });
            blockDetect(entity, rot, requiredSpace);
            return;
        }
    } else {
        heightCheck = false;
    }
    //kontol.warn(`radiusCheck: ${radiusCheck}, heightCheck: ${heightCheck}`)
    if(!radiusCheck || !heightCheck) {
        try {
            entity.runCommand(`playsound note.bass @a ~~~`)
            entity.dimension.getPlayers({closest:1,location:entity.location}).forEach(player=>{
                player.runCommand(`title @s actionbar §cNot enough space!`)
                player.getGameMode() != 'creative' ? entity.runCommand(`loot spawn ${player.location.x} ${player.location.y} ${player.location.z}  loot "heropixels/more_paintings/${entity.typeId.replace('hp4_paint:', '')}"`) : null;
            })
            entity.remove()
        } catch (error) {
            
        }
        //contol.warn(`not enough space for the display!`)
    } else {
        entity.runCommand(`playsound dig.wood @a ~~~`)
        //Place Collision
        resetCollision(entity, false, true)
    }
}
function checkDir(block, direction) {
    let dir = direction
    if(block.flip != undefined) {
        if(block.flip.condition.includes(dir)) {
            dir = flip(dir)
        }
    }
    if(block.rotate != undefined) {
        dir = rotate(dir, block.rotate.clock)
    }
    return dir
}
function resetCollision(entity, removing, noReplace, isNext) {
    const rotation_y = entity.getRotation().y+(-entity.getRotation().y+(Math.round(entity.getRotation().y/90)*90))
    let direction
    if(rotation_y == 0) {
        direction = 'north'
    } else if(rotation_y == 90 || rotation_y == -270) {
        direction = 'east'
    } else if(rotation_y == 180 || rotation_y == -180) {
        direction = 'south'
    } else if(rotation_y == 270 || rotation_y == -90) {
        direction = 'west'
    }
    //kontol.warn(direction)
    if(!noReplace) {
    collisionData.filter(c=>entity.typeId.includes(c.id)).some(c=>{
        c.blocks.forEach(b=>{
            if(typeof b.condition != 'function') {
                entity.runCommand(`setblock ${blockDirectionBasedCoords(direction, b.x, b.y, b.z)} air`)
            } else {
                if(b.condition(entity).next == entity.getProperty(`hp4_paint:furniture_model`) && isNext){
                    b.blocks.forEach(b=>{
                        entity.runCommand(`setblock ${blockDirectionBasedCoords(direction, b.x, b.y, b.z)} air`)
                    })
                } else if(b.condition(entity).req == entity.getProperty(`hp4_paint:furniture_model`) && !isNext) {
                    b.blocks.forEach(b=>{
                        entity.runCommand(`setblock ${blockDirectionBasedCoords(direction, b.x, b.y, b.z)} air`)
                    })
                }
            }
        })
    })
    }
    if(!removing) {
        system.runTimeout(()=>{
            collisionData.filter(c=>entity.typeId.includes(c.id)).some(c=>{
                c.blocks.forEach(b=>{
                    if(typeof b.condition != 'function') {
                        entity.runCommand( 
                            !b.state ? 
                            `setblock ${blockDirectionBasedCoords(direction, b.x, b.y, b.z)} hp4_paint:${b.name} ["minecraft:cardinal_direction"="${checkDir(b, direction)}"]` : 
                            `setblock ${blockDirectionBasedCoords(direction, b.x, b.y, b.z)} hp4_paint:${b.name} ["hp4_paint:custom_state"="${b.state}", "minecraft:cardinal_direction"="${checkDir(b, direction)}"]`
                        )
                    } else {
                        if (b.condition(entity).isActive == true) {
                            b.blocks.forEach(b=>{
                                entity.runCommand( 
                                    !b.state ? 
                                    `setblock ${blockDirectionBasedCoords(direction, b.x, b.y, b.z)} hp4_paint:${b.name} ["minecraft:cardinal_direction"="${checkDir(b, direction)}"]` : 
                                    `setblock ${blockDirectionBasedCoords(direction, b.x, b.y, b.z)} hp4_paint:${b.name} ["hp4_paint:custom_state"="${b.state}", "minecraft:cardinal_direction"="${checkDir(b, direction)}"]`
                                )
                            })
                        }
                    }
                })
            })
        },1)
    }
}
function blockDirectionBasedCoords(dir, x, y, z) {
    let result
    switch (dir) {
        case 'north':
            result = `~${x} ~${y} ~${z}`
            break;
        case 'south':
            result = `~${-x} ~${y} ~${-z}`
            break;
        case 'west':
            result = `~${z} ~${y} ~${-x}`
            break;
        case 'east':
            result = `~${-z} ~${y} ~${x}`
            break;
        default:
            break;
    }
    return result
}
const collisionData = [
    {
        id: `hp4_paint:wide_planter`,
        blocks: [
            {x:0,y:0,z:0,name:'collision_full'},
            {x:1,y:0,z:0,name:'collision_full'},
            {x:-1,y:0,z:0,name:'collision_full'},
        ]
    },
    {
        id: `hp4_paint:large_planter`,
        blocks: [
            {x:0,y:0,z:0,name:'collision_full'},

            {x:1,y:0,z:0,name:'collision_side_slab',state:'left'},
            {x:-1,y:0,z:0,name:'collision_side_slab',state:'right'},
            
            {x:0,y:0,z:1,name:'collision_side_slab',state:'back'},
            {x:0,y:0,z:-1,name:'collision_side_slab',state:'front'},
            
            {x:1,y:0,z:1,name:'collision_half_side_slab',state:'front_right'},
            {x:-1,y:0,z:1,name:'collision_half_side_slab',state:'front_left'},
            {x:1,y:0,z:-1,name:'collision_half_side_slab',state:'back_right'},
            {x:-1,y:0,z:-1,name:'collision_half_side_slab',state:'back_left'},
        ]
    },
    {
        id: `hp4_paint:vase`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.spray_can'},
        ]
    },
    {
        id: `hp4_paint:thin_planter`,
        blocks: [
            {x:0,y:0,z:0,name:'collision_side_slab',state:'back'},
            {x:1,y:0,z:0,name:'collision_half_side_slab',state:'front_right'},
            {x:-1,y:0,z:0,name:'collision_half_side_slab',state:'front_left'},
        ]
    },
    {
        id: `hp4_paint:round_planter`,
        blocks: [
            {x:0,y:0,z:0,name:'collision_full'},
        ]
    },
    {
        id: `hp4_paint:art_bench`,
        blocks: [
            {x:0,y:0,z:0,name:'collision_full'},
        ]
    },
    {
        id: `hp4_paint:brushes_set`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.spray_can'},
        ]
    },
    {
        id: `hp4_paint:sketchbook`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.stencil'},
        ]
    },
    {
        id: `hp4_paint:tube_paint`,
        blocks: [
            {x:0,y:0,z:0,name:'collision_slab',state:'down'},
        ]
    },
    {
        id: `hp4_paint:spatula`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.eraser_sharpener'},
        ]
    },
    {
        id: `hp4_paint:chalk_and_charcoal`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.eraser_sharpener'},
        ]
    },
    {
        id: `hp4_paint:brush_cleaner_jar`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.spray_can'},
        ]
    },
    {
        id: `hp4_paint:art_knives`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.eraser_sharpener'},
        ]
    },
    {
        id: `hp4_paint:artist_box`,
        blocks: [
            {x:0,y:0,z:0,name:'collision_side_slab',state:'back'},
        ]
    },
    {
        id: `hp4_paint:brush_cleaner_cup`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.brush_cleaner_cup'},
        ]
    },
    {
        id: `hp4_paint:brush_holder_cup`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.brush_holder_cup'},
        ]
    },
    {
        id: `hp4_paint:color_swatch`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.stencil'},
        ]
    },
    {
        id: `hp4_paint:drafting_tools`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.stencil'},
        ]
    },
    {
        id: `hp4_paint:drawing_tube`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.drawing_tube'},
        ]
    },
    {
        id: `hp4_paint:eraser_sharpener`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.eraser_sharpener'},
        ]
    },
    {
        id: `hp4_paint:marker_set`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.marker_set'},
        ]
    },
    {
        id: `hp4_paint:paint_tubes`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.stencil'},
        ]
    },
    {
        id: `hp4_paint:pencil_set`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.stencil'},
        ]
    },
    {
        id: `hp4_paint:sculpture_stand`,
        blocks: [
            {x:0,y:0,z:0,name:'collision_full'},
            {x:0,y:1,z:0,name:'collision_slab', state: 'down'},
        ]
    },
    {
        id: `hp4_paint:soft_pastel_box`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.soft_pastel_box'},
        ]
    },
    {
        id: `hp4_paint:sewing_kit`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.soft_pastel_box'},
        ]
    },
    {
        id: `hp4_paint:spray_can`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.spray_can'},
        ]
    },
    {
        id: `hp4_paint:stencil`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.stencil'},
        ]
    },
    {
        id: `hp4_paint:unfinished_wooden_block`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.unfinished_wooden_block'},
        ]
    },
    {
        id: `hp4_paint:powderjar`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.powderjar'},
        ]
    },
    {
        id: `hp4_paint:jewellery_components`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.jewellery_components'},
        ]
    },
    {
        id: `hp4_paint:art_chair`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.art_chair',state:'down'},
            {x:0,y:1,z:0,name:'collision.art_chair',state:'up'},
        ]
    },
    {
        id: `hp4_paint:color_bucket`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.color_bucket'},
        ]
    },
    {
        id: `hp4_paint:brush_on_shelf`,
        blocks: [
            {
                condition: (e) => {
                    const value = 0
                    return {isActive: e.getProperty(`hp4_paint:furniture_model`) == value, next: value + 1, req: value}
                },
                blocks: [
                    {x:0,y:0,z:0,name:'collision.brush_on_shelf',rotate:{clock:false}},
                ]
            },
            {
                condition: (e) => {
                    const value = 1
                    return {isActive: e.getProperty(`hp4_paint:furniture_model`) == value, next: 0, req: value}
                },
                blocks: [
                    {x:0,y:0,z:0,name:'collision.brush_on_shelf',rotate:{clock:false}},
                    {x:1,y:0,z:0,name:'collision.brush_on_shelf',rotate:{clock:false}},
                ]
            }
        ]
    },
    {
        id: `hp4_paint:canvas`,
        blocks: [
            {
                condition: (e) => {
                    const value = 0
                    return {isActive: e.getProperty(`hp4_paint:furniture_model`) == value, next: value + 1, req: value}
                },
                blocks: [
                    {x:0,y:0,z:0,name:'collision_side_slab',state:'back'},
                ]
            },
            {
                condition: (e) => {
                    const value = 1
                    return {isActive: e.getProperty(`hp4_paint:furniture_model`) == value, next: value + 1, req: value}
                },
                blocks: [
                    {x:0,y:0,z:0,name:'collision_side_slab',state:'back'},
                    {x:1,y:0,z:0,name:'collision_side_slab',state:'back'},
                ]
            },
            {
                condition: (e) => {
                    const value = 2
                    return {isActive: e.getProperty(`hp4_paint:furniture_model`) == value, next: 0, req: value}
                },
                blocks: [
                    {x:0,y:0,z:0,name:'collision_side_slab',state:'back'},
                    {x:0,y:1,z:0,name:'collision_side_slab',state:'back'},
                ]
            }
        ]
    },
    {
        id: `hp4_paint:variant_paint_bottle`,
        blocks: [
            {
                condition: (e) => {
                    const value = 0
                    return {isActive: e.getProperty(`hp4_paint:furniture_model`) == value, next: value + 1, req: value}
                },
                blocks: [
                    {x:0,y:0,z:0,name:'collision.variant_paint_bottle'},
                ]
            },
            {
                condition: (e) => {
                    const value = 1
                    return {isActive: e.getProperty(`hp4_paint:furniture_model`) == value, next: 0, req: value}
                },
                blocks: [
                    {x:0,y:0,z:0,name:'collision_side_slab',state:'back'}
                ]
            },
        ]
    },
    {
        id: `hp4_paint:lying_bottle_color`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.lying_bottle_color'},
        ]
    },
    {
        id: `hp4_paint:stool`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.stool'},
        ]
    },
    {
        id: `hp4_paint:statue_painting`,
        blocks: [
            {x:0,y:0,z:0,name:'collision_full'},
            {x:0,y:1,z:0,name:'collision_full'},
            {x:0,y:2,z:0,name:'collision_full'},
        ]
    },
    {
        id: `hp4_paint:sack_of_beton`,
        blocks: [
            {x:0,y:0,z:0,name:'collision.sack_of_beton'},
        ]
    },
    {
        id: `hp4_paint:cabinet`,
        blocks: [
            {x:-1,y:0,z:0,name:'collision_full'},
            {x:-1,y:1,z:0,name:'collision_full'},
            {x:-1,y:2,z:0,name:'collision_full'},
            
            {x:0,y:0,z:0,name:'collision_full'},
            {x:0,y:1,z:0,name:'collision_full'},
            {x:0,y:2,z:0,name:'collision_full'},
            
            {x:1,y:0,z:0,name:'collision_full'},
            {x:1,y:1,z:0,name:'collision_full'},
            {x:1,y:2,z:0,name:'collision_full'},
        ]
    },
    {
        id: `hp4_paint:easel_stand`,
        blocks: [
            {x:0,y:0,z:0,name:'collision_full'},
            {x:0,y:1,z:0,name:'collision_full'},
        ]
    },
    {
        id: `hp4_paint:display_case`,
        blocks: [
            {x:0,y:0,z:0,name:'collision_full'},
            {x:0,y:1,z:0,name:'collision_full'},
            {x:0,y:2,z:0,name:'collision_slab', state: 'down'},
        ]
    },
    {
        id: `hp4_paint:display_case_wide`,
        blocks: [
            {x:-1,y:0,z:0,name:'collision_full'},
            {x:-1,y:1,z:0,name:'collision_full'},
            
            {x:0,y:0,z:0,name:'collision_full'},
            {x:0,y:1,z:0,name:'collision_full'},
            
            {x:1,y:0,z:0,name:'collision_full'},
            {x:1,y:1,z:0,name:'collision_full'},
        ]
    },
    {
        id: `hp4_paint:display_case_big`,
        blocks: [
            {x:-1,y:0,z:0,name:'collision_full'},
            {x:-1,y:1,z:0,name:'collision_full'},
            {x:-1,y:2,z:0,name:'collision_full'},
            {x:-1,y:3,z:0,name:'collision_slab', state: 'down'},
            
            {x:0,y:0,z:0,name:'collision_full'},
            {x:0,y:1,z:0,name:'collision_full'},
            {x:0,y:2,z:0,name:'collision_full'},
            {x:0,y:3,z:0,name:'collision_slab', state: 'down'},
            
            {x:1,y:0,z:0,name:'collision_full'},
            {x:1,y:1,z:0,name:'collision_full'},
            {x:1,y:2,z:0,name:'collision_full'},
            {x:1,y:3,z:0,name:'collision_slab', state: 'down'},
        ]
    },
    {
        id: `hp4_paint:display_case_tall`,
        blocks: [
            {x:-1,y:0,z:0,name:'collision_full'},
            {x:-1,y:1,z:0,name:'collision_full'},
            {x:-1,y:2,z:0,name:'collision_full'},
            {x:-1,y:3,z:0,name:'collision_full'},
            {x:-1,y:4,z:0,name:'collision_full'},
            {x:-1,y:5,z:0,name:'collision_slab', state: 'down'},

            {x:0,y:0,z:0,name:'collision_full'},
            {x:0,y:1,z:0,name:'collision_full'},
            {x:0,y:2,z:0,name:'collision_full'},
            {x:0,y:3,z:0,name:'collision_full'},
            {x:0,y:4,z:0,name:'collision_full'},
            {x:0,y:5,z:0,name:'collision_slab', state: 'down'},
            
            {x:1,y:0,z:0,name:'collision_full'},
            {x:1,y:1,z:0,name:'collision_full'},
            {x:1,y:2,z:0,name:'collision_full'},
            {x:1,y:3,z:0,name:'collision_full'},
            {x:1,y:4,z:0,name:'collision_full'},
            {x:1,y:5,z:0,name:'collision_slab', state: 'down'},
        ]
    },
    {
        id: `hp4_paint:display_case_huge`,
        blocks: [
            {x:-2,y:0,z:0,name:'collision_side_slab', state: 'right'},
            {x:-2,y:1,z:0,name:'collision_side_slab', state: 'right'},
            {x:-2,y:2,z:0,name:'collision_side_slab', state: 'right'},
            {x:-2,y:3,z:0,name:'collision_side_slab', state: 'right'},
            {x:-2,y:4,z:0,name:'collision_side_slab', state: 'right'},
            {x:-2,y:5,z:0,name:'collision_half_slab', state: 'bottom_right'},

            {x:-1,y:0,z:0,name:'collision_full'},
            {x:-1,y:1,z:0,name:'collision_full'},
            {x:-1,y:2,z:0,name:'collision_full'},
            {x:-1,y:3,z:0,name:'collision_full'},
            {x:-1,y:4,z:0,name:'collision_full'},
            {x:-1,y:5,z:0,name:'collision_slab', state: 'down'},

            {x:0,y:0,z:0,name:'collision_full'},
            {x:0,y:1,z:0,name:'collision_full'},
            {x:0,y:2,z:0,name:'collision_full'},
            {x:0,y:3,z:0,name:'collision_full'},
            {x:0,y:4,z:0,name:'collision_full'},
            {x:0,y:5,z:0,name:'collision_slab', state: 'down'},
            
            {x:1,y:0,z:0,name:'collision_full'},
            {x:1,y:1,z:0,name:'collision_full'},
            {x:1,y:2,z:0,name:'collision_full'},
            {x:1,y:3,z:0,name:'collision_full'},
            {x:1,y:4,z:0,name:'collision_full'},
            {x:1,y:5,z:0,name:'collision_slab', state: 'down'},
            
            {x:2,y:0,z:0,name:'collision_side_slab', state: 'left'},
            {x:2,y:1,z:0,name:'collision_side_slab', state: 'left'},
            {x:2,y:2,z:0,name:'collision_side_slab', state: 'left'},
            {x:2,y:3,z:0,name:'collision_side_slab', state: 'left'},
            {x:2,y:4,z:0,name:'collision_side_slab', state: 'left'},
            {x:2,y:5,z:0,name:'collision_half_slab', state: 'bottom_left'},
        ]
    },
    {
        id: `hp4_paint:display_case_wide2`,
        blocks: [
            {x:-3,y:0,z:0,name:'collision_side_slab', state: 'right'},
            {x:-3,y:1,z:0,name:'collision_side_slab', state: 'right'},
            {x:-3,y:2,z:0,name:'collision_side_slab', state: 'right'},
            {x:-3,y:3,z:0,name:'collision_half_slab', state: 'bottom_right'},

            {x:-2,y:0,z:0,name:'collision_full'},
            {x:-2,y:1,z:0,name:'collision_full'},
            {x:-2,y:2,z:0,name:'collision_full'},
            {x:-2,y:3,z:0,name:'collision_slab', state: 'down'},
            
            {x:-1,y:0,z:0,name:'collision_full'},
            {x:-1,y:1,z:0,name:'collision_full'},
            {x:-1,y:2,z:0,name:'collision_full'},
            {x:-1,y:3,z:0,name:'collision_slab', state: 'down'},
            
            {x:0,y:0,z:0,name:'collision_full'},
            {x:0,y:1,z:0,name:'collision_full'},
            {x:0,y:2,z:0,name:'collision_full'},
            {x:0,y:3,z:0,name:'collision_slab', state: 'down'},
            
            {x:1,y:0,z:0,name:'collision_full'},
            {x:1,y:1,z:0,name:'collision_full'},
            {x:1,y:2,z:0,name:'collision_full'},
            {x:1,y:3,z:0,name:'collision_slab', state: 'down'},
            
            {x:2,y:0,z:0,name:'collision_full'},
            {x:2,y:1,z:0,name:'collision_full'},
            {x:2,y:2,z:0,name:'collision_full'},
            {x:2,y:3,z:0,name:'collision_slab', state: 'down'},
            
            {x:3,y:0,z:0,name:'collision_side_slab', state: 'left'},
            {x:3,y:1,z:0,name:'collision_side_slab', state: 'left'},
            {x:3,y:2,z:0,name:'collision_side_slab', state: 'left'},
            {x:3,y:3,z:0,name:'collision_half_slab', state: 'bottom_left'},
        ]
    }
]
function flip(dir) {
    let result
    switch (dir) {
        case 'north':
            result = 'south'
            break;
        case 'south':
            result = 'north'
            break;
        case 'west':
            result = 'east'
            break;
        case 'east':
            result = 'west'
            break;
        default:
            break;
    }
    return result
}
function rotate(dir, clock = true) {
    let result
    switch (dir) {
        case 'north':
            clock ?
            result = 'east' :
            result = 'west'
            break;
        case 'south':
            clock ?
            result = 'west' :
            result = 'east'
            break;
        case 'west':
            clock ?
            result = 'north' :
            result = 'south'
            break;
        case 'east':
            clock ?
            result = 'south' :
            result = 'north'
            break;
        default:
            break;
    }
    return result
}