import * as mc from "@minecraft/server";
import * as main from './hp4_paint_index'

//NAVIGATION SYSTEM
const radius = 50
const monsterRadius = 10
const dura = 0.3
const paintingTimer = [5, 20]
mc.system.runInterval(()=>{
    mc.world.getDimension(`overworld`).getEntities({type: `hp4_paint:artist_villager`}).forEach((entity)=>{
        const isHiding = entity.getDynamicProperty(`hp4_paint:isHiding`)
        const hidingSpot = entity.dimension.getEntities({type: `hp4_paint:artist_villager_hiding_spot`, location: entity.location, maxDistance: 1})
        const paintingSpot = entity.dimension.getEntities({type: `hp4_paint:artist_villager_painting_spot`, location: entity.location, maxDistance: 1})
        const sleepingSpot = entity.dimension.getEntities({type: `hp4_paint:artist_villager_sleeping_spot`, location: entity.location, maxDistance: 1}).filter(e=>!e.getDynamicProperty(`hp4_paint:sleeper`) || e.getDynamicProperty(`hp4_paint:sleeper`) == entity.id)

        //TIMER COUNTDOWN
        entity.getDynamicProperty(`hp4_paint:hidingTimer`) > 0 ? entity.setDynamicProperty(`hp4_paint:hidingTimer`, entity.getDynamicProperty(`hp4_paint:hidingTimer`) - 1) : null
        entity.getDynamicProperty(`hp4_paint:paintingTimer`) > 0 ? entity.setDynamicProperty(`hp4_paint:paintingTimer`, entity.getDynamicProperty(`hp4_paint:paintingTimer`) - 1) : null

        {
            if(!entity.getDynamicProperty(`hp4_paint:night`)) {
                paintingSpot.forEach((paintingSpot)=>{
                    if(isHiding || entity.getDynamicProperty(`hp4_paint:isCamouflage`))return
                    if(!entity.getDynamicProperty(`hp4_paint:is_painting`)){
                        entity.setRotation({x: 0, y: paintingSpot.getRotation().y + 180})
                        entity.addEffect(`slowness`, 1*20, {amplifier: 255, showParticles: false})
                        entity.triggerEvent(`static`)
                        mc.system.runTimeout(()=>{
                        console.warn(`\nspot rotation: ${paintingSpot.getRotation().y}\nentity rotation: ${entity.getRotation().y}`)
                        },5)
                        entity.teleport(paintingSpot.location)
                        const timer = Math.round(Math.random()*(paintingTimer[1]-paintingTimer[0])+paintingTimer[0])
                        entity.setDynamicProperty(`hp4_paint:paintingTimer`, timer*20)
                        entity.setDynamicProperty(`hp4_paint:is_painting`, true)
                        //entity.playAnimation(`animation.hp4_paint.artist_villager.painting`)
                        entity.setDynamicProperty(`hp4_paint:lookingForSpot`, false)
                    } else if(entity.getDynamicProperty(`hp4_paint:is_painting`) && entity.getDynamicProperty(`hp4_paint:paintingTimer`) <= 0 && !entity.getDynamicProperty(`hp4_paint:lookingForSpot`)){
                        //console.warn('looking for spot2')
                        entity.dimension.getEntities({type: `hp4_paint:artist_villager_painting_spot`, location: entity.location, maxDistance: 1}).forEach((spotEntity)=>{
                            spotEntity.remove()
                        })
                        const paintingSpotLoc = entity.dimension.getEntities({type: `hp4_paint:artist_villager_painting_spot_loc`, location: entity.location, maxDistance: radius})
                        const random = Math.floor(Math.random() * (paintingSpotLoc.length - 0) + 0)
                        const chosenSpot = paintingSpotLoc[random]
                        const tot = chosenSpot.dimension.spawnEntity(`hp4_paint:artist_villager_painting_spot`, chosenSpot.location)
                        const rots = [
                            0, 90, 180, -90
                        ]
                        tot.setRotation({
                            x:chosenSpot.getRotation().x,
                            y:chosenSpot.getRotation().y,
                        })
                        entity.triggerEvent(`go_painting`)
                        entity.setDynamicProperty(`hp4_paint:is_painting`, false)
                        entity.setDynamicProperty(`hp4_paint:lookingForSpot`, true)
                    }
                    entity.getDynamicProperty(`hp4_paint:isHidingStart`) ? entity.setDynamicProperty(`hp4_paint:isHidingStart`, false) : null
                })

                //MONSTER DETECT
                if(entity.dimension.getEntities({families:[`monster`], location: entity.location, maxDistance: monsterRadius}).length > 0){
                    if(!entity.getDynamicProperty(`hp4_paint:isCamouflage`)) {
                        entity.playAnimation(`spin`)
                        mc.system.runTimeout(()=>{
                            //console.warn('camouflage on')
                            entity.setProperty(`hp4_paint:camouflage`, true)
                            !entity.getDynamicProperty(`hp4_paint:isHiding`) ?
                            entity.triggerEvent(`go_hang_around`) : null
                        },3*20)
                        entity.setDynamicProperty(`hp4_paint:isCamouflage`, true)
                    }
                } else if(entity.dimension.getEntities({families:[`monster`], location: entity.location, maxDistance: monsterRadius}).length == 0){
                    if(entity.getDynamicProperty(`hp4_paint:isCamouflage`)) {
                        const timer = mc.system.runTimeout(()=>{
                            if(entity.dimension.getEntities({families:[`monster`], location: entity.location, maxDistance: 30}).length > 0 || !entity.getDynamicProperty(`hp4_paint:isCamouflage`)) return
                            entity.playAnimation(`spin`)
                            entity.addEffect(`slowness`, 6*20, {amplifier:255, showParticles: false})
                            mc.system.runTimeout(()=>{
                                //console.warn('camouflage off')
                                entity.setProperty(`hp4_paint:camouflage`, false)
                                entity.triggerEvent(`go_painting`)
                            },3*20)
                            entity.setDynamicProperty(`hp4_paint:isCamouflage`, false)
                        },5*20)
                        if(entity.dimension.getEntities({families:[`monster`], location: entity.location, maxDistance: 30}).length > 0) {
                            mc.system.clearRun(timer)
                        }
                    }
                }
            }
            
                if(paintingSpot.length == 0 && (entity.getProperty(`hp4_paint:is_painting`)||entity.getDynamicProperty(`hp4_paint:is_painting`))){
                    entity.setProperty(`hp4_paint:is_painting`, false)
                    entity.setDynamicProperty(`hp4_paint:is_painting`, false)
                } else if (paintingSpot.length > 0 && (!entity.getProperty(`hp4_paint:is_painting`) || !entity.getDynamicProperty(`hp4_paint:is_painting`))){
                    entity.setProperty(`hp4_paint:is_painting`, true)
                    entity.setDynamicProperty(`hp4_paint:is_painting`, true)
                }
            //SPOT DETECT
            hidingSpot.forEach((hidingSpot)=>{
                if(!entity.getDynamicProperty(`hp4_paint:isHidingStart`)){
                    entity.triggerEvent(`static`)
                    entity.teleport(hidingSpot.location)
                    entity.setDynamicProperty(`hp4_paint:isHidingStart`, true)
                    entity.setDynamicProperty(`hp4_paint:is_painting`, false)
                    entity.setProperty(`hp4_paint:using_shield`, true)
                }
                //entity.addEffect(`invisibility`, 1*20, {showParticles: false})
                entity.addEffect(`regeneration`, 1*20, {showParticles: false})
            })
            {
                if(entity.getDynamicProperty(`hp4_paint:hidingTimer`) <= 0){
                    if(entity.getProperty(`hp4_paint:camouflage`)==false) {
                        getTimeOfDayForQuest() == `day` ? entity.triggerEvent(`go_painting`) : entity.triggerEvent(`find_bed`)
                        entity.setProperty(`hp4_paint:is_hiding`, false)
                    } else if (entity.getProperty(`hp4_paint:camouflage`)==true) {
                        entity.triggerEvent(`go_hang_around`)
                        entity.setProperty(`hp4_paint:is_hiding`, false)
                    }
                    entity.setDynamicProperty(`hp4_paint:isHiding`, false)
                    entity.setProperty(`hp4_paint:using_shield`, false)
                }
            }
            if(hidingSpot.length == 0 && entity.getDynamicProperty(`hp4_paint:isHidingStart`)){
                entity.setProperty(`hp4_paint:is_painting`, false)
                entity.setDynamicProperty(`hp4_paint:isHidingStart`, false)
            }
        }
        if(getTimeOfDayForQuest() == `day`) {
            //INITIATOR
            if(entity.getDynamicProperty(`hp4_paint:night`) && !isHiding) {
                entity.setDynamicProperty(`hp4_paint:night`, false)
                entity.triggerEvent(`go_painting`)
                entity.setProperty(`hp4_paint:sleeping`, false)
            }
        } else if (getTimeOfDayForQuest() == `night`){
            //INITIATOR
            if(!entity.getDynamicProperty(`hp4_paint:night`) && !isHiding) {
                mc.system.runTimeout(()=>{
                    entity.triggerEvent(`find_bed`)
                    entity.setDynamicProperty(`hp4_paint:night`, true)
                },1)
            }
            if(sleepingSpot.length > 0) {
                if(!entity.getDynamicProperty(`hp4_paint:sleeping`) && !entity.getDynamicProperty(`hp4_paint:isHiding`)) {
                    sleepingSpot[0].setDynamicProperty(`hp4_paint:sleeper`, entity.id)
                    entity.setDynamicProperty(`hp4_paint:sleeping`, true)
                    entity.setProperty(`hp4_paint:sleeping`, true)
                    const facingLoc = {
                        x: sleepingSpot[0].location.x + sleepingSpot[0].getViewDirection().x * 5,
                        y: sleepingSpot[0].location.y,
                        z: sleepingSpot[0].location.z + sleepingSpot[0].getViewDirection().z * 5
                    }
                    entity.teleport(sleepingSpot[0].location,
                        {
                            facingLocation: facingLoc
                        }
                    )
                    mc.system.runTimeout(()=>{
                        entity.triggerEvent(`static`)
                    },15)
                }
            } else {
                entity.getProperty(`hp4_paint:sleeping`) ? entity.setProperty(`hp4_paint:sleeping`, false) : null
                if (entity.getDynamicProperty(`hp4_paint:sleeping`)) {
                    entity.setDynamicProperty(`hp4_paint:sleeping`, false)
                    entity.triggerEvent('go_hang_around')
                }
            }
        }
    })
    mc.world.getDimension(`overworld`).getEntities({type: `hp4_paint:artist_villager_sleeping_spot`}).forEach((entity)=>{
        const sleeper = entity.dimension.getEntities({type:`hp4_paint:artist_villager`, maxDistance: 1, location: entity.location}).filter(e=>e.id == entity.getDynamicProperty(`hp4_paint:sleeper`))
        if(sleeper.length > 0) {
            entity.triggerEvent(`has_sleeper`)
        } else if(sleeper.length == 0) {
            entity.triggerEvent(`no_sleeper`)
        }

        const owner = entity.dimension.getEntities({type:`hp4_paint:artist_villager`}).filter(e=>e.id == entity.getDynamicProperty(`hp4_paint:sleeper`))
        if(owner.length == 0) {
            entity.setDynamicProperty(`hp4_paint:sleeper`, undefined)
        }

        const blockBelow = entity.dimension.getBlock({
            x: entity.location.x,
            y: entity.location.y - 1,
            z: entity.location.z
        })
        try {
        if(blockBelow.typeId != 'minecraft:bed') {
            console.warn('no bed was found below the entity')
            entity.remove()
        }
        } catch (error) {
            
        }
    })
})
mc.world.afterEvents.entityHitEntity.subscribe(arg=>{
    const entity = arg.hitEntity
    const player = arg.damagingEntity

    if(entity.typeId == `hp4_paint:artist_villager` && player.typeId == `minecraft:player`){
        const hidingSpot = entity.dimension.getEntities({type: `hp4_paint:artist_villager_hiding_spot_loc`, location: entity.location, closest: 1, maxDistance: entity.getProperty(`hp4_paint:camouflage`)==false ? radius : radius *3})
        const attack = [
            `attack`,
            `throw_bucket`
        ]
        entity.setProperty(`hp4_paint:sleeping`, false)
        if(hidingSpot.length > 0) {
            if(!entity.getDynamicProperty(`hp4_paint:isHiding`)) {
                entity.playAnimation(attack[Math.floor(Math.random() * (2 - 0) + 0)])
                mc.system.runTimeout(()=>{
                    //player.runCommand(`camera @s fade time 0 1 1 color ${Math.round(Math.random() * (255-0) + 0)} ${Math.round(Math.random() * (255-0) + 0)} ${Math.round(Math.random() * (255-0) + 0)}`)
                    entity.setProperty(`hp4_paint:is_hiding`, true)
                },0.7*20)
                {
                    entity.setDynamicProperty(`hp4_paint:hidingTimer`, dura*20*60)
                    entity.addEffect(`slowness`, 0.75*20, {amplifier: 255, showParticles: false})
                    entity.triggerEvent(`go_hiding`)
                    hidingSpot.forEach((spot)=>{
                        spot.dimension.getEntities({type: `hp4_paint:artist_villager_hiding_spot`, location: spot.location, maxDistance: 1}).forEach((spotEntity)=>{
                            spotEntity.remove()
                        })
                    })
                    const random = Math.floor(Math.random() * (hidingSpot.length - 0) + 0)
                    const chosenSpot = hidingSpot[random]
                    //console.warn(random)
                    chosenSpot.dimension.spawnEntity(`hp4_paint:artist_villager_hiding_spot`, chosenSpot.location)
                    entity.setDynamicProperty(`hp4_paint:isHiding`, true)
                }
            }
        } else {
            entity.playAnimation(attack[Math.floor(Math.random() * (2 - 0) + 0)])
            mc.system.runTimeout(()=>{
                // player.runCommand(`camera @s fade time 0 1 1 color ${Math.round(Math.random() * (255-0) + 0)} ${Math.round(Math.random() * (255-0) + 0)} ${Math.round(Math.random() * (255-0) + 0)}`)
                entity.remove()
            },2*20)
        }
    }
})
mc.world.afterEvents.entitySpawn.subscribe(arg=>{
    const entity = arg.entity
    if(entity.typeId == `hp4_paint:artist_villager`){
        const paintingSpot = entity.dimension.getEntities({type: `hp4_paint:artist_villager_painting_spot_loc`, location: entity.location, maxDistance: radius})
            {
                //VARIANT RANDOMIZE
                const variants = [
                    [`cloth`, 4],
                    [`skin`, 3],
                    [`colors`, 3]
                ]
                variants.forEach((variant)=>{
                    const random = Math.round(Math.random() * (variant[1] - 0) + 0)
                    entity.setProperty(`hp4_paint:${variant[0]}`, random)
                })
            }
        {
            if(paintingSpot.length > 0) {
                entity.triggerEvent(`go_painting`)
                paintingSpot.forEach((spot)=>{
                    spot.dimension.getEntities({type: `hp4_paint:artist_villager_painting_spot`, location: spot.location, maxDistance: 1}).forEach((spotEntity)=>{
                        spotEntity.remove()
                    })
                })
                const random = Math.floor(Math.random() * (paintingSpot.length - 0) + 0)
                const chosenSpot = paintingSpot[random]
                //console.warn(random)
                chosenSpot.dimension.spawnEntity(`hp4_paint:artist_villager_painting_spot`, chosenSpot.location)
            } else if(paintingSpot.length == 0) {
                entity.triggerEvent(`static`)
            }
        }
    }
    if(entity.typeId == `hp4_paint:artist_villager_sleeping_spot`) {
        try {
            entity.setRotation({
                x: 0,
                y: Math.round(
                    entity.getRotation().y / 90) * 90
            })
            mc.system.runTimeout(()=>{
                const blockBelow = entity.dimension.getBlock({
                    x: entity.location.x,
                    y: entity.location.y - 1,
                    z: entity.location.z
                })
                console.warn(blockBelow.typeId)
            },1)
        } catch (error) {}
    }
    if(entity.typeId.startsWith(`hp4_paint`) && entity.typeId.endsWith(`_executor`)) {
        mc.system.runTimeout(()=>{
            const number = Number(entity.typeId.replace(`hp4_paint:artist_villager_house`, ``).replace(`_executor`, ``))
            entity.dimension.getEntities({type: `hp4_paint:artist_villager_house${number}_target`, closest:1, location: entity.location}).forEach(target=>{
                entity.teleport(
                    entity.location,
                    {
                        facingLocation: target.location
                    }
                )
                mc.system.runTimeout(()=>{
                    target.runCommand(`setblock ~~~ air`)
                    target.runCommand(`setblock ~~-1~ oak_planks`)
                },1*20)
            })
            mc.system.runTimeout(()=>{
                //console.warn(entity.getRotation().y)
                    const furnish = [
[
{type: "hp4_paint:pirates_painting",location: {x: -1,y: 0.5,z: 2},rotation: {x: 0,y: -132.114013671875},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799847"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"medieval"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"none"},{name:"hp4_paint:paint_colors", value:8},{name:"hp4_paint:paint_models", value:1},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:halloween_painting",location: {x: 3,y: -0.5,z: 1},rotation: {x: 0,y: -84.59473419189453},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799834"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"easel_stand"},{name:"hp4_paint:paint_colors", value:13},{name:"hp4_paint:paint_models", value:2},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:statue_painting",location: {x: 7,y: -0.5,z: 1},rotation: {x: 0,y: 72.99526977539062},dynamicProperties: [{name:"hp4_paint:disable_interaction", value:0},{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799824"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:1},{name:"hp4_paint:statue_pose", value:0},]},
{type: "hp4_paint:forest_painting",location: {x: -4,y: -0.5,z: 7},rotation: {x: 0,y: 0.4322509765625},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799823"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"display_case_wide"},{name:"hp4_paint:paint_colors", value:7},{name:"hp4_paint:paint_models", value:1},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:statue_painting",location: {x: 5,y: 4.5,z: 5},rotation: {x: 0,y: 11.65460205078125},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799818"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:statue_pose", value:0},]},
{type: "hp4_paint:dino_dragons_painting",location: {x: -1,y: 5.5,z: 7},rotation: {x: 0,y: 131.67190551757812},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799817"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"medieval"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"none"},{name:"hp4_paint:paint_colors", value:3},{name:"hp4_paint:paint_models", value:0},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:alien_painting",location: {x: -1,y: -0.5,z: 9},rotation: {x: 0,y: -174.82379150390625},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799812"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"easel_stand"},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_models", value:0},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:biomes_painting",location: {x: 5,y: -0.5,z: 10},rotation: {x: 0,y: 168.40228271484375},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799804"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"easel_stand"},{name:"hp4_paint:paint_colors", value:12},{name:"hp4_paint:paint_models", value:2},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:tiny_painting",location: {x: 5,y: 4.5,z: 9},rotation: {x: 0,y: 86.16983032226562},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799796"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"easel_stand"},{name:"hp4_paint:paint_colors", value:13},{name:"hp4_paint:paint_models", value:2},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:alien_painting",location: {x: -7,y: 0.5,z: 9},rotation: {x: 0,y: -90.4085693359375},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799786"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"deciron"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"none"},{name:"hp4_paint:paint_colors", value:14},{name:"hp4_paint:paint_models", value:3},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:horror_painting",location: {x: -6,y: -0.5,z: 11},rotation: {x: 0,y: -175.33853149414062},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799769"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"display_case"},{name:"hp4_paint:paint_colors", value:13},{name:"hp4_paint:paint_models", value:2},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:dino_dragons_painting",location: {x: -6,y: 5.5,z: 11},rotation: {x: 0,y: -166.8050079345703},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799761"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"none"},{name:"hp4_paint:paint_colors", value:11},{name:"hp4_paint:paint_models", value:1},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:animated_painting",location: {x: 3,y: 5.5,z: 14},rotation: {x: 0,y: -179.1344451904297},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799758"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"black_modern"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"none"},{name:"hp4_paint:paint_colors", value:13},{name:"hp4_paint:paint_models", value:6},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:fantasy_painting",location: {x: 11,y: 8.499999046325684,z: 9},rotation: {x: 0,y: -23.019088745117188},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799753"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"none"},{name:"hp4_paint:paint_colors", value:37},{name:"hp4_paint:paint_models", value:5},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:fantasy_painting",location: {x: 13,y: 8.499999046325684,z: 7},rotation: {x: 0,y: 169.19842529296875},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799743"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"none"},{name:"hp4_paint:paint_colors", value:37},{name:"hp4_paint:paint_models", value:5},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:brush_on_shelf",location: {x: 1,y: 0.5,z: 0},rotation: {x: 0,y: 77.659912109375},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799726"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:brush_on_shelf",location: {x: 1,y: 0.5,z: 1},rotation: {x: 0,y: 96.9991455078125},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799725"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:art_bench",location: {x: 3,y: -0.5,z: 0},rotation: {x: 0,y: -87.55055236816406},dynamicProperties: [{name:"hp4_paint:disable_interaction", value:0},{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799724"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:1},]},
{type: "hp4_paint:cabinet",location: {x: 1,y: -0.5,z: 3},rotation: {x: 0,y: 71.19107055664062},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799723"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:easel_stand",location: {x: 3,y: -0.5,z: 1},rotation: {x: 0,y: -84.59473419189453},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:babu", value:"-21474836428"},{name:"hp4_paint:id", value:"-682899799722"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_installed", value:true},{name:"hp4_paint:is_glowing", value:false},{name:"hp4_paint:painting_type", value:0},{name:"hp4_paint:paint_size", value:"null"},]},
{type: "hp4_paint:round_planter",location: {x: 1,y: -0.5,z: 5},rotation: {x: 0,y: 61.3419189453125},dynamicProperties: [{name:"hp4_paint:slot", value:0},{name:"hp4_paint:slot0", value:"-682899799627"},{name:"hp4_paint:id", value:"-682899799628"},],properties: [{name:"hp4_paint:furniture_color", value:0},]},
{type: "hp4_paint:plants_holder_mp",location: {x: 1,y: -0.5,z: 5},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-682899799627"},],properties: []},
{type: "hp4_paint:easel_stand",location: {x: 3,y: -0.5,z: 5},rotation: {x: 0,y: -3.4742584228515625},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799719"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_installed", value:false},{name:"hp4_paint:is_glowing", value:false},{name:"hp4_paint:painting_type", value:0},{name:"hp4_paint:paint_size", value:"null"},]},
{type: "hp4_paint:sack_of_beton",location: {x: 4,y: -0.5,z: 5},rotation: {x: 0,y: 9.511260986328125},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799718"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:artist_box",location: {x: 5,y: 0.5,z: 5},rotation: {x: 0,y: 1.026397705078125},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799717"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -6,y: 0.5,z: 4},rotation: {x: 0,y: 3.852081298828125},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799716"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 6,y: 0.5,z: 4},rotation: {x: 0,y: -158.45529174804688},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799715"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -6,y: 1.5,z: 4},rotation: {x: 0,y: 3.84747314453125},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799713"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 6,y: 1.5,z: 4},rotation: {x: 0,y: -158.42922973632812},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799714"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:art_knives",location: {x: 7,y: 0.5,z: 3},rotation: {x: 0,y: 85.77450561523438},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799712"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:cabinet",location: {x: 2,y: 4.5,z: 6},rotation: {x: 0,y: -1.34185791015625},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799711"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:art_knives",location: {x: 6,y: 0.5,z: 5},rotation: {x: 0,y: -18.58551025390625},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799709"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:brush_cleaner_cup",location: {x: -6,y: 0.5,z: 5},rotation: {x: 0,y: -3.384307861328125},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799710"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:stool",location: {x: 0,y: -0.5,z: 8},rotation: {x: 0,y: 144.2830810546875},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799708"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:display_case_wide",location: {x: -4,y: -0.5,z: 7},rotation: {x: 0,y: 0.4322509765625},dynamicProperties: [{name:"hp4_paint:disable_interaction", value:0},{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:babu", value:"-8589934513"},{name:"hp4_paint:id", value:"-682899799707"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_installed", value:true},{name:"hp4_paint:is_glowing", value:false},{name:"hp4_paint:painting_type", value:0},{name:"hp4_paint:paint_size", value:"null"},]},
{type: "hp4_paint:color_bucket",location: {x: -7,y: 0.5,z: 5},rotation: {x: 0,y: -23.42529296875},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799706"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:easel_stand",location: {x: -1,y: -0.5,z: 9},rotation: {x: 0,y: -174.82379150390625},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:babu", value:"-8589934500"},{name:"hp4_paint:id", value:"-682899799705"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_installed", value:true},{name:"hp4_paint:is_glowing", value:false},{name:"hp4_paint:painting_type", value:0},{name:"hp4_paint:paint_size", value:"null"},]},
{type: "hp4_paint:plants_holder_mp",location: {x: 6,y: 4.49899959564209,z: 5.147003173828125},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-682899799619"},],properties: []},
{type: "hp4_paint:art_chair",location: {x: 1,y: 4.5,z: 8},rotation: {x: 0,y: -76.81513977050781},dynamicProperties: [{name:"hp4_paint:disable_interaction", value:0},{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799704"},],properties: [{name:"hp4_paint:furniture_color", value:2},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:brush_holder_cup",location: {x: 7,y: 0.5,z: 6},rotation: {x: 0,y: 61.25502014160156},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799703"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:plants_holder_mp",location: {x: 6,y: 4.494999885559082,z: 6},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-682899799621"},],properties: []},
{type: "hp4_paint:wide_planter",location: {x: 6,y: 4.5,z: 6},rotation: {x: 0,y: -79.94001770019531},dynamicProperties: [{name:"hp4_paint:slot", value:2},{name:"hp4_paint:slot0", value:"-682899799621"},{name:"hp4_paint:slot1", value:"-682899799620"},{name:"hp4_paint:slot2", value:"-682899799619"},{name:"hp4_paint:id", value:"-682899799623"},],properties: [{name:"hp4_paint:furniture_color", value:0},]},
{type: "hp4_paint:paint_tubes",location: {x: 5,y: 4.5,z: 7},rotation: {x: 0,y: 25.593994140625},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799701"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:lying_bottle_color",location: {x: 7,y: 0.5,z: 7},rotation: {x: 0,y: 89.76315307617188},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799700"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:art_chair",location: {x: 6,y: -0.5,z: 8},rotation: {x: 0,y: -85.70299530029297},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799699"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -8,y: 0.5,z: 6},rotation: {x: 0,y: -83.09681701660156},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799698"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -8,y: 1.5,z: 6},rotation: {x: 0,y: -82.87737274169922},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799697"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:plants_holder_mp",location: {x: 6,y: 4.496999740600586,z: 6.842010498046875},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-682899799620"},],properties: []},
{type: "hp4_paint:vase",location: {x: -5,y: 5.5,z: 7},rotation: {x: 0,y: 12.700775146484375},dynamicProperties: [{name:"hp4_paint:disable_interaction", value:0},{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799696"},{name:"hp4_paint:slot", value:0},{name:"hp4_paint:slot0", value:"-8589934448"},],properties: [{name:"hp4_paint:furniture_color", value:0},]},
{type: "hp4_paint:plants_holder",location: {x: -5,y: 5.5,z: 7},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799695"},],properties: []},
{type: "hp4_paint:brush_holder_cup",location: {x: 3,y: 0.5,z: 10},rotation: {x: 0,y: -120.13446044921875},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799694"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:sketchbook",location: {x: -6,y: 5.5,z: 7},rotation: {x: 0,y: 0.4281005859375},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799693"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:plants_holder_mp",location: {x: 6,y: 4.496999740600586,z: 8.157989501953125},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-682899799617"},],properties: []},
{type: "hp4_paint:easel_stand",location: {x: 5,y: -0.5,z: 10},rotation: {x: 0,y: 168.40228271484375},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:babu", value:"-8589934558"},{name:"hp4_paint:id", value:"-682899799692"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_installed", value:true},{name:"hp4_paint:is_glowing", value:false},{name:"hp4_paint:painting_type", value:0},{name:"hp4_paint:paint_size", value:"null"},]},
{type: "hp4_paint:easel_stand",location: {x: 5,y: 4.5,z: 9},rotation: {x: 0,y: 86.16983032226562},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:babu", value:"-12884901887"},{name:"hp4_paint:id", value:"-682899799691"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_installed", value:true},{name:"hp4_paint:is_glowing", value:false},{name:"hp4_paint:painting_type", value:0},{name:"hp4_paint:paint_size", value:"null"},]},
{type: "hp4_paint:window_big",location: {x: 8,y: 0.5,z: 8},rotation: {x: 0,y: 76.31500244140625},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799690"},],properties: [{name:"hp4_paint:furniture_color", value:3},]},
{type: "hp4_paint:tube_paint",location: {x: 3,y: 0.5,z: 11},rotation: {x: 0,y: -86.96077728271484},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799689"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:chalk_and_charcoal",location: {x: 7,y: 0.5,z: 9},rotation: {x: 0,y: 91.0740966796875},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799688"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:plants_holder_mp",location: {x: 6,y: 4.494999885559082,z: 9},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-682899799618"},],properties: []},
{type: "hp4_paint:wide_planter",location: {x: 6,y: 4.5,z: 9},rotation: {x: 0,y: 92.29022216796875},dynamicProperties: [{name:"hp4_paint:slot1", value:"-682899799617"},{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799687"},{name:"hp4_paint:slot", value:2},{name:"hp4_paint:slot0", value:"-682899799618"},{name:"hp4_paint:slot2", value:"-682899799616"},],properties: [{name:"hp4_paint:furniture_color", value:0},]},
{type: "hp4_paint:window",location: {x: -8,y: 5.5,z: 7},rotation: {x: 0,y: -65.07705688476562},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799686"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 8,y: 5.5,z: 7},rotation: {x: 0,y: 79.07763671875},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799685"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:brushes_set",location: {x: 5,y: 4.5,z: 10},rotation: {x: 0,y: 80.77395629882812},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799684"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:spatula",location: {x: 7,y: 0.5,z: 10},rotation: {x: 0,y: 23.842864990234375},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799683"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:spatula",location: {x: 7,y: 0.5,z: 10},rotation: {x: 0,y: 23.842864990234375},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799682"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:plants_holder_mp",location: {x: 6,y: 4.49899959564209,z: 9.852996826171875},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-682899799616"},],properties: []},
{type: "hp4_paint:window",location: {x: 8,y: 6.5,z: 7},rotation: {x: 0,y: 79.07763671875},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799681"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -8,y: 6.5,z: 7},rotation: {x: 0,y: -65.07697296142578},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799680"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:display_case",location: {x: -6,y: -0.5,z: 11},rotation: {x: 0,y: -175.33853149414062},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:babu", value:"-8589934360"},{name:"hp4_paint:id", value:"-682899799679"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_installed", value:true},{name:"hp4_paint:is_glowing", value:false},{name:"hp4_paint:painting_type", value:0},{name:"hp4_paint:paint_size", value:"null"},]},
{type: "hp4_paint:plants_holder_mp",location: {x: 7,y: -0.5,z: 11},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-682899799624"},],properties: []},
{type: "hp4_paint:round_planter",location: {x: 7,y: -0.5,z: 11},rotation: {x: 0,y: 54.849639892578125},dynamicProperties: [{name:"hp4_paint:slot", value:0},{name:"hp4_paint:slot0", value:"-682899799624"},{name:"hp4_paint:id", value:"-682899799626"},],properties: [{name:"hp4_paint:furniture_color", value:0},]},
{type: "hp4_paint:cabinet",location: {x: 2,y: -0.5,z: 13},rotation: {x: 0,y: -9.967254638671875},dynamicProperties: [{name:"hp4_paint:id", value:"-682899799615"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 8,y: 5.5,z: 9},rotation: {x: 0,y: 105.7584228515625},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799676"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -8,y: 5.5,z: 9},rotation: {x: 0,y: -81.85765075683594},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799675"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:brush_cleaner_jar",location: {x: 1,y: 5.5,z: 12},rotation: {x: 0,y: -85.18731689453125},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799674"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -6,y: 0.5,z: 12},rotation: {x: 0,y: 11.9849853515625},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799673"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -6,y: 1.5,z: 12},rotation: {x: 0,y: 9.544189453125},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799672"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -8,y: 6.5,z: 9},rotation: {x: 0,y: -81.85765075683594},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799671"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 8,y: 6.5,z: 9},rotation: {x: 0,y: 105.7584228515625},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799670"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:art_bench",location: {x: 1,y: -0.5,z: 14},rotation: {x: 0,y: -85.43997192382812},dynamicProperties: [{name:"hp4_paint:id", value:"-682899799614"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:chalk_and_charcoal",location: {x: 5,y: 5.5,z: 12},rotation: {x: 0,y: 77.92010498046875},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799669"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:sewing_kit",location: {x: 1,y: 5.5,z: 13},rotation: {x: 0,y: -83.31539916992188},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799668"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:spray_can",location: {x: 5,y: 5.5,z: 13},rotation: {x: 0,y: 90.928955078125},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799667"},],properties: [{name:"hp4_paint:furniture_model", value:1},]},
{type: "hp4_paint:unfinished_wooden_block",location: {x: 1,y: 5.5,z: 14},rotation: {x: 0,y: -91.67424774169922},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799666"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:art_chair",location: {x: 2,y: 4.5,z: 16},rotation: {x: 0,y: -78.00839233398438},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799665"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:color_swatch",location: {x: 5,y: 5.5,z: 16},rotation: {x: 0,y: 75.76637268066406},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799664"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:pencil_set",location: {x: 5,y: 5.5,z: 17},rotation: {x: 0,y: 72.54399108886719},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799663"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 6,y: 0.5,z: 18},rotation: {x: 0,y: -86.99479675292969},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799662"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 6,y: 1.5,z: 18},rotation: {x: 0,y: -82.93328094482422},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799661"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 4,y: 0.5,z: 21},rotation: {x: 0,y: 18.350494384765625},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799660"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 4,y: 1.5,z: 21},rotation: {x: 0,y: 18.3504638671875},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799659"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 2,y: 4.5,z: 21},rotation: {x: 0,y: -35.588470458984375},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799658"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 2,y: 5.5,z: 21},rotation: {x: 0,y: -35.588470458984375},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799657"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 4,y: 4.5,z: 21},rotation: {x: 0,y: 15.959197998046875},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799656"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 4,y: 5.5,z: 21},rotation: {x: 0,y: 15.959197998046875},dynamicProperties: [{name:"hp4_paint:langsung", value:true},{name:"hp4_paint:id", value:"-682899799655"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},


{type: "hp4_paint:artist_villager_painting_spot_loc",location: {x: 4,y: -0.5,z: 1},rotation: {x: 0,y: -90},dynamicProperties: [{name:"hp4_paint:id", value:"-687194765752"},],properties: []},
{type: "hp4_paint:artist_villager_painting_spot_loc",location: {x: -1,y: -0.5,z: 8},rotation: {x: 0,y: 180},dynamicProperties: [{name:"hp4_paint:id", value:"-687194765751"},],properties: []},
{type: "hp4_paint:artist_villager_hiding_spot_loc",location: {x: -6,y: -0.5,z: 6},rotation: {x: 0,y: 43.78070068359375},dynamicProperties: [{name:"hp4_paint:id", value:"-687194765747"},],properties: []},
{type: "hp4_paint:artist_villager_painting_spot_loc",location: {x: 5,y: 0.5,z: 9},rotation: {x: 0,y: 180},dynamicProperties: [{name:"hp4_paint:id", value:"-687194765750"},],properties: []},
{type: "hp4_paint:artist_villager_painting_spot_loc",location: {x: 4,y: 5.5,z: 9},rotation: {x: 0,y: 90},dynamicProperties: [{name:"hp4_paint:id", value:"-687194765749"},],properties: []},
{type: "hp4_paint:artist_villager_hiding_spot_loc",location: {x: 2,y: -0.5,z: 14},rotation: {x: 0,y: -123.6905288696289},dynamicProperties: [{name:"hp4_paint:id", value:"-687194765746"},],properties: []},
{type: "hp4_paint:artist_villager_hiding_spot_loc",location: {x: 2,y: 4.5,z: 20},rotation: {x: 0,y: -102.16357421875},dynamicProperties: [{name:"hp4_paint:id", value:"-687194765745"},],properties: []},
{type: "hp4_paint:artist_villager",location: {x: -1,y: -0.5,z: 8},rotation: {x: 0,y: 35.53108215332031},dynamicProperties: [],properties: []},
{type: "hp4_paint:artist_villager_sleeping_spot",location: {x: 2,y: 5.5,z: 18},rotation: {x: 0,y: -90},dynamicProperties: [{name:"hp4_paint:id", value:"-687194765748"},],properties: []},
],
[
{type: "hp4_paint:8bit_painting",location: {x: -2,y: -0.5,z: 3},rotation: {x: 0,y: -152.10891723632812},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901786"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"display_case"},{name:"hp4_paint:paint_colors", value:12},{name:"hp4_paint:paint_models", value:2},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:snow_painting",location: {x: 0,y: 4.5,z: 2},rotation: {x: 0,y: 71.49111938476562},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869110"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"display_case_wide"},{name:"hp4_paint:paint_colors", value:9},{name:"hp4_paint:paint_models", value:1},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:circus_painting",location: {x: -2,y: 5.5,z: 5},rotation: {x: 0,y: 2.514404296875},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869109"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"enchanted"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"none"},{name:"hp4_paint:paint_colors", value:3},{name:"hp4_paint:paint_models", value:0},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:dino_dragons_painting",location: {x: 8,y: -0.5,z: 1},rotation: {x: 0,y: -9.91796875},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901713"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"easel_stand"},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_models", value:0},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:ocean_painting",location: {x: -3,y: -0.5,z: 9},rotation: {x: 0,y: -92.00580596923828},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901759"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"display_case_wide"},{name:"hp4_paint:paint_colors", value:7},{name:"hp4_paint:paint_models", value:1},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:fog_painting",location: {x: -10,y: -0.5,z: 6},rotation: {x: 0,y: -80.38492584228516},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901738"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"display_case_big"},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_models", value:0},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:candy2_painting",location: {x: -7,y: 5.5,z: 8},rotation: {x: 0,y: 96.20379638671875},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869078"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"glitter"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"none"},{name:"hp4_paint:paint_colors", value:3},{name:"hp4_paint:paint_models", value:0},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:dragon_painting",location: {x: 7,y: 4.5,z: 9},rotation: {x: 0,y: -178.0116729736328},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836469"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"easel_stand"},{name:"hp4_paint:paint_colors", value:2},{name:"hp4_paint:paint_models", value:1},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:ninja_painting",location: {x: -2,y: 4.5,z: 12},rotation: {x: 0,y: -170.7081756591797},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869142"},{name:"hp4_paint:rotation_attempt", value:0},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:frame_type", value:"none"},{name:"hp4_paint:size", value:1},{name:"hp4_paint:displayer_active", value:false},{name:"hp4_paint:displayer", value:"easel_stand"},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_models", value:0},{name:"hp4_paint:paint_materials", value:false},{name:"hp4_paint:visible", value:true},]},
{type: "hp4_paint:tube_paint",location: {x: 1,y: 0.5,z: -1},rotation: {x: 0,y: 97.09674072265625},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901686"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:round_planter",location: {x: -2,y: -0.5,z: 1},rotation: {x: 0,y: -56.687217712402344},dynamicProperties: [{name:"hp4_paint:disable_interaction", value:0},{name:"hp4_paint:id", value:"-12884901752"},{name:"hp4_paint:slot", value:0},{name:"hp4_paint:slot0", value:"-12884901726"},],properties: [{name:"hp4_paint:furniture_color", value:2},]},
{type: "hp4_paint:tube_paint",location: {x: 1,y: 0.5,z: -2},rotation: {x: 0,y: 79.30816650390625},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901687"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:plants_holder",location: {x: -2,y: -0.5,z: 1},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901726"},],properties: []},
{type: "hp4_paint:window",location: {x: 0,y: 0.5,z: -3},rotation: {x: 0,y: -4.02239990234375},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901707"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 0,y: 1.5,z: -3},rotation: {x: 0,y: -4.02239990234375},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901708"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:display_case",location: {x: -2,y: -0.5,z: 3},rotation: {x: 0,y: -152.10891723632812},dynamicProperties: [{name:"hp4_paint:babu", value:"-12884901786"},{name:"hp4_paint:id", value:"-12884901789"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_installed", value:true},{name:"hp4_paint:is_glowing", value:false},{name:"hp4_paint:painting_type", value:0},{name:"hp4_paint:paint_size", value:"null"},]},
{type: "hp4_paint:cabinet",location: {x: -4,y: -0.5,z: 1},rotation: {x: 0,y: -0.6267852783203125},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901754"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:display_case_wide",location: {x: 0,y: 4.5,z: 2},rotation: {x: 0,y: 71.49111938476562},dynamicProperties: [{name:"hp4_paint:babu", value:"-17179869110"},{name:"hp4_paint:id", value:"-17179869111"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_installed", value:true},{name:"hp4_paint:is_glowing", value:false},{name:"hp4_paint:painting_type", value:0},{name:"hp4_paint:paint_size", value:"null"},]},
{type: "hp4_paint:color_splash",location: {x: -1,y: -0.5,z: 5},rotation: {x: 0,y: -45.10821533203125},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869159"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:color_splash",location: {x: 1,y: -0.5,z: 5},rotation: {x: 0,y: 5.408416748046875},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869158"},],properties: [{name:"hp4_paint:furniture_color", value:6},{name:"hp4_paint:furniture_model", value:2},]},
{type: "hp4_paint:brush_holder_cup",location: {x: -2,y: 0.5,z: 5},rotation: {x: 0,y: -29.5167236328125},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901751"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -1,y: 5.5,z: 0},rotation: {x: 0,y: -5.435699462890625},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901697"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 4,y: 0.5,z: 4},rotation: {x: 0,y: 9.289703369140625},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901712"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 4,y: 1.5,z: 4},rotation: {x: 0,y: -20.295318603515625},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901711"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:art_bench",location: {x: 5,y: -0.5,z: 3},rotation: {x: 0,y: 174.6861572265625},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836454"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -3,y: 5.5,z: 0},rotation: {x: 0,y: -33.70440673828125},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901695"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -6,y: 0.5,z: 2},rotation: {x: 0,y: -81.63148498535156},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901705"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:art_chair",location: {x: 4,y: -0.5,z: 5},rotation: {x: 0,y: -90},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869179"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -6,y: 1.5,z: 2},rotation: {x: 0,y: -81.63148498535156},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901706"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -1,y: 6.5,z: 0},rotation: {x: 0,y: -5.43353271484375},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901698"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:round_planter",location: {x: 1,y: 4.5,z: 5},rotation: {x: 0,y: 59.651824951171875},dynamicProperties: [{name:"hp4_paint:disable_interaction", value:0},{name:"hp4_paint:id", value:"-17179869106"},{name:"hp4_paint:slot", value:0},{name:"hp4_paint:slot0", value:"-17179869100"},],properties: [{name:"hp4_paint:furniture_color", value:2},]},
{type: "hp4_paint:plants_holder",location: {x: 1,y: 4.5,z: 5},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869100"},],properties: []},
{type: "hp4_paint:color_splash",location: {x: 0,y: -0.5,z: 7},rotation: {x: 0,y: -80.17654418945312},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869160"},],properties: [{name:"hp4_paint:furniture_color", value:11},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:brushes_set",location: {x: 5,y: 0.5,z: 5},rotation: {x: 0,y: -40.797515869140625},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869177"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:artist_box",location: {x: 7,y: -0.5,z: 1},rotation: {x: 0,y: 9.42254638671875},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836455"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -3,y: 6.5,z: 0},rotation: {x: 0,y: -33.70436096191406},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901696"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 1,y: 6.5,z: 3},rotation: {x: 0,y: 91.38525390625},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869113"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:round_planter",location: {x: 3,y: 4.5,z: 5},rotation: {x: 0,y: -18.598724365234375},dynamicProperties: [{name:"hp4_paint:disable_interaction", value:0},{name:"hp4_paint:id", value:"-21474836476"},{name:"hp4_paint:slot", value:0},{name:"hp4_paint:slot0", value:"-21474836472"},],properties: [{name:"hp4_paint:furniture_color", value:2},]},
{type: "hp4_paint:plants_holder",location: {x: 3,y: 4.5,z: 5},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836472"},],properties: []},
{type: "hp4_paint:art_bench",location: {x: 4,y: 4.5,z: 5},rotation: {x: 0,y: -1.542266845703125},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836464"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:color_bucket",location: {x: 6,y: 0.5,z: 5},rotation: {x: 0,y: -32.35426330566406},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869176"},],properties: [{name:"hp4_paint:furniture_color", value:5},{name:"hp4_paint:furniture_model", value:2},]},
{type: "hp4_paint:easel_stand",location: {x: 8,y: -0.5,z: 1},rotation: {x: 0,y: -9.91796875},dynamicProperties: [{name:"hp4_paint:babu", value:"-12884901713"},{name:"hp4_paint:id", value:"-12884901714"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_installed", value:true},{name:"hp4_paint:is_glowing", value:false},{name:"hp4_paint:painting_type", value:0},{name:"hp4_paint:paint_size", value:"null"},]},
{type: "hp4_paint:brush_on_shelf",location: {x: -4,y: 0.5,z: 7},rotation: {x: 0,y: 171.7598876953125},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869181"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:art_chair",location: {x: 4,y: -0.5,z: 7},rotation: {x: 0,y: -80.18773651123047},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869148"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 1,y: 7.5,z: 3},rotation: {x: 0,y: 71.29287719726562},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869112"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:brush_on_shelf",location: {x: -5,y: 0.5,z: 7},rotation: {x: 0,y: -168.93887329101562},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869182"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:tube_paint",location: {x: 7,y: 0.5,z: 5},rotation: {x: 0,y: -29.43157958984375},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869161"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:chalk_and_charcoal",location: {x: 5,y: 5.5,z: 5},rotation: {x: 0,y: -56.589447021484375},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836463"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 8,y: 0.5,z: 4},rotation: {x: 0,y: -10.06341552734375},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901710"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 8,y: 1.5,z: 4},rotation: {x: 0,y: -10.06341552734375},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901709"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:round_planter",location: {x: 3,y: -0.5,z: 9},rotation: {x: 0,y: 154.21875},dynamicProperties: [{name:"hp4_paint:disable_interaction", value:0},{name:"hp4_paint:id", value:"-17179869162"},{name:"hp4_paint:slot", value:0},{name:"hp4_paint:slot0", value:"-21474836456"},],properties: [{name:"hp4_paint:furniture_color", value:2},]},
{type: "hp4_paint:plants_holder",location: {x: 3,y: -0.5,z: 9},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836456"},],properties: []},
{type: "hp4_paint:display_case_wide",location: {x: -3,y: -0.5,z: 9},rotation: {x: 0,y: -92.00580596923828},dynamicProperties: [{name:"hp4_paint:babu", value:"-12884901759"},{name:"hp4_paint:id", value:"-12884901760"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_installed", value:true},{name:"hp4_paint:is_glowing", value:false},{name:"hp4_paint:painting_type", value:0},{name:"hp4_paint:paint_size", value:"null"},]},
{type: "hp4_paint:unfinished_wooden_block",location: {x: 6,y: 5.5,z: 5},rotation: {x: 0,y: -15.915756225585938},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836459"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -9,y: 0.5,z: 4},rotation: {x: 0,y: -25.247772216796875},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901747"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -9,y: 1.5,z: 4},rotation: {x: 0,y: -25.246734619140625},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901748"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:round_planter",location: {x: 1,y: -0.5,z: 10},rotation: {x: 0,y: 109.479248046875},dynamicProperties: [{name:"hp4_paint:disable_interaction", value:0},{name:"hp4_paint:id", value:"-12884901782"},{name:"hp4_paint:slot", value:0},{name:"hp4_paint:slot0", value:"-12884901767"},],properties: [{name:"hp4_paint:furniture_color", value:2},]},
{type: "hp4_paint:plants_holder",location: {x: 1,y: -0.5,z: 10},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901767"},],properties: []},
{type: "hp4_paint:stool",location: {x: -1,y: -0.5,z: 10},rotation: {x: 0,y: -38.827423095703125},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869155"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:canvas",location: {x: -7,y: 5.5,z: 5},rotation: {x: 0,y: 12.4876708984375},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869072"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:spatula",location: {x: 7,y: 5.5,z: 5},rotation: {x: 0,y: -5.120452880859375},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836458"},],properties: [{name:"hp4_paint:furniture_model", value:1},]},
{type: "hp4_paint:variant_paint_bottle",location: {x: -5,y: 5.5,z: 7},rotation: {x: 0,y: -81.7347183227539},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869064"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:art_bench",location: {x: -8,y: 4.5,z: 5},rotation: {x: 0,y: -5.292388916015625},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869068"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:sack_of_beton",location: {x: 1,y: 5.5,z: 9},rotation: {x: 0,y: 96.06939697265625},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869133"},],properties: [{name:"hp4_paint:furniture_color", value:8},{name:"hp4_paint:furniture_model", value:1},]},
{type: "hp4_paint:artist_box",location: {x: -7,y: 0.5,z: 8},rotation: {x: 0,y: 97.91400146484375},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901728"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:variant_paint_bottle",location: {x: -5,y: 5.5,z: 8},rotation: {x: 0,y: -78.56633758544922},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869063"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:brush_holder_cup",location: {x: 3,y: 5.5,z: 9},rotation: {x: 0,y: -165.7382049560547},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836465"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:stool",location: {x: -1,y: 4.5,z: 10},rotation: {x: 0,y: 161.50576782226562},dynamicProperties: [{name:"hp4_paint:disable_interaction", value:0},{name:"hp4_paint:id", value:"-17179869115"},],properties: [{name:"hp4_paint:furniture_color", value:1},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:art_knives",location: {x: 4,y: 5.5,z: 9},rotation: {x: 0,y: -177.78977966308594},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836466"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:brush_holder_cup",location: {x: -7,y: 0.5,z: 9},rotation: {x: 0,y: 88.01727294921875},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901730"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:sculpture_stand",location: {x: 11,y: -0.5,z: 3},rotation: {x: 0,y: 119.55743408203125},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836453"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:sack_of_beton",location: {x: 1,y: 5.5,z: 10},rotation: {x: 0,y: 99.0797119140625},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869134"},],properties: [{name:"hp4_paint:furniture_color", value:5},{name:"hp4_paint:furniture_model", value:1},]},
{type: "hp4_paint:soft_pastel_box",location: {x: -9,y: 5.5,z: 5},rotation: {x: 0,y: -10.389129638671875},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869067"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:display_case_big",location: {x: -10,y: -0.5,z: 6},rotation: {x: 0,y: -80.38492584228516},dynamicProperties: [{name:"hp4_paint:babu", value:"-12884901738"},{name:"hp4_paint:id", value:"-12884901739"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_installed", value:true},{name:"hp4_paint:is_glowing", value:false},{name:"hp4_paint:painting_type", value:0},{name:"hp4_paint:paint_size", value:"null"},]},
{type: "hp4_paint:variant_paint_bottle",location: {x: -5,y: 5.5,z: 9},rotation: {x: 0,y: -82.16736602783203},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869062"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:drawing_tube",location: {x: 6,y: 4.5,z: 9},rotation: {x: 0,y: -177.8872833251953},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836460"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:easel_stand",location: {x: 7,y: 4.5,z: 9},rotation: {x: 0,y: -178.0116729736328},dynamicProperties: [{name:"hp4_paint:babu", value:"-21474836469"},{name:"hp4_paint:id", value:"-21474836470"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_installed", value:true},{name:"hp4_paint:is_glowing", value:false},{name:"hp4_paint:painting_type", value:0},{name:"hp4_paint:paint_size", value:"null"},]},
{type: "hp4_paint:art_chair",location: {x: -9,y: 4.5,z: 7},rotation: {x: 0,y: 90},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869053"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:variant_paint_bottle",location: {x: -5,y: 5.5,z: 10},rotation: {x: 0,y: -80.33712005615234},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869061"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:color_swatch",location: {x: -10,y: 5.5,z: 5},rotation: {x: 0,y: -4.7412567138671875},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869060"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 11,y: 0.5,z: 6},rotation: {x: 0,y: 79.23779296875},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869163"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 11,y: 1.5,z: 6},rotation: {x: 0,y: 79.23779296875},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869165"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:art_bench",location: {x: -10,y: -0.5,z: 8},rotation: {x: 0,y: -83.1970443725586},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901731"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 8,y: 0.5,z: 10},rotation: {x: 0,y: 4.118988037109375},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836450"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:sculpture_stand",location: {x: -8,y: 4.5,z: 9},rotation: {x: 0,y: -163.26089477539062},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869052"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 8,y: 1.5,z: 10},rotation: {x: 0,y: -0.1911163330078125},dynamicProperties: [{name:"hp4_paint:id", value:"-21474836449"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:easel_stand",location: {x: -2,y: 4.5,z: 12},rotation: {x: 0,y: -170.7081756591797},dynamicProperties: [{name:"hp4_paint:babu", value:"-17179869142"},{name:"hp4_paint:id", value:"-17179869143"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},{name:"hp4_paint:paint_colors", value:0},{name:"hp4_paint:paint_installed", value:true},{name:"hp4_paint:is_glowing", value:false},{name:"hp4_paint:painting_type", value:0},{name:"hp4_paint:paint_size", value:"null"},]},
{type: "hp4_paint:window",location: {x: 11,y: 0.5,z: 7},rotation: {x: 0,y: 105.9132080078125},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869164"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 11,y: 1.5,z: 7},rotation: {x: 0,y: 105.9132080078125},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869166"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:eraser_sharpener",location: {x: -2,y: 0.5,z: 13},rotation: {x: 0,y: -163.2088623046875},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901719"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 7,y: 5.5,z: 10},rotation: {x: 0,y: -179.18202209472656},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901692"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:color_bucket",location: {x: -10,y: 0.5,z: 9},rotation: {x: 0,y: -78.81600189208984},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901727"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -11,y: 0.5,z: 8},rotation: {x: 0,y: -87.34896850585938},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901749"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -11,y: 1.5,z: 8},rotation: {x: 0,y: -87.34893798828125},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901750"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:sack_of_beton",location: {x: 0,y: 4.5,z: 13},rotation: {x: 0,y: -176.70858764648438},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869107"},],properties: [{name:"hp4_paint:furniture_color", value:0},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:brush_holder_cup",location: {x: -10,y: 5.5,z: 8},rotation: {x: 0,y: -94.47914123535156},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869057"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -1,y: 0.5,z: 14},rotation: {x: 0,y: -174.7421875},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901771"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -1,y: 1.5,z: 14},rotation: {x: 0,y: -174.72695922851562},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901772"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:pencil_set",location: {x: -1,y: 5.5,z: 13},rotation: {x: 0,y: -152.36831665039062},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869141"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 11,y: 5.5,z: 7},rotation: {x: 0,y: 82.56692504882812},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901693"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -11,y: 5.5,z: 7},rotation: {x: 0,y: -105.75072479248047},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901688"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:plants_holder",location: {x: -10,y: 4.5,z: 9},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869074"},],properties: []},
{type: "hp4_paint:round_planter",location: {x: -10,y: 4.5,z: 9},rotation: {x: 0,y: -118.33480072021484},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869075"},{name:"hp4_paint:slot", value:0},{name:"hp4_paint:slot0", value:"-17179869074"},],properties: [{name:"hp4_paint:furniture_color", value:0},]},
{type: "hp4_paint:paint_tubes",location: {x: -3,y: 5.5,z: 13},rotation: {x: 0,y: 99.36712646484375},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869139"},],properties: [{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: 11,y: 6.5,z: 7},rotation: {x: 0,y: 82.57852172851562},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901694"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -11,y: 6.5,z: 7},rotation: {x: 0,y: -105.75072479248047},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901689"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -4,y: 0.5,z: 14},rotation: {x: 0,y: -140.85293579101562},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901769"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:round_planter",location: {x: -5,y: 4.5,z: 13},rotation: {x: 0,y: -111.5948486328125},dynamicProperties: [{name:"hp4_paint:disable_interaction", value:0},{name:"hp4_paint:id", value:"-17179869136"},{name:"hp4_paint:slot", value:0},{name:"hp4_paint:slot0", value:"-17179869101"},],properties: [{name:"hp4_paint:furniture_color", value:2},]},
{type: "hp4_paint:plants_holder",location: {x: -5,y: 4.5,z: 13},rotation: {x: 0,y: 0},dynamicProperties: [{name:"hp4_paint:id", value:"-17179869101"},],properties: []},
{type: "hp4_paint:window",location: {x: -4,y: 1.5,z: 14},rotation: {x: 0,y: -140.85264587402344},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901770"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -1,y: 5.5,z: 14},rotation: {x: 0,y: 174.53482055664062},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901699"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -3,y: 5.5,z: 14},rotation: {x: 0,y: -158.62245178222656},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901701"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -1,y: 6.5,z: 14},rotation: {x: 0,y: 174.53363037109375},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901700"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},
{type: "hp4_paint:window",location: {x: -3,y: 6.5,z: 14},rotation: {x: 0,y: -158.62245178222656},dynamicProperties: [{name:"hp4_paint:id", value:"-12884901702"},],properties: [{name:"hp4_paint:furniture_color", value:3},{name:"hp4_paint:furniture_model", value:0},]},


{type: "hp4_paint:artist_villager_painting_spot_loc",location: {x: 8,y: -0.5,z: 2},rotation: {x: 0,y: 9.258880615234375},dynamicProperties: [{name:"hp4_paint:id", value:"-60129542142"},],properties: []},
{type: "hp4_paint:artist_villager_hiding_spot_loc",location: {x: 8,y: 4.5,z: 5},rotation: {x: 0,y: 45.827850341796875},dynamicProperties: [{name:"hp4_paint:id", value:"-60129542139"},],properties: []},
{type: "hp4_paint:artist_villager_painting_spot_loc",location: {x: 7,y: 5.5,z: 8},rotation: {x: 0,y: 168.384765625},dynamicProperties: [{name:"hp4_paint:id", value:"-60129542140"},],properties: []},
{type: "hp4_paint:artist_villager_hiding_spot_loc",location: {x: -8,y: -0.5,z: 9},rotation: {x: 0,y: 160.50247192382812},dynamicProperties: [{name:"hp4_paint:id", value:"-60129542143"},],properties: []},
{type: "hp4_paint:artist_villager_painting_spot_loc",location: {x: -2,y: 4.5,z: 11},rotation: {x: 0,y: 169.6748046875},dynamicProperties: [{name:"hp4_paint:id", value:"-60129542141"},],properties: []},

{type: "hp4_paint:artist_villager",location: {x: -3.9824981689453125,y: 4.676753997802734,z: 7.99996280670166},rotation: {x: 4.5186920166015625,y: -89.99783325195312},dynamicProperties: [],properties: []},
{type: "hp4_paint:artist_villager_sleeping_spot",location: {x: 9,y: 5.5,z: 9},rotation: {x: 0,y: -180},dynamicProperties: [{name:"hp4_paint:id", value:"-60129542138"},],properties: []},
]
                    ]
                furnish[number-1].forEach(furni=>{
                    const furniture = entity.dimension.spawnEntity(furni.type,
                        {
                            x: entity.location.x,
                            y: entity.location.y,
                            z: entity.location.z
                        }
                    )
                    furniture.setDynamicProperty(`hp4_paint:langsung`, true)
                    furniture.addTag(`hp4_paint:${furniture.id}`)
                    entity.runCommand(`tp @e[type=${furni.type},tag=hp4_paint:${furniture.id}] ^${furni.location.x}^${furni.location.y}^${furni.location.z} ~~ false`)
                    const rots = {
                        x: furni.rotation.x + entity.getRotation().x,
                        y: furni.rotation.y + entity.getRotation().y
                    }
                    furniture.setRotation(
                        rots
                    )
                    mc.system.runTimeout(()=>{
                        if(furni.properties.length > 0) {
                            furni.properties.forEach(property=>{
                                furniture.setProperty(property.name, property.value)
                                //console.warn(`${property.name}: ${property.value}`)
                            })
                        }
                        if(furni.dynamicProperties.length > 0) {
                            furni.dynamicProperties.forEach(dp=>{
                                try {
                                furniture.setDynamicProperty(dp.name, dp.value)
                                if(dp.name==`hp4_paint:babu`){
                                    mc.system.runTimeout(()=>{
                                    mc.world.getDimension('overworld').getEntities().filter(e=>e.getDynamicProperty(`hp4_paint:id`) == dp.value).forEach(f=>{
                                        //console.warn(`${f.typeId} babunya ${furniture.typeId}`)
                                        f.teleport(furniture.location)
                                        f.setRotation(
                                            {
                                                x:furniture.getRotation().x,
                                                y:furniture.getRotation().y
                                            }
                                        )
                                    })
                                    },3*20)
                                }
                                } catch (error) {
                                    
                                }
                            })
                        }
                    },1)

                    if(furni.type.endsWith(`_painting`) && !furni.type.includes(`statue`)) {
                        console.warn('ngentot')
                        const rots = [
                            0, 90, 180, -90
                        ]
                        let newRotation = main.findClosestNumber(rots, furniture.getRotation().y)
                        main.hitBoxManager(furniture, main.paintingTypeChoose(furniture).models[furniture.getProperty(`hp4_paint:paint_models`)], newRotation)
                    }
                })
            })
            //CLOSURE
            mc.system.runTimeout(()=>{
                console.warn('asu')
                entity.runCommand(`setblock ~~~ air`)
                entity.runCommand(`setblock ~~-1~ oak_planks`)
            },1*20)
        })
    }
    if(entity.typeId == `hp4_paint:artist_villager_house_summoner`) {
        {
            entity.runCommand(`setblock ~~~ dirt`)
            entity.runCommand(`setblock ~~-1~ dirt`)
            entity.runCommand(`setblock ~-1~-1~ dirt`)
        }
        const nearbyEntities = entity.dimension.getEntities({location: entity.location, type: `hp4_paint:artist_villager_house_summoner`, maxDistance: 100}).filter(e=> e != entity)
        if(nearbyEntities.length == 0) {
            const houses = [
                `artist_villager_house1`,
                `artist_villager_house2`
            ]
            const direction = [
                `0_degrees`,
                `90_degrees`,
                `180_degrees`,
                `270_degrees`
            ]
            const randomHouse = houses[Math.floor(Math.random() * houses.length)]
            const randomDirection = direction[Math.floor(Math.random() * direction.length)]

            entity.runCommand(`structure load ${randomHouse} ~-13~3~-13 ${randomDirection}`)
        } else {
            entity.remove()
        }

    }
})
mc.system.afterEvents.scriptEventReceive.subscribe(data => {
    const id = data.id, source = data.sourceEntity
    if (id == "hp4_paint:artist_villager_death") {
        source.triggerEvent(`static`)
        mc.system.runTimeout(()=>{
            source.remove()
        },2*20)
    }
})
function getTimeOfDayForQuest() {
    const worldTime = mc.world.getTimeOfDay()
    const dayCycleLength = 24000;
    const timeOfDay = worldTime % dayCycleLength; // waktu dalam 1 hari Minecraft

    if (timeOfDay >= 23000 || timeOfDay < 12000) {
        return 'day';
    } else {
        return 'night';
    }
}
function parseValue(value) {
    if (typeof value !== "string") return value
    return `"${value}"`
}
mc.world.afterEvents.itemUse.subscribe(arg=>{
    const player = arg.source
    const item = arg.itemStack
    player.dimension.getEntities({type:`hp4_paint:artist_villager_house2_executor`, closest:1, location: player.location}).forEach(executor=>{
        if(item.typeId == `minecraft:iron_ingot`) {
            console.warn(
                `\nx: ${executor.location.x}\ny: ${executor.location.y}\nz: ${executor.location.z}`
            )
        }
        if(item.typeId == `minecraft:copper_ingot`) {
            let text = ``
            executor.dimension.getEntities({families:[
                `hp4_paint_furniture`
            ], maxDistance:30, location:executor.location}).sort((a, b) => {
  const aPainting = a.typeId.endsWith('_painting');
  const bPainting = b.typeId.endsWith('_painting');

  if (aPainting && !bPainting) return -1; // a duluan
  if (!aPainting && bPainting) return 1;  // b duluan
  return 0; // sama kategori
})
.filter(e=> e.typeId.includes(`artist_villager`))
.forEach(furni=>{
                furni.setDynamicProperty(`hp4_paint:id`, furni.id)
                if(furni.typeId=='hp4_paint:window' || furni.typeId=='hp4_paint:window_big') {
                    furni.setProperty(`hp4_paint:furniture_color`, 3)
                }
                //VARIABLES
                let dp = ``
                let prop = ``
                {
                    const dynamicProperties = furni.getDynamicPropertyIds()
                    dynamicProperties.forEach(dynamicP=>{
                        const value = parseValue(furni.getDynamicProperty(dynamicP))
                        dp = dp + `{name:"${dynamicP}", value:${value}},`
                    })
                    {
                        const properties = [
`hp4_paint:furniture_color`,
`hp4_paint:furniture_model`,
`hp4_paint:statue_pose`,
`hp4_paint:frame_type`,
`hp4_paint:size`,
`hp4_paint:displayer_active`,
`hp4_paint:displayer`,
`hp4_paint:paint_colors`,
`hp4_paint:paint_models`,
`hp4_paint:paint_materials`,
`hp4_paint:paint_installed`,
`hp4_paint:is_glowing`,
`hp4_paint:painting_type`,
`hp4_paint:paint_size`,
`hp4_paint:visible`
                        ]
                        properties.forEach(property=>{
                            try {
                                if(furni.getProperty(property) != undefined) {
                                    const value = parseValue(furni.getProperty(property))
                                    prop = prop + `{name:"${property}", value:${value}},`
                                }
                            } catch (error) {}
                        })
                    }
                }
                text = text + 
`\n{type: "${furni.typeId}",location: {x: ${furni.location.x - executor.location.x},y: ${furni.location.y - executor.location.y},z: ${furni.location.z - executor.location.z}},rotation: {x: ${furni.getRotation().x},y: ${furni.getRotation().y}},dynamicProperties: [${dp}],properties: [${prop}]},`
            })
            mc.system.runTimeout(()=>{
                console.warn(text)
            },1)
        }
    })
})
function toNearestCardinalRotation(rot) {
    // Normalisasi ke range -360 sampai 360
    let normalized = rot % 360;

    // Biar konsisten (optional, tapi bagus)
    if (normalized > 360) normalized -= 360;
    if (normalized < -360) normalized += 360;

    // Round ke kelipatan 90 terdekat
    let snapped = Math.round(normalized / 90) * 90;

    return snapped;
}
mc.world.afterEvents.playerInteractWithBlock.subscribe(arg=>{
    const player = arg.player
    const item = arg.itemStack
    const block = arg.block
    try {
        if(item.typeId == 'minecraft:bed') {
    const faceLoc = {
        x: Math.floor(arg.faceLocation.x)+0.5,
        y: Math.floor(arg.faceLocation.y+1),
        z: Math.floor(arg.faceLocation.z)+0.5
    }
    let pillowLoc = {
        x: 0,
        y: 0,
        z: 0
    }
    const rot = toNearestCardinalRotation(player.getRotation().y)
    switch (rot) {
        case 0:
            pillowLoc.z = 1
            break;
        case 90:
            pillowLoc.x = -1
            break;
        case 180:
            pillowLoc.z = -1
            break;
        case -180:
            pillowLoc.z = -1
            break;
        case -90:
            pillowLoc.x = 1
            break;
        default:
            break;
    }
            const artistVillager = player.dimension.getEntities({type: `hp4_paint:artist_villager`, location: player.location, maxDistance: radius})
            if(artistVillager.length > 0) {
                const sleepingSpot = player.dimension.spawnEntity(`hp4_paint:artist_villager_sleeping_spot`, {
                    x: faceLoc.x + pillowLoc.x,
                    y: faceLoc.y + pillowLoc.y,
                    z: faceLoc.z + pillowLoc.z
                })
                sleepingSpot.teleport(sleepingSpot.location,
                    {
                        facingLocation: faceLoc
                    }
                )
                mc.system.runTimeout(()=>{
                    console.warn(`ENTSPOT\nx: ${sleepingSpot.location.x}\ny: ${sleepingSpot.location.y}\nz: ${sleepingSpot.location.z}`)
                    console.warn(`LOOKING\nx: ${faceLoc.x}\ny: ${faceLoc.y}\nz: ${faceLoc.z}`)
                },1*20)
            }
        }
    } catch (error) {}

    // console.warn(`ROT: ${toNearestCardinalRotation(player.getRotation().y)}`)
    // console.warn(`BEDLOC\nx: ${faceLoc.x}\ny: ${faceLoc.y}\nz: ${faceLoc.z}`)
})









//STRUCTURE LOC
//2663.64 -30.00 -78.03