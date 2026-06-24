import * as mc from "@minecraft/server";
import * as main from './hp4_paint_index'

//NAVIGATION SYSTEM
const radius = 50
const monsterRadius = 5
const dura = 0.3
const paintingTimer = [20, 60]
const houseRadius = 500

mc.system.runInterval(()=>{
    mc.world.getDimension(`overworld`).getEntities({type: `hp4_paint:artist_villager`}).forEach((entity)=>{

        {
            const paintingSpot = entity.dimension.getEntities({type: `hp4_paint:easel_stand`, location: entity.location, maxDistance: radius})
            if(paintingSpot.length > 0) {
                if(entity.getDynamicProperty(`hp4_paint:initialSpawnRequireEaselStand`)) {
                    entity.setDynamicProperty(`hp4_paint:initialSpawnRequireEaselStand`, undefined)
                    entity.triggerEvent(`go_painting`)
                    paintingSpot.forEach((spot)=>{
                        spot.dimension.getEntities({type: `hp4_paint:artist_villager_painting_spot`, location: spot.location, maxDistance: 1}).forEach((spotEntity)=>{
                            spotEntity.remove()
                        })
                    })
                    const random = Math.floor(Math.random() * (paintingSpot.length - 0) + 0)
                    const chosenSpot = paintingSpot[random]
                    
                    const yaw = chosenSpot.getRotation().y * (Math.PI / 180);
                    const distance = 1.5;
                    const drawingLocation = {
                        x: chosenSpot.location.x + Math.sin(-yaw) * distance,
                        y: chosenSpot.location.y,
                        z: chosenSpot.location.z + Math.cos(yaw) * distance
                    };

                    const tot = chosenSpot.dimension.spawnEntity(`hp4_paint:artist_villager_painting_spot`, drawingLocation)
                    tot.setDynamicProperty(`hp4_paint:easel_stand`, chosenSpot.id)
                    entity.setDynamicProperty(`hp4_paint:easel_stand`, chosenSpot.id)
                    tot.teleport(
                        tot.location,
                        {facingLocation: chosenSpot.location}
                    )
                }
            } else if(paintingSpot.length == 0 && !entity.getDynamicProperty(`hp4_paint:initialSpawnRequireEaselStand`)) {
                entity.setDynamicProperty(`hp4_paint:initialSpawnRequireEaselStand`, true)
            }
        }

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
                        const rotating = mc.system.runInterval(()=>{
                            if(!entity.isValid) return
                            entity.teleport(paintingSpot.location,
                                {
                                    facingLocation: entity.dimension.getEntities({type: `hp4_paint:easel_stand`, closest:1, location:entity.location})[0].location
                                }
                            )
                        })
                        mc.system.runTimeout(()=>{
                            entity.triggerEvent(`static`)
                            mc.system.clearRun(rotating)
                        },1*20)
                        entity.addEffect(`slowness`, 1*20, {amplifier: 255, showParticles: false})
                        const timer = Math.round(Math.random()*(paintingTimer[1]-paintingTimer[0])+paintingTimer[0])
                        entity.setDynamicProperty(`hp4_paint:paintingTimer`, timer*20)
                        entity.setDynamicProperty(`hp4_paint:is_painting`, true)
                        //entity.playAnimation(`animation.hp4_paint.artist_villager.painting`)
                        entity.setDynamicProperty(`hp4_paint:lookingForSpot`, false)
                        entity.runCommand(`playsound hp4_paint:art_v.sing @a ~~~`)

                    } else if(entity.getDynamicProperty(`hp4_paint:is_painting`) && entity.getDynamicProperty(`hp4_paint:paintingTimer`) <= 0 && !entity.getDynamicProperty(`hp4_paint:lookingForSpot`)){
                        //console.warn('looking for spot2')
                        entity.dimension.getEntities({type: `hp4_paint:artist_villager_painting_spot`, location: entity.location, maxDistance: 1}).forEach((spotEntity)=>{
                            spotEntity.remove()
                        })
                    }
                    entity.getDynamicProperty(`hp4_paint:isHidingStart`) ? entity.setDynamicProperty(`hp4_paint:isHidingStart`, false) : null
                })

                //MONSTER DETECT
                if(entity.dimension.getEntities({families:[`monster`], location: entity.location, maxDistance: monsterRadius}).length > 0){
                    if(!entity.getDynamicProperty(`hp4_paint:isCamouflage`)) {
                        entity.playAnimation(`spin`)
                        entity.addEffect(`slowness`, 6*20, {amplifier:255, showParticles: false})
                        entity.addEffect(`resistance`, 6*20, {amplifier:255, showParticles: false})
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
                            if(entity.dimension.getEntities({families:[`monster`], location: entity.location, maxDistance: monsterRadius}).length > 0 || !entity.getDynamicProperty(`hp4_paint:isCamouflage`)) return
                            entity.playAnimation(`spin`)
                            entity.addEffect(`slowness`, 6*20, {amplifier:255, showParticles: false})
                            entity.addEffect(`resistance`, 6*20, {amplifier:255, showParticles: false})
                            mc.system.runTimeout(()=>{
                                //console.warn('camouflage off')
                                entity.setProperty(`hp4_paint:camouflage`, false)
                                !entity.getDynamicProperty(`hp4_paint:isHiding`) ? entity.triggerEvent(`go_painting`) : null
                            },3*20)
                            entity.setDynamicProperty(`hp4_paint:isCamouflage`, false)
                        },5*20)
                        if(entity.dimension.getEntities({families:[`monster`], location: entity.location, maxDistance: monsterRadius}).length > 0) {
                            mc.system.clearRun(timer)
                        }
                    }
                }
            }
            
                if(paintingSpot.length == 0 && (entity.getProperty(`hp4_paint:is_painting`)||entity.getDynamicProperty(`hp4_paint:is_painting`))){
                    entity.setProperty(`hp4_paint:is_painting`, false)
                    entity.setDynamicProperty(`hp4_paint:is_painting`, false)
                    entity.runCommand(`stopsound @a[r=10] hp4_paint:art_v.sing`)

                    if(!entity.getDynamicProperty(`hp4_paint:night`) && !entity.getDynamicProperty(`hp4_paint:isHiding`)) {
                        entity.triggerEvent(`go_painting`)
                    }
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
                entity.addEffect(`invisibility`, 1*20, {showParticles: false})
                entity.addEffect(`regeneration`, 1*20, {showParticles: false})
            })
            {
                if(entity.getDynamicProperty(`hp4_paint:hidingTimer`) <= 0){
                    if(entity.getProperty(`hp4_paint:camouflage`)==false) {
                        if(entity.getProperty(`hp4_paint:is_hiding`)) {
                            if(getTimeOfDayForQuest() == `day`) {
                                if(!entity.getDynamicProperty(`hp4_paint:is_painting`)) {
                                    entity.triggerEvent(`go_painting`)
                                }
                            } else {
                                entity.triggerEvent(`find_bed`)
                            }
                            entity.setProperty(`hp4_paint:is_hiding`, false)
                        }
                        
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
                entity.setDynamicProperty(`hp4_paint:night`, true)
                mc.system.runTimeout(()=>{
                    entity.triggerEvent(`find_bed`)
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

        
        const indicator = entity.dimension.getEntities({type: `hp4_paint:artist_villager_spot_indicator`}).filter(e=>entity.getDynamicProperty(`hp4_paint:indicator`) == e.id)
        if(indicator.length == 0) {
            const tot = entity.dimension.spawnEntity(`hp4_paint:artist_villager_spot_indicator`, entity.location)
            entity.setDynamicProperty(`hp4_paint:indicator`, tot.id)
            tot.setProperty(`hp4_paint:indicator_for`, `sleeping_spot`)
            tot.teleport(
                entity.location,
                {rotation: { x: 0, y: 0 }}
            )
            // console.warn(`summoned indicator for sleeping spot`)
        }
    })
    mc.world.getDimension(`overworld`).getEntities({type: `hp4_paint:artist_villager_hiding_spot_loc`}).forEach((entity)=>{
        const indicator = entity.dimension.getEntities({type: `hp4_paint:artist_villager_spot_indicator`}).filter(e=>entity.getDynamicProperty(`hp4_paint:indicator`) == e.id)
        if(indicator.length == 0) {
            const tot = entity.dimension.spawnEntity(`hp4_paint:artist_villager_spot_indicator`, entity.location)
            entity.setDynamicProperty(`hp4_paint:indicator`, tot.id)
            tot.setProperty(`hp4_paint:indicator_for`, `hiding_spot`)
            tot.teleport(
                entity.location,
                {rotation: { x: 0, y: 0 }}
            )
            // console.warn(`summoned indicator for hiding spot`)
        }
    })
    mc.world.getDimension(`overworld`).getEntities({type: `hp4_paint:artist_villager_painting_spot`}).forEach((entity)=>{
        const es = entity.getDynamicProperty(`hp4_paint:easel_stand`)
        if(entity.dimension.getEntities().filter(e=>e.id == es).length == 0) {
            entity.remove()
        }
    })
    
    mc.world.getDimension(`overworld`).getEntities().filter(e=>e.typeId == `hp4_paint:artist_villager_spot_indicator`).forEach(e=>{
        // e.setRotation({x: 0, y: 0})
        const cPlayers = e.dimension.getPlayers({maxDistance: 5, location: e.location}).filter(p=>p.getGameMode() == `creative`)
        if(cPlayers.length > 0) {
            e.setProperty(`hp4_paint:visible`, true)
        } else {
            e.setProperty(`hp4_paint:visible`, false)
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
                    player.runCommand(`camera @s fade time 0 1 1 color ${Math.round(Math.random() * (255-0) + 0)} ${Math.round(Math.random() * (255-0) + 0)} ${Math.round(Math.random() * (255-0) + 0)}`)
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
                player.runCommand(`camera @s fade time 0 1 1 color ${Math.round(Math.random() * (255-0) + 0)} ${Math.round(Math.random() * (255-0) + 0)} ${Math.round(Math.random() * (255-0) + 0)}`)
                entity.remove()
            },0.7*20)
        }
    }
    if(entity.typeId == `hp4_paint:artist_villager_sleeping_spot` && player.typeId == `minecraft:player` && player.getGameMode() == `creative`) {
        entity.remove()
    }
    if(entity.typeId == `hp4_paint:artist_villager_hiding_spot_loc` && player.typeId == `minecraft:player` && player.getGameMode() == `creative`) {
        entity.remove()
    }
})
mc.world.afterEvents.entitySpawn.subscribe(arg=>{
    const entity = arg.entity
    if(entity.typeId == `hp4_paint:artist_villager`){
        const paintingSpot = entity.dimension.getEntities({type: `hp4_paint:easel_stand`, location: entity.location, maxDistance: radius}).filter(paintingSpot => paintingSpot.id != entity.getDynamicProperty(`hp4_paint:easel_stand`))
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
                
                const yaw = chosenSpot.getRotation().y * (Math.PI / 180);
                const distance = 1.5;
                const drawingLocation = {
                    x: chosenSpot.location.x + Math.sin(-yaw) * distance,
                    y: chosenSpot.location.y,
                    z: chosenSpot.location.z + Math.cos(yaw) * distance
                };

                const tot = chosenSpot.dimension.spawnEntity(`hp4_paint:artist_villager_painting_spot`, drawingLocation)
                tot.setDynamicProperty(`hp4_paint:easel_stand`, chosenSpot.id)
                entity.setDynamicProperty(`hp4_paint:easel_stand`, chosenSpot.id)
                tot.teleport(
                    tot.location,
                    {facingLocation: chosenSpot.location}
                )
            } else if(paintingSpot.length == 0) {
                entity.triggerEvent(`static`)
                entity.setDynamicProperty(`hp4_paint:initialSpawnRequireEaselStand`, true)
            }
        }
        mc.system.runTimeout(() => {
            spawnSleepingSpotFromNearbyBeds(entity, 30)
        }, 20)
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
        entity.setRotation({
            x: 0,
            y: 0
        })
    }
    if(entity.typeId == `hp4_paint:artist_villager_hiding_spot_loc`) {
        entity.setRotation({
            x: 0,
            y: 0
        })
    }
    if(entity.typeId == `hp4_paint:easel_stand`) {
        const rot = toNearestCardinalRotation(entity.getRotation().y)
        entity.setRotation({x: 0, y: rot})
        mc.system.runTimeout(()=>{
            console.warn(entity.getRotation().y)
        },1*20)
    }
    if(entity.typeId == `hp4_paint:artist_villager_house_summoner`) {
        {
            entity.runCommand(`setblock ~~~ dirt`)
            entity.runCommand(`setblock ~~-1~ dirt`)
            entity.runCommand(`setblock ~-1~-1~ dirt`)
        }
        const nearbyEntities = entity.dimension.getEntities({location: entity.location, type: `hp4_paint:artist_villager_house_summoner`, maxDistance: houseRadius}).filter(e=> e != entity)
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

            entity.runCommand(`structure load "mystructure:hp_games/more_paintings/${randomHouse}" ~-13~-3~-13 ${randomDirection}`)
            mc.system.runTimeout(()=>{
                const avLoc = entity.dimension.getEntities({type:`hp4_paint:artist_villager_sleeping_spot`, location:entity.location, closest:1, maxDistance: 100})[0].location
                entity.dimension.spawnEntity(`hp4_paint:artist_villager`, avLoc)

            },2*20)
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
    if(id == 'hp4_paint:check_painting_spot' && source.typeId == `hp4_paint:artist_villager`) {
        try {
            const paintingSpot = source.dimension.getEntities({type:`hp4_paint:artist_villager_painting_spot`, location:source.location, maxDistance:radius})
            if(paintingSpot.length == 0) {
                const entity = source
                let paintingSpotLoc = entity.dimension.getEntities({type: `hp4_paint:easel_stand`, location: entity.location, maxDistance: radius})

                const paintingSpot = paintingSpotLoc.length > 1 ? paintingSpotLoc.filter(ps => ps.id != entity.getDynamicProperty(`hp4_paint:easel_stand`)) : paintingSpotLoc
                //console.warn(paintingSpot.length)
                const random = Math.floor(Math.random() * (paintingSpot.length - 0) + 0)
                const chosenSpot = paintingSpot[random]
                const rotation = chosenSpot.getRotation();

                const yaw = chosenSpot.getRotation().y * (Math.PI / 180);
                const distance = 1.5;
                const drawingLocation = {
                    x: chosenSpot.location.x + Math.sin(-yaw) * distance,
                    y: chosenSpot.location.y,
                    z: chosenSpot.location.z + Math.cos(yaw) * distance
                };

                const tot = chosenSpot.dimension.spawnEntity(`hp4_paint:artist_villager_painting_spot`, drawingLocation)
                tot.setDynamicProperty(`hp4_paint:easel_stand`, chosenSpot.id)
                entity.setDynamicProperty(`hp4_paint:easel_stand`, chosenSpot.id)
                const rots = [
                    0, 90, 180, -90
                ]
                tot.teleport(
                    tot.location,
                    {facingLocation: chosenSpot.location}
                )
                entity.setDynamicProperty(`hp4_paint:is_painting`, false)
                entity.setDynamicProperty(`hp4_paint:lookingForSpot`, true)
            }
        } catch (error) {
            
        }
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
function spawnSleepingSpotFromNearbyBeds(entity, radius = 30) {
    const dim = entity.dimension
    const origin = entity.location

    for (let x = -radius; x <= radius; x++) {
        for (let y = -5; y <= 5; y++) {
            for (let z = -radius; z <= radius; z++) {

                const block = dim.getBlock({
                    x: Math.floor(origin.x + x),
                    y: Math.floor(origin.y + y),
                    z: Math.floor(origin.z + z)
                })

                if (!block) continue

                if (block.typeId.includes("bed")) {

                    const perm = block.permutation
                    const isHead = perm.getState("head_piece_bit") === true
                    if (!isHead) continue

                    const direction = perm.getState("direction")

                    let offset = { x: 0, y: 0, z: 0 }

                    switch (direction) {
                        case 0: offset.z = -1; break;
                        case 1: offset.x = 1; break;
                        case 2: offset.z = 1; break;
                        case 3: offset.x = -1; break;
                    }

                    const pillowLoc = {
                        x: block.location.x + 0.5,
                        y: block.location.y + 1,
                        z: block.location.z + 0.5
                    }

                    const faceLoc = {
                        x: pillowLoc.x + offset.x,
                        y: pillowLoc.y,
                        z: pillowLoc.z + offset.z
                    }

                    // 🔥 CHECK DUPLICATE DI SINI
                    const existing = dim.getEntities({
                        type: "hp4_paint:artist_villager_sleeping_spot",
                        location: pillowLoc,
                        maxDistance: 0.6 // kecil biar presisi
                    })

                    if (existing.length > 0) continue // skip kalau sudah ada

                    // ✅ spawn kalau belum ada
                    const sleepingSpot = dim.spawnEntity(
                        "hp4_paint:artist_villager_sleeping_spot",
                        pillowLoc
                    )

                    sleepingSpot.teleport(pillowLoc, {
                        facingLocation: faceLoc
                    })
                }
            }
        }
    }
}
mc.world.afterEvents.dataDrivenEntityTrigger.subscribe(arg=>{
    const entity = arg.entity
    const event = arg.eventId

    if(entity.typeId == 'hp4_paint:artist_villager') {
        //console.warn(event)
    }
})



//STRUCTURE LOC
//2663.64 -30.00 -78.03