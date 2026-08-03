"use client";

import React, { useEffect, useState, useRef } from "react";
import { ArrowLeft, Package, User, Clock, CreditCard, Send, CheckCircle2, Circle, Truck, AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { OrderStatus, OrderPaymentStatus } from "@prisma/client";
import { useRouter, useParams } from "next/navigation";
import { SkeletonList } from "@/components/shared/SkeletonCard";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: {
    name: string;
    imageUrl?: string | null;
  };
}

interface OrderMessage {
  id: string;
  content: string;
  fromOwner: boolean;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  owner: {
    name: string;
    phone: string;
  };
  items: OrderItem[];
  messages: OrderMessage[];
}

export default function OrderDetailsPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = React.use(params);
  const t = useTranslations("store");
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Chat state
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Status state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const STATUS_STEPS = [
    { value: OrderStatus.PENDING, label: t("status_pending"), icon: Clock },
    { value: OrderStatus.CONFIRMED, label: t("status_confirmed"), icon: CheckCircle2 },
    { value: OrderStatus.READY, label: t("status_ready"), icon: Package },
    { value: OrderStatus.DELIVERED, label: t("status_delivered"), icon: Truck }
  ];

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [order?.messages]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/store/orders/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.en || "Failed to fetch order");
      setOrder(json.data.order);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: OrderStatus) => {
    if (!order || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/store/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.en || "Failed to update status");
      
      setOrder({ ...order, status: newStatus });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendingMessage || !order) return;
    
    setSendingMessage(true);
    try {
      const res = await fetch(`/api/store/orders/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message, fromOwner: false })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.en || "Failed to send message");
      
      setOrder({
        ...order,
        messages: [...order.messages, json.data.message]
      });
      setMessage("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const currentStatusIndex = STATUS_STEPS.findIndex(s => s.value === order?.status);
  const isCancelled = order?.status === OrderStatus.CANCELLED;

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <SkeletonList count={3} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="bg-error/10 border border-error/20 text-error rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={24} />
          <div>
            <h3 className="font-semibold">{t("error")}</h3>
            <p>{error || t("orderNotFound")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push(`/${locale}/store/orders`)} className="p-2 hover:bg-surface-container rounded-full transition-colors border border-outline-variant/30">
          <ArrowLeft size={20} className="text-on-surface" />
        </button>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-on-surface flex items-center gap-3">
            {t("orderNumberValue", { number: order.orderNumber })}
            {isCancelled && <span className="text-sm font-medium bg-error/10 text-error px-3 py-1 rounded-full border border-error/20">{t("status_cancelled")}</span>}
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">{new Date(order.createdAt).toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Flow & Items */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Flow */}
          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/50 shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-6">{t("orderStatus")}</h3>
            {!isCancelled ? (
              <div className="flex justify-between items-center relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-container rounded-full z-0 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${(Math.max(0, currentStatusIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = step.icon;
                  return (
                    <div key={step.value} className="relative z-10 flex flex-col items-center gap-2">
                      <button
                        onClick={() => updateStatus(step.value)}
                        disabled={updatingStatus || index < currentStatusIndex}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 
                          ${isCompleted ? 'bg-primary border-primary text-on-primary' : 'bg-surface-container border-outline-variant text-on-surface-variant'} 
                          ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}
                          ${!isCompleted && !updatingStatus && index > currentStatusIndex ? 'hover:border-primary/50 cursor-pointer' : 'cursor-default'}
                        `}
                      >
                        <Icon size={18} />
                      </button>
                      <span className={`text-xs font-medium ${isCompleted ? 'text-on-surface' : 'text-on-surface-variant'}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 text-error bg-error/5 p-4 rounded-xl border border-error/20">
                <AlertCircle size={24} />
                <span className="font-semibold">{t("orderCancelledMsg")}</span>
              </div>
            )}
            
            {!isCancelled && (
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => updateStatus(OrderStatus.CANCELLED)}
                  className="text-sm text-error hover:bg-error/10 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  {t("cancelOrder")}
                </button>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/50 shadow-sm">
            <div className="p-6 border-b border-outline-variant/50">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Package size={20} className="text-primary" />
                {t("orderItems")}
              </h3>
            </div>
            <ul className="divide-y divide-outline-variant/50">
              {order.items.map(item => (
                <li key={item.id} className="p-4 sm:p-6 flex items-center gap-4 hover:bg-surface-container/50 transition-colors">
                  <div className="w-16 h-16 rounded-xl bg-surface-container-high border border-outline-variant/50 flex items-center justify-center overflow-hidden shrink-0">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={24} className="text-on-surface-variant" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-on-surface font-semibold truncate">{item.product.name}</h4>
                    <p className="text-on-surface-variant text-sm mt-1">{item.unitPrice.toFixed(2)} {t("currency")} x {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-on-surface font-bold whitespace-nowrap">{item.total.toFixed(2)} {t("currency")}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-6 bg-surface-container-low border-t border-outline-variant/50 space-y-3">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>{t("subtotal")}</span>
                <span>{order.subtotal.toFixed(2)} {t("currency")}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>{t("deliveryFee")}</span>
                <span>{order.deliveryFee.toFixed(2)} {t("currency")}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-on-surface pt-2 border-t border-outline-variant/50">
                <span>{t("total")}</span>
                <span className="text-primary">{order.total.toFixed(2)} {t("currency")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Chat */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/50 shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              {t("customerDetails")}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">{t("name")}</p>
                <p className="text-on-surface font-medium">{order.owner.name}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">{t("phone")}</p>
                <p className="text-on-surface font-medium">{order.owner.phone}</p>
              </div>
              <div className="pt-4 border-t border-outline-variant/50">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">{t("paymentStatus")}</p>
                {order.paymentStatus === OrderPaymentStatus.PAID || order.paymentStatus === OrderPaymentStatus.CASH ? (
                  <div className="inline-flex items-center gap-1.5 bg-success/10 text-success px-3 py-1.5 rounded-lg border border-success/20">
                    <CheckCircle2 size={16} />
                    <span className="text-sm font-semibold text-success">{t("payment_paid")}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 bg-error/10 text-error px-3 py-1.5 rounded-lg border border-error/20">
                    <CreditCard size={16} />
                    <span className="text-sm font-semibold text-error">{t("payment_unpaid")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Chat */}
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant/50 shadow-sm flex flex-col h-[400px]">
            <div className="p-4 border-b border-outline-variant/50">
              <h3 className="font-bold text-on-surface">{t("orderChat")}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {order.messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-on-surface-variant text-sm">
                  {t("noMessages")}
                </div>
              ) : (
                order.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.fromOwner ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.fromOwner 
                        ? 'bg-surface-container-high text-on-surface rounded-tl-sm' 
                        : 'bg-primary text-on-primary rounded-tr-sm'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.fromOwner ? 'text-on-surface-variant' : 'text-on-primary/70'} text-right`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-outline-variant/50 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("typeMessage")}
                className="flex-1 bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                disabled={sendingMessage}
              />
              <button 
                type="submit"
                disabled={!message.trim() || sendingMessage}
                className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-on-primary p-2.5 rounded-xl transition-colors shrink-0"
              >
                {sendingMessage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
