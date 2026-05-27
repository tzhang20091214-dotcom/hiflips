
import { useEffect, useState } from "react";
import { recipes, computeCraftCost, npcPrices } from "../lib/recipes";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [sortKey, setSortKey] = useState("profitPercent");
  const [minVolume, setMinVolume] = useState(0);
  const [minMargin, setMinMargin] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/bazaar");
    const data = await res.json();
    const bazaar = data.products;

    const rows = [];
    for (const id in bazaar) {
      const q = bazaar[id].quick_status;
      const buy = q.buyPrice;
      const sell = q.sellPrice;
      if (buy <= 0) continue;

      const profit = sell - buy;
      const profitPercent = (profit / buy) * 100;

      const craftCost = computeCraftCost(id, bazaar) ?? null;
      const craftProfit = craftCost != null ? sell - craftCost : null;

      const npcSell = npcPrices[id] ?? null;
      const npcProfit = npcSell != null ? npcSell - buy : null;

      rows.push({
        id,
        buy,
        sell,
        profit,
        profitPercent,
        volume: q.sellVolume,
        craftCost,
        craftProfit,
        npcSell,
        npcProfit,
      });
    }

    setProducts(rows);
  }

  const filtered = products
    .filter(p => p.volume >= minVolume)
    .filter(p => p.profitPercent >= minMargin);

  const sorted = [...filtered].sort((a, b) => {
    return (b[sortKey] ?? -999999) - (a[sortKey] ?? -999999);
  });

  function header(label, key) {
    return (
      <th
        className="px-4 py-2 cursor-pointer hover:text-blue-400"
        onClick={() => setSortKey(key)}
      >
        {label}
      </th>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-2">Hypixel Bazaar Flips</h1>
      <p className="text-gray-400 mb-6">
        Buy orders → sell offers, crafting profit, NPC profit, filters & sorting.
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="number"
          placeholder="Min Volume"
          className="px-3 py-2 bg-gray-800 rounded"
          value={minVolume}
          onChange={e => setMinVolume(Number(e.target.value) || 0)}
        />
        <input
          type="number"
          placeholder="Min Profit %"
          className="px-3 py-2 bg-gray-800 rounded"
          value={minMargin}
          onChange={e => setMinMargin(Number(e.target.value) || 0)}
        />
        <button
          onClick={load}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded">
          <thead className="bg-gray-700">
            <tr>
              {header("Item", "id")}
              {header("Buy", "buy")}
              {header("Sell", "sell")}
              {header("Profit /u", "profit")}
              {header("Profit %", "profitPercent")}
              {header("Volume", "volume")}
              {header("Craft Profit", "craftProfit")}
              {header("NPC Sell", "npcSell")}
              {header("NPC Profit", "npcProfit")}
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => (
              <tr key={p.id} className="hover:bg-gray-700">
                <td className="px-4 py-2">{p.id}</td>
                <td className="px-4 py-2">{p.buy.toFixed(2)}</td>
                <td className="px-4 py-2">{p.sell.toFixed(2)}</td>
                <td className="px-4 py-2">{p.profit.toFixed(2)}</td>
                <td className="px-4 py-2">{p.profitPercent.toFixed(2)}%</td>
                <td className="px-4 py-2">{p.volume}</td>
                <td className="px-4 py-2">
                  {p.craftProfit != null ? p.craftProfit.toFixed(2) : "-"}
                </td>
                <td className="px-4 py-2">
                  {p.npcSell != null ? p.npcSell.toFixed(2) : "-"}
                </td>
                <td className="px-4 py-2">
                  {p.npcProfit != null ? p.npcProfit.toFixed(2) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
