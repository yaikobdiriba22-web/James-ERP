/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { HardDrive, Plus, AlertCircle, TrendingDown } from "lucide-react";
import { Asset } from "../../types";

interface AssetsModuleProps {
  assets: Asset[];
  token: string | null;
  onRefreshData: () => void;
  darkMode: boolean;
}

export default function AssetsModule({
  assets,
  token,
  onRefreshData,
  darkMode,
}: AssetsModuleProps) {
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(assets[0] || null);
  const [showAddAsset, setShowAddAsset] = React.useState(false);

  // States for Add Asset Form
  const [assetName, setAssetName] = React.useState("");
  const [assetCategory, setAssetCategory] = React.useState<"IT Equipment" | "Vehicles" | "Machinery" | "Real Estate" | "Office Furniture">("Machinery");
  const [assetCost, setAssetCost] = React.useState("");
  const [salvageVal, setSalvageVal] = React.useState("");
  const [usefulLife, setUsefulLife] = React.useState("10");
  const [purchaseDate, setPurchaseDate] = React.useState("");
  const [assetStatusMsg, setAssetStatusMsg] = React.useState("");

  // Submit Asset
  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !assetCost || !purchaseDate) {
      setAssetStatusMsg("Required fields missing.");
      return;
    }

    try {
      const res = await fetch("/api/erp/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: assetName,
          category: assetCategory,
          cost: parseFloat(assetCost),
          salvageValue: parseFloat(salvageVal) || 0,
          usefulLifeYears: parseInt(usefulLife) || 10,
          acquisitionDate: purchaseDate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAssetStatusMsg("Corporate asset added to registers!");
        onRefreshData();
        setTimeout(() => {
          setShowAddAsset(false);
          setAssetName("");
          setAssetCost("");
          setSalvageVal("");
          setAssetStatusMsg("");
        }, 1500);
      } else {
        setAssetStatusMsg(data.error || "Failed to log asset.");
      }
    } catch (err) {
      setAssetStatusMsg("Network error logging asset.");
    }
  };

  // Straight line depreciation calculations
  const calculateDepreciationTimeline = (asset: Asset) => {
    const cost = asset.cost;
    const salvage = asset.salvageValue;
    const life = asset.usefulLifeYears;
    const annualExp = (cost - salvage) / life;
    
    const timeline = [];
    for (let year = 0; year <= life; year++) {
      const accumulated = annualExp * year;
      const bookValue = Math.max(salvage, cost - accumulated);
      timeline.push({ year, bookValue, accumulated });
    }
    return { timeline, annualExp };
  };

  const depResult = selectedAsset ? calculateDepreciationTimeline(selectedAsset) : null;

  // Render depreciation curve points to SVG space (width 400, height 180, padding 30)
  const mapY = (val: number, max: number) => 150 - (val / max) * 110;
  const mapX = (idx: number, total: number) => 35 + idx * (330 / total);

  const svgPoints = depResult && selectedAsset
    ? depResult.timeline.map((pt, i) => `${mapX(i, selectedAsset.usefulLifeYears)},${mapY(pt.bookValue, selectedAsset.cost)}`).join(" L ")
    : "";

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive size={22} className="text-blue-500" /> Corporate Assets & Amortization
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
            Track fixed infrastructure depreciation schedules and compute annual book value write-downs.
          </p>
        </div>
        <button
          onClick={() => setShowAddAsset(!showAddAsset)}
          className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95"
        >
          + Log New Asset
        </button>
      </div>

      {/* Add Asset Form popup */}
      {showAddAsset && (
        <form onSubmit={handleAssetSubmit} className={`p-4 rounded-xl border max-w-md animate-slide-down ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3">Register Corporate Asset</h4>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Asset Name</label>
                <input
                  type="text"
                  required
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="e.g. Isuzu Logistics Truck"
                  className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Asset Category</label>
                <select
                  value={assetCategory}
                  onChange={(e) => setAssetCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                >
                  <option value="Machinery">Machinery & Plant</option>
                  <option value="Vehicles">Logistics Vehicles</option>
                  <option value="Real Estate">Real Estate & Offices</option>
                  <option value="IT Equipment">IT Infrastructure</option>
                  <option value="Office Furniture">Office Furniture</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Original Cost (ETB)</label>
                <input
                  type="number"
                  required
                  value={assetCost}
                  onChange={(e) => setAssetCost(e.target.value)}
                  placeholder="e.g. 1500000"
                  className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 font-mono text-right"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Salvage Value</label>
                <input
                  type="number"
                  value={salvageVal}
                  onChange={(e) => setSalvageVal(e.target.value)}
                  placeholder="e.g. 200000"
                  className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 font-mono text-right"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Lifespan (Years)</label>
                <input
                  type="number"
                  value={usefulLife}
                  onChange={(e) => setUsefulLife(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 font-mono text-right"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono">Purchase Posting Date</label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
              />
            </div>

            {assetStatusMsg && (
              <p className="text-[10px] font-semibold text-cyan-400 mt-2 font-mono flex items-center gap-1">
                <AlertCircle size={10} /> {assetStatusMsg}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg">
                Record Asset
              </button>
              <button type="button" onClick={() => setShowAddAsset(false)} className="px-3 bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Assets directory table */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-mono font-bold uppercase tracking-wider ${darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                  <th className="p-3">Asset Classification</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Acquisition Cost</th>
                  <th className="p-3 text-center">Life Span</th>
                  <th className="p-3 text-center">Net Book Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assets.map((asset) => {
                  const netBookVal = asset.cost - asset.accumulatedDepreciation;
                  return (
                    <tr
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer ${
                        selectedAsset?.id === asset.id ? "bg-blue-50/30 dark:bg-blue-950/10 font-medium" : ""
                      }`}
                    >
                      <td className="p-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{asset.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">Acquired: {asset.acquisitionDate}</span>
                      </td>
                      <td className="p-3 uppercase text-slate-600 dark:text-slate-300 font-medium text-[10px] font-mono">
                        {asset.category}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold">{asset.cost.toLocaleString()} ETB</td>
                      <td className="p-3 text-center font-mono font-medium">{asset.usefulLifeYears} Years</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-800 dark:text-slate-100">
                        {netBookVal.toLocaleString()} ETB
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Depreciation calculations Curve plotting details panel */}
        <div className="space-y-4">
          {selectedAsset && depResult ? (
            <div
              className={`p-5 rounded-2xl border ${
                darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <h3 className="text-sm font-bold font-display uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 flex items-center gap-1.5">
                <TrendingDown size={14} className="text-red-500" /> Depreciation Curves
              </h3>

              <div className="space-y-4">
                <div className="bg-slate-950/10 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/40 text-xs text-left">
                  <p className="font-bold text-slate-800 dark:text-white">{selectedAsset.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Annual Depreciation: <strong className="font-mono text-cyan-400">{depResult.annualExp.toLocaleString()} ETB / yr</strong>
                  </p>
                </div>

                {/* Draw depreciation line curve vector */}
                <div className="relative w-full h-44 mt-4 bg-slate-950/20 p-2 rounded-xl border border-slate-850/60 flex flex-col justify-between">
                  <span className="text-[8px] font-bold tracking-widest text-slate-400 font-mono block text-center uppercase">
                    Straight Line Decline (Book Value)
                  </span>

                  <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible mt-2">
                    {/* Grids */}
                    <line x1="35" y1="40" x2="365" y2="40" stroke="rgba(148,163,184,0.1)" strokeDasharray="3" />
                    <line x1="35" y1="95" x2="365" y2="95" stroke="rgba(148,163,184,0.1)" strokeDasharray="3" />
                    <line x1="35" y1="150" x2="365" y2="150" stroke="rgba(148,163,184,0.2)" />

                    {/* Shading fill */}
                    <path d={`M ${mapX(0, selectedAsset.usefulLifeYears)},150 L ${svgPoints} L ${mapX(selectedAsset.usefulLifeYears, selectedAsset.usefulLifeYears)},150 Z`} fill="rgba(220,38,38,0.03)" />

                    {/* Vector curve declining */}
                    <path d={`M ${svgPoints}`} fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />

                    {/* Dots markers */}
                    {depResult.timeline.map((pt, i) => (
                      <circle key={i} cx={mapX(i, selectedAsset.usefulLifeYears)} cy={mapY(pt.bookValue, selectedAsset.cost)} r="3" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1" />
                    ))}

                    {/* X-axis labels years */}
                    {depResult.timeline.filter((_, idx) => idx % 2 === 0 || idx === selectedAsset.usefulLifeYears).map((pt, idx) => (
                      <text key={idx} x={mapX(pt.year, selectedAsset.usefulLifeYears)} y="165" fontSize="7.5" fill="#94A3B8" textAnchor="middle" fontWeight="600" fontFamily="monospace">
                        Yr {pt.year}
                      </text>
                    ))}

                    {/* Net values labels */}
                    <text x="35" y="145" fontSize="7" fill="#10B981" textAnchor="start" fontWeight="600" fontFamily="monospace">
                      Salvage: {selectedAsset.salvageValue.toLocaleString()}
                    </text>
                    <text x="35" y="32" fontSize="7" fill="#94A3B8" textAnchor="start" fontWeight="600" fontFamily="monospace">
                      Cost: {selectedAsset.cost.toLocaleString()}
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-slate-400 text-xs font-semibold text-center">
              Select an asset on the table left to evaluate its declination schedules.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
