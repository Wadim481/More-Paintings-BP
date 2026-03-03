import * as mc from "@minecraft/server";

//NAVIGATION SYSTEM
const radius = 8
const dura = 0.3
const paintingTimer = [10, 30]
mc.system.runInterval(()=>{
    mc.world.getDimension(`overworld`).getEntities({type: `hp4_paint:artist_villager`}).forEach((entity)=>{
        const isPainting = entity.getDynamicProperty(`hp4_paint:is_painting`)
        const isHiding = entity.getDynamicProperty(`hp4_paint:isHiding`)
        const hidingSpot = entity.dimension.getEntities({type: `hp4_paint:artist_villager_hiding_spot`, location: entity.location, maxDistance: 1})
        const paintingSpot = entity.dimension.getEntities({type: `hp4_paint:artist_villager_painting_spot`, location: entity.location, maxDistance: 1})
        const sleepingSpot = entity.dimension.getEntities({type: `hp4_paint:artist_villager_sleeping_spot`, location: entity.location, maxDistance: 1})

        //TIMER COUNTDOWN
        entity.getDynamicProperty(`hp4_paint:hidingTimer`) > 0 ? entity.setDynamicProperty(`hp4_paint:hidingTimer`, entity.getDynamicProperty(`hp4_paint:hidingTimer`) - 1) : null
        entity.getDynamicProperty(`hp4_paint:paintingTimer`) > 0 ? entity.setDynamicProperty(`hp4_paint:paintingTimer`, entity.getDynamicProperty(`hp4_paint:paintingTimer`) - 1) : null

        {
            if(!entity.getDynamicProperty(`hp4_paint:night`)) {
                paintingSpot.forEach((paintingSpot)=>{
                    if(isHiding || entity.getDynamicProperty(`hp4_paint:isCamouflage`))return
                    if(!isPainting){
                        //console.warn('looking for initiate')
                        entity.triggerEvent(`static`)
                        entity.teleport(paintingSpot.location)
                        const timer = Math.round(Math.random()*(paintingTimer[1]-paintingTimer[0])+paintingTimer[0])
                        entity.setDynamicProperty(`hp4_paint:paintingTimer`, timer*20)
                        entity.setDynamicProperty(`hp4_paint:is_painting`, true)
                        //entity.playAnimation(`animation.hp4_paint.artist_villager.painting`)
                        entity.setDynamicProperty(`hp4_paint:lookingForSpot`, false)
                    } else if(isPainting && entity.getDynamicProperty(`hp4_paint:paintingTimer`) <= 0 && !entity.getDynamicProperty(`hp4_paint:lookingForSpot`)){
                        //console.warn('looking for spot2')
                        entity.dimension.getEntities({type: `hp4_paint:artist_villager_painting_spot`, location: entity.location, maxDistance: 1}).forEach((spotEntity)=>{
                            spotEntity.remove()
                        })
                        const paintingSpotLoc = entity.dimension.getEntities({type: `hp4_paint:artist_villager_painting_spot_loc`, location: entity.location, maxDistance: radius})
                        const random = Math.floor(Math.random() * (paintingSpotLoc.length - 0) + 0)
                        const chosenSpot = paintingSpotLoc[random]
                        chosenSpot.dimension.spawnEntity(`hp4_paint:artist_villager_painting_spot`, chosenSpot.location)
                        entity.triggerEvent(`go_painting`)
                        entity.setDynamicProperty(`hp4_paint:is_painting`, false)
                        entity.setDynamicProperty(`hp4_paint:lookingForSpot`, true)
                    }
                    entity.getDynamicProperty(`hp4_paint:isHidingStart`) ? entity.setDynamicProperty(`hp4_paint:isHidingStart`, false) : null
                })
                if(paintingSpot.length == 0 && entity.getProperty(`hp4_paint:is_painting`)){
                    entity.setProperty(`hp4_paint:is_painting`, false)
                } else if (paintingSpot.length > 0 && !entity.getProperty(`hp4_paint:is_painting`)){
                    entity.setProperty(`hp4_paint:is_painting`, true)
                }

                //MONSTER DETECT
                if(entity.dimension.getEntities({families:[`monster`], location: entity.location, maxDistance: radius}).length > 0){
                    if(!entity.getDynamicProperty(`hp4_paint:isCamouflage`)) {
                        entity.playAnimation(`camouflage`)
                        mc.system.runTimeout(()=>{
                            //console.warn('camouflage on')
                            entity.setProperty(`hp4_paint:camouflage`, true)
                            !entity.getDynamicProperty(`hp4_paint:isHiding`) ?
                            entity.triggerEvent(`go_hang_around`) : null
                        },7*20)
                        entity.setDynamicProperty(`hp4_paint:isCamouflage`, true)
                    }
                } else if(entity.dimension.getEntities({families:[`monster`], location: entity.location, maxDistance: radius}).length == 0){
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
            //SPOT DETECT
            hidingSpot.forEach((hidingSpot)=>{
                if(!entity.getDynamicProperty(`hp4_paint:isHidingStart`)){
                    entity.triggerEvent(`static`)
                    entity.teleport(hidingSpot.location)
                    entity.setDynamicProperty(`hp4_paint:isHidingStart`, true)
                    entity.setDynamicProperty(`hp4_paint:is_painting`, false)
                }
                if(entity.getDynamicProperty(`hp4_paint:hidingTimer`) <= 0){
                    if(entity.getProperty(`hp4_paint:camouflage`)==false) {
                        getTimeOfDayForQuest() == `day` ? entity.triggerEvent(`go_painting`) : entity.triggerEvent(`find_bed`)
                        entity.setProperty(`hp4_paint:is_hiding`, false)
                    } else if (entity.getProperty(`hp4_paint:camouflage`)==true) {
                        entity.triggerEvent(`go_hang_around`)
                        entity.setProperty(`hp4_paint:is_hiding`, false)
                    }
                    entity.setDynamicProperty(`hp4_paint:isHiding`, false)
                }
                //entity.addEffect(`invisibility`, 1*20, {showParticles: false})
                entity.addEffect(`regeneration`, 1*20, {showParticles: false})
            })
        }
        if(getTimeOfDayForQuest() == `day`) {
            //INITIATOR
            if(entity.getDynamicProperty(`hp4_paint:night`)) {
                entity.setDynamicProperty(`hp4_paint:night`, false)
                entity.triggerEvent(`go_painting`)
                entity.setProperty(`hp4_paint:sleeping`, false)
            }
        } else if (getTimeOfDayForQuest() == `night`){
            //INITIATOR
            if(!entity.getDynamicProperty(`hp4_paint:night`)) {
                entity.triggerEvent(`find_bed`)
                entity.setDynamicProperty(`hp4_paint:night`, true)
            }
            if(sleepingSpot.length > 0) {
                if(!entity.getProperty(`hp4_paint:sleeping`) && !entity.getDynamicProperty(`hp4_paint:isHiding`)) {
                    entity.setProperty(`hp4_paint:sleeping`, true)
                    entity.triggerEvent(`static`)
                }
                const rot = (sleepingSpot.map(e=>e.getRotation().y))
                entity.setRotation({
                    x: 0,
                    y: Math.floor(rot)
                })
            } else {
                entity.getProperty(`hp4_paint:sleeping`) ? entity.setProperty(`hp4_paint:sleeping`, false) : null
            }
        }
    })
})
mc.world.afterEvents.entityHitEntity.subscribe(arg=>{
    const entity = arg.hitEntity
    const player = arg.damagingEntity

    if(entity.typeId == `hp4_paint:artist_villager` && player.typeId == `minecraft:player`){
        const hidingSpot = entity.dimension.getEntities({type: `hp4_paint:artist_villager_hiding_spot_loc`, location: entity.location, maxDistance: entity.getProperty(`hp4_paint:camouflage`)==false ? radius : radius *3})
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
        if(getTimeOfDayForQuest() == `day`) {
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
        } else {
            entity.triggerEvent(`find_bed`)
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