```meta-bind-js-view  
{HwayoungMiniSheetConfig#strMod} as strMod
{HwayoungMiniSheetConfig#adarinBab} as bab
{hasted} as hasted  
{atkAdjust} as atkAdjust
{dmgAdjust} as dmgAdjust
{rangedAtkAdjust} as rangedAtkAdjust
{rangedDmgAdjust} as rangedDmgAdjust
{biteAtkAdjust} as biteAtkAdjust
{biteDmgAdjust} as biteDmgAdjust
{charging} as charging
{conditionEffects} as conditionEffects
{size} as size
save to {HwayoungMiniSheetConfig#attackStrings}
hidden
---  
// Parse and cache all inputs
const stats = {
    str: context.bound.strMod || 0,
    dex: context.bound.dexMod || 0,
    bab: context.bound.bab || 0
};

const adjustments = {
    atk: parseInt(context.bound.atkAdjust) || 0,
    dmg: parseInt(context.bound.dmgAdjust) || 0,
    rangedAtk: parseInt(context.bound.rangedAtkAdjust) || 0,
    rangedDmg: parseInt(context.bound.rangedDmgAdjust) || 0,
    biteAtk: parseInt(context.bound.biteAtkAdjust) || 0,
    biteDmg: parseInt(context.bound.biteDmgAdjust) || 0
};

const flags = {
    charging: context.bound.charging || false,
    hasted: context.bound.hasted || false
};

const options = {
    size: context.bound.size || "Tiny"
};

const conditionEffects = context.bound.conditionEffects || { meleeAtkAdjust: 0, rangedAtkAdjust: 0 };

// --------------------------------
// Utility Functions
// --------------------------------

const getSizeAdjustments = (size) => {
    const sizeAdjustments = {
        Fine: { atkBonus: 8 },
        Diminutive: { atkBonus: 4 },
        Tiny: { atkBonus: 2},
        Small: { atkBonus: 1},
        Medium: { atkBonus: 0},
        Large: { atkBonus: -1},
        Huge: { atkBonus: -2}
    };
    return sizeAdjustments[size] || sizeAdjustments.Tiny;
};

const getBiteDamageDie = (size) => {
    const biteDamage = {
        Fine: "1",
        Diminutive: "1d2",
        Tiny: "1d3",
        Small: "1d4",
        Medium: "1d6",
        Large: "1d8",
        Huge: "2d6"
    };
    return biteDamage[size] || biteDamage.Tiny;
};

const formatAttackBonus = (bonus) => bonus >= 0 ? `+${bonus}` : `${bonus}`;

const calculateAttacks = (baseAttackBonus, bab, isHasted) => {
    let attacks = [];
    
    if (isHasted) attacks.push(baseAttackBonus);
    
    attacks.push(baseAttackBonus);
    
    // Add iterative attacks based on BAB
    for (let i = 6; i <= bab; i += 5) {
        attacks.push(baseAttackBonus - (i - 1));
    }
    
    return attacks;
};

const formatAttackStrings = (standardBonus, damageString, critInfo, attacks, touchAttack = false) => {
    const touchText = touchAttack ? " (touch)" : "";
    const damageText = damageString ? ` (${damageString})` : "";
    const standardAttack = `${formatAttackBonus(standardBonus)}${touchText}${damageText}${critInfo}`;
    const fullAttackString = attacks.map(formatAttackBonus).join('/');
    const fullAttack = `${fullAttackString}${touchText}${damageText}${critInfo}`;
    
    return { standard: standardAttack, full: fullAttack };
};

const createAttack = (params) => {
    const attackBonus = params.baseAttackBonus + params.attackStat + params.sizeAdjustment.atkBonus + 
                      params.hasteBonus + params.atkAdjust + params.chargeBonus + params.conditionAdjust;
    
    const damageBonus = params.damageStat + params.dmgAdjust;
    
    // Create damage string
    let damageString;
    if (params.damageDie === "") {
        // For rays, show only bonus damage if any exists
        damageString = damageBonus > 0 ? `+${damageBonus}` : "";
    } else {
        damageString = `${params.damageDie}${damageBonus >= 0 ? '+' : ''}${damageBonus}`;
    }
    
    const critInfo = ` (${params.critRange}/x${params.critMultiplier})`;
    
    return { attackBonus, damageString, critInfo };
};

// --------------------------------
// Calculate Common Values
// --------------------------------
const sizeAdjustment = getSizeAdjustments(options.size);
const hasteBonus = flags.hasted ? 1 : 0;
const chargeBonus = flags.charging ? 2 : 0;

// --------------------------------
// Create Attacks
// --------------------------------

// Common attack parameters
const baseParams = {
    baseAttackBonus: stats.bab,
    sizeAdjustment,
    hasteBonus
};

// BITE ATTACK
const biteAttack = createAttack({
    ...baseParams,
    damageDie: getBiteDamageDie(options.size),
    critRange: "20",
    critMultiplier: "2",
    attackStat: stats.dex, // Bite uses STR for attack
    damageStat: stats.str, // Bite uses STR for damage
    atkAdjust: adjustments.biteAtk,
    dmgAdjust: adjustments.biteDmg,
    chargeBonus,
    conditionAdjust: conditionEffects.meleeAtkAdjust || 0
});

const biteAttacks = calculateAttacks(biteAttack.attackBonus, stats.bab, flags.hasted);
const biteAttackStrings = formatAttackStrings(biteAttack.attackBonus, biteAttack.damageString, biteAttack.critInfo, biteAttacks);
// RAY ATTACK
const rayAttack = createAttack({
    ...baseParams,
    damageDie: "", // Rays typically don't have base damage
    critRange: "20",
    critMultiplier: "2",
    attackStat: stats.dex, // Rays use DEX for attack
    damageStat: 0, // Rays typically don't add ability modifier to damage
    atkAdjust: adjustments.rangedAtk,
    dmgAdjust: adjustments.rangedDmg,
    chargeBonus: 0, // Can't charge with ranged attacks
    conditionAdjust: conditionEffects.rangedAtkAdjust || 0
});

const rayAttacks = calculateAttacks(rayAttack.attackBonus, stats.bab, flags.hasted);
const rayAttackStrings = formatAttackStrings(rayAttack.attackBonus, rayAttack.damageString, rayAttack.critInfo, rayAttacks, true);

// --------------------------------
// Format Output
// --------------------------------
const formatWeaponOutput = (attackStrings) => 
    `**Standard Attack:** ${attackStrings.standard}\n**Full Attack:** ${attackStrings.full}`;

return {
    bite: formatWeaponOutput(biteAttackStrings),
    ray: formatWeaponOutput(rayAttackStrings)
};
```