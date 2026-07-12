/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  TrendingUp,
  Plus,
  Users,
  QrCode,
  DollarSign,
  Smartphone,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { SalesOrder, Customer, Product, Lead } from "../../types";

interface SalesModuleProps {
  salesOrders: SalesOrder[];
  customers: Customer[];
  products: Product[];
  crmLeads: Lead[];
  token: string | null;
  onRefreshData: () => void;
  darkMode: boolean;
}

export default function SalesModule({
  salesOrders,
  customers,
  products,
  crmLeads,
  token,
  onRefreshData,
  darkMode,
}: SalesModuleProps) {
  const [activeTab, setActiveTab] = React.useState<"crm" | "orders" | "customers">("orders");
  const [showCheckout, setShowCheckout] = React.useState(false);

  // States for Checkout Form
  const [selectedCustId, setSelectedCustId] = React.useState(customers[0]?.id || "");
  const [selectedProdId, setSelectedProdId] = React.useState(products[0]?.id || "");
  const [salesQty, setSalesQty] = React.useState("10");
  const [paymentMethod, setPaymentMethod] = React.useState<"Telebirr" | "CBE Birr" | "Chapa" | "Bank Transfer">("Telebirr");
  const [checkoutMsg, setCheckoutMsg] = React.useState("");

  // States for Interactive Telebirr Overlay
  const [showPayOverlay, setShowPayOverlay] = React.useState(false);
  const [userPIN, setUserPIN] = React.useState("");
  const [overlayStatus, setOverlayStatus] = React.useState<"idle" | "verifying" | "success">("idle");
  const [smsIncoming, setSmsIncoming] = React.useState(false);

  // Computed Billing Calculations
  const selectedProduct = products.find((p) => p.id === selectedProdId) || products[0];
  const unitPrice = selectedProduct ? selectedProduct.price : 0;
  const quantity = parseFloat(salesQty) || 0;
  const subtotal = quantity * unitPrice;
  const vatAmount = subtotal * 0.15; // 15% VAT
  const totalBill = subtotal + vatAmount;

  // Submit Sales Requisition
  const handleCheckoutInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId || !selectedProdId || !salesQty) {
      setCheckoutMsg("Please complete all required fields.");
      return;
    }
    setCheckoutMsg("");
    // If digital gateway chosen, show the visual checkout overlay!
    if (["Telebirr", "CBE Birr", "Chapa"].includes(paymentMethod)) {
      setShowPayOverlay(true);
      setOverlayStatus("idle");
      setUserPIN("");
    } else {
      // Direct post for Bank Transfers
      postSalesOrder();
    }
  };

  const postSalesOrder = async () => {
    try {
      const res = await fetch("/api/erp/sales/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: selectedCustId,
          productId: selectedProdId,
          quantity: salesQty,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onRefreshData();
        return true;
      } else {
        alert(data.error || "Failed to log sales order.");
        return false;
      }
    } catch (err) {
      alert("Network error creating sales order.");
      return false;
    }
  };

  // Confirm mobile wallet checkout flow
  const handleConfirmMobilePayment = async () => {
    if (!userPIN || userPIN.length < 4) {
      alert("Please enter a valid 4-digit confirmation PIN.");
      return;
    }

    setOverlayStatus("verifying");
    
    // Simulate secure handshakes over local SMS API
    setTimeout(async () => {
      const success = await postSalesOrder();
      if (success) {
        setOverlayStatus("success");
        setSmsIncoming(true);
        // Slide out SMS after 3 seconds
        setTimeout(() => {
          setSmsIncoming(false);
          setShowPayOverlay(false);
          setShowCheckout(false);
        }, 3500);
      } else {
        setOverlayStatus("idle");
      }
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans relative">
      {/* Dynamic Receipt SMS Slide-In Alert */}
      {smsIncoming && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-80 max-w-sm rounded-xl bg-slate-900 border border-slate-700 text-white p-3.5 shadow-2xl z-50 animate-bounce duration-500 flex gap-3 items-start">
          <Smartphone className="text-cyan-400 shrink-0 mt-0.5 animate-pulse" size={20} />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-cyan-400 block font-mono">SMS GATEWAY: Telebirr Alert</span>
            <p className="mt-0.5">
              Trans: <strong className="font-mono">TX-{Date.now().toString().slice(-6)}</strong>. Received <strong>{totalBill.toLocaleString()} ETB</strong> from James ERP Checkout. Ledger status: SETTLED.
            </p>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={22} className="text-blue-500" /> Sales & Regional Billing
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
            Oversee client opportunities pipelines, review invoices, and checkout orders over digital networks.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-[#0F172A] rounded-xl border dark:border-slate-800/80 shrink-0">
          {[
            { id: "orders", label: "Sales Orders", icon: TrendingUp },
            { id: "crm", label: "CRM Leads", icon: DollarSign },
            { id: "customers", label: "Customers", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/10"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <tab.icon size={12} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SALES ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-4 animate-fade-in">
          {/* Action Row */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider">
              Sales Invoices Registry
            </h3>
            <button
              onClick={() => setShowCheckout(!showCheckout)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md shadow-blue-500/10 transition-colors animate-pulse-subtle"
            >
              <Plus size={13} />
              <span>Initiate Customer Checkout</span>
            </button>
          </div>

          {/* Checkout Form drawer block */}
          {showCheckout && (
            <form onSubmit={handleCheckoutInitiate} className={`p-5 rounded-2xl border animate-slide-down ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4 font-display flex items-center gap-1.5">
                <Smartphone size={14} className="text-blue-500" /> POS Sales Checkout Gate
              </h4>
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Purchasing Customer</label>
                    <select
                      value={selectedCustId}
                      onChange={(e) => setSelectedCustId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 focus:outline-none"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.tin})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Product SKU Required</label>
                    <select
                      value={selectedProdId}
                      onChange={(e) => setSelectedProdId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 focus:outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Order Quantity</label>
                    <input
                      type="number"
                      value={salesQty}
                      onChange={(e) => setSalesQty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-md p-2 focus:border-blue-500 font-mono text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Digital Wallet selection buttons */}
                  <div>
                    <label className="block text-slate-400 mb-2 font-mono">Regional Gateway Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "Telebirr", label: "Telebirr Wallet" },
                        { id: "CBE Birr", label: "CBE Birr Core" },
                        { id: "Chapa", label: "Chapa Gateway" },
                        { id: "Bank Transfer", label: "Bank Transfer" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPaymentMethod(item.id as any)}
                          className={`p-2 rounded-lg border text-left font-bold transition-all ${
                            paymentMethod === item.id
                              ? "bg-blue-600 text-white border-blue-500"
                              : darkMode
                              ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300"
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown calculations */}
                  <div className="bg-slate-950/20 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 font-mono text-right space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>QTY SUB-TOTAL:</span>
                      <span>{subtotal.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>ETHIOPIAN VAT (15%):</span>
                      <span>{vatAmount.toLocaleString()} ETB</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 mt-2 flex justify-between items-center text-xs font-bold text-cyan-400">
                      <span>TOTAL BIRR DUE:</span>
                      <span>{totalBill.toLocaleString()} ETB</span>
                    </div>
                  </div>
                </div>

                {checkoutMsg && (
                  <p className="text-[10px] font-semibold text-cyan-400 font-mono flex items-center gap-1">
                    <AlertCircle size={10} /> {checkoutMsg}
                  </p>
                )}
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-800/40">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-500/10">
                    <QrCode size={14} />
                    <span>Generate Invoice Checkout</span>
                  </button>
                  <button type="button" onClick={() => setShowCheckout(false)} className="px-4 bg-slate-800 text-slate-400 hover:text-white rounded-lg">
                    ClosePOS
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Checkout Mobile Gateway Mock Overlay Dialog */}
          {showPayOverlay && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 font-sans text-white">
                <div className="h-10 w-10 bg-blue-600/10 rounded-full text-blue-500 flex items-center justify-center mx-auto border border-blue-500/20">
                  <Smartphone size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight font-display text-white">
                    {paymentMethod} Secure Mobile Handshake
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Authorized Transaction POS: <span className="font-mono text-cyan-400">TXN-{Date.now().toString().slice(-8)}</span>
                  </p>
                </div>

                {overlayStatus === "idle" && (
                  <>
                    {/* Mock QR Scan overlay */}
                    <div className="bg-white p-3 rounded-xl w-32 h-32 mx-auto shadow-inner flex items-center justify-center">
                      <svg viewBox="0 0 30 30" className="w-full h-full">
                        <rect x="0" y="0" width="8" height="8" fill="#000" />
                        <rect x="22" y="0" width="8" height="8" fill="#000" />
                        <rect x="0" y="22" width="8" height="8" fill="#000" />
                        <rect x="10" y="10" width="10" height="10" fill="#000" />
                        <rect x="4" y="14" width="4" height="4" fill="#000" />
                        <rect x="14" y="4" width="4" height="4" fill="#000" />
                      </svg>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-400 leading-snug">
                      <p>Total bill: <strong className="font-mono text-white text-sm">{totalBill.toLocaleString()} ETB</strong></p>
                      <p>Scan above or enter your 4-digit confirmation PIN below:</p>
                    </div>
                    <input
                      type="password"
                      maxLength={4}
                      value={userPIN}
                      onChange={(e) => setUserPIN(e.target.value)}
                      placeholder="••••"
                      className="bg-slate-950 border border-slate-800 rounded-md p-2 text-center text-sm w-24 tracking-widest focus:border-blue-500 outline-none font-mono"
                    />
                    <div className="flex gap-2 pt-2 text-xs font-bold">
                      <button
                        onClick={handleConfirmMobilePayment}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                      >
                        Confirm payment
                      </button>
                      <button
                        onClick={() => setShowPayOverlay(false)}
                        className="px-3 bg-slate-800 text-slate-400 rounded-lg hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}

                {overlayStatus === "verifying" && (
                  <div className="py-8 space-y-3">
                    <div className="h-6 w-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-slate-400 font-mono">
                      Querying regional API nodes for PIN validation...
                    </p>
                  </div>
                )}

                {overlayStatus === "success" && (
                  <div className="py-6 space-y-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                      <Check size={18} />
                    </div>
                    <p className="text-xs font-bold text-emerald-400">
                      Payment Settled successfully!
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                      SMS confirmation receipts dispatched to ledger nodes and customer mobile.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Table */}
          <div className={`rounded-xl border overflow-hidden ${darkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-mono font-bold uppercase tracking-wider ${darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Client Customer</th>
                  <th className="p-3">Checkout Date</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3 text-right">Invoiced Total</th>
                  <th className="p-3 text-center">Invoicing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {salesOrders.map((so) => (
                  <tr key={so.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{so.id}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{so.customerName}</td>
                    <td className="p-3 font-mono">{so.date}</td>
                    <td className="p-3 text-slate-500">{so.paymentMethod}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                      {so.totalAmount.toLocaleString()} ETB
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        so.status === "Paid"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                      }`}>
                        {so.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CRM LEADS */}
      {activeTab === "crm" && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fade-in">
          {["Lead", "Opportunity", "Negotiation", "Won"].map((stage) => {
            const matches = crmLeads.filter((l) => l.stage === stage);
            return (
              <div
                key={stage}
                className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] ${
                  darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-1.5 mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      {stage} Stage
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 dark:text-slate-400 text-slate-600 px-1.5 py-0.5 rounded-full font-mono font-bold">
                      {matches.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {matches.map((m) => (
                      <div key={m.id} className="p-2 bg-slate-950/10 dark:bg-slate-950/40 rounded border dark:border-slate-850 text-[11px]">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{m.contactName}</p>
                        <p className="text-slate-400 font-medium truncate mt-0.5">{m.company}</p>
                        <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono font-semibold mt-2">
                          <span>VALUE:</span>
                          <span className="text-cyan-400">{m.value.toLocaleString()} ETB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: CUSTOMERS */}
      {activeTab === "customers" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          {customers.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-xl border ${
                darkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex justify-between items-start pb-2 border-b border-slate-100 dark:border-slate-800/60 mb-2 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 leading-snug">{c.name}</h4>
                  <span className="text-[9px] text-slate-400 font-mono block mt-0.5">TIN: {c.tin} | ID: {c.id}</span>
                </div>
                <Users size={16} className="text-blue-500" />
              </div>
              <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                <p>Phone contact: {c.phone}</p>
                <p>Corporate Email: {c.email}</p>
                <p>Office Address: {c.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
