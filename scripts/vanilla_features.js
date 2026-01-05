import * as mc from "@minecraft/server";

mc.world.afterEvents.itemUse.subscribe(arg=>{
    const player = arg.source
    const item = arg.itemStack
    if(item.typeId.endsWith('.frame') && item.typeId.startsWith('hp4_paint:')) {
        player.getEntitiesFromViewDirection().forEach(ray=>{
            const entity = ray.entity
            const distance = ray.distance
            if(entity.typeId=='minecraft:painting') {
                if(distance <= 4) {
                }
            }
        })
    }
})