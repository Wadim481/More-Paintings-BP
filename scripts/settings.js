import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import * as index from "./hp4_paint_index"

const paintings = [
    "8bit_painting",
    "alien_painting",
    "animated_painting",
    "biomes_painting",
    "candy1_painting",
    "candy2_painting",
    "circus_painting",
    "dino_dragons_painting",
    "dino_painting",
    "dragon_painting",
    "egypt_painting",
    "fantasy_painting",
    "fog_painting",
    "forest_painting",
    "halloween_painting",
    "horror_painting",
    "kawaii_painting",
    "magic_painting",
    "medieval_painting",
    "modern_painting",
    "music_painting",
    "nature_painting",
    "ninja_painting",
    "ocean_painting",
    "pirates_painting",
    "robot_painting",
    "scifi_painting",
    "snow_painting",
    "steampunk_painting",
    "superheroes_painting",
    "tiny_painting",
    "vanilla_pack",
    "zombies_painting"
]
mc.world.afterEvents.worldInitialize.subscribe(()=>{
    if(!mc.world.getDynamicProperty(`hp4_paint`)) {
        paintings.forEach(p=>{
            mc.world.setDynamicProperty(`hp4_paint:painting_filter.${p}`, true)
        })
        mc.world.setDynamicProperty(`hp4_paint`, true)
    }
})
mc.world.afterEvents.playerSpawn.subscribe((arg)=>{
    if(!arg.player.hasTag('hp4_paint')) {
        arg.player.setDynamicProperty(`hp4_paint:additionalFurniture`, true)
        arg.player.setDynamicProperty(`hp4_paint:particles`, true)
        arg.player.setDynamicProperty(`hp4_paint:onlyCutePaintings`, false)
        arg.player.setDynamicProperty(`hp4_paint:paintingSizeUI`, true)
        arg.player.addTag('hp4_paint')
    }
})
mc.world.afterEvents.itemUse.subscribe(arg=>{
    const player = arg.source
    const item = arg.itemStack

    if(item.typeId == 'hp4_paint:settings_gear') {
        mainSettings(player)
    }
    if(item.typeId=='minecraft:stick') {
        const object = player.dimension.spawnEntity(`hp4_paint:particle_objects`, player.location)
        object.setProperty(`hp4_paint:model`, 0)
        mc.system.runTimeout(()=>{object.remove()},5*20)
    }
})
function mainSettings(player) {
    let buttons = [
        {
            text: `Gameplay Settings`,
            image: ``,
            command: () =>{
                gameplaySettings(player)
            }
        },
        {
            text: `Paintings Filter Settings`,
            image: ``,
            command: () =>{
                paintingFilterSettings(player)
            }
        }
    ]
    index.instanceMenu(
        player,
        (`More Paintings Settings`),
        (`Choose settings\n`),
        buttons
    )
}
function gameplaySettings(player) {
    const defaultValue = {
        additionalFurnitures: player.getDynamicProperty(`hp4_paint:additionalFurniture`),
        particles: player.getDynamicProperty(`hp4_paint:particles`),
        outlines: player.getDynamicProperty(`hp4_paint:outlines`),
        paintingsSizeUI: player.getDynamicProperty(`hp4_paint:paintingSizeUI`)
    }
    new ui.ModalFormData()
	.title({translate:'settings'})
    .toggle('Additional Furnitures', defaultValue.additionalFurnitures)
    .toggle('Particles', defaultValue.particles)
    .toggle('Outlines', defaultValue.outlines)
    .toggle('Painting size choose UI', defaultValue.paintingsSizeUI)
	.show(player)
	.then((r) => {
        try {
            const additionalFurnitures = r.formValues[0];
            const particles = r.formValues[1];
            const outlines = r.formValues[2];
            const paintingSizeUI = r.formValues[3];

            player.setDynamicProperty(`hp4_paint:additionalFurniture`, additionalFurnitures)
            player.setDynamicProperty(`hp4_paint:particles`, particles)
            player.setDynamicProperty(`hp4_paint:outlines`, outlines)
            player.setDynamicProperty(`hp4_paint:paintingSizeUI`, paintingSizeUI)
        } catch (error) {
            
        }
	});
}
function paintingFilterSettings(player) {
    let buttons = []
    paintings.forEach((p, i)=>{
        buttons.push({
            text: ({
                rawtext: [
                    {translate:`item.hp4_paint:${p}`},
                    {text:` ${mc.world.getDynamicProperty(`hp4_paint:painting_filter.${p}`) ? `§2ON§r` : `§4OFF§r`}`}
                ]
            }),
            image: `textures/hp/more_paintings/paintings_filter/${p}`,
            command: () =>{
                mc.world.getDynamicProperty(`hp4_paint:painting_filter.${p}`) ? mc.world.setDynamicProperty(`hp4_paint:painting_filter.${p}`, false) : mc.world.setDynamicProperty(`hp4_paint:painting_filter.${p}`, true)
                paintingFilterSettings(player)
            }
        })
    })
    index.instanceMenu(
        player,
        (`Paintings Filter Settings`),
        (`Choose which paintings you want to activate/deactivate in your world\n`),
        buttons
    )
}