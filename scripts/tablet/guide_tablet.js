import * as mc from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

// ──────────────────────────────────────────────────────
//  Helper: info page with only a Back button
// ──────────────────────────────────────────────────────
function infoPage(player, title, body, backFn) {
    new ActionFormData()
        .title("Detail")
        .body(body)
        .button("§fBack", "textures/ui/back_ui")
        .show(player)
        .then(r => {
            if (r.canceled) return;
            if (r.selection === 0) backFn();
        });
}

// ──────────────────────────────────────────────────────
//  Helper: navigation menu (ActionFormData)
// ──────────────────────────────────────────────────────
function navMenu(player, title, body, buttons, backFn) {
    const form = new ActionFormData().title(title).body(body);
    if (backFn) form.button("§fBack", "textures/ui/back_ui");
    buttons.forEach(b => b.image ? form.button(b.text, b.image) : form.button(b.text));
    form.show(player).then(r => {
        if (r.canceled) return;
        const offset = backFn ? 1 : 0;
        if (r.selection === 0 && backFn) { backFn(); return; }
        const btn = buttons[r.selection - offset];
        if (btn) btn.command();
    });
}

// ──────────────────────────────────────────────────────
//  Helper: list of items as buttons → detail infoPage
// ──────────────────────────────────────────────────────
function itemListMenu(player, title, intro, items, formatFn, backFn) {
    const buttons = items.map(item => ({
        text: "§e" + item.name,
        image: item.image,
        command: () => infoPage(
            player,
            "§6" + item.name,
            formatFn(item),
            () => itemListMenu(player, title, intro, items, formatFn, backFn)
        )
    }));
    navMenu(player, title, intro, buttons, backFn);
}

// ══════════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════════

const PAINTINGS = [
    { name: "8-Bit",        image: "textures/hp/more_paintings/items/8bit_painting",        variants: 1, desc: "Retro pixel art style inspired by classic 8-bit video games.",              obtain: "Trade with Artist Villager." },
    { name: "Alien",         image: "textures/hp/more_paintings/items/alien_painting",        variants: 1, desc: "Mysterious extraterrestrial and outer-space themed artwork.",               obtain: "Trade with Artist Villager." },
    { name: "Animated",      image: "textures/hp/more_paintings/items/animated1",              variants: 1, desc: "A special animated painting with moving visuals.",                         obtain: "Trade with Artist Villager." },
    { name: "Biomes",        image: "textures/hp/more_paintings/items/biome_painting",        variants: 4, desc: "Scenic landscapes depicting Minecraft's many biomes.",                     obtain: "Trade with Artist Villager." },
    { name: "Candy",         image: "textures/hp/more_paintings/items/candy_painting",        variants: 2, desc: "Bright, colorful candy-land themed artwork.",                              obtain: "Trade with Artist Villager." },
    { name: "Circus",        image: "textures/hp/more_paintings/items/circus_painting",       variants: 1, desc: "Lively circus and carnival themed painting.",                              obtain: "Trade with Artist Villager." },
    { name: "Dino Dragons",  image: "textures/hp/more_paintings/items/dino_dragon_painting",  variants: 1, desc: "Epic artwork featuring dinosaurs and dragons side by side.",               obtain: "Trade with Artist Villager." },
    { name: "Dino",          image: "textures/hp/more_paintings/items/dino_painting",         variants: 1, desc: "Prehistoric dinosaur artwork in various styles.",                          obtain: "Trade with Artist Villager." },
    { name: "Dragon",        image: "textures/hp/more_paintings/items/dragon_painting",       variants: 1, desc: "Majestic dragon artwork with fantasy elements.",                           obtain: "Trade with Artist Villager." },
    { name: "Egypt",         image: "textures/hp/more_paintings/items/egypt_painting",        variants: 1, desc: "Ancient Egyptian art with hieroglyphs, pyramids, and pharaohs.",           obtain: "Trade with Artist Villager." },
    { name: "Fantasy",       image: "textures/hp/more_paintings/items/fantasy_painting",      variants: 1, desc: "Magical fantasy world scenes with mythical creatures.",                    obtain: "Trade with Artist Villager." },
    { name: "Fog",           image: "textures/hp/more_paintings/items/fog_painting",          variants: 1, desc: "Atmospheric foggy landscape painting.",                                    obtain: "Trade with Artist Villager." },
    { name: "Forest",        image: "textures/hp/more_paintings/items/forest_painting",       variants: 2, desc: "Lush forest scenery with detailed tree and nature art.",                   obtain: "Trade with Artist Villager." },
    { name: "Halloween",     image: "textures/hp/more_paintings/items/halloween_painting",    variants: 1, desc: "Spooky Halloween themed art with pumpkins and ghosts.",                   obtain: "Trade with Artist Villager." },
    { name: "Horror",        image: "textures/hp/more_paintings/items/horror_painting",       variants: 1, desc: "Eerie horror-themed painting - not for the faint-hearted.",               obtain: "Trade with Artist Villager." },
    { name: "Kawaii",        image: "textures/hp/more_paintings/items/kawaii_painting",       variants: 1, desc: "Cute Japanese kawaii styled characters and cheerful scenes.",              obtain: "Trade with Artist Villager." },
    { name: "Magic",         image: "textures/hp/more_paintings/items/magic_painting",        variants: 1, desc: "Mystical magic-themed artwork with spells and potions.",                   obtain: "Trade with Artist Villager." },
    { name: "Medieval",      image: "textures/hp/more_paintings/items/medieval_painting",     variants: 2, desc: "Historic medieval scenes with knights, castles, and battles.",             obtain: "Trade with Artist Villager." },
    { name: "Modern",        image: "textures/hp/more_paintings/items/modern_painting",       variants: 1, desc: "Contemporary modern art in abstract and geometric styles.",                obtain: "Trade with Artist Villager." },
    { name: "Music",         image: "textures/hp/more_paintings/items/music_painting",        variants: 1, desc: "Vibrant music-themed artwork with instruments and notes.",                 obtain: "Trade with Artist Villager." },
    { name: "Nature",        image: "textures/hp/more_paintings/items/nature_painting",       variants: 2, desc: "Beautiful natural landscapes and wildlife scenes.",                        obtain: "Trade with Artist Villager." },
    { name: "Ninja",         image: "textures/hp/more_paintings/items/ninja_painting",        variants: 1, desc: "Stealthy ninja art painted in classic Eastern brush style.",               obtain: "Trade with Artist Villager." },
    { name: "Ocean",         image: "textures/hp/more_paintings/items/ocean_painting",        variants: 2, desc: "Deep ocean and aquatic life themed artwork.",                              obtain: "Trade with Artist Villager." },
    { name: "Pirates",       image: "textures/hp/more_paintings/items/pirate_painting",       variants: 1, desc: "High-seas adventure art with pirates, ships, and treasure.",               obtain: "Trade with Artist Villager." },
    { name: "Robot",         image: "textures/hp/more_paintings/items/robot_painting",        variants: 1, desc: "Futuristic robot and mechanical themed artwork.",                          obtain: "Trade with Artist Villager." },
    { name: "Sci-Fi",        image: "textures/hp/more_paintings/items/scifi_painting",        variants: 2, desc: "Science fiction art with spaceships, planets, and technology.",            obtain: "Trade with Artist Villager." },
    { name: "Snow",          image: "textures/hp/more_paintings/items/snow_painting",         variants: 1, desc: "Serene winter and snow landscape paintings.",                              obtain: "Trade with Artist Villager." },
    { name: "Steampunk",     image: "textures/hp/more_paintings/items/steampunk_painting",    variants: 1, desc: "Victorian-era steampunk machinery and aesthetic.",                         obtain: "Trade with Artist Villager." },
    { name: "Superheroes",   image: "textures/hp/more_paintings/items/superheroes_painting",  variants: 2, desc: "Heroic superhero-themed artwork in comic book style.",                     obtain: "Trade with Artist Villager." },
    { name: "Tiny",          image: "textures/hp/more_paintings/items/tiny_painting",         variants: 4, desc: "Miniature-sized paintings in tiny decorative frames.",                     obtain: "Trade with Artist Villager." },
    { name: "Zombies",       image: "textures/hp/more_paintings/items/zombie_painting",       variants: 1, desc: "Undead zombie apocalypse themed horror artwork.",                          obtain: "Trade with Artist Villager." },
];

const TOOLS = [
    {
        name: "Hammer",
        image: "textures/hp/more_paintings/items/special_tool",
        desc: "Tool for changing the shape of furniture.",
        func: "Changes the shape variant of a furniture to a different available form.",
        where: "All furniture that has shape variants.",
        obtain: "Craft at the Art Bench, or find in Artist Villager House chest."
    },
    {
        name: "Chisel",
        image: "textures/hp/more_paintings/items/chisel",
        desc: "Tool for changing the shape of statues.",
        func: "When used on a statue furniture, cycles through different cool statue shapes.",
        where: "Statue furniture.",
        obtain: "Craft at the Art Bench."
    },
    {
        name: "Painting Brush",
        image: "textures/hp/more_paintings/items/painting_brush",
        desc: "Tool for changing the color of furniture.",
        func: "Changes the color variant of a furniture to a different available color.",
        where: "All furniture that has color variants.",
        obtain: "Craft at the Art Bench."
    },
    {
        name: "Spray Can",
        image: "textures/hp/more_paintings/items/spray_can",
        desc: "Spray paint particles onto blocks in any of 16 dye colors.",
        func: "Spray colored particles; adjustable shape, size, and density. Combine with Stencil for precise art.",
        where: "Any block surface.",
        obtain: "Craft at the Art Bench. Available in 16 dye colors."
    },
    {
        name: "Stencil",
        image: "textures/hp/more_paintings/items/stencil",
        desc: "Mask tool for creating sharp-edged spray patterns.",
        func: "Place on a flat surface to mask the spray area, then use the Spray Can through it.",
        where: "Any flat block surface.",
        obtain: "Craft at the Art Bench."
    },
];

const DISPLAY_CASES = [
    {
        name: "Display Case",
        image: "textures/hp/more_paintings/items/display_case",
        desc: "Standard single-block display case.",
        func: "Mounts a 1x1 painting on the wall.",
        obtain: "Craft at Crafting table.",
        variants: "6 wood frame variants: Oak, Spruce, Birch, Jungle, Acacia, Dark Oak."
    },
    {
        name: "Wide",
        image: "textures/hp/more_paintings/items/display_case_wide",
        desc: "Wide horizontal display case for panoramic artwork.",
        func: "Mounts a 2x1 wide painting on the wall.",
        obtain: "Craft at Crafting table.",
        variants: "6 wood frame variants."
    },
    {
        name: "Big",
        image: "textures/hp/more_paintings/items/display_case_big",
        desc: "Large square display case for bigger artwork.",
        func: "Mounts a 2x2 large painting on the wall.",
        obtain: "Craft at Crafting table.",
        variants: "6 wood frame variants."
    },
    {
        name: "Tall",
        image: "textures/hp/more_paintings/items/display_case_tall",
        desc: "Tall vertical display case for portrait paintings.",
        func: "Mounts a 1x2 tall painting on the wall.",
        obtain: "Craft at Crafting table.",
        variants: "6 wood frame variants."
    },
    {
        name: "Wide 2",
        image: "textures/hp/more_paintings/items/display_case_wide2",
        desc: "Extra-wide display case for very wide paintings.",
        func: "Mounts a 3x1 extra-wide painting on the wall.",
        obtain: "Craft at Crafting table.",
        variants: "6 wood frame variants."
    },
    {
        name: "Huge",
        image: "textures/hp/more_paintings/items/display_case_huge",
        desc: "The largest display case for the most impressive artwork.",
        func: "Mounts a 3x2 huge painting on the wall.",
        obtain: "Craft at Crafting table.",
        variants: "6 wood frame variants."
    },
];

const FURNITURES = [
    {
        name: "Easel Stand",
        image: "textures/hp/more_paintings/items/easel_stand",
        desc: "An artist's easel for displaying or working on paintings.",
        func: "Display a painting on it; works as a decorative stand.",
        obtain: "Craft at Crafting table.",
        variants: "3 wood color variants."
    },
    {
        name: "Art Bench",
        image: "textures/hp/more_paintings/items/art_bench",
        desc: "Primary crafting station for all art-related items.",
        func: "Craft tools, furniture, and art supplies.",
        obtain: "Craft with Planks and Sticks.",
        variants: "No color variants."
    },
    {
        name: "Art Chair",
        image: "textures/hp/more_paintings/items/art_chair",
        desc: "Decorative artist chair that can be sat on.",
        func: "Sittable decoration, great for art studio setups.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple fabric and wood color variants."
    },
    {
        name: "Cabinet",
        image: "textures/hp/more_paintings/items/cabinet",
        desc: "Decorative storage cabinet for art studios.",
        func: "Purely decorative; no container functionality.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple wood and color variants."
    },
    {
        name: "Vase",
        image: "textures/hp/more_paintings/items/vase",
        desc: "Elegant decorative vase for art room aesthetics.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple color variants."
    },
    {
        name: "Brush Holder",
        image: "textures/hp/more_paintings/items/brush_holder_cup",
        desc: "Small cup for displaying paintbrushes on a desk.",
        func: "Decorative desk accessory.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple color variants."
    },
    {
        name: "Brush Cleaner",
        image: "textures/hp/more_paintings/items/brush_cleaner_cup",
        desc: "Water jar used for cleaning paintbrushes.",
        func: "Decorative desk piece.",
        obtain: "Craft at Crafting table.",
        variants: "Clear and tinted variants."
    },
    {
        name: "Color Bucket",
        image: "textures/hp/more_paintings/items/color_bucket",
        desc: "A bucket overflowing with paint.",
        func: "Decorative; emits paint drip particles when placed.",
        obtain: "Craft at Crafting table.",
        variants: "16 dye color variants."
    },
    {
        name: "Marker Set",
        image: "textures/hp/more_paintings/items/marker_set",
        desc: "A decorative set of art markers for a desk.",
        func: "Purely decorative desk accessory.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple color variants."
    },
    {
        name: "Stool",
        image: "textures/hp/more_paintings/items/stool",
        desc: "A round wooden stool for sitting or as a prop.",
        func: "Sittable decoration.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple wood color variants."
    },
    {
        name: "Artist Box",
        image: "textures/hp/more_paintings/items/artist_box",
        desc: "A portable artist's storage box for supplies.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple color variants."
    },
    {
        name: "Canvas",
        image: "textures/hp/more_paintings/items/canvas",
        desc: "A blank canvas on a small frame stand.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "No color variants."
    },
    {
        name: "Sculpture Stand",
        image: "textures/hp/more_paintings/items/sculpture_stand",
        desc: "A pedestal stand for displaying sculptures.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple height and material variants."
    },
    {
        name: "Statue Painting",
        image: "textures/hp/more_paintings/items/artist_statue",
        desc: "A decorative artist statue.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple pose variants."
    },
    {
        name: "Unfinished Wooden Block",
        image: "textures/hp/more_paintings/items/unfinished_wooden_block",
        desc: "A rough wooden block mid-carving, as a sculptor's prop.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "No color variants."
    },
    {
        name: "Window",
        image: "textures/hp/more_paintings/items/window",
        desc: "A decorative window frame for studio walls.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple frame color variants."
    },
    {
        name: "Big Window",
        image: "textures/hp/more_paintings/items/window_big",
        desc: "A larger decorative window frame.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple frame color variants."
    },
    {
        name: "Spray Table",
        image: "textures/hp/more_paintings/items/spray_table",
        desc: "A table workspace for spray painting and art projects.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "No color variants."
    },
    {
        name: "Brushes Set",
        image: "textures/hp/more_paintings/items/brushes_set",
        desc: "A grouped display of various artist paintbrushes.",
        func: "Purely decorative desk accessory.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple color variants."
    },
    {
        name: "Brush Cleaner Jar",
        image: "textures/hp/more_paintings/items/brush_cleaner_jar",
        desc: "A jar-style brush cleaning container.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "Clear and tinted variants."
    },
    {
        name: "Brush on Shelf",
        image: "textures/hp/more_paintings/items/brush_on_shelf",
        desc: "Paintbrushes displayed on a wall shelf.",
        func: "Purely decorative wall-mounted prop.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple color variants."
    },
    {
        name: "Paint Tubes",
        image: "textures/hp/more_paintings/items/paint_tubes",
        desc: "A cluster of squeezed paint tubes on a surface.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple color variants."
    },
    {
        name: "Tube Paint",
        image: "textures/hp/more_paintings/items/tube_paint",
        desc: "A single large decorative paint tube.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "16 dye color variants."
    },
    {
        name: "Variant Paint Bottle",
        image: "textures/hp/more_paintings/items/variant_paint_bottle",
        desc: "A small colored paint bottle.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "16 dye color variants."
    },
    {
        name: "Lying Bottle Color",
        image: "textures/hp/more_paintings/items/lying_bottle_color",
        desc: "A paint bottle lying on its side, spilling color.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "16 dye color variants."
    },
    {
        name: "Color Splash",
        image: "textures/hp/more_paintings/items/color_splash",
        desc: "A decorative splatter of paint on the floor.",
        func: "Purely decorative floor decal.",
        obtain: "Craft at Crafting table.",
        variants: "16 dye color variants."
    },
    {
        name: "Color Swatch",
        image: "textures/hp/more_paintings/items/color_swatch",
        desc: "A fan of paint color swatches.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple color variants."
    },
    {
        name: "Powder Jar",
        image: "textures/hp/more_paintings/items/powder_jar",
        desc: "A jar filled with colored powder pigment.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "16 dye color variants."
    },
    {
        name: "Pencil Set",
        image: "textures/hp/more_paintings/items/pencil_set",
        desc: "A cup holding a set of colored pencils.",
        func: "Purely decorative desk accessory.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple color variants."
    },
    {
        name: "Sketchbook",
        image: "textures/hp/more_paintings/items/sketch_book",
        desc: "A spiral-bound sketchbook propped open.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "No color variants."
    },
    {
        name: "Chalk & Charcoal",
        image: "textures/hp/more_paintings/items/chalk_and_charcoal",
        desc: "A box of chalk and charcoal drawing sticks.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "No color variants."
    },
    {
        name: "Soft Pastel Box",
        image: "textures/hp/more_paintings/items/soft_pastel_box",
        desc: "An open box of soft pastel chalk sticks.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "No color variants."
    },
    {
        name: "Drafting Tools",
        image: "textures/hp/more_paintings/items/drafting_tools",
        desc: "Technical drawing and drafting instruments.",
        func: "Purely decorative desk accessory.",
        obtain: "Craft at Crafting table.",
        variants: "No color variants."
    },
    {
        name: "Drawing Tube",
        image: "textures/hp/more_paintings/items/drawing_tube",
        desc: "A cylindrical tube for storing rolled drawings or blueprints.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple color variants."
    },
    {
        name: "Art Knives",
        image: "textures/hp/more_paintings/items/art_knives",
        desc: "A set of precision art and palette knives.",
        func: "Purely decorative desk accessory.",
        obtain: "Craft at Crafting table.",
        variants: "No color variants."
    },
    {
        name: "Spatula",
        image: "textures/hp/more_paintings/items/spatula",
        desc: "A palette spatula for mixing paints.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "No color variants."
    },
    {
        name: "Eraser & Sharpener",
        image: "textures/hp/more_paintings/items/eraser_sharpener",
        desc: "A decorative eraser and pencil sharpener set.",
        func: "Purely decorative desk accessory.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple color variants."
    },
    {
        name: "Sewing Kit",
        image: "textures/hp/more_paintings/items/sewing_kit",
        desc: "A sewing kit with threads used in textile art.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple color variants."
    },
    {
        name: "Jewellery Components",
        image: "textures/hp/more_paintings/items/jewellery_components",
        desc: "Small jewellery-making components and beads.",
        func: "Purely decorative.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple color variants."
    },
    {
        name: "Sack of Concrete",
        image: "textures/hp/more_paintings/items/sack_of_concrete",
        desc: "A sack of concrete (beton) for sculpture work.",
        func: "Purely decorative prop.",
        obtain: "Craft at Crafting table.",
        variants: "No color variants."
    },
];

const PLANTERS = [
    {
        name: "Round",
        image: "textures/hp/more_paintings/items/round_planter",
        desc: "Small round planter pot for indoor plants.",
        func: "Decorative planter.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple pot color and plant variants."
    },
    {
        name: "Large",
        image: "textures/hp/more_paintings/items/large_planter",
        desc: "Bigger floor planter for larger indoor plants.",
        func: "Decorative planter.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple pot color and plant variants."
    },
    {
        name: "Wide",
        image: "textures/hp/more_paintings/items/wide_planter",
        desc: "Long rectangular planter pot, ideal as a windowsill planter.",
        func: "Decorative planter.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple pot color and plant variants."
    },
    {
        name: "Thin",
        image: "textures/hp/more_paintings/items/thin_planter",
        desc: "Slim tall planter pot for slender plants.",
        func: "Decorative planter.",
        obtain: "Craft at Crafting table.",
        variants: "Multiple pot color and plant variants."
    },
    {
        name: "Grass Plant",
        image: "textures/hp/more_paintings/items/grass_plant",
        desc: "Decorative potted ornamental grass plants.",
        func: "Decorative plant.",
        obtain: "Craft at Crafting table.",
        variants: "6 grass type variants."
    },
    {
        name: "Foxglove",
        image: "textures/hp/more_paintings/items/foxglove_plant",
        desc: "A decorative animated foxglove flower plant.",
        func: "Decorative animated plant.",
        obtain: "Craft at Crafting table.",
        variants: "4 stages x 4 color variants (pink, purple, white, orange)."
    },
    {
        name: "Rose Bush",
        image: "textures/hp/more_paintings/items/rose_bush",
        desc: "A decorative rose bush with blooming flowers.",
        func: "Decorative plant.",
        obtain: "Craft at Crafting table.",
        variants: "3 stages x 4 color variants (pink, red, white, yellow)."
    },
];

const STENCILS = [
    {
        name: "Stencil",
        image: "textures/hp/more_paintings/items/stencil",
        desc: "A placeable stencil mask for spray painting.",
        func: "Place on a flat surface, then use the Spray Can through it for precise patterns.",
        obtain: "Craft at the Art Bench.",
        variants: "Multiple shape variants."
    },
];

// ══════════════════════════════════════════════════════
//  FORMAT FUNCTIONS
// ══════════════════════════════════════════════════════

function formatPainting(p) {
    return (
        "§6§l" + p.name + "\n\n" +
        "§eVariants: §f" + p.variants + "\n\n" +
        "§eDescription:\n§f" + p.desc + "\n\n" +
        "§eHow to Obtain:\n§f" + p.obtain
    );
}

function formatTool(t) {
    return (
        "§6§l" + t.name + "\n\n" +
        "§eDescription:\n§f" + t.desc + "\n\n" +
        "§eFunction:\n§f" + t.func + "\n\n" +
        "§eWhere to Use:\n§f" + t.where + "\n\n" +
        "§eHow to Obtain:\n§f" + t.obtain
    );
}

function formatFurniture(f) {
    return (
        "§6§l" + f.name + "\n\n" +
        "§eDescription:\n§f" + f.desc + "\n\n" +
        (f.func ? "§eFunction:\n§f" + f.func + "\n\n" : "") +
        "§eHow to Obtain:\n§f" + f.obtain + "\n\n" +
        "§eVariants:\n§f" + f.variants
    );
}

// ══════════════════════════════════════════════════════
//  MAIN GUIDE MENU
// ══════════════════════════════════════════════════════
function openGuideMain(player) {
    navMenu(player,
        "More Paintings Guide",
        "§fSelect a category:\n",
        [
            {
                text: "§ePaintings",
                image: "textures/ui/painting_ui",
                command: () => itemListMenu(
                    player,
                    "All Paintings",
                    "§fSelect a painting to see details:\n",
                    PAINTINGS,
                    formatPainting,
                    () => openGuideMain(player)
                )
            },
            {
                text: "§eTools",
                image: "textures/ui/tool_ui",
                command: () => itemListMenu(
                    player,
                    "All Tools",
                    "§fSelect a tool to see details:\n",
                    TOOLS,
                    formatTool,
                    () => openGuideMain(player)
                )
            },
            {
                text: "§eFurnitures",
                image: "textures/ui/furniture_ui",
                command: () => openFurnituresMenu(player)
            },
            {
                text: "§eMobs",
                image: "textures/ui/mobs_ui",
                command: () => openMobsMenu(player)
            },
            {
                text: "§eStructures",
                image: "textures/ui/structures_ui",
                command: () => openStructuresMenu(player)
            },
            {
                text: "§8Close",
                image: "textures/ui/back_ui",
                command: () => {}
            }
        ]
    );
}

// ══════════════════════════════════════════════════════
//  FURNITURES  — Main → Furnitures → [Display Cases | Furnitures] → each detail
// ══════════════════════════════════════════════════════
function openFurnituresMenu(player) {
    navMenu(player,
        "Furnitures",
        "§fSelect a furniture category:\n",
        [
            {
                text: "§eDisplay Cases",
                image: "textures/hp/more_paintings/items/display_case",
                command: () => itemListMenu(
                    player,
                    "Display Cases",
                    "§fSelect a display case to see details:\n",
                    DISPLAY_CASES,
                    formatFurniture,
                    () => openFurnituresMenu(player)
                )
            },
            {
                text: "§eFurnitures",
                image: "textures/hp/more_paintings/items/easel_stand",
                command: () => itemListMenu(
                    player,
                    "All Furnitures",
                    "§fSelect a furniture to see details:\n",
                    FURNITURES,
                    formatFurniture,
                    () => openFurnituresMenu(player)
                )
            },
            {
                text: "§ePlanter",
                image: "textures/hp/more_paintings/items/round_planter",
                command: () => itemListMenu(
                    player,
                    "All Planters",
                    "§fSelect a planter or plant to see details:\n",
                    PLANTERS,
                    formatFurniture,
                    () => openFurnituresMenu(player)
                )
            },
            {
                text: "§eStencil",
                image: "textures/hp/more_paintings/items/stencil",
                command: () => itemListMenu(
                    player,
                    "All Stencils",
                    "§fSelect a stencil to see details:\n",
                    STENCILS,
                    formatFurniture,
                    () => openFurnituresMenu(player)
                )
            }
        ],
        () => openGuideMain(player)
    );
}

// ══════════════════════════════════════════════════════
//  MOBS  — Main → Mobs → Artist Villager → detail
// ══════════════════════════════════════════════════════
function openMobsMenu(player) {
    navMenu(player,
        "Mobs",
        "§fSelect a mob to learn about:\n",
        [
            {
                text: "§eArtist Villager",
                image: "textures/hp/more_paintings/items/artist_villager_egg_spawn",
                command: () => infoPage(
                    player,
                    "§6Artist Villager",
                    "§6§lArtist Villager\n\n" +
                    "§eVariants: §f20 combinations\n" +
                    "§f(5 profession styles x 4 skin tones)\n\n" +
                    "§eDescription:\n" +
                    "§fA unique NPC that lives in Artist Villager Houses. Wanders and paints during\n" +
                    "§fthe day, camouflages near danger at night, and can be zombified when attacked.\n\n" +
                    "§eFunction:\n" +
                    "§fTrade with the Artist Villager to obtain exclusive §ePaintings §fand §eFurnitures§f.\n" +
                    "§fTrade level unlocks better deals the more you trade.",
                    () => openMobsMenu(player)
                )
            }
        ],
        () => openGuideMain(player)
    );
}

// ══════════════════════════════════════════════════════
//  STRUCTURES  — Main → Structures → Artist Villager House → detail
// ══════════════════════════════════════════════════════
function openStructuresMenu(player) {
    navMenu(player,
        "Structures",
        "§fSelect a structure to learn about:\n",
        [
            {
                text: "§eArtist House",
                image: "textures/hp/more_paintings/items/artist_box",
                command: () => infoPage(
                    player,
                    "§6Artist Villager House",
                    "§6§lArtist Villager House\n\n" +
                    "§eWhat is it?\n" +
                    "§fA naturally-generating structure that serves as the home of the Artist Villager.\n\n" +
                    "§eSpawn Biomes:\n" +
                    "§a- Plains\n" +
                    "§a- Sunflower Plains\n" +
                    "§a- Meadow\n\n" +
                    "§eContents:\n" +
                    "§f- 1 Artist Villager NPC\n" +
                    "§f- Art furniture and decorations\n" +
                    "§f- Loot chest (art supplies & paintings)\n" +
                    "§f- Easel stands and art workstations\n\n" +
                    "§eTip:\n" +
                    "§fTrade with the Artist Villager inside for exclusive painting deals!",
                    () => openStructuresMenu(player)
                )
            }
        ],
        () => openGuideMain(player)
    );
}

// ══════════════════════════════════════════════════════
//  EVENT LISTENER
// ══════════════════════════════════════════════════════
mc.world.afterEvents.itemUse.subscribe(arg => {
    const player = arg.source;
    const item = arg.itemStack;
    if (item.typeId === "hp4_paint:guide_tablet") {
        openGuideMain(player);
    }
});


