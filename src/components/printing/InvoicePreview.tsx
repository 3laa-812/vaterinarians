"use client";

import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { InvoiceA4 } from "./InvoiceA4";
import { Receipt58 } from "./Receipt58";
import { Receipt80 } from "./Receipt80";
import type { InvoiceDetails } from "@/services/invoice.service";
import { useTranslations } from "next-intl";

type PrintLayout = "A4" | "58mm" | "80mm";

interface Props {
  invoice: InvoiceDetails;
}

export const InvoicePreview: React.FC<Props> = ({ invoice }) => {
  const t = useTranslations("printing");
  const [layout, setLayout] = useState<PrintLayout>("A4");
  
  // Create refs for each print component
  const a4Ref = useRef<HTMLDivElement>(null);
  const receipt58Ref = useRef<HTMLDivElement>(null);
  const receipt80Ref = useRef<HTMLDivElement>(null);

  // Load the appropriate CSS when layout changes
  useEffect(() => {
    // Remove existing print stylesheets if any
    const existingLinks = document.querySelectorAll('link[data-print-style="true"]');
    existingLinks.forEach(link => link.remove());

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.setAttribute("data-print-style", "true");
    
    if (layout === "A4") {
      link.href = "/styles/invoice-a4.css";
    } else {
      link.href = "/styles/invoice-receipt.css";
    }
    
    document.head.appendChild(link);
    
    return () => {
      link.remove();
    };
  }, [layout]);

  // We determine which ref to print based on state
  const contentRef = layout === "A4" 
    ? a4Ref 
    : layout === "58mm" 
      ? receipt58Ref 
      : receipt80Ref;

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Invoice_${invoice.invoiceNumber}`,
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center bg-surface-container p-4 rounded-xl shadow-sm border border-outline-variant/30">
        <div>
          <h2 className="text-xl font-bold text-on-surface">{t("printPreview")}</h2>
          <p className="text-sm text-on-surface-variant">#{invoice.invoiceNumber}</p>
        </div>
        <div className="flex gap-4 items-center">
          <select 
            value={layout} 
            onChange={(e) => setLayout(e.target.value as PrintLayout)}
            className="bg-surface text-on-surface border border-outline-variant rounded-lg px-4 py-2"
          >
            <option value="A4">{t("printA4")}</option>
            <option value="58mm">{t("print58mm")}</option>
            <option value="80mm">{t("print80mm")}</option>
          </select>
          <button 
            onClick={() => handlePrint()} 
            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {t("print")}
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low p-8 rounded-xl overflow-auto border border-outline-variant/30 shadow-inner flex justify-center items-start min-h-[500px]">
        {/* We render all of them but hide the non-selected ones so refs are always available */}
        <div className={layout === "A4" ? "block" : "hidden"}>
          <InvoiceA4 ref={a4Ref} invoice={invoice} />
        </div>
        <div className={layout === "58mm" ? "block" : "hidden"}>
          <Receipt58 ref={receipt58Ref} invoice={invoice} />
        </div>
        <div className={layout === "80mm" ? "block" : "hidden"}>
          <Receipt80 ref={receipt80Ref} invoice={invoice} />
        </div>
      </div>
    </div>
  );
};
