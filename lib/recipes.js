
export const npcPrices = {
  "COBBLESTONE": 1,
  "DIAMOND": 8,
  "IRON_INGOT": 3,
};

export const recipes = {
  "ENCHANTED_COBBLESTONE": { inputs: { "COBBLESTONE": 160 } },
  "ENCHANTED_DIAMOND": { inputs: { "DIAMOND": 160 } },
  "ENCHANTED_IRON": { inputs: { "IRON_INGOT": 160 } },
  "ENCHANTED_DIAMOND_BLOCK": { inputs: { "ENCHANTED_DIAMOND": 160 } },
};

export function computeCraftCost(id, bazaar, memo = {}) {
  if (memo[id] !== undefined) return memo[id];

  if (!recipes[id]) {
    const product = bazaar[id];
    if (product) {
      const price = product.quick_status.buyPrice;
      memo[id] = price;
      return price;
    }
    if (npcPrices[id]) {
      memo[id] = npcPrices[id];
      return npcPrices[id];
    }
    memo[id] = null;
    return null;
  }

  let total = 0;
  for (const mat in recipes[id].inputs) {
    const qty = recipes[id].inputs[mat];
    const matCost = computeCraftCost(mat, bazaar, memo);
    if (matCost == null) return null;
    total += matCost * qty;
  }
  memo[id] = total;
  return total;
}
