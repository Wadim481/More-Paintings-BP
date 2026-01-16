import { system, world, EquipmentSlot, ItemStack } from "@minecraft/server";
import { ActionFormData, FormCancelationReason } from "@minecraft/server-ui";
import { colorPaintingData } from './color_painting_data'
import './paintings_display'
import './vanilla_features'
import './settings'
//UI
function chooseSize(player, modelAvailable, models, entity) {
    let buttonList = []
    modelAvailable.sort((a,b)=>{
        return (models[a].width + models[a].height) - (models[b].width + models[b].height)
    }).forEach(model=>{
        const button = {
            text: `(${models[model].height}x${models[model].width})`,
            image: ``,
            command: () =>{
                //kontol.warn(`tombol ${models[model].height}X${models[model].width} ditekan`)
                paintSpawned(entity, false, true, model)
            }
        }
        buttonList.push(button)
    })
    instanceMenu(
        player,
        {translate: 'Size Option'},
        {translate: 'Choose the size you want of the painting\n\navailable size:'},
        buttonList,
        () => {
            paintSpawned(entity, false, true, modelAvailable[Math.max(modelAvailable.length-1)])
        }
    )
}
export function instanceMenu(player, title, body, buttons, cancelation) {
    const UI = new ActionFormData()
    .title(title)
    .body(body)
    buttons.forEach(button => {
        button.image
        ? UI.button(button.text, button.image)
        : UI.button(button.text)
    })
    UI.show(player).then(result => {
        if (result.canceled) {
            if(cancelation) {
                cancelation()
            }
        }
        buttons.forEach((button, index) => {
            if (result.selection === index) {
                button.command(player)
            }
        })
    })
    if(FormCancelationReason == 'UserClosed') {
        //kontol.warn('ditutup')
    }
    return UI
}

system.runInterval(()=>{
    world.getAllPlayers().forEach(p=>{
        if(!p.getDynamicProperty('hp4_paint:particles')) return
        const heldItem = p.getComponent("minecraft:inventory").container.getItem(p.selectedSlotIndex)
        p.dimension.getEntities({maxDistance: 10, location: p.location}).forEach(e=>{
            if(e == p) return
            try {
                if((heldItem.typeId == 'hp4_paint:special_tool' && !checkOutlineFilter(e, 'hp4_paint:special_tool')) || heldItem.typeId == 'hp4_paint:brush') {
                    try {
                        if (!e.getProperty(`hp4_paint:outline`)) {
                            e.setProperty(`hp4_paint:outline`, true)
                        }
                    } catch (error) {
                        
                    }
                } else {
                    try {
                        if (e.getProperty(`hp4_paint:outline`)) {
                            e.setProperty(`hp4_paint:outline`, false)
                        }
                    } catch (error) {
                        
                    }
                }
            } catch (error) {
                try {
                    if (e.getProperty(`hp4_paint:outline`)) {
                        e.setProperty(`hp4_paint:outline`, false)
                    }
                } catch (error) {
                    
                }
            }
        })
        p.dimension.getEntities({maxDistance: 20, minDistance: 11, location: p.location}).forEach(e=>{
            {
                try {
                    if (e.getProperty(`hp4_paint:outline`)) {
                        e.setProperty(`hp4_paint:outline`, false)
                    }
                } catch (error) {
                    
                }
            }
        })
    })
})
function checkOutlineFilter(e, item) {
    for (const f of outLineFilters[item]) {
        if (e.typeId === `hp4_paint:${f}`) {
            return true
        }
    }
    return false
}
const outLineFilters = {
    'hp4_paint:special_tool': [
        `display`, `planter`, `cabinet`, `lying_bottle_color`, `jewellery_components`, `powder_jar`, `sewing_kit`, `unfinished_wooden_block`, `soft_pastel_box`, `sculpture_stand`, `pencil_set`, `paint_brush`, `marker_set`, `eraser_sharpener`, `drawing_tube`, `color_swatch`, `brush_holder_cup`, `brush_cleaner_cup`, `artist_box`, `art_knives`, `chalk_and_charcoal`, `sketchbook`
    ]
}
//MECHANIC
world.afterEvents.entitySpawn.subscribe(arg=>{
    const entity = arg.entity
    if((entity.typeId.includes('hp4_paint')&&entity.typeId.endsWith('painting'))&&!entity.typeId.includes(`statue`)){
        if(world.getDynamicProperty(`hp4_paint:painting_filter.${arg.entity.typeId.replace(`hp4_paint:`,``)}`)) {
            system.runTimeout(()=>{
                entity.setDynamicProperty(`hp4_paint:rotation_attempt`, 0)
                if(entity.getProperty(`hp4_paint:displayer`)==`none`){paintSpawned(entity)}
            },1)
        } else {
            arg.entity.runCommand(`tell @p This entity is deactivated, check Paintings Filter Settings to activate.`)
            system.runTimeout(()=>{
                arg.entity.remove()
            },1)
        }
    }
})
function paintSpawned(entity, inisiasi = true, langsung = false, modelJadi) {
    if(!entity.isValid)return
    const rots = [
        0, 90, 180, -90
    ]
    let newRotation = findClosestNumber(rots, entity.getRotation().y)
    if (entity.getRotation().y <= -135) {
        newRotation = 180
    }
    //Model Manager
    {
        if(!entity.isValid)return
        let model
        const up = {
            front: blockCheck(entity, newRotation).up,
            back: blockCheck(entity, newRotation).upBack
        }, down = {
            front: blockCheck(entity, newRotation).down,
            back: blockCheck(entity, newRotation).downBack
        }, right = {
            front: blockCheck(entity, newRotation).right,
            back: blockCheck(entity, newRotation).rightBack
        }, left = {
            front: blockCheck(entity, newRotation).left,
            back: blockCheck(entity, newRotation).leftBack
        }
        const horizontal = blockCheck(entity, newRotation).horizontalAvailable
        const vertical = blockCheck(entity, newRotation).verticalAvailable
        const upOffset = blockCheck(entity, newRotation).upOffset
        const rightOffset = blockCheck(entity, newRotation).rightOffset
        //kontol.warn(`newRotation: ${newRotation}`)
        //kontol.warn(`up: ${up.front}, ${up.back}, down: ${down.front}, ${down.back}, right: ${right.front}, ${right.back}, left: ${left.front}, ${left.back}`)
        //kontol.warn(`horizontal: ${horizontal}, vertical: ${vertical}`)
        const models = paintingTypeChoose(entity).models;
        const type = paintingTypeChoose(entity).jenis
        const modelPossibility = detectPossibleModels(models, horizontal, vertical);

        let modelAvailable = []
        modelPossibility.forEach(model => {
            modelAvailable.push(model)
        })

        const availableModelLength = modelPossibility.length
        const choosenModel = langsung ? modelJadi : modelPossibility[randomize(0, availableModelLength - 1, true)]
        if(availableModelLength == 0) {
            entity.setRotation({x:entity.getRotation().x,y:entity.getRotation().y+90})
            entity.setDynamicProperty(`hp4_paint:rotation_attempt`, entity.getDynamicProperty(`hp4_paint:rotation_attempt`) + 1)
            if(entity.getDynamicProperty(`hp4_paint:rotation_attempt`) > 3){entity.triggerEvent('death'); return;}
            paintSpawned(entity)
            return
        }
        entity.dimension.getPlayers({closest:1,location:entity.location}).forEach(player=>{
            inisiasi && player.getDynamicProperty(`hp4_paint:paintingSizeUI`) ? chooseSize(player, modelAvailable, models, entity) : 
            inisiasi && !player.getDynamicProperty(`hp4_paint:paintingSizeUI`) ? paintSpawned(entity, false, true, 
                modelAvailable.sort((a,b)=>{
                    return (models[b].width + models[b].height) - (models[a].width + models[a].height)
                })[0]) : null
        })
        {
            if(inisiasi) return
            if(type == 1) {
                if(choosenModel == 0) {
                    model = 0
                    entity.triggerEvent('model0')
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 1) {
                    model = 1
                    entity.triggerEvent('model1')
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 2) {
                    model = 2
                    entity.triggerEvent('model2')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 3) {
                    model = 3
                    entity.triggerEvent('model3')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 4) {
                    model = 4
                    entity.triggerEvent('model4')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 5) {
                    model = 5
                    entity.triggerEvent('model5')
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-2~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 6) {
                    model = 6
                    entity.triggerEvent('model6')
                    upOffset == 2 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-2~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-3~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                //kontol.warn(`model: ${model}`)
                //kontol.warn(`upOffset: ${upOffset}, rightOffset: ${rightOffset}`)
            }
            if(type == 2) {
                if(choosenModel == 0) {
                    model = 0
                    entity.triggerEvent('model0')
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 1) {
                    model = 1
                    entity.triggerEvent('model1')
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 2) {
                    model = 2
                    entity.triggerEvent('model2')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 3) {
                    model = 3
                    entity.triggerEvent('model3')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 4) {
                    model = 4
                    entity.triggerEvent('model4')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 5) {
                    model = 5
                    entity.triggerEvent('model5')
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-2~`) : null
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,7)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,7)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 6) {
                    model = 5
                    entity.triggerEvent('model6')
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-2~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[6], newRotation)
                }
                if (choosenModel == 7) {
                    model = 5
                    entity.triggerEvent('model7')
                    upOffset == 2 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-2~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-3~`) : null
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,7)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,7)}`) : null
                    hitBoxManager(entity, models[7], newRotation)
                }
                if (choosenModel == 8) {
                    model = 6
                    entity.triggerEvent('model8')
                    upOffset == 2 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-2~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-3~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[8], newRotation)
                }
                //kontol.warn(`model: ${model}`)
                //kontol.warn(`upOffset: ${upOffset}, rightOffset: ${rightOffset}`)
            }
            if(type == 3) {
                if(choosenModel == 0) {
                    model = 0
                    entity.triggerEvent('model0')
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 1) {
                    model = 1
                    entity.triggerEvent('model1')
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 2) {
                    model = 2
                    entity.triggerEvent('model2')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 3) {
                    model = 3
                    entity.triggerEvent('model3')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 4) {
                    model = 5
                    entity.triggerEvent('model4')
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-2~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[4], newRotation)
                }
                if (choosenModel == 5) {
                    model = 6
                    entity.triggerEvent('model5')
                    upOffset == 2 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-2~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-3~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[5], newRotation)
                }
                //kontol.warn(`model: ${model}`)
                //kontol.warn(`upOffset: ${upOffset}, rightOffset: ${rightOffset}`)
            }
            if(type == 4) {
                if (choosenModel == 0) {
                    model = 3
                    entity.triggerEvent('model0')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[0], newRotation)
                }
                if (choosenModel == 1) {
                    model = 4
                    entity.triggerEvent('model1')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[1], newRotation)
                }
                if (choosenModel == 2) {
                    model = 5
                    entity.triggerEvent('model2')
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-2~`) : null
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,7)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,7)}`) : null
                    hitBoxManager(entity, models[2], newRotation)
                }
                if (choosenModel == 3) {
                    model = 5
                    entity.triggerEvent('model3')
                    upOffset == 2 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-2~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-3~`) : null
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,3)}`) : null
                    hitBoxManager(entity, models[3], newRotation)
                }
                if (choosenModel == 4) {
                    model = 5
                    entity.triggerEvent('model4')
                    upOffset == 2 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-2~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-3~`) : null
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,7)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,7)}`) : null
                    hitBoxManager(entity, models[4], newRotation)
                }
                if (choosenModel == 5) {
                    model = 6
                    entity.triggerEvent('model5')
                    upOffset == 2 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-2~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-3~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[5], newRotation)
                }
                //kontol.warn(`model: ${model}`)
                //kontol.warn(`upOffset: ${upOffset}, rightOffset: ${rightOffset}`)
            }
            if(type == 5) {
                if(choosenModel == 0) {
                    model = 0
                    entity.triggerEvent('model0')
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 1) {
                    model = 1
                    entity.triggerEvent('model1')
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 2) {
                    model = 2
                    entity.triggerEvent('model2')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 3) {
                    model = 3
                    entity.triggerEvent('model3')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 4) {
                    model = 4
                    entity.triggerEvent('model4')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 5) {
                    model = 5
                    entity.triggerEvent('model5')
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-2~`) : null
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,7)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,7)}`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 6) {
                    model = 5
                    entity.triggerEvent('model6')
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-2~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[6], newRotation)
                }
                //kontol.warn(`model: ${model}`)
                //kontol.warn(`upOffset: ${upOffset}, rightOffset: ${rightOffset}`)
            }
            if(type == 6) {
                if (choosenModel == 0) {
                    model = 1
                    entity.triggerEvent('model0')
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[choosenModel], newRotation)
                }
                if (choosenModel == 1) {
                    model = 3
                    entity.triggerEvent('model1')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[choosenModel], newRotation)
                }
                if (choosenModel == 2) {
                    model = 5
                    entity.triggerEvent('model2')
                    upOffset == 2 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-2~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-3~`) : null
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,1)}`) : null
                    hitBoxManager(entity, models[choosenModel], newRotation)
                }
                if (choosenModel == 3) {
                    model = 4
                    entity.triggerEvent('model3')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[choosenModel], newRotation)
                }
                if (choosenModel == 4) {
                    model = 5
                    entity.triggerEvent('model4')
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-2~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[choosenModel], newRotation)
                }
                if (choosenModel == 5) {
                    model = 6
                    entity.triggerEvent('model5')
                    upOffset == 2 ? entity.runCommand(`tp @s ~~-1~`) :
                    upOffset == 1 ? entity.runCommand(`tp @s ~~-2~`) :
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-3~`) : null
                    rightOffset == 2 ? entity.runCommand(`tp @s ${horizontalOffsetControl(2,newRotation,model)}`) :
                    rightOffset == 1 ? entity.runCommand(`tp @s ${horizontalOffsetControl(1,newRotation,model)}`) :
                    rightOffset == 0 ? entity.runCommand(`tp @s ${horizontalOffsetControl(0,newRotation,model)}`) : null
                    hitBoxManager(entity, models[choosenModel], newRotation)
                }
                if (choosenModel == 6) {
                    model = 6
                    entity.triggerEvent('model6')
                    hitBoxManager(entity, models[model], newRotation)
                }
                if (choosenModel == 7) {
                    model = 7
                    entity.triggerEvent('model7')
                    upOffset == 0 ? entity.runCommand(`tp @s ~~-1~`) : null
                    hitBoxManager(entity, models[model], newRotation)
                }
                //kontol.warn(`model: ${model}`)
                //kontol.warn(`upOffset: ${upOffset}, rightOffset: ${rightOffset}`)
            }
            system.runTimeout(()=>{
                entity.setProperty(`hp4_paint:visible`, true)
            },0.1*20)
        }
    }
}
function hitBoxManager(entity, model, rot) {
    if(rot == 0) {
        //z positive front, x positive right
        for (let iv = 0; iv < model.height; iv++) {
            for (let ih = 1; ih < model.width; ih++) {
                const hloc = {
                    x: entity.location.x + ih,
                    y: entity.location.y + iv,
                    z: entity.location.z
                }
                const hitBox = entity.dimension.spawnEntity(`hp4_paint:hitboxes`, hloc)
                hitBox.setDynamicProperty(`hp4_paint:owner`, `hp4_point:owner/${entity.id}`)
                hitBox.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBoxDetect=>{
                    if((hitBoxDetect != hitBox && hitBoxDetect.getDynamicProperty(`hp4_paint:owner`) != hitBox.getDynamicProperty(`hp4_paint:owner`)) && hitBoxDetect.location.x == hitBox.location.x && hitBoxDetect.location.y == hitBox.location.y && hitBoxDetect.location.z == hitBox.location.z) {
                        hitBox.triggerEvent('death')
                    }
                })
                //2//kontol.warn(`x: ${hitBox.location.x}, y: ${hitBox.location.y}, z: ${hitBox.location.z}`)
            }
            const vloc = {
                x: entity.location.x,
                y: entity.location.y + iv,
                z: entity.location.z
            }
            const hitBox = entity.dimension.spawnEntity(`hp4_paint:hitboxes`, vloc)
            hitBox.setDynamicProperty(`hp4_paint:owner`, `hp4_point:owner/${entity.id}`)
            hitBox.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBoxDetect=>{
                if((hitBoxDetect != hitBox && hitBoxDetect.getDynamicProperty(`hp4_paint:owner`) != hitBox.getDynamicProperty(`hp4_paint:owner`)) && hitBoxDetect.location.x == hitBox.location.x && hitBoxDetect.location.y == hitBox.location.y && hitBoxDetect.location.z == hitBox.location.z) {
                    hitBox.triggerEvent('death')
                }
            })
            //2//kontol.warn(`x: ${hitBox.location.x}, y: ${hitBox.location.y}, z: ${hitBox.location.z}`)
        }
    }
    if(rot == 90) {
        //z positive right, x negative front
        for (let iv = 0; iv < model.height; iv++) {
            for (let ih = 1; ih < model.width; ih++) {
                const hloc = {
                    x: entity.location.x,
                    y: entity.location.y + iv,
                    z: entity.location.z + ih
                }
                const hitBox = entity.dimension.spawnEntity(`hp4_paint:hitboxes`, hloc)
                hitBox.setDynamicProperty(`hp4_paint:owner`, `hp4_point:owner/${entity.id}`)
                hitBox.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBoxDetect=>{
                    if((hitBoxDetect != hitBox && hitBoxDetect.getDynamicProperty(`hp4_paint:owner`) != hitBox.getDynamicProperty(`hp4_paint:owner`)) && hitBoxDetect.location.x == hitBox.location.x && hitBoxDetect.location.y == hitBox.location.y && hitBoxDetect.location.z == hitBox.location.z) {
                        hitBox.triggerEvent('death')
                    }
                })
                //2//kontol.warn(`x: ${hitBox.location.x}, y: ${hitBox.location.y}, z: ${hitBox.location.z}`)
            }
            const vloc = {
                x: entity.location.x,
                y: entity.location.y + iv,
                z: entity.location.z
            }
            const hitBox = entity.dimension.spawnEntity(`hp4_paint:hitboxes`, vloc)
            hitBox.setDynamicProperty(`hp4_paint:owner`, `hp4_point:owner/${entity.id}`)
                hitBox.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBoxDetect=>{
                    if((hitBoxDetect != hitBox && hitBoxDetect.getDynamicProperty(`hp4_paint:owner`) != hitBox.getDynamicProperty(`hp4_paint:owner`)) && hitBoxDetect.location.x == hitBox.location.x && hitBoxDetect.location.y == hitBox.location.y && hitBoxDetect.location.z == hitBox.location.z) {
                        hitBox.triggerEvent('death')
                    }
                })
            //2//kontol.warn(`x: ${hitBox.location.x}, y: ${hitBox.location.y}, z: ${hitBox.location.z}`)
        }
    }
    if(rot == 180) {
        //z negative front, x negative right
        for (let iv = 0; iv < model.height; iv++) {
            for (let ih = 1; ih < model.width; ih++) {
                const hloc = {
                    x: entity.location.x - ih,
                    y: entity.location.y + iv,
                    z: entity.location.z
                }
                const hitBox = entity.dimension.spawnEntity(`hp4_paint:hitboxes`, hloc)
                hitBox.setDynamicProperty(`hp4_paint:owner`, `hp4_point:owner/${entity.id}`)
                hitBox.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBoxDetect=>{
                    if((hitBoxDetect != hitBox && hitBoxDetect.getDynamicProperty(`hp4_paint:owner`) != hitBox.getDynamicProperty(`hp4_paint:owner`)) && hitBoxDetect.location.x == hitBox.location.x && hitBoxDetect.location.y == hitBox.location.y && hitBoxDetect.location.z == hitBox.location.z) {
                        hitBox.triggerEvent('death')
                    }
                })
                //2//kontol.warn(`x: ${hitBox.location.x}, y: ${hitBox.location.y}, z: ${hitBox.location.z}`)
            }
            const vloc = {
                x: entity.location.x,
                y: entity.location.y + iv,
                z: entity.location.z
            }
            const hitBox = entity.dimension.spawnEntity(`hp4_paint:hitboxes`, vloc)
            hitBox.setDynamicProperty(`hp4_paint:owner`, `hp4_point:owner/${entity.id}`)
                hitBox.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBoxDetect=>{
                    if((hitBoxDetect != hitBox && hitBoxDetect.getDynamicProperty(`hp4_paint:owner`) != hitBox.getDynamicProperty(`hp4_paint:owner`)) && hitBoxDetect.location.x == hitBox.location.x && hitBoxDetect.location.y == hitBox.location.y && hitBoxDetect.location.z == hitBox.location.z) {
                        hitBox.triggerEvent('death')
                    }
                })
            //2//kontol.warn(`x: ${hitBox.location.x}, y: ${hitBox.location.y}, z: ${hitBox.location.z}`)
        }
    }
    if(rot == -90) {
        //z negative right, x positive front
        for (let iv = 0; iv < model.height; iv++) {
            for (let ih = 1; ih < model.width; ih++) {
                const hloc = {
                    x: entity.location.x,
                    y: entity.location.y + iv,
                    z: entity.location.z - ih
                }
                const hitBox = entity.dimension.spawnEntity(`hp4_paint:hitboxes`, hloc)
                hitBox.setDynamicProperty(`hp4_paint:owner`, `hp4_point:owner/${entity.id}`)
                hitBox.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBoxDetect=>{
                    if((hitBoxDetect != hitBox && hitBoxDetect.getDynamicProperty(`hp4_paint:owner`) != hitBox.getDynamicProperty(`hp4_paint:owner`)) && hitBoxDetect.location.x == hitBox.location.x && hitBoxDetect.location.y == hitBox.location.y && hitBoxDetect.location.z == hitBox.location.z) {
                        hitBox.triggerEvent('death')
                    }
                })
                //2//kontol.warn(`x: ${hitBox.location.x}, y: ${hitBox.location.y}, z: ${hitBox.location.z}`)
            }
            const vloc = {
                x: entity.location.x,
                y: entity.location.y + iv,
                z: entity.location.z
            }
            const hitBox = entity.dimension.spawnEntity(`hp4_paint:hitboxes`, vloc)
            hitBox.setDynamicProperty(`hp4_paint:owner`, `hp4_point:owner/${entity.id}`)
                hitBox.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBoxDetect=>{
                    if((hitBoxDetect != hitBox && hitBoxDetect.getDynamicProperty(`hp4_paint:owner`) != hitBox.getDynamicProperty(`hp4_paint:owner`)) && hitBoxDetect.location.x == hitBox.location.x && hitBoxDetect.location.y == hitBox.location.y && hitBoxDetect.location.z == hitBox.location.z) {
                        hitBox.triggerEvent('death')
                    }
                })
            //2//kontol.warn(`x: ${hitBox.location.x}, y: ${hitBox.location.y}, z: ${hitBox.location.z}`)
        }
    }
}
function horizontalOffsetControl(rightOffset, rot, model) {
    if(rot == 90) {
        if(rightOffset == 0) {
            if(model == 1 || model == 3) {
                return `~~~-1`
            } else if (model == 4 || model == 5 || model == 6) {
                return `~~~-3`
            } else if (model == 7) {
                return `~~~-2`
            }
        } else if(rightOffset == 1) {
            if(model == 4 || model == 5 || model == 6) {
                return `~~~-2`
            } else if (model == 7) {
                return `~~~-1`
            }
        } else if(rightOffset == 2) {
            if(model == 4 || model == 5 || model == 6) {
                return `~~~-1`
            }
        }
    } else if(rot == -90) {
        if(rightOffset == 0) {
            if(model == 1 || model == 3) {
                return `~~~+1`
            } else if (model == 4 || model == 5 || model == 6) {
                return `~~~+3`
            } else if (model == 7) {
                return `~~~+2`
            }
        } else if(rightOffset == 1) {
            if(model == 4 || model == 5 || model == 6) {
                return `~~~+2`
            } else if (model == 7) {
                return `~~~+1`
            }
        } else if(rightOffset == 2) {
            if(model == 4 || model == 5 || model == 6) {
                return `~~~+1`
            }
        }
    } else if(rot == 0) {
        if(rightOffset == 0) {
            if(model == 1 || model == 3) {
                return `~-1~~`
            } else if (model == 4 || model == 5 || model == 6) {
                return `~-3~~`
            } else if (model == 7) {
                return `~-2~~`
            }
        } else if(rightOffset == 1) {
            if(model == 4 || model == 5 || model == 6) {
                return `~-2~~`
            } else if (model == 7) {
                return `~-1~~`
            }
        } else if(rightOffset == 2) {
            if(model == 4 || model == 5 || model == 6) {
                return `~-1~~`
            }
        }
    } else if(rot == 180) {
        if(rightOffset == 0) {
            if(model == 1 || model == 3) {
                return `~+1~~`
            } else if (model == 4 || model == 5 || model == 6) {
                return `~+3~~`
            } else if (model == 7) {
                return `~+2~~`
            }
        } else if(rightOffset == 1) {
            if(model == 4 || model == 5 || model == 6) {
                return `~+2~~`
            } else if (model == 7) {
                return `~+1~~`
            }
        } else if(rightOffset == 2) {
            if(model == 4 || model == 5 || model == 6) {
                return `~+1~~`
            }
        }
    }
}
export function findClosestNumber(arr, target) {
    if (arr.length === 0) {
      return undefined; // Or handle as an error
    }
    let closest = arr[0];
    let minDiff = Math.abs(target - arr[0]);
    for (let i = 1; i < arr.length; i++) {
        const currentDiff = Math.abs(target - arr[i]);
        if (currentDiff < minDiff) {
            minDiff = currentDiff;
            closest = arr[i];
        }
    }
    return closest;
}
export function randomize(min, max, round) {
	return min == max ? min: round ? Math.round(Math.random() * (max-min)+min) : Math.random() * (max-min)+min
}
function detectPossibleModels(models, horizontal, vertical) {
    const possible = [];

    models.forEach(model => {
        const fit = horizontal >= model.width && vertical >= model.height;
        if (fit) {
            possible.push(model.id);
        }
    });

    return possible;
}
Math.clamp = function(value, min, max) {
    return Math.min(Math.max(value, min), max);
};

function blockCheck(entity, rot) {
    let horizontalAvailable, verticalAvailable;
    let up, down, right, left, upBack, downBack, rightBack, leftBack, leftBottomCorner = {x: 0, y: 0, z: 0};
    let upOffset, rightOffset;
    if (rot == 90) {
        //UP DOWN
        {
            for (let offset = 0; offset <= 8; offset++) {
                const loc = {
                    x: entity.location.x,
                    y: entity.location.y + offset,
                    z: entity.location.z
                }
                const block = entity.dimension.getBlock(loc);
                up = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x && hitBox.location.y == entity.location.y + offset && hitBox.location.z == entity.location.z) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const loc = {
                    x: entity.location.x,
                    y: entity.location.y - offset,
                    z: entity.location.z
                };
                const block = entity.dimension.getBlock(loc);
                down = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x && hitBox.location.y == entity.location.y - offset && hitBox.location.z == entity.location.z) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
        }
        {
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x + 1,
                    y: entity.location.y + offset,
                    z: entity.location.z
                });

                upBack = offset;
                if (block.isAir) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x + 1,
                    y: entity.location.y - offset,
                    z: entity.location.z
                });

                downBack = offset;
                if (block.isAir) {
                    break;
                }
            }
        }
        //RIGHT LEFT
        {
            for (let offset = 0; offset <= 8; offset++) {
                const loc = {
                    x: entity.location.x,
                    y: entity.location.y,
                    z: entity.location.z + offset
                };
                const block = entity.dimension.getBlock(loc);

                right = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x && hitBox.location.y == entity.location.y && hitBox.location.z == entity.location.z + offset) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const loc = {
                    x: entity.location.x,
                    y: entity.location.y,
                    z: entity.location.z - offset
                };
                const block = entity.dimension.getBlock(loc);
                left = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x && hitBox.location.y == entity.location.y && hitBox.location.z == entity.location.z - offset) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
        }
        {
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x + 1,
                    y: entity.location.y,
                    z: entity.location.z + offset
                });

                rightBack = offset;
                if (block.isAir) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x + 1,
                    y: entity.location.y,
                    z: entity.location.z - offset
                });

                leftBack = offset;
                if (block.isAir) {
                    break;
                }
            }
        }
    }
    if (rot == 0) {
        //UP DOWN
        {
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x,
                    y: entity.location.y + offset,
                    z: entity.location.z
                });
                
                up = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x && hitBox.location.y == entity.location.y + offset && hitBox.location.z == entity.location.z) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x,
                    y: entity.location.y - offset,
                    z: entity.location.z
                });

                down = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x && hitBox.location.y == entity.location.y - offset && hitBox.location.z == entity.location.z) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
        }
        {
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x,
                    y: entity.location.y + offset,
                    z: entity.location.z - 1
                });

                upBack = offset;
                if (block.isAir) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x,
                    y: entity.location.y - offset,
                    z: entity.location.z - 1
                });

                downBack = offset;
                if (block.isAir) {
                    break;
                }
            }
        }
        //RIGHT LEFT
        {
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x + offset,
                    y: entity.location.y,
                    z: entity.location.z
                });

                right = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x + offset && hitBox.location.y == entity.location.y && hitBox.location.z == entity.location.z) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x - offset,
                    y: entity.location.y,
                    z: entity.location.z
                });

                left = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x - offset && hitBox.location.y == entity.location.y && hitBox.location.z == entity.location.z) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
        }
        {
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x + offset,
                    y: entity.location.y,
                    z: entity.location.z - 1
                });

                rightBack = offset;
                if (block.isAir) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x - offset,
                    y: entity.location.y,
                    z: entity.location.z - 1
                });

                leftBack = offset;
                if (block.isAir) {
                    break;
                }
            }
        }
    }
    if (rot == -90) {
        //UP DOWN
        {
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x,
                    y: entity.location.y + offset,
                    z: entity.location.z
                });

                up = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x && hitBox.location.y == entity.location.y + offset && hitBox.location.z == entity.location.z) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x,
                    y: entity.location.y - offset,
                    z: entity.location.z
                });

                down = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x && hitBox.location.y == entity.location.y - offset && hitBox.location.z == entity.location.z) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
        }
        {
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x - 1,
                    y: entity.location.y + offset,
                    z: entity.location.z
                });

                upBack = offset;
                if (block.isAir) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x - 1,
                    y: entity.location.y - offset,
                    z: entity.location.z
                });

                downBack = offset;
                if (block.isAir) {
                    break;
                }
            }
        }
        //RIGHT LEFT
        {
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x,
                    y: entity.location.y,
                    z: entity.location.z - offset
                });

                right = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x && hitBox.location.y == entity.location.y && hitBox.location.z == entity.location.z - offset) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x,
                    y: entity.location.y,
                    z: entity.location.z + offset
                });

                left = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x && hitBox.location.y == entity.location.y && hitBox.location.z == entity.location.z + offset) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
        }
        {
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x - 1,
                    y: entity.location.y,
                    z: entity.location.z - offset
                });

                rightBack = offset;
                if (block.isAir) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x - 1,
                    y: entity.location.y,
                    z: entity.location.z + offset
                });

                leftBack = offset;
                if (block.isAir) {
                    break;
                }
            }
        }
    }
    if (rot == 180) {
        //UP DOWN
        {
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x,
                    y: entity.location.y + offset,
                    z: entity.location.z
                });

                up = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x && hitBox.location.y == entity.location.y + offset && hitBox.location.z == entity.location.z) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x,
                    y: entity.location.y - offset,
                    z: entity.location.z
                });

                down = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x && hitBox.location.y == entity.location.y - offset && hitBox.location.z == entity.location.z) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
        }
        {
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x,
                    y: entity.location.y + offset,
                    z: entity.location.z + 1
                });

                upBack = offset;
                if (block.isAir) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x,
                    y: entity.location.y - offset,
                    z: entity.location.z + 1
                });

                downBack = offset;
                if (block.isAir) {
                    break;
                }
            }
        }
        //RIGHT LEFT
        {
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x - offset,
                    y: entity.location.y,
                    z: entity.location.z
                });

                right = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x - offset && hitBox.location.y == entity.location.y && hitBox.location.z == entity.location.z) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x + offset,
                    y: entity.location.y,
                    z: entity.location.z
                });

                left = offset;
                let hasPaint = false;
                const hasPainting = entity.dimension.getEntities({type: 'hp4_paint:hitboxes'}).forEach(hitBox=>{
                    if (hitBox.location.x == entity.location.x + offset && hitBox.location.y == entity.location.y && hitBox.location.z == entity.location.z) {
                        hasPaint = true;
                    }
                });
                if (!block.isAir || hasPaint) {
                    break;
                }
            }
        }
        {
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x - offset,
                    y: entity.location.y,
                    z: entity.location.z + 1
                });

                rightBack = offset;
                if (block.isAir) {
                    break;
                }
            }
            for (let offset = 0; offset <= 8; offset++) {
                const block = entity.dimension.getBlock({
                    x: entity.location.x + offset,
                    y: entity.location.y,
                    z: entity.location.z + 1
                });

                leftBack = offset;
                if (block.isAir) {
                    break;
                }
            }
        }
    }
    horizontalAvailable = Math.clamp(right, 1, rightBack) + (Math.clamp(left, 1, leftBack)-1)
    verticalAvailable = Math.clamp(up, 1, upBack) + (Math.clamp(down, 1, downBack)-1);
    upOffset = Math.clamp(up, 1, upBack) - 1
    rightOffset = Math.clamp(right, 1, rightBack) - 1
    // //leftBottomCorner
    // {
    //     if (rot == 90) {
    //         leftBottomCorner.x = entity.location.x;
    //         leftBottomCorner.y = entity.location.y - (Math.clamp(down, 1, downBack)-1);
    //         leftBottomCorner.z = entity.location.z - (Math.clamp(left, 1, leftBack)-1);
    //     }
    //     if (rot == 0) {
    //         leftBottomCorner.x = entity.location.x - (Math.clamp(left, 1, leftBack)-1);
    //         leftBottomCorner.y = entity.location.y - (Math.clamp(down, 1, downBack)-1);
    //         leftBottomCorner.z = entity.location.z;
    //     }
    //     if (rot == -90) {
    //         leftBottomCorner.x = entity.location.x;
    //         leftBottomCorner.y = entity.location.y - (Math.clamp(down, 1, downBack)-1);
    //         leftBottomCorner.z = entity.location.z + (Math.clamp(left, 1, leftBack)-1);
    //     }
    //     if (rot == 180) {
    //         leftBottomCorner.x = entity.location.x + (Math.clamp(left, 1, leftBack)-1);
    //         leftBottomCorner.y = entity.location.y - (Math.clamp(down, 1, downBack)-1);
    //         leftBottomCorner.z = entity.location.z;
    //     }
    //     leftBottomCorner.x = Math.floor(leftBottomCorner.x);
    //     leftBottomCorner.y = Math.floor(leftBottomCorner.y);
    //     leftBottomCorner.z = Math.floor(leftBottomCorner.z);
    // }
    // //checkRightFromCorner
    // {
    //     for (let indexRight = 0; indexRight < horizontalAvailable; indexRight++) {
    //         for (let indexUp = 0; indexUp < verticalAvailable; indexUp++) {
    //             const block = entity.dimension.getBlock({
    //                 x: leftBottomCorner.x,
    //                 y: leftBottomCorner.y + indexUp,
    //                 z: leftBottomCorner.z + indexRight
    //             });

    //             if (!block.isAir) {
    //                 //kontol.warn(`upClamp: ${indexUp}, rightClamp: ${indexRight}`);
    //                 break;
    //             }
    //         }
    //     }
    // }
    return {
        up: up,
        down: down,
        right: right,
        left: left,
        upBack: upBack,
        downBack: downBack,
        rightBack: rightBack,
        leftBack: leftBack,
        horizontalAvailable: horizontalAvailable,
        verticalAvailable: verticalAvailable,
        leftBottomCorner: leftBottomCorner,
        upOffset: upOffset,
        rightOffset: rightOffset
    };
}
system.afterEvents.scriptEventReceive.subscribe(data => {
    const id = data.id, source = data.sourceEntity
    if (id == "hp4_paint:hitbox_hit") {
        const owner = source.getDynamicProperty("hp4_paint:owner")
        let death = false
        world.getDimension('overworld').getEntities().forEach(entity=>{
            if (entity.id == owner.replace('hp4_point:owner/', '')) {
                if(entity.getProperty('hp4_paint:frame_type') != 'none') {
                    entity.runCommand(`loot spawn ^^^1 loot "heropixels/more_paintings/frames/${entity.getProperty('hp4_paint:frame_type')}"`)
                    entity.setProperty('hp4_paint:frame_type', 'none')
                } else {
                    death = true
                    entity.triggerEvent('death')
                }
            }
        })
        if(death) {
            source.dimension.getEntities({type:'hp4_paint:hitboxes'}).forEach(entity => {
                if(entity.getDynamicProperty("hp4_paint:owner") == owner) {
                    entity.runCommand(`particle hp4_paint:destroy_particle ~~~`)
                    if(entity == source) return
                    entity.remove()
                }
            })
            source.remove()
        }
    }
    if (id == "hp4_paint:hitbox_hit_noloot") {
        const owner = source.getDynamicProperty("hp4_paint:owner")
        let death = false
        world.getDimension('overworld').getEntities().forEach(entity=>{
            if (entity.id == owner.replace('hp4_point:owner/', '')) {
                if(entity.getProperty('hp4_paint:frame_type') != 'none') {
                    //entity.runCommand(`loot spawn ^^^1 loot "heropixels/more_paintings/frames/${entity.getProperty('hp4_paint:frame_type')}"`)
                    entity.setProperty('hp4_paint:frame_type', 'none')
                } else {
                    death = true
                    entity.remove()
                }
            }
        })
        if(death) {
            source.dimension.getEntities({type:'hp4_paint:hitboxes'}).forEach(entity => {
                if(entity.getDynamicProperty("hp4_paint:owner") == owner) {
                    entity.runCommand(`particle hp4_paint:destroy_particle ~~~`)
                    if(entity == source) return
                    entity.remove()
                }
            })
            source.remove()
        }
    }
    if (id == "hp4_paint:hitbox_glow") {
        const owner = source.getDynamicProperty("hp4_paint:owner")
        world.getDimension('overworld').getEntities().forEach(entity=>{
            if (entity.id == owner.replace('hp4_point:owner/', '')) {
                entity.triggerEvent('glow')
                entity.runCommand(`playsound sign.ink_sac.use @a ~~~`)
            }
            if (entity.getDynamicProperty(`hp4_paint:owner`) == owner) {
                entity.setProperty(`hp4_paint:is_glow`, true)
            }
        })
    }
    if (id == "hp4_paint:hitbox_remove_glow") {
        const owner = source.getDynamicProperty("hp4_paint:owner")
        world.getDimension('overworld').getEntities().forEach(entity=>{
            if (entity.id == owner.replace('hp4_point:owner/', '')) {
                if(entity.getProperty(`hp4_paint:paint_materials`) == true) {
                    entity.runCommand(`loot spawn ^^^1 loot "heropixels/more_paintings/glow_ink_sac"`)
                    entity.runCommand(`playsound mob.sheep.shear @a ~~~`)
                }
                entity.triggerEvent('remove_glow')
            }
            if (entity.getDynamicProperty(`hp4_paint:owner`) == owner) {
                entity.setProperty(`hp4_paint:is_glow`, false)
            }
        })
    }
    if (id == "hp4_paint:hitbox_remove_glow_noloot") {
        const owner = source.getDynamicProperty("hp4_paint:owner")
        world.getDimension('overworld').getEntities().forEach(entity=>{
            if (entity.id == owner.replace('hp4_point:owner/', '')) {
                entity.triggerEvent('remove_glow')
                entity.runCommand(`playsound mob.sheep.shear @a ~~~`)
            }
            if (entity.getDynamicProperty(`hp4_paint:owner`) == owner) {
                entity.setProperty(`hp4_paint:is_glow`, false)
            }
        })
    }
    if (id == "hp4_paint:change_image") {
        const owner = source.getDynamicProperty("hp4_paint:owner")
        //kontol.warn('image change')
        world.getDimension('overworld').getEntities().forEach(entity=>{
            if (entity.id == owner.replace('hp4_point:owner/', '')) {
                const model = entity.getProperty(`hp4_paint:paint_models`)
                //FUNCTION GANTI GAMBAR
                gantiGambar(entity, model)
                entity.runCommand(`playsound dig.wood @a ~~~`)
            }
        })
    }
})
export function paintingTypeChoose(entity) {
    let models
    let jenis
    const type1 = [
        "8bit",
        "alien",
        "biomes",
        "candy1",
        "candy2",
        "dino_dragons",
        "dino",
        "forest",
        "kawaii",
        "magic",
        "music",
        "nature",
        "ninja",
        "ocean",
        "pirates",
        "snow",
        "superheroes",
        "vanilla_pack"
    ], type2 = [
        "circus",
        "egypt",
        "fantasy",
        "halloween",
        "horror",
        "modern",
        "robot",
        "steampunk",
        "tiny",
        "zombies"
    ], type3 = [
        "medieval",
        "dragon"
    ], type4 = [
        "fog"
    ], type5 = [
        "scifi"
    ], type6 = [
        "animated"
    ]
    type1.forEach(type => {
        if(entity.typeId == `hp4_paint:${type}_painting`) {
            //kontol.warn(`type1: ${type}`)
            models = [
                { id: 0, width: 1, height: 1 },
                { id: 1, width: 2, height: 1 },
                { id: 2, width: 1, height: 2 },
                { id: 3, width: 2, height: 2 },
                { id: 4, width: 4, height: 2 },
                { id: 5, width: 4, height: 3 },
                { id: 6, width: 4, height: 4 }
            ];
            jenis = 1
        }
    })
    type2.forEach(type => {
        if(entity.typeId == `hp4_paint:${type}_painting`) {
            //kontol.warn(`type2: ${type}`)
            models = [
                { id: 0, width: 1, height: 1 },
                { id: 1, width: 2, height: 1 },
                { id: 2, width: 1, height: 2 },
                { id: 3, width: 2, height: 2 },
                { id: 4, width: 4, height: 2 },
                { id: 5, width: 3, height: 3 },
                { id: 6, width: 4, height: 3 },
                { id: 7, width: 3, height: 4 },
                { id: 8, width: 4, height: 4 }
            ];
            jenis = 2
        }
    })
    type3.forEach(type => {
        if(entity.typeId == `hp4_paint:${type}_painting`) {
            //kontol.warn(`type3: ${type}`)
            models = [
                { id: 0, width: 1, height: 1 },
                { id: 1, width: 2, height: 1 },
                { id: 2, width: 1, height: 2 },
                { id: 3, width: 2, height: 2 },
                { id: 4, width: 4, height: 3 },
                { id: 5, width: 4, height: 4 }
            ];
            jenis = 3
        }
    })
    type4.forEach(type => {
        if(entity.typeId == `hp4_paint:${type}_painting`) {
            //kontol.warn(`type4: ${type}`)
            models = [
                { id: 0, width: 2, height: 2 },
                { id: 1, width: 4, height: 2 },
                { id: 2, width: 3, height: 3 },
                { id: 3, width: 2, height: 4 },
                { id: 4, width: 3, height: 4 },
                { id: 5, width: 4, height: 4 }
            ];
            jenis = 4
        }
    })
    type5.forEach(type => {
        if(entity.typeId == `hp4_paint:${type}_painting`) {
            //kontol.warn(`type4: ${type}`)
            models = [
                { id: 0, width: 1, height: 1 },
                { id: 1, width: 2, height: 1 },
                { id: 2, width: 1, height: 2 },
                { id: 3, width: 2, height: 2 },
                { id: 4, width: 4, height: 2 },
                { id: 5, width: 3, height: 3 },
                { id: 6, width: 4, height: 3 }
            ];
            jenis = 5
        }
    })
    type6.forEach(type => {
        if(entity.typeId == `hp4_paint:${type}_painting`) {
            //kontol.warn(`type4: ${type}`)
            models = [
                { id: 0, width: 2, height: 1 },
                { id: 1, width: 2, height: 2 },
                { id: 2, width: 2, height: 4 },
                { id: 3, width: 4, height: 2 },
                { id: 4, width: 4, height: 3 },
                { id: 5, width: 4, height: 4 },
                { id: 6, width: 1, height: 1 },
                { id: 7, width: 1, height: 2 }
            ];
            jenis = 6
        }
    })
    return {models: models, jenis: jenis}
}
world.afterEvents.dataDrivenEntityTrigger.subscribe((arg)=>{
    const entity = arg.entity
    const event = arg.eventId
    if(entity.typeId.includes('hp4_paint')&&(entity.typeId.endsWith('painting') || entity.typeId == 'hp4_paint:vanilla_pack')) {
        if(event == 'death') {
            const folder = `heropixels/more_paintings/${entity.typeId.replace('hp4_paint:', '').replace('_painting', '')}`
            entity.runCommand(`loot spawn ^^^1 loot "${folder}"`)
            entity.runCommand(`playsound dig.wood @a ~~~`)
            if(entity.getProperty(`hp4_paint:paint_materials`)){
                entity.runCommand(`loot spawn ^^^1 loot "heropixels/more_paintings/glow_ink_sac"`)
            }
        }
        if(event == 'minecraft:entity_spawned') {
            entity.runCommand(`playsound dig.wood @a ~~~`)
        }
    }
})
world.afterEvents.entityHitEntity.subscribe((arg)=>{
    const player = arg.damagingEntity
    const paint = arg.hitEntity
    if(paint.typeId == 'hp4_paint:hitboxes') {
        paint.runCommand(`playsound hp4_paint:display.furniture_remove @a ~~~`)
        const gamemode = player.getGameMode()
        paint.dimension.getEntities({type:'hp4_paint:hitboxes'}).forEach(entity => {
            if(entity == paint) return
            if (entity.getDynamicProperty("hp4_paint:owner") == paint.getDynamicProperty("hp4_paint:owner")) {
                if(player.getDynamicProperty(`hp4_paint:particles`)) {
                    paint.runCommand(`playsound hp4_paint:display.tool_use @a ~~~`)
                    paint.runCommand(`function hp/more_paintings/destroy_wood`)
                }
            }
        })
        if(gamemode == "creative") {
            paint.triggerEvent('death_noloot')
        } else {
            paint.triggerEvent('death')
        }
    }
})
export const frames = [
    'black_modern',
    'burning',
    'decgold',
    'deciron',
    'diamond',
    'enchanted',
    'foliage',
    'glass',
    'glitter',
    'medieval',
    'pink',
    'white_modern',
    'wooden'
]
world.afterEvents.playerInteractWithEntity.subscribe((arg)=>{
    const player = arg.player
    const item = arg.itemStack
    const target = arg.target
    try {
        if(target.typeId=="hp4_paint:hitboxes"&&item.typeId=="minecraft:shears") {
            const gamemode = player.getGameMode()
            if(gamemode == "creative") {
                target.triggerEvent('remove_glow_noloot')
            } else {
                target.triggerEvent('remove_glow')
            }
        }
        frames.forEach(frame=>{
            if(target.typeId=="hp4_paint:hitboxes"&&item.typeId==`hp4_paint:${frame}.frame`) {
                //console.warn('interact with frame')
                const owner = target.getDynamicProperty("hp4_paint:owner")
                //PAINTING ENTITY
                world.getDimension('overworld').getEntities().forEach(entity=>{
                    if (entity.id == owner.replace('hp4_point:owner/', '')) {
                        entity.runCommand(`playsound dig.wood @a ~~~`)
                        if (entity.getProperty('hp4_paint:frame_type') != frame) {
                            player.getGameMode() != 'creative' ? entity.runCommand(`loot spawn ^^^1 loot "heropixels/more_paintings/frames/${entity.getProperty('hp4_paint:frame_type')}"`) : null
                            entity.setProperty('hp4_paint:frame_type', frame)
                            player.getGameMode() != 'creative' ? player.runCommand(`clear @s hp4_paint:${frame}.frame 0 1`) : null
                        }
                    }
                })
            }
        })
    } catch (error) {
        
    }
})
export function gantiGambar(entity, model) {
    const color = entity.getProperty(`hp4_paint:paint_colors`)
    const entityTypeId = entity.typeId.replace('hp4_paint:','').replace('_painting','')
    const nilai = colorPaintingData[entityTypeId][model]
    const min = Math.min(...nilai), max = Math.max(...nilai)

    entity.setProperty(`hp4_paint:paint_colors`, 
        color == max ? min : color + 1
    )
}
