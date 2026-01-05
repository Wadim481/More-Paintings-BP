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
world.afterEvents.entitySpawn.subscribe(arg=>{
    if(displays.includes(arg.entity.typeId)) {
        let newRotation = arg.entity.getRotation().y+(-arg.entity.getRotation().y+(Math.round(arg.entity.getRotation().y/90)*90))
        //contol.warn(newRotation)
        system.runTimeout(() => {
            switch (arg.entity.typeId) {
                case `hp4_paint:easel_stand`:
                    blockDetect(arg.entity, newRotation, {radius: 1, height: 2})
                    break;
                case `hp4_paint:display_case`:
                    blockDetect(arg.entity, newRotation, {radius: 1, height: 3})
                    break;
                case `hp4_paint:display_case_wide`:
                    blockDetect(arg.entity, newRotation, {radius: 3, height: 2})
                    break;
                case `hp4_paint:display_case_big`:
                    blockDetect(arg.entity, newRotation, {radius: 3, height: 4})
                    break;
                case `hp4_paint:display_case_tall`:
                    blockDetect(arg.entity, newRotation, {radius: 3, height: 6})
                    break;
                case `hp4_paint:display_case_huge`:
                    blockDetect(arg.entity, newRotation, {radius: 5, height: 6})
                    break;
                case `hp4_paint:display_case_wide2`:
                    blockDetect(arg.entity, newRotation, {radius: 5, height: 4})
                    break;
                default:
                    break;
            }
        },1)
    }
    if(furnitures.includes(arg.entity.typeId)) {
        const spawner = arg.entity.dimension.getPlayers({closest:1, location: arg.entity.location}).filter(p=>(p.getDynamicProperty(`hp4_paint:additionalFurniture`) && p.getComponent("minecraft:inventory").container.getItem(p.selectedSlotIndex).typeId == arg.entity.typeId))
        if(spawner.length >= 1) {
            let newRotation = arg.entity.getRotation().y+(-arg.entity.getRotation().y+(Math.round(arg.entity.getRotation().y/90)*90))
            system.runTimeout(() => {
                switch (arg.entity.typeId) {
                    case `hp4_paint:brush_on_shelf`:
                        blockDetect(arg.entity, newRotation, {radius: 2, height: 1})
                        break;
                    case `hp4_paint:jewellery_components`:
                    case `hp4_paint:variant_paint_bottle`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:canvas`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 2})
                        break;
                    case `hp4_paint:powderjar`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:sewing_kit`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:unfinished_wooden_block`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:stencil`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:spray_can`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:soft_pastel_box`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:sculpture_stand`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:pencil_set`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:painting_brush`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:paint_tubes`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:marker_set`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:eraser_sharpener`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:drawing_tube`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:drafting_tools`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_swatch`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:brush_holder_cup`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:brush_cleaner_cup`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:artist_box`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:art_knives`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;

                    case `hp4_paint:brush_cleaner_jar`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:tube_paint`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:brushes_set`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:art_bench`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_black`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_blue`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_brown`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_cyan`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_gray`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_green`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_light_blue`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_light_gray`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_lime`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_magenta`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_orange`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_pink`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_purple`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_red`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_white`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:color_bucket_yellow`:
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:large_planter`:
                        arg.entity.setDynamicProperty('hp4_paint:slot', 4)
                        blockDetect(arg.entity, newRotation, {radius: 3, height: 1}, true)
                        break;
                    case `hp4_paint:round_planter`:
                        arg.entity.setDynamicProperty('hp4_paint:slot', 0)
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:thin_planter`:
                        arg.entity.setDynamicProperty('hp4_paint:slot', 2)
                        blockDetect(arg.entity, newRotation, {radius: 3, height: 1})
                        break;
                    case `hp4_paint:vase`:
                        arg.entity.setDynamicProperty('hp4_paint:slot', 0)
                        blockDetect(arg.entity, newRotation, {radius: 1, height: 1})
                        break;
                    case `hp4_paint:wide_planter`:
                        arg.entity.setDynamicProperty('hp4_paint:slot', 2)
                        blockDetect(arg.entity, newRotation, {radius: 3, height: 1})
                        break;
                    default:
                        break;
                }
            },1)
        } else if (spawner.length == 0) {
            console.warn('anjay')
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
                                        //console.warn('remove')
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
                                        const painting = target.dimension.spawnEntity(`hp4_paint:${jenis}_painting`, target.location);
                                        if(player.getDynamicProperty(`hp4_paint:particlesOutlines`)) {
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
                                if(player.getDynamicProperty(`hp4_paint:particlesOutlines`)) {
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
            if(item.typeId === 'hp4_paint:special_tool') {
                try {
                    if(player.getDynamicProperty(`hp4_paint:particlesOutlines`)) {
                        target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                        // target.runCommand(`particle hp4_paint:dust ~~1~`)
                        // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                        
                        const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, target.location)
                        object.setProperty(`hp4_paint:model`, 0)
                        system.runTimeout(()=>{object.remove()},5*20)
                        target.runCommand(`function hp/more_paintings/hammer_start`)
                        system.runTimeout(()=>{target.runCommand(`function hp/more_paintings/hammer_finish_wood`)},1*20)
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
                        if(player.getDynamicProperty(`hp4_paint:particlesOutlines`)) {
                            target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                            // target.runCommand(`particle hp4_paint:dust ~~1~`)
                            // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                            
                            const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, target.location)
                            object.setProperty(`hp4_paint:model`, 0)
                            system.runTimeout(()=>{object.remove()},5*20)
                            target.runCommand(`function hp/more_paintings/hammer_start`)
                            system.runTimeout(()=>{target.runCommand(`function hp/more_paintings/hammer_finish_wood`)},1*20)
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
            if(item.typeId == 'hp4_paint:brush') {
                // target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                // target.runCommand(`particle hp4_paint:dust ~~1~`)
                // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                try {
                    if(player.getDynamicProperty(`hp4_paint:particlesOutlines`)) {
                        target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                        // target.runCommand(`particle hp4_paint:dust ~~1~`)
                        // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                        target.runCommand(`function hp/more_paintings/brush_start`)
                        system.runTimeout(()=>{target.runCommand(`function hp/more_paintings/brush_finish`)},1*20)
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
                        if(player.getDynamicProperty(`hp4_paint:particlesOutlines`)) {
                            target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                            // target.runCommand(`particle hp4_paint:dust ~~1~`)
                            // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                            target.runCommand(`function hp/more_paintings/brush_start`)
                            system.runTimeout(()=>{target.runCommand(`function hp/more_paintings/brush_finish`)},1*20)
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
                        //console.warn(itemNumber)
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
                        //console.warn(itemNumber)
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
                        //console.warn(itemNumber)
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
            if(item.typeId == 'hp4_paint:special_tool') {
                try {
                    if(player.getDynamicProperty(`hp4_paint:particlesOutlines`)) {
                        target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                        // target.runCommand(`particle hp4_paint:dust ~~1~`)
                        // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                        
                        const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, target.location)
                        object.setProperty(`hp4_paint:model`, 0)
                        system.runTimeout(()=>{object.remove()},5*20)
                        target.runCommand(`function hp/more_paintings/hammer_start`)
                        system.runTimeout(()=>{target.runCommand(`function hp/more_paintings/hammer_finish_wood`)},1*20)
                    }
                    target.setProperty(`hp4_paint:furniture_model`, target.getProperty(`hp4_paint:furniture_model`) + 1)
                } catch (error) {
                    try {
                        if(player.getDynamicProperty(`hp4_paint:particlesOutlines`)) {
                            target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                            // target.runCommand(`particle hp4_paint:dust ~~1~`)
                            // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                            
                            const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, target.location)
                            object.setProperty(`hp4_paint:model`, 0)
                            system.runTimeout(()=>{object.remove()},5*20)
                            target.runCommand(`function hp/more_paintings/hammer_start`)
                            system.runTimeout(()=>{target.runCommand(`function hp/more_paintings/hammer_finish_wood`)},1*20)
                        }
                        target.setProperty(`hp4_paint:furniture_model`, 0)
                    } catch (error) {
                        
                    }
                }
            }
            if(item.typeId == 'hp4_paint:brush') {
                try {
                    if(player.getDynamicProperty(`hp4_paint:particlesOutlines`)) {
                        target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                        // target.runCommand(`particle hp4_paint:dust ~~1~`)
                        // target.runCommand(`particle hp4_paint:dust2 ~~1~`)

                        
                        target.runCommand(`function hp/more_paintings/brush_start`)
                        system.runTimeout(()=>{target.runCommand(`function hp/more_paintings/brush_finish`)},1*20)
                    }
                    target.setProperty(`hp4_paint:furniture_color`, target.getProperty(`hp4_paint:furniture_color`) + 1)
                } catch (error) {
                    try {
                        if(player.getDynamicProperty(`hp4_paint:particlesOutlines`)) {
                        target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                        // target.runCommand(`particle hp4_paint:dust ~~1~`)
                        // target.runCommand(`particle hp4_paint:dust2 ~~1~`)

                        
                        target.runCommand(`function hp/more_paintings/brush_start`)
                        system.runTimeout(()=>{target.runCommand(`function hp/more_paintings/brush_finish`)},1*20)
                        }
                        target.setProperty(`hp4_paint:furniture_color`, 0)
                    } catch (error) {
                        
                    }
                }
            }
            if(item.typeId == 'hp4_paint:chisel') {
                try {
                    if(player.getDynamicProperty(`hp4_paint:particlesOutlines`)) {
                        target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                        // target.runCommand(`particle hp4_paint:dust ~~1~`)
                        // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                        
                        system.runTimeout(()=>{object.remove()},5*20)
                        target.runCommand(`function hp/more_paintings/hammer_start`)
                        system.runTimeout(()=>{target.runCommand(`function hp/more_paintings/hammer_finish_stone`)},1*20)

                        const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, target.location)
                        object.setProperty(`hp4_paint:model`, 1)
                        system.runTimeout(()=>{object.remove()},5*20)
                    }
                    target.setProperty(`hp4_paint:statue_pose`, target.getProperty(`hp4_paint:statue_pose`) + 1)
                } catch (error) {
                    try {
                        if(player.getDynamicProperty(`hp4_paint:particlesOutlines`)) {
                            target.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                            // target.runCommand(`particle hp4_paint:dust ~~1~`)
                            // target.runCommand(`particle hp4_paint:dust2 ~~1~`)
                            
                            system.runTimeout(()=>{object.remove()},5*20)
                            target.runCommand(`function hp/more_paintings/hammer_start`)
                            system.runTimeout(()=>{target.runCommand(`function hp/more_paintings/hammer_finish_stone`)},1*20)

                            const object = target.dimension.spawnEntity(`hp4_paint:particle_objects`, target.location)
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
        //     console.warn('script masuk')
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
    //console.warn(`slot${slot} id: ${entity.getDynamicProperty(`hp4_paint:slot${slot}`)}`)
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
        //console.warn(newRotation)
        if(xz == 'x') {
            return direction == 'left' ? -1 : direction == 'right' ? 1 : 0;
        } else if(xz == 'z') {
            return offset;
        }
    } else if(newRotation == 180 || newRotation == -180) {
        //console.warn(newRotation)
        if(xz == 'x') {
            return direction == 'left' ? 1 : direction == 'right' ? -1 : 0;
        } else if(xz == 'z') {
            return Math.abs(offset);
        }
    } else if(newRotation == 90) {
        //console.warn(newRotation)
        if(xz == 'x') {
            return Math.abs(offset);
        } else if(xz == 'z') {
            return direction == 'left' ? -1 : direction == 'right' ? 1 : 0;
        }
    } else if(newRotation == -90) {
        //console.warn(newRotation)
        if(xz == 'x') {
            return offset;
        } else if(xz == 'z') {
            return direction == 'left' ? 1 : direction == 'right' ? -1 : 0;
        }
    }
    return 0;
}
// world.afterEvents.dataDrivenEntityTrigger.subscribe((arg)=>{
//     const entity = arg.entity
//     const event = arg.eventId
//     if(displays.includes(entity.typeId)) {
//         if(event == 'death') {
//             let hasPainting = false
//             entity.runCommand(`playsound dig.wood @a ~~~`)
//             entity.dimension.getEntities().forEach(paint=>{
//                 if(paint.id==entity.getDynamicProperty(`hp4_paint:babu`)) {
//                     hasPainting = true
//                     if(paint.getProperty('hp4_paint:frame_type')=='none') {
//                         paint.triggerEvent('death');
//                         entity.setProperty(`hp4_paint:paint_installed`, false)
//                     } else {
//                         paint.runCommand(`loot spawn ^^^1 loot "heropixels/more_paintings/frames/${paint.getProperty('hp4_paint:frame_type')}"`)
//                         paint.setProperty('hp4_paint:frame_type', 'none')
//                     }
//                 }
//             })
//             if(!hasPainting) {
//                 const folder = `heropixels/more_paintings/${entity.typeId.replace('hp4_paint:', '')}`
//                 entity.runCommand(`loot spawn ^^^1 loot "${folder}"`)
//                 removeBarrier(entity)
//                 entity.remove()
//             }
//         }
//     }
// })
world.afterEvents.entityHitEntity.subscribe((arg)=>{
    const player = arg.damagingEntity
    const entity = arg.hitEntity
    const gamemode = player.getGameMode()

    const targetFront = getFrontPos(entity, 1)
    const slot0 = entity.getDynamicProperty(`hp4_paint:slot0`), slot1 = entity.getDynamicProperty(`hp4_paint:slot1`), slot2 = entity.getDynamicProperty(`hp4_paint:slot2`), slot3 = entity.getDynamicProperty(`hp4_paint:slot3`), slot4 = entity.getDynamicProperty(`hp4_paint:slot4`)
    if(displays.includes(entity.typeId)) {
        if(player.getDynamicProperty(`hp4_paint:particlesOutlines`)) {
            entity.runCommand(`playsound hp4_paint:display.furniture_remove @a ~~~`)
            entity.runCommand(`function hp/more_paintings/destroy_wood`)
        }
        {
            let hasPainting = false
            
            entity.dimension.getEntities().forEach(paint=>{
                try {
                    if(paint.id==entity.getDynamicProperty(`hp4_paint:babu`)) {
                        hasPainting = true
                        if(paint.getProperty('hp4_paint:frame_type')=='none') {
                            //console.warn('hit')
                            gamemode != 'creative' ? (paint.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/${paint.typeId.replace('hp4_paint:', '').replace('_painting', '')}"`), paint.remove()) : paint.remove();
                            entity.setProperty(`hp4_paint:paint_installed`, false)
                        } else {
                            player.getGameMode() != 'creative' ? paint.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/frames/${paint.getProperty('hp4_paint:frame_type')}"`) : null;
                            paint.setProperty('hp4_paint:frame_type', 'none')
                        }
                    }
                } catch (error) {
                    
                }
            })
            if(!hasPainting) {
                const folder = `heropixels/more_paintings/${entity.typeId.replace('hp4_paint:', '')}`
                gamemode != 'creative' ? entity.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "${folder}"`) : null;
                removeBarrier(entity)
                entity.remove()
            }
        }
    }
                console.warn('cok')
    if(furnitures.includes(entity.typeId)) {
        if(player.getDynamicProperty(`hp4_paint:particlesOutlines`)) {
            entity.runCommand(`playsound hp4_paint:display.furniture_remove @a ~~~`)
            entity.runCommand(`function hp/more_paintings/destroy_wood`)
        }
        {
            if(slot0 == undefined && slot1 == undefined && slot2 == undefined && slot3 == undefined && slot4 == undefined)  {
                entity.runCommand(`playsound hp4_paint:display.furniture_remove @a ~~~`)
                player.getGameMode() != 'creative' ? entity.runCommand(`loot spawn ${targetFront.x} ${targetFront.y} ${targetFront.z}  loot "heropixels/more_paintings/${entity.typeId.replace('hp4_paint:', '')}"`) : null;
                removeBarrier(entity)
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
    //console.warn(newRotation)
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
function barrierPlacement(entity, newRotation) {
    switch (entity.typeId) {
        case `hp4_paint:canvas`:
            for (let index = 0; index < 2; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:sculpture_stand`:
        case `hp4_paint:easel_stand`:
            for (let index = 0; index < 2; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:display_case`:
            for (let index = 0; index < 3; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:display_case_wide`:
            for (let index = 0; index < 2; index++) {
                if(newRotation == 0 || newRotation == 180 || newRotation == -180) {
                    entity.runCommand(`setblock ~1~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~-1~${index}~ barrier replace`)
                } else if (newRotation == 90 || newRotation == 270 || newRotation == -90 || newRotation == -270) {
                    entity.runCommand(`setblock ~~${index}~1 barrier replace`)
                    entity.runCommand(`setblock ~~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~~${index}~-1 barrier replace`)
                }
            }
            break;
        case `hp4_paint:display_case_big`:
            for (let index = 0; index < 4; index++) {
                if(newRotation == 0 || newRotation == 180 || newRotation == -180) {
                    entity.runCommand(`setblock ~1~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~-1~${index}~ barrier replace`)
                } else if (newRotation == 90 || newRotation == 270 || newRotation == -90 || newRotation == -270) {
                    entity.runCommand(`setblock ~~${index}~1 barrier replace`)
                    entity.runCommand(`setblock ~~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~~${index}~-1 barrier replace`)
                }
            }
            break;
        case `hp4_paint:display_case_tall`:
            for (let index = 0; index < 6; index++) {
                if(newRotation == 0 || newRotation == 180 || newRotation == -180) {
                    entity.runCommand(`setblock ~1~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~-1~${index}~ barrier replace`)
                } else if (newRotation == 90 || newRotation == 270 || newRotation == -90 || newRotation == -270) {
                    entity.runCommand(`setblock ~~${index}~1 barrier replace`)
                    entity.runCommand(`setblock ~~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~~${index}~-1 barrier replace`)
                }
            }
            break;
        case `hp4_paint:display_case_huge`:
            for (let index = 0; index < 6; index++) {
                if(newRotation == 0 || newRotation == 180 || newRotation == -180) {
                    entity.runCommand(`setblock ~2~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~1~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~-1~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~-2~${index}~ barrier replace`)
                } else if (newRotation == 90 || newRotation == 270 || newRotation == -90 || newRotation == -270) {
                    entity.runCommand(`setblock ~~${index}~2 barrier replace`)
                    entity.runCommand(`setblock ~~${index}~1 barrier replace`)
                    entity.runCommand(`setblock ~~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~~${index}~-1 barrier replace`)
                    entity.runCommand(`setblock ~~${index}~-2 barrier replace`)
                }
            }
            break;
        case `hp4_paint:display_case_wide2`:
            for (let index = 0; index < 4; index++) {
                if(newRotation == 0 || newRotation == 180 || newRotation == -180) {
                    entity.runCommand(`setblock ~2~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~1~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~-1~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~-2~${index}~ barrier replace`)
                } else if (newRotation == 90 || newRotation == 270 || newRotation == -90 || newRotation == -270) {
                    entity.runCommand(`setblock ~~${index}~2 barrier replace`)
                    entity.runCommand(`setblock ~~${index}~1 barrier replace`)
                    entity.runCommand(`setblock ~~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~~${index}~-1 barrier replace`)
                    entity.runCommand(`setblock ~~${index}~-2 barrier replace`)
                }
            }
            break;
        case `hp4_paint:variant_paint_bottle`:
        case `hp4_paint:jewellery_components`:
        case `hp4_paint:powderjar`:
        case `hp4_paint:sewing_kit`:
        case `hp4_paint:unfinished_wooden_block`:
        case `hp4_paint:stencil`:
        case `hp4_paint:spray_can`:
        case `hp4_paint:soft_pastel_box`:
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
            // spawn only one barrier block for these small furniture items
            entity.runCommand(`setblock ~~0~ barrier replace`)
            break;
            
        case `hp4_paint:tube_paint`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
        case `hp4_paint:chalk_and_charcoal`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
        case `hp4_paint:spatula`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
        case `hp4_paint:brush_cleaner_jar`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
        case `hp4_paint:brushes_set`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
        case `hp4_paint:art_bench`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_black`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_blue`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_brown`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_cyan`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_gray`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_green`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_light_blue`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_light_gray`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_lime`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_magenta`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_orange`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_pink`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_purple`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_red`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_white`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:color_bucket_yellow`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:round_planter`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:vase`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
            }
            break;
        case `hp4_paint:large_planter`:
            for (let index = 0; index < 1; index++) {
                entity.runCommand(`setblock ~1~${index}~1 barrier replace`)
                entity.runCommand(`setblock ~1~${index}~ barrier replace`)
                entity.runCommand(`setblock ~1~${index}~-1 barrier replace`)
                entity.runCommand(`setblock ~-1~${index}~1 barrier replace`)
                entity.runCommand(`setblock ~-1~${index}~ barrier replace`)
                entity.runCommand(`setblock ~-1~${index}~-1 barrier replace`)
                entity.runCommand(`setblock ~~${index}~1 barrier replace`)
                entity.runCommand(`setblock ~~${index}~ barrier replace`)
                entity.runCommand(`setblock ~~${index}~-1 barrier replace`)
            }
            break;
        case `hp4_paint:thin_planter`:
            for (let index = 0; index < 1; index++) {
                if(newRotation == 0 || newRotation == 180 || newRotation == -180) {
                    entity.runCommand(`setblock ~1~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~-1~${index}~ barrier replace`)
                } else if (newRotation == 90 || newRotation == 270 || newRotation == -90 || newRotation == -270) {
                    entity.runCommand(`setblock ~~${index}~1 barrier replace`)
                    entity.runCommand(`setblock ~~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~~${index}~-1 barrier replace`)
                }
            }
            break;
        case `hp4_paint:wide_planter`:
            for (let index = 0; index < 1; index++) {
                if(newRotation == 0 || newRotation == 180 || newRotation == -180) {
                    entity.runCommand(`setblock ~1~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~-1~${index}~ barrier replace`)
                } else if (newRotation == 90 || newRotation == 270 || newRotation == -90 || newRotation == -270) {
                    entity.runCommand(`setblock ~~${index}~1 barrier replace`)
                    entity.runCommand(`setblock ~~${index}~ barrier replace`)
                    entity.runCommand(`setblock ~~${index}~-1 barrier replace`)
                }
            }
            break;
        default:
            break;
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
    } else {
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
                console.warn(`rightSide: ${rightSide}, leftSide: ${leftSide}`)
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
                console.warn(`rightSide: ${rightSide}, leftSide: ${leftSide}`)
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
                console.warn(`rightSide: ${rightSide}, leftSide: ${leftSide}`)
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
                console.warn(`rightSide: ${rightSide}, leftSide: ${leftSide}`)
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
    }
    //Height Control
    {
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
    console.warn(`radiusCheck: ${radiusCheck}, heightCheck: ${heightCheck}`)
    if(!radiusCheck || !heightCheck) {
        entity.runCommand(`playsound note.bass @a ~~~`)
        entity.dimension.getPlayers({closest:1,location:entity.location}).forEach(player=>{
            player.runCommand(`title @s actionbar §cNot enough space!`)
            player.getGameMode() != 'creative' ? entity.runCommand(`loot spawn ${player.location.x} ${player.location.y} ${player.location.z}  loot "heropixels/more_paintings/${entity.typeId.replace('hp4_paint:', '')}"`) : null;
        })
        entity.remove()
        //contol.warn(`not enough space for the display!`)
    } else {
        entity.runCommand(`playsound dig.wood @a ~~~`)
        barrierPlacement(entity, rot)
    }
}
function removeBarrier(entity) {
    let rot = entity.getRotation().y+(-entity.getRotation().y+(Math.round(entity.getRotation().y/90)*90))
    let radius
    let height
    let isRound = false
    switch (entity.typeId) {
        case `hp4_paint:sculpture_stand`:
        case `hp4_paint:canvas`:
        case `hp4_paint:easel_stand`:
            radius = 1
            height = 2
            break;
        case `hp4_paint:display_case`:
            radius = 1
            height = 3
            break;
        case `hp4_paint:display_case_wide`:
            radius = 3
            height = 2
            break;
        case `hp4_paint:display_case_big`:
            radius = 3
            height = 4
            break;
        case `hp4_paint:display_case_tall`:
            radius = 3
            height = 6
            break;
        case `hp4_paint:display_case_huge`:
            radius = 5
            height = 6
            break;
        case `hp4_paint:display_case_wide2`:
            radius = 5
            height = 4
            break;
        case `hp4_paint:variant_paint_bottle`:
        case `hp4_paint:jewellery_components`:
        case `hp4_paint:powderjar`:
        case `hp4_paint:sewing_kit`:
        case `hp4_paint:unfinished_wooden_block`:
        case `hp4_paint:stencil`:
        case `hp4_paint:spray_can`:
        case `hp4_paint:soft_pastel_box`:
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
            radius = 1
            height = 1
            break;
        case `hp4_paint:chalk_and_charcoal`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:tube_paint`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:spatula`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:brush_cleaner_jar`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:brushes_set`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:art_bench`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_black`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_blue`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_brown`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_cyan`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_gray`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_green`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_light_blue`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_light_gray`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_lime`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_magenta`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_orange`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_pink`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_purple`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_red`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_white`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:color_bucket_yellow`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:large_planter`:
            radius = 3
            height = 1
            isRound = true
            break;
        case `hp4_paint:round_planter`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:thin_planter`:
            radius = 3
            height = 1
            break;
        case `hp4_paint:vase`:
            radius = 1
            height = 1
            break;
        case `hp4_paint:wide_planter`:
            radius = 3
            height = 1
            break;
        default:
            break;
    }
    if(isRound) {
        if (radius == 3) {
            for (let index = 0; index < height; index++) {
                entity.runCommand(`setblock ~1~${index}~1 air replace`)
                entity.runCommand(`setblock ~1~${index}~ air replace`)
                entity.runCommand(`setblock ~1~${index}~-1 air replace`)
                entity.runCommand(`setblock ~-1~${index}~1 air replace`)
                entity.runCommand(`setblock ~-1~${index}~ air replace`)
                entity.runCommand(`setblock ~-1~${index}~-1 air replace`)
                entity.runCommand(`setblock ~~${index}~1 air replace`)
                entity.runCommand(`setblock ~~${index}~ air replace`)
                entity.runCommand(`setblock ~~${index}~-1 air replace`)
            }
        }
    } else {
        if(rot == 0 || rot == 180 || rot == -180) {
            for (let index = 0; index < height; index++) {
                if(radius == 1) {
                    entity.runCommand(`setblock ~~${index}~ air replace`)
                } else if (radius == 3) {
                    entity.runCommand(`setblock ~-1~${index}~ air replace`)
                    entity.runCommand(`setblock ~~${index}~ air replace`)
                    entity.runCommand(`setblock ~1~${index}~ air replace`)
                } else if (radius == 5) {
                    entity.runCommand(`setblock ~-2~${index}~ air replace`)
                    entity.runCommand(`setblock ~-1~${index}~ air replace`)
                    entity.runCommand(`setblock ~~${index}~ air replace`)
                    entity.runCommand(`setblock ~1~${index}~ air replace`)
                    entity.runCommand(`setblock ~2~${index}~ air replace`)
                }
            }
        } else if (rot == 90 || rot == 270 || rot == -90 || rot == -270) {
            for (let index = 0; index < height; index++) {
                if (radius == 1) {
                    entity.runCommand(`setblock ~~${index}~ air replace`)
                } else if (radius == 3) {
                    entity.runCommand(`setblock ~~${index}~-1 air replace`)
                    entity.runCommand(`setblock ~~${index}~ air replace`)
                    entity.runCommand(`setblock ~~${index}~1 air replace`)
                } else if (radius == 5) {
                    entity.runCommand(`setblock ~~${index}~-2 air replace`)
                    entity.runCommand(`setblock ~~${index}~-1 air replace`)
                    entity.runCommand(`setblock ~~${index}~ air replace`)
                    entity.runCommand(`setblock ~~${index}~1 air replace`)
                    entity.runCommand(`setblock ~~${index}~2 air replace`)
                }
            }
        }
    }
}