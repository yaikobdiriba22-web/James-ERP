/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  ShoppingCart,
  Plus,
  Truck,
  Users,
  AlertCircle,
  FileText,
  Clock,
} from "lucide-react";
import { PurchaseOrder, Supplier, Product } from "../../types";

interface PurchaseModuleProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  products: Product[];
  token: string | null;
  onRefreshData: () => void;
  darkMode: boolean;
}

export default function PurchaseModule({
  purchaseOrders,
  suppliers,
  products,
  token,
  onRefreshData,
  darkMode,
}: PurchaseModuleProps) {
  const [activeTab, setActiveTab] = React.useState<"suppliers" | "orders">("orders");
  const [showPOForm, setShowPOForm] = React.useState(false);

  // States for Add Requisition Form
  const [selectedSupplierId, setSelectedSupplierId] = React.useState(suppliers[0]?.id || "");
  const [selectedProdId, setSelectedProdId] = React.useState(products[0]?.id || "");
  const [poQty, setPoQty] = React.useState("500");
  const [poPrice, setPoPrice] = React.useState("180");
  const [poStatusMsg, setPoStatusMsg] = React.useState("");

  // Submit PO
  const handlePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || !selectedProdId || !poQty) {
      setPoStatusMsg("Required fields missing.");
      return;
    }

    try {
      const res = await fetch("/api/erp/procurement/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplierId: selectedSupplierId,
          productId: selectedProdId,
          quantity: poQty,
          unitPrice: poPrice,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPoStatusMsg("Procurement PO requisition logged successfully!");
        onRefreshData();
        setTimeout(() => {
          setShowPOForm(false);
          setPoStatusMsg("");
        }, 1500);
      } else {
        setPoStatusMsg(data.error || "Failed to log PO Requisition.");
      }
    } catch (err) {
      setPoStatusMsg("Network error logging PO.");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart size={22} className="text-blue-500" /> Purchase & Supply Chains
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
            Maintain raw sourcing partners, dispatch purchase requisitions, and track supply orders.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-[#0F172A] rounded-xl border dark:border-slate-800/80 shrink-0">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "orders"
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/10"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            Purchase Orders (POs)
          </button>
          <button
            onClick={() => setActiveTab("suppliers")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "suppliers"
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/10"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            Sourcing Suppliers
          </button>
        </div>
      </div>

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider">
              Corporate Procurement Registry
            </h3>
            <button
              onClick={() => setShowPOForm(!showPOForm)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md shadow-blue-500/10 transition-colors"
            >
              <Plus size={13} />
              <span>Raise PO Requisition</span>
            </button>
          </div>

          {/* PO form popup */}
          {showPOForm && (
            <form onSubmit={handlePOSubmit} className={`p-4 rounded-xl border max-w-md animate-slide-down ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3">Requisition RFQ Form</h4>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Select Sourcing Supplier</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 focus:outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (TIN: {s.tin})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Material Item Required</label>
                    <select
                      value={selectedProdId}
                      onChange={(e) => {
                        setSelectedProdId(e.target.value);
                        const prod = products.find((p) => p.id === e.target.value);
                        if (prod) setPoPrice(prod.cost.toString());
                      }}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 focus:outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Cost: {p.cost} ETB)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Required Quantity</label>
                    <input
                      type="number"
                      value={poQty}
                      onChange={(e) => setPoQty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 font-mono text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Supplier Negotiated Cost (ETB)</label>
                  <input
                    type="number"
                    value={poPrice}
                    onChange={(e) => setPoPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 font-mono text-right"
                  />
                </div>

                {/* Live total display */}
                <div className="p-2.5 rounded bg-slate-950/40 border border-slate-800/60 font-mono text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Estimated value:</span>
                  <p className="text-sm font-bold text-cyan-400 mt-1">
                    {((parseFloat(poQty) || 0) * (parseFloat(poPrice) || 0)).toLocaleString()} ETB
                  </p>
                </div>

                {poStatusMsg && (
                  <p className="text-[10px] font-semibold text-cyan-400 mt-2 font-mono flex items-center gap-1">
                    <AlertCircle size={10} /> {poStatusMsg}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg">
                    Approve & Raise Requisition
                  </button>
                  <button type="button" onClick={() => setShowPOForm(false)} className="px-3 bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* PO Table */}
          <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-mono font-bold uppercase tracking-wider ${darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                  <th className="p-3">PO Code</th>
                  <th className="p-3">Supplier Name</th>
                  <th className="p-3">Requisition Date</th>
                  <th className="p-3 text-right">Total Budget</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{po.id}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{po.supplierName}</td>
                    <td className="p-3 font-mono">{po.date}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                      {po.totalAmount.toLocaleString()} ETB
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        po.status === "Received"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : po.status === "Ordered"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                      }`}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIERS */}
      {activeTab === "suppliers" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className={`p-4 rounded-xl border ${
                darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex justify-between items-start pb-2 border-b border-slate-100 dark:border-slate-800/60 mb-2">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 leading-snug">{s.name}</h4>
                  <span className="text-[9px] text-slate-400 font-mono">TIN: {s.tin}</span>
                </div>
                <Truck size={16} className="text-cyan-400" />
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <p>Phone: {s.phone}</p>
                <p>Email: {s.email}</p>
                <p>Address: {s.address}</p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-2 flex flex-wrap gap-1">
                  {s.productsSupplied?.map((pName, idx) => (
                    <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-[9px] text-slate-400 font-mono px-1.5 py-0.5 rounded">
                      {pName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
