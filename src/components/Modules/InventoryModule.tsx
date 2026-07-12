/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Package,
  Plus,
  RefreshCw,
  QrCode,
  Printer,
  Barcode,
  Search,
  AlertCircle,
} from "lucide-react";
import { Product, Warehouse } from "../../types";

interface InventoryModuleProps {
  products: Product[];
  warehouses: Warehouse[];
  token: string | null;
  onRefreshData: () => void;
  darkMode: boolean;
}

export default function InventoryModule({
  products,
  warehouses,
  token,
  onRefreshData,
  darkMode,
}: InventoryModuleProps) {
  const [activeTab, setActiveTab] = React.useState<"catalog" | "warehouses">("catalog");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  // States for Add Product Form
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [prodName, setProdName] = React.useState("");
  const [prodSku, setProdSku] = React.useState("");
  const [prodCat, setProdCat] = React.useState("Agribusiness Products");
  const [prodPrice, setProdPrice] = React.useState("");
  const [prodCost, setProdCost] = React.useState("");
  const [prodStock, setProdStock] = React.useState("");
  const [prodWH, setProdWH] = React.useState(warehouses[0]?.id || "");
  const [reorderPoint, setReorderPoint] = React.useState("10");
  const [prodDesc, setProdDesc] = React.useState("");
  const [statusMsg, setStatusMsg] = React.useState("");

  // States for Stock Adjustment Form
  const [showAdjustForm, setShowAdjustForm] = React.useState(false);
  const [adjProdId, setAdjProdId] = React.useState(products[0]?.id || "");
  const [adjWH, setAdjWH] = React.useState(warehouses[0]?.id || "");
  const [adjQty, setAdjQty] = React.useState("");
  const [adjReason, setAdjReason] = React.useState("Physical Count Discrepancy");
  const [adjStatusMsg, setAdjStatusMsg] = React.useState("");

  // Submit Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodSku || !prodPrice) {
      setStatusMsg("Required fields missing.");
      return;
    }

    try {
      const res = await fetch("/api/erp/inventory/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: prodName,
          sku: prodSku,
          category: prodCat,
          price: prodPrice,
          cost: prodCost,
          initialStock: prodStock,
          warehouseId: prodWH,
          reorderPoint,
          description: prodDesc,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg("Product added to catalog!");
        onRefreshData();
        setTimeout(() => {
          setShowAddForm(false);
          setProdName("");
          setProdSku("");
          setProdPrice("");
          setProdCost("");
          setProdStock("");
          setProdDesc("");
          setStatusMsg("");
        }, 1500);
      } else {
        setStatusMsg(data.error || "Failed to add product.");
      }
    } catch (err) {
      setStatusMsg("Network error adding product.");
    }
  };

  // Submit Stock Adjustment
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjProdId || !adjQty) {
      setAdjStatusMsg("Required fields missing.");
      return;
    }

    try {
      const res = await fetch("/api/erp/inventory/adjust", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: adjProdId,
          warehouseId: adjWH,
          quantity: adjQty,
          reason: adjReason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAdjStatusMsg("Stock adjusted successfully!");
        onRefreshData();
        setTimeout(() => {
          setShowAdjustForm(false);
          setAdjQty("");
          setAdjStatusMsg("");
        }, 1500);
      } else {
        setAdjStatusMsg(data.error || "Failed to adjust stock.");
      }
    } catch (err) {
      setAdjStatusMsg("Network error adjusting stock.");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Package size={22} className="text-blue-500" /> Inventory & Stock Control
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
            Browse registered SKUs, generate labels, adjust warehouse levels, and perform transfers.
          </p>
        </div>

        {/* Modular Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-[#0F172A] rounded-xl border dark:border-slate-800/80 shrink-0">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "catalog"
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/10"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            Product Catalog
          </button>
          <button
            onClick={() => setActiveTab("warehouses")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "warehouses"
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/10"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            Warehouses List
          </button>
        </div>
      </div>

      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and action bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search catalog by SKU, name, or category..."
                  className={`w-full rounded-lg pl-9 pr-3 py-2 text-xs border outline-none focus:ring-1 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                  }`}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                >
                  + Add Product
                </button>
                <button
                  onClick={() => setShowAdjustForm(!showAdjustForm)}
                  className={`text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${
                    darkMode ? "border-slate-800 hover:bg-slate-800 text-slate-200" : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  Adjust Stock
                </button>
              </div>
            </div>

            {/* Forms overlays */}
            {showAddForm && (
              <form onSubmit={handleAddProduct} className={`p-5 rounded-2xl border animate-slide-down ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4 font-display">Add Catalog Product</h4>
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Product Name</label>
                      <input
                        type="text"
                        required
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="Premium Arabica..."
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">SKU ID Code</label>
                      <input
                        type="text"
                        required
                        value={prodSku}
                        onChange={(e) => setProdSku(e.target.value)}
                        placeholder="AGR-COF-01"
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Category</label>
                      <select
                        value={prodCat}
                        onChange={(e) => setProdCat(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="Agribusiness Products">Agribusiness</option>
                        <option value="Renewable Energy Equipment">Energy Equipment</option>
                        <option value="Packaging Materials">Packaging</option>
                        <option value="General Products">General Products</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Selling Price</label>
                      <input
                        type="number"
                        required
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        placeholder="e.g. 380"
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Cost Price</label>
                      <input
                        type="number"
                        value={prodCost}
                        onChange={(e) => setProdCost(e.target.value)}
                        placeholder="e.g. 210"
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Initial Qty</label>
                      <input
                        type="number"
                        value={prodStock}
                        onChange={(e) => setProdStock(e.target.value)}
                        placeholder="e.g. 1000"
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Warehouse Location</label>
                      <select
                        value={prodWH}
                        onChange={(e) => setProdWH(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                      >
                        {warehouses.map((wh) => (
                          <option key={wh.id} value={wh.id}>
                            {wh.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Reorder Limit</label>
                      <input
                        type="number"
                        value={reorderPoint}
                        onChange={(e) => setReorderPoint(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Description</label>
                    <textarea
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                      rows={2}
                    />
                  </div>

                  {statusMsg && (
                    <p className="text-[10px] font-semibold text-cyan-400 mt-2 font-mono flex items-center gap-1">
                      <AlertCircle size={10} /> {statusMsg}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg">
                      Save Product
                    </button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="px-3 bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {showAdjustForm && (
              <form onSubmit={handleAdjustStock} className={`p-5 rounded-2xl border animate-slide-down ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4 font-display">Inventory Stock Adjustment</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Select Product SKU</label>
                    <select
                      value={adjProdId}
                      onChange={(e) => setAdjProdId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 focus:outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Warehouse Location</label>
                      <select
                        value={adjWH}
                        onChange={(e) => setAdjWH(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                      >
                        {warehouses.map((wh) => (
                          <option key={wh.id} value={wh.id}>
                            {wh.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Adjusted Quantity (+ or -)</label>
                      <input
                        type="number"
                        value={adjQty}
                        onChange={(e) => setAdjQty(e.target.value)}
                        placeholder="e.g. 50 or -12"
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 font-mono text-right"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Reason for Adjustment</label>
                    <input
                      type="text"
                      value={adjReason}
                      onChange={(e) => setAdjReason(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500"
                    />
                  </div>

                  {adjStatusMsg && (
                    <p className="text-[10px] font-semibold text-cyan-400 mt-2 font-mono flex items-center gap-1">
                      <AlertCircle size={10} /> {adjStatusMsg}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg">
                      Submit Adjustment
                    </button>
                    <button type="button" onClick={() => setShowAdjustForm(false)} className="px-3 bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Catalog Table */}
            <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b font-mono font-bold uppercase tracking-wider ${darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    <th className="p-3">SKU / Item</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Selling Price</th>
                    <th className="p-3 text-center">In Stock</th>
                    <th className="p-3 text-center">Barcode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.map((p) => {
                    const totalQty = Object.values(p.stock).reduce((s, q) => s + q, 0);
                    const isLow = totalQty <= p.reorderPoint;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer ${
                          selectedProduct?.id === p.id ? "bg-blue-50/30 dark:bg-blue-950/10 font-medium" : ""
                        }`}
                      >
                        <td className="p-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                        <td className="p-3 text-right font-mono font-semibold">{p.price.toLocaleString()} ETB</td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                            isLow
                              ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 animate-pulse"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          }`}>
                            {totalQty.toLocaleString()} {isLow ? "Low Stock" : "OK"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Barcode size={16} className="text-slate-400 mx-auto" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side Drawer: Dynamic Barcode QR Generator and details */}
          <div className="space-y-4">
            <div
              className={`p-5 rounded-2xl border sticky top-20 text-center ${
                darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <h3 className="text-sm font-bold font-display uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                Asset Label Generator
              </h3>

              {selectedProduct ? (
                <div className="space-y-6">
                  {/* Item card */}
                  <div className="text-left bg-slate-950/10 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/40">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold leading-none">Selected SKU</p>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white mt-1 leading-tight">{selectedProduct.name}</h4>
                    <span className="text-[10px] text-cyan-400 font-mono font-semibold block mt-1">{selectedProduct.sku}</span>
                  </div>

                  {/* Draw Custom SVG Barcode */}
                  <div className="space-y-1 bg-white p-4 rounded-xl shadow-inner border border-slate-100 flex flex-col items-center">
                    <span className="text-[9px] font-bold tracking-wider font-mono text-slate-400 mb-1">UPC BARCODE LABEL</span>
                    <svg viewBox="0 0 160 50" className="w-40 h-12 overflow-visible">
                      {/* Drawing mock vertical lines of variable widths */}
                      <rect x="0" y="0" width="3" height="40" fill="#000" />
                      <rect x="5" y="0" width="1" height="40" fill="#000" />
                      <rect x="8" y="0" width="4" height="40" fill="#000" />
                      <rect x="14" y="0" width="2" height="40" fill="#000" />
                      <rect x="18" y="0" width="1" height="40" fill="#000" />
                      <rect x="21" y="0" width="3" height="40" fill="#000" />
                      <rect x="26" y="0" width="5" height="40" fill="#000" />
                      <rect x="33" y="0" width="2" height="40" fill="#000" />
                      <rect x="37" y="0" width="1" height="40" fill="#000" />
                      <rect x="40" y="0" width="4" height="40" fill="#000" />
                      <rect x="46" y="0" width="2" height="40" fill="#000" />
                      <rect x="50" y="0" width="3" height="40" fill="#000" />
                      <rect x="55" y="0" width="1" height="40" fill="#000" />
                      <rect x="58" y="0" width="4" height="40" fill="#000" />
                      <rect x="64" y="0" width="1" height="40" fill="#000" />
                      <rect x="67" y="0" width="2" height="40" fill="#000" />
                      <rect x="71" y="0" width="3" height="40" fill="#000" />
                      <rect x="76" y="0" width="1" height="40" fill="#000" />
                      <rect x="79" y="0" width="4" height="40" fill="#000" />
                      <rect x="85" y="0" width="2" height="40" fill="#000" />
                      {/* UPC check digits bottom */}
                      <text x="42" y="48" fontSize="6.5" fontFamily="monospace" letterSpacing="1">{selectedProduct.barcode}</text>
                    </svg>
                  </div>

                  {/* Draw Custom SVG QR Code block */}
                  <div className="space-y-1 bg-white p-4 rounded-xl shadow-inner border border-slate-100 flex flex-col items-center">
                    <span className="text-[9px] font-bold tracking-wider font-mono text-slate-400 mb-1">2D MATRIX QR CODE</span>
                    <svg viewBox="0 0 60 60" className="w-24 h-24 overflow-visible">
                      {/* Draw mock corner boxes */}
                      <rect x="0" y="0" width="16" height="16" fill="none" stroke="#000" strokeWidth="2" />
                      <rect x="4" y="4" width="8" height="8" fill="#000" />

                      <rect x="44" y="0" width="16" height="16" fill="none" stroke="#000" strokeWidth="2" />
                      <rect x="48" y="4" width="8" height="8" fill="#000" />

                      <rect x="0" y="44" width="16" height="16" fill="none" stroke="#000" strokeWidth="2" />
                      <rect x="4" y="48" width="8" height="8" fill="#000" />

                      {/* Random pixelated blocks */}
                      <rect x="20" y="2" width="4" height="4" fill="#000" />
                      <rect x="28" y="0" width="4" height="4" fill="#000" />
                      <rect x="36" y="2" width="4" height="4" fill="#000" />
                      <rect x="24" y="8" width="8" height="4" fill="#000" />
                      <rect x="36" y="10" width="4" height="4" fill="#000" />

                      <rect x="0" y="24" width="8" height="4" fill="#000" />
                      <rect x="12" y="20" width="4" height="8" fill="#000" />
                      <rect x="20" y="16" width="12" height="4" fill="#000" />
                      <rect x="24" y="24" width="4" height="4" fill="#000" />
                      <rect x="16" y="32" width="8" height="4" fill="#000" />

                      <rect x="36" y="20" width="8" height="4" fill="#000" />
                      <rect x="48" y="24" width="4" height="12" fill="#000" />
                      <rect x="32" y="32" width="8" height="8" fill="#000" />
                      <rect x="44" y="40" width="12" height="4" fill="#000" />

                      <text x="30" y="52" fontSize="5" fontFamily="monospace" textAnchor="middle">{selectedProduct.qrCode}</text>
                    </svg>
                  </div>

                  {/* Print triggers */}
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => alert("Forwarded label to Bole Head Office Warehouse Zebra Thermal Printer.")}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <Printer size={13} />
                      <span>Print Thermal Label</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-slate-400 text-xs font-semibold">
                  Click on any product in the catalog table to generate its unique asset labels.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TABS 2: WAREHOUSES LIST */}
      {activeTab === "warehouses" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in">
          {warehouses.map((wh) => {
            // Count total stock items inside this warehouse
            const whProducts = products.filter((p) => p.stock[wh.id] !== undefined);
            const totalStockCount = whProducts.reduce((sum, p) => sum + (p.stock[wh.id] || 0), 0);
            return (
              <div
                key={wh.id}
                className={`p-5 rounded-2xl border ${
                  darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-snug">{wh.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">ID: {wh.id}</span>
                  </div>
                  <Package size={18} className="text-blue-500" />
                </div>
                <div className="space-y-2 text-xs">
                  <p className="text-slate-500">{wh.address}</p>
                  <div className="pt-2 flex justify-between items-center text-[11px] font-semibold text-cyan-400 font-mono">
                    <span>SECTOR CLASS</span>
                    <span>LOGISTICS</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">Distinct SKUs:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{whProducts.length} items</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">Total Physical units:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{totalStockCount.toLocaleString()} units</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
