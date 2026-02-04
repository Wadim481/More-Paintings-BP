import * as mc from "@minecraft/server";
const radius = 20
const dura = 0.3
mc.system.runInterval(()=>{
    mc.world.getDimension(`overworld`).getEntities({type: `hp4_paint:artist_villager`}).forEach((entity)=>{
        const isPainting = entity.getDynamicProperty(`hp4_paint:isPainting`)
        const isHiding = entity.getDynamicProperty(`hp4_paint:isHiding`)
        entity.dimension.getEntities({type: `hp4_paint:artist_villager_hiding_spot`, closest: 1, location: entity.location, maxDistance: 1}).forEach((hidingSpot)=>{
            if(!isHiding){
                entity.triggerEvent(`static`)
                entity.teleport(hidingSpot.location)
                entity.setDynamicProperty(`hp4_paint:isHiding`, true)
                entity.setDynamicProperty(`hp4_paint:isPainting`, false)
                entity.setDynamicProperty(`hp4_paint:hidingTimer`, dura*20*60)
            }
            if(isHiding && entity.getDynamicProperty(`hp4_paint:hidingTimer`) <= 0){
                entity.triggerEvent(`go_painting`)
            }
        })
        entity.dimension.getEntities({type: `hp4_paint:artist_villager_painting_spot`, closest: 1, location: entity.location, maxDistance: 1}).forEach((hidingSpot)=>{
            if(!isPainting){
                entity.triggerEvent(`static`)
                entity.teleport(hidingSpot.location)
                entity.setDynamicProperty(`hp4_paint:isPainting`, true)
                entity.setDynamicProperty(`hp4_paint:isHiding`, false)
            }
        })
        entity.getDynamicProperty(`hp4_paint:hidingTimer`) > 0 ? entity.setDynamicProperty(`hp4_paint:hidingTimer`, entity.getDynamicProperty(`hp4_paint:hidingTimer`) - 1) : null
    })
})
mc.world.afterEvents.entityHitEntity.subscribe(arg=>{
    const entity = arg.hitEntity
    const player = arg.damagingEntity

    if(entity.typeId == `hp4_paint:artist_villager` && player.typeId == `minecraft:player`){
        const hidingSpot = entity.dimension.getEntities({type: `hp4_paint:artist_villager_hiding_spot`, closest: 1, location: entity.location, maxDistance: radius})
        if(hidingSpot.length > 0) {
            if(!entity.getDynamicProperty(`hp4_paint:isHiding`)) {
                entity.triggerEvent(`go_hiding`)
                console.warn('cok')
            }
        } else {
            entity.remove()
        }
    }
})
mc.world.afterEvents.entitySpawn.subscribe(arg=>{
    const entity = arg.entity
    if(entity.typeId == `hp4_paint:artist_villager`){
        const paintingSpot = entity.dimension.getEntities({type: `hp4_paint:artist_villager_painting_spot`, closest: 1, location: entity.location, maxDistance: radius})
        if(paintingSpot.length > 0) {
            entity.triggerEvent(`go_painting`)
        } else {
            entity.triggerEvent(`static`)
        }
    }
})