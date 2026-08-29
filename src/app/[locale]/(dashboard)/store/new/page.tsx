"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { ProductCategory } from "@prisma/client";
import { createProductSchema } from "@/lib/validations/store.schema";
import { z } from "zod";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Textarea } from "@/components/shared/Textarea";
import { Select } from "@/components/shared/Select";
import { FormField } from "@/components/shared/FormField";
import { UploadCloud, Loader2 } from "lucide-react";
import { logger } from '@/lib/logger';

type ProductFormValues = z.infer<typeof createProductSchema>;

export default function NewProductPage() {
  const t = useTranslations("store");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [values, setValues] = useState<ProductFormValues>({
    name: "",
    nameAr: "",
    description: "",
    category: ProductCategory.OTHER,
    price: 0,
    imageUrl: "",
    stock: 0,
    minStock: 5,
    unit: "piece",
    isActive: true,
    requiresPrescription: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === "checkbox") {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === "number") {
      finalValue = value === "" ? "" : Number(value);
    }

    setValues((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);

      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paramsToSign: { timestamp } }),
      });
      const { signature } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await uploadRes.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      logger.error("Error uploading file:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean up empty optional fields so Zod doesn't fail on empty strings
    const payload = { ...values };
    if (payload.imageUrl === "") {
      delete (payload as any).imageUrl;
    }
    if (payload.description === "") {
      delete (payload as any).description;
    }
    if (payload.nameAr === "") {
      delete (payload as any).nameAr;
    }

    const result = createProductSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as any;
      const newErrors: Record<string, string> = {};
      for (const key in fieldErrors) {
        if (fieldErrors[key] && fieldErrors[key]!.length > 0) {
          newErrors[key] = fieldErrors[key]![0];
        }
      }
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/store/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, imageUrl }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.en || t("error"));
      }
      router.push(`/${locale}/store`);
    } catch (err: any) {
      logger.error(err);
      alert(err.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative max-w-4xl mx-auto w-full">
      <div className="flex-none pt-4 px-4 sm:pt-6 sm:px-6">
        <PageHeader title={t("addNewProduct")} />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-4 pb-20 sm:px-6">
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label={t("productName")} required>
                  <Input
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="e.g. Royal Canin"
                    error={errors.name}
                  />
                </FormField>
                <FormField label={t("productNameAr")}>
                  <Input
                    name="nameAr"
                    value={values.nameAr}
                    onChange={handleChange}
                    placeholder="رويال كانين"
                  />
                </FormField>
              </div>

              <FormField label={t("description")}>
                <Textarea
                  name="description"
                  value={values.description || ""}
                  onChange={handleChange}
                  className="h-24"
                  placeholder="Product details..."
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label={t("category")} required>
                  <Select
                    name="category"
                    value={values.category}
                    onChange={handleChange}
                  >
                    {Object.values(ProductCategory).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label={t("price")} required>
                  <Input
                    type="number"
                    step="0.01"
                    name="price"
                    value={values.price}
                    onChange={handleChange}
                    error={errors.price}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label={t("initialStock")}>
                  <Input
                    type="number"
                    name="stock"
                    value={values.stock}
                    onChange={handleChange}
                  />
                </FormField>
                <FormField label={t("minStockAlert")}>
                  <Input
                    type="number"
                    name="minStock"
                    value={values.minStock}
                    onChange={handleChange}
                  />
                </FormField>
              </div>

              <FormField label={t("productImage")}>
                <label className="relative flex flex-col items-center justify-center w-full min-h-[200px] bg-surface border-2 border-dashed border-outline-variant rounded-xl p-8 text-center transition-colors hover:border-primary cursor-pointer overflow-hidden">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm text-on-surface-variant">
                        Uploading...
                      </p>
                    </div>
                  ) : imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt="Product"
                      className="max-h-48 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UploadCloud className="w-8 h-8 text-on-surface-variant" />
                      <p className="text-sm text-on-surface-variant">
                        {t("clickToUploadImage") || "Click to upload an image"}
                      </p>
                    </div>
                  )}
                </label>
              </FormField>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={values.isActive}
                      onChange={handleChange}
                      className="peer appearance-none w-5 h-5 border border-outline-variant rounded bg-surface-container checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                    />
                    <svg
                      className="absolute w-3.5 h-3.5 text-on-primary pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path
                        d="M3 8L6 11L11 3.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-on-surface text-sm">{t("active")}</span>
                </label>

                <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      name="requiresPrescription"
                      checked={values.requiresPrescription}
                      onChange={handleChange}
                      className="peer appearance-none w-5 h-5 border border-outline-variant rounded bg-surface-container checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                    />
                    <svg
                      className="absolute w-3.5 h-3.5 text-on-primary pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path
                        d="M3 8L6 11L11 3.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-on-surface text-sm">
                    {t("requiresPrescription")}
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant mt-8">
                <Button
                  variant="secondary"
                  onClick={() => router.back()}
                  type="button"
                >
                  {t("cancel")}
                </Button>
                <Button variant="primary" type="submit" loading={loading}>
                  {t("saveProduct")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
