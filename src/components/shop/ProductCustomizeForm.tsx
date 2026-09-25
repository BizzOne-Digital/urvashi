"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AddressAutocomplete } from "@/components/checkout/AddressAutocomplete";
import { MonerisCheckout } from "@/components/payments/MonerisCheckout";
import { CANADIAN_PROVINCES, normalizeProvinceCode, provinceFromPostalCode } from "@/lib/canadian-tax";
import { formatCanadianPostalCode } from "@/lib/canadian-postal";
import {
  getArtworkImagePreviewUrls,
  getUploadedArtworkIds,
  type LocalArtworkFile,
  uploadArtworkItemsOnSubmit,
  uploadPendingArtworkItems,
} from "@/components/customize/ArtworkMultiUpload";
import {
  CalendarArtworkUpload,
  createEmptyCalendarSlots,
  getCalendarArtworkItems,
  getCalendarPreviewUrls,
} from "@/components/customize/CalendarArtworkUpload";
import { CalendarMockupPreview } from "@/components/customize/CalendarMockupPreview";
import { ProductDualSideCustomizePreview } from "@/components/customize/ProductDualSideCustomizePreview";
import { CustomizePrintPlanPanel } from "@/components/customize/CustomizePrintPlanPanel";
import {
  type CustomizePrintPlanId,
  printPlanRequiresBackArtwork,
  printPlanRequiresFrontArtwork,
  printPlanShowsBackPreview,
  printPlanShowsFrontPreview,
} from "@/lib/customize-print-plan";
import {
  defaultPrintPlanForProduct,
  getProductPrintPlanChoices,
  getProductPrintPlanSurcharge,
} from "@/lib/product-print-pricing";
import {
  FILL_PRINT_AREA_TRANSFORM,
  formatArtworkTransformNote,
  type ArtworkTransform,
} from "@/lib/artwork-transform";
import { CALENDAR_MONTH_COUNT, isCalendarProduct } from "@/lib/calendar-customize";
import { DESIGN_HELP_SURCHARGE, getProductDisplayImages } from "@/lib/product-catalog";
import {
  getProductMockupConfig,
  resolveProductMockupSides,
  supportsDualSideCustomize,
} from "@/lib/product-mockup-config";
import { resolveImageSrc } from "@/lib/image-url";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  MAX_CUSTOMIZE_DESIGNS,
  type CustomizeDesignSetPayload,
} from "@/lib/customize-design-sets";
import { filterInStockOptions } from "@/lib/product-stock";

type MonerisEnvironment = "qa" | "prod";

interface SavedCustomizeDesignDraft {
  id: string;
  printPlan: CustomizePrintPlanId;
  frontArtworkItems: LocalArtworkFile[];
  backArtworkItems: LocalArtworkFile[];
  frontTransform: ArtworkTransform;
  backTransform: ArtworkTransform;
}

function cloneArtworkItems(items: LocalArtworkFile[]): LocalArtworkFile[] {
  return items.map((item) => ({ ...item }));
}

interface ProductCustomizeFormProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price?: number;
    currency?: string;
    minQuantity: number;
    designHelpSurcharge?: number;
    blankImage?: { url: string; alt?: string };
    customizedImage?: { url: string; alt?: string };
    images?: Array<{ url: string; alt?: string }>;
    mockupFrontImage?: { url: string; alt?: string };
    mockupBackImage?: { url: string; alt?: string };
    variants?: Array<{
      name: string;
      options: Array<{ label: string; value: string; surcharge?: number; inStock?: boolean }>;
    }>;
    printLocations?: Array<{ id: string; label: string; surcharge?: number }>;
    customizer?: {
      printArea?: { x: number; y: number; width: number; height: number };
      previewDisclaimer?: string;
    };
  };
  monerisMode?: MonerisEnvironment;
}

interface PendingMonerisPayment {
  ticket: string;
  referenceNumber: string;
  mode: MonerisEnvironment;
}

interface CustomizeRateSummary {
  rates: Array<{ id: string; label: string; description: string; price: number; currency: string }>;
  subtotal: number;
  designFee: number;
  printSurcharge?: number;
  merchandiseTotal?: number;
  shippingCost: number;
  tax: number;
  taxLabel?: string;
  total: number;
  currency: string;
  rateSource?: "canada_post" | "estimate";
}

export function ProductCustomizeForm({ product, monerisMode = "qa" }: ProductCustomizeFormProps) {
  const router = useRouter();
  const { blank, customized } = getProductDisplayImages(product);
  const optionVariant = product.variants?.find(
    (v) => v.name === "Colour" || v.name === "Shape"
  );
  const sizeVariant = product.variants?.find((v) => v.name === "Size");
  const optionChoices = useMemo(
    () => (optionVariant ? filterInStockOptions(optionVariant.options) : []),
    [optionVariant]
  );
  const sizeChoices = useMemo(
    () => (sizeVariant ? filterInStockOptions(sizeVariant.options) : []),
    [sizeVariant]
  );
  const [selectedOption, setSelectedOption] = useState(
    () => optionChoices[0]?.value ?? ""
  );
  const [selectedSize, setSelectedSize] = useState(() => sizeChoices[0]?.value ?? "");

  useEffect(() => {
    if (!optionChoices.length) {
      setSelectedOption("");
      return;
    }
    if (!optionChoices.some((o) => o.value === selectedOption)) {
      setSelectedOption(optionChoices[0].value);
    }
  }, [optionChoices, selectedOption]);

  useEffect(() => {
    if (!sizeChoices.length) {
      setSelectedSize("");
      return;
    }
    if (!sizeChoices.some((o) => o.value === selectedSize)) {
      setSelectedSize(sizeChoices[0].value);
    }
  }, [sizeChoices, selectedSize]);
  const mockupSides = useMemo(
    () =>
      resolveProductMockupSides(
        {
          slug: product.slug,
          mockupFrontImage: product.mockupFrontImage,
          mockupBackImage: product.mockupBackImage,
        },
        selectedOption || undefined
      ),
    [product.slug, product.mockupFrontImage, product.mockupBackImage, selectedOption]
  );
  const baseImage = useMemo(
    () => resolveImageSrc(mockupSides?.front || blank?.url || customized?.url),
    [mockupSides, blank?.url, customized?.url]
  );
  const backBaseImage = useMemo(
    () =>
      resolveImageSrc(
        mockupSides?.back || mockupSides?.front || blank?.url || customized?.url
      ),
    [mockupSides, blank?.url, customized?.url]
  );
  const mockupConfig = getProductMockupConfig(product.slug, product.customizer?.printArea);
  const selectedOptionLabel =
    optionVariant?.options.find((o) => o.value === selectedOption)?.label || selectedOption;
  const selectedSizeLabel =
    sizeVariant?.options.find((o) => o.value === selectedSize)?.label || selectedSize;
  const designFee = product.designHelpSurcharge ?? DESIGN_HELP_SURCHARGE;
  const basePrice = product.price ?? 0;
  const planChoices = useMemo(
    () => getProductPrintPlanChoices(basePrice, product.printLocations),
    [basePrice, product.printLocations]
  );
  const isCalendar = isCalendarProduct(product.slug);
  const dualSide = supportsDualSideCustomize(product.slug);

  const [frontArtworkItems, setFrontArtworkItems] = useState<LocalArtworkFile[]>([]);
  const [backArtworkItems, setBackArtworkItems] = useState<LocalArtworkFile[]>([]);
  const [frontTransform, setFrontTransform] = useState<ArtworkTransform>(FILL_PRINT_AREA_TRANSFORM);
  const [backTransform, setBackTransform] = useState<ArtworkTransform>(FILL_PRINT_AREA_TRANSFORM);
  const [calendarSlots, setCalendarSlots] = useState(createEmptyCalendarSlots);
  const [previewMonth, setPreviewMonth] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [printPlan, setPrintPlan] = useState<CustomizePrintPlanId>(() =>
    defaultPrintPlanForProduct(product.printLocations)
  );
  const [savedDesigns, setSavedDesigns] = useState<SavedCustomizeDesignDraft[]>([]);
  const [designHelp, setDesignHelp] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingMonerisPayment | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [shippingRatesError, setShippingRatesError] = useState<string | null>(null);
  const [rateSummary, setRateSummary] = useState<CustomizeRateSummary | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    quantity: product.minQuantity || 1,
    address1: "",
    city: "",
    province: "",
    postalCode: "",
    shippingMethod: "",
    instructions: "",
    rightsConfirmed: false,
  });

  const printSurcharge = useMemo(
    () => getProductPrintPlanSurcharge(printPlan, product.printLocations, form.quantity),
    [printPlan, product.printLocations, form.quantity]
  );

  const merchandiseTotal = useMemo(
    () => basePrice * form.quantity + printSurcharge + (designHelp ? designFee : 0),
    [basePrice, form.quantity, printSurcharge, designHelp, designFee]
  );

  const backPreviewUrls = useMemo(() => {
    const backUrls = getArtworkImagePreviewUrls(backArtworkItems);
    if (printPlan === "print_wrap" && !backUrls.length && frontArtworkItems.length) {
      return getArtworkImagePreviewUrls(frontArtworkItems);
    }
    return backUrls;
  }, [printPlan, frontArtworkItems, backArtworkItems]);

  const showFrontPreview = printPlanShowsFrontPreview(printPlan);
  const showBackPreview = printPlanShowsBackPreview(printPlan);
  const needsArtworkRights =
    isCalendar ||
    savedDesigns.some(
      (d) => d.frontArtworkItems.length > 0 || d.backArtworkItems.length > 0
    ) ||
    frontArtworkItems.length > 0 ||
    backArtworkItems.length > 0 ||
    (!designHelp &&
      (printPlanRequiresFrontArtwork(printPlan) || printPlanRequiresBackArtwork(printPlan)));

  const displayTotal = rateSummary?.total ?? merchandiseTotal;
  const checkoutReady = Boolean(rateSummary?.rates?.length && form.shippingMethod);

  const resetDesignWorkspace = useCallback(() => {
    setFrontArtworkItems([]);
    setBackArtworkItems([]);
    setFrontTransform(FILL_PRINT_AREA_TRANSFORM);
    setBackTransform(FILL_PRINT_AREA_TRANSFORM);
    setPrintPlan(defaultPrintPlanForProduct(product.printLocations));
  }, [product.printLocations]);

  const currentDesignHasArtwork = useMemo(
    () => frontArtworkItems.length > 0 || backArtworkItems.length > 0,
    [frontArtworkItems, backArtworkItems]
  );

  const validateDesignArtwork = useCallback(
    (
      plan: CustomizePrintPlanId,
      front: LocalArtworkFile[],
      back: LocalArtworkFile[]
    ): boolean => {
      if (printPlanRequiresFrontArtwork(plan) && !front.length) {
        toast.error("Please upload artwork for the front");
        return false;
      }
      if (printPlanRequiresBackArtwork(plan) && !back.length) {
        toast.error("Please upload artwork for the back");
        return false;
      }
      return true;
    },
    []
  );

  const buildPlacementNotes = useCallback(
    (draft: Pick<SavedCustomizeDesignDraft, "frontTransform" | "backTransform" | "frontArtworkItems" | "backArtworkItems">) =>
      [
        draft.frontArtworkItems.length
          ? `Front: ${formatArtworkTransformNote(draft.frontTransform) || "default placement"}`
          : "",
        draft.backArtworkItems.length
          ? `Back: ${formatArtworkTransformNote(draft.backTransform) || "default placement"}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    []
  );

  const handleSaveAnotherDesign = () => {
    if (designHelp || isCalendar) return;
    if (!validateDesignArtwork(printPlan, frontArtworkItems, backArtworkItems)) return;
    if (savedDesigns.length >= MAX_CUSTOMIZE_DESIGNS - 1) {
      toast.error(`You can add up to ${MAX_CUSTOMIZE_DESIGNS} designs per order.`);
      return;
    }

    setSavedDesigns((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        printPlan,
        frontArtworkItems: cloneArtworkItems(frontArtworkItems),
        backArtworkItems: cloneArtworkItems(backArtworkItems),
        frontTransform,
        backTransform,
      },
    ]);
    resetDesignWorkspace();
    toast.success(`Design ${savedDesigns.length + 1} saved. You can create another option below.`);
  };

  const uploadDesignDraft = async (
    draft: SavedCustomizeDesignDraft
  ): Promise<CustomizeDesignSetPayload> => {
    let frontIds: string[] = [];
    let backIds: string[] = [];

    if (draft.frontArtworkItems.length) {
      const uploaded = await uploadArtworkItemsOnSubmit(
        draft.frontArtworkItems,
        form.rightsConfirmed,
        form.instructions
      );
      frontIds = getUploadedArtworkIds(uploaded.items);
    }
    if (draft.backArtworkItems.length) {
      const uploaded = await uploadArtworkItemsOnSubmit(
        draft.backArtworkItems,
        form.rightsConfirmed,
        form.instructions
      );
      backIds = getUploadedArtworkIds(uploaded.items);
    }

    return {
      printPlan: draft.printPlan,
      frontArtworkAssetIds: frontIds.length ? frontIds : undefined,
      backArtworkAssetIds: backIds.length ? backIds : undefined,
      placementNotes: buildPlacementNotes(draft),
    };
  };

  const frontArtworkItemKeys = useMemo(
    () => frontArtworkItems.map((item) => item.key).join("|"),
    [frontArtworkItems]
  );
  const backArtworkItemKeys = useMemo(
    () => backArtworkItems.map((item) => item.key).join("|"),
    [backArtworkItems]
  );

  useEffect(() => {
    if (frontArtworkItems.length > 0) {
      setFrontTransform(FILL_PRINT_AREA_TRANSFORM);
    }
  }, [frontArtworkItemKeys, frontArtworkItems.length]);

  useEffect(() => {
    if (backArtworkItems.length > 0) {
      setBackTransform(FILL_PRINT_AREA_TRANSFORM);
    }
  }, [backArtworkItemKeys, backArtworkItems.length]);

  const fetchRates = useCallback(
    async (postal: string, prov: string, method?: string) => {
      const formattedPostal = formatCanadianPostalCode(postal);
      if (!formattedPostal) {
        setRateSummary(null);
        return;
      }

      setRatesLoading(true);
      try {
        const res = await fetch("/api/customize/shipping-rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productSlug: product.slug,
            quantity: form.quantity,
            preferDesign: designHelp,
            printPlan,
            postalCode: formattedPostal,
            province: prov || undefined,
            shippingMethod: method || undefined,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not load shipping rates");
        if (!json.rates?.length) throw new Error("No shipping options available for this postal code");

        setRateSummary(json);
        setShippingRatesError(null);
        if (json.selectedMethod) {
          setForm((prev) => ({ ...prev, shippingMethod: json.selectedMethod }));
        }
      } catch (err) {
        setRateSummary(null);
        const message = err instanceof Error ? err.message : "Shipping rates unavailable";
        setShippingRatesError(message);
        toast.error(message);
      } finally {
        setRatesLoading(false);
      }
    },
    [product.slug, form.quantity, designHelp, printPlan]
  );

  useEffect(() => {
    const normalized = form.postalCode.replace(/\s/g, "");
    if (normalized.length < 6) {
      setRateSummary(null);
      setShippingRatesError(null);
      return;
    }

    const timer = setTimeout(() => {
      fetchRates(form.postalCode, form.province, form.shippingMethod || undefined);
    }, 400);

    return () => clearTimeout(timer);
  }, [form.postalCode, form.province, form.shippingMethod, designHelp, form.quantity, printPlan, fetchRates]);

  const allArtworkItems = useMemo(
    () => [...frontArtworkItems, ...backArtworkItems],
    [frontArtworkItems, backArtworkItems]
  );

  const handleRightsChange = async (checked: boolean) => {
    setForm((prev) => ({ ...prev, rightsConfirmed: checked }));
    if (!checked) return;

    const hasArtwork = isCalendar
      ? getCalendarArtworkItems(calendarSlots).length > 0
      : frontArtworkItems.length > 0 || backArtworkItems.length > 0;
    if (!hasArtwork) return;

    setUploading(true);
    try {
      if (isCalendar) {
        const items = getCalendarArtworkItems(calendarSlots);
        const uploaded = await uploadPendingArtworkItems(items, form.instructions);
        const uploadedByKey = new Map(uploaded.map((item) => [item.key, item]));
        setCalendarSlots(
          calendarSlots.map((slot) => (slot ? uploadedByKey.get(slot.key) || slot : null))
        );
      } else {
        const uploaded = await uploadPendingArtworkItems(allArtworkItems, form.instructions);
        const uploadedByKey = new Map(uploaded.map((item) => [item.key, item]));
        setFrontArtworkItems(frontArtworkItems.map((item) => uploadedByKey.get(item.key) || item));
        setBackArtworkItems(backArtworkItems.map((item) => uploadedByKey.get(item.key) || item));
      }
      toast.success("Artwork uploaded");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCalendar) {
      const filledMonths = getCalendarArtworkItems(calendarSlots);
      if (filledMonths.length < CALENDAR_MONTH_COUNT) {
        toast.error(`Please upload all ${CALENDAR_MONTH_COUNT} monthly photos (January through December)`);
        return;
      }
    } else if (!designHelp) {
      const drafts: SavedCustomizeDesignDraft[] = [...savedDesigns];
      if (currentDesignHasArtwork) {
        if (!validateDesignArtwork(printPlan, frontArtworkItems, backArtworkItems)) return;
        drafts.push({
          id: "current",
          printPlan,
          frontArtworkItems,
          backArtworkItems,
          frontTransform,
          backTransform,
        });
      }
      if (!drafts.length) {
        toast.error('Please upload at least one design (or choose "Customize by our way").');
        return;
      }
    } else if (currentDesignHasArtwork) {
      if (!validateDesignArtwork(printPlan, frontArtworkItems, backArtworkItems)) return;
    }
    if (needsArtworkRights && !form.rightsConfirmed) {
      toast.error("Please confirm artwork rights");
      return;
    }
    if (designHelp && !form.instructions.trim()) {
      toast.error("Please describe what you want in your design");
      return;
    }
    if (!form.address1.trim() || !form.city.trim() || !form.province.trim()) {
      toast.error("Please complete your shipping address");
      return;
    }
    if (!rateSummary || !form.shippingMethod) {
      toast.error("Please wait for shipping and tax to be calculated");
      return;
    }

    setSubmitting(true);
    try {
      let artworkIds: string[] = [];
      let designSets: CustomizeDesignSetPayload[] | undefined;

      if (isCalendar) {
        const itemsToUpload = getCalendarArtworkItems(calendarSlots);
        const uploaded = await uploadArtworkItemsOnSubmit(
          itemsToUpload,
          form.rightsConfirmed,
          form.instructions
        );
        artworkIds = uploaded.artworkIds;
      } else if (!designHelp) {
        const drafts: SavedCustomizeDesignDraft[] = [...savedDesigns];
        if (currentDesignHasArtwork) {
          drafts.push({
            id: "current",
            printPlan,
            frontArtworkItems,
            backArtworkItems,
            frontTransform,
            backTransform,
          });
        }
        designSets = await Promise.all(drafts.map((draft) => uploadDesignDraft(draft)));
        artworkIds = designSets.flatMap((set) => [
          ...(set.frontArtworkAssetIds || []),
          ...(set.backArtworkAssetIds || []),
        ]);
      } else if (allArtworkItems.length) {
        const uploaded = await uploadArtworkItemsOnSubmit(
          allArtworkItems,
          form.rightsConfirmed,
          form.instructions
        );
        artworkIds = uploaded.artworkIds;
      }

      const calendarNote = isCalendar
        ? "Desk calendar - monthly photos uploaded in order from January through December."
        : undefined;
      const designHelpNote = designHelp
        ? "Customer chose: Customize by our way (DPM design team)."
        : undefined;
      const optionNotes = [
        selectedOptionLabel && optionVariant
          ? `${optionVariant.name}: ${selectedOptionLabel}`
          : undefined,
        selectedSizeLabel && sizeVariant ? `${sizeVariant.name}: ${selectedSizeLabel}` : undefined,
      ].filter(Boolean);
      const optionNote = optionNotes.length ? optionNotes.join("; ") : undefined;
      const res = await fetch("/api/customize/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          message: [optionNote, calendarNote, designHelpNote, form.instructions]
            .filter(Boolean)
            .join("\n\n"),
          artworkAssetIds: artworkIds.length ? artworkIds : undefined,
          designSets,
          preferDesign: designHelp,
          printPlan,
          productSlug: product.slug,
          productName: product.name,
          quantity: form.quantity,
          shipping: {
            address1: form.address1,
            city: form.city,
            province: form.province,
            postalCode: form.postalCode,
            country: "Canada",
            method: form.shippingMethod,
          },
          consentGiven: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Checkout failed");

      if (json.monerisTicket) {
        setPendingPayment({
          ticket: json.monerisTicket,
          referenceNumber: json.referenceNumber,
          mode: json.monerisMode === "prod" ? "prod" : monerisMode,
        });
        return;
      }

      throw new Error("Payment could not be started");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMonerisComplete = async (ticket: string) => {
    if (!pendingPayment) return;

    try {
      const res = await fetch("/api/customize/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket,
          referenceNumber: pendingPayment.referenceNumber,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Payment confirmation failed");

      setPendingPayment(null);
      router.push(`/customize/success?ref=${pendingPayment.referenceNumber}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment confirmation failed");
    }
  };

  const fieldClass =
    "w-full rounded-sm border border-white/15 bg-[#12141c] px-3 py-2 text-sm text-pure-paper placeholder:text-chrome-mid focus:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan/25";

  return (
    <section className="border-b border-white/10 bg-[#050508] py-12 lg:py-16">
    <Container className="max-w-6xl">
      <nav className="mb-6 text-sm text-chrome-mid">
        <Link href="/shop" className="text-chrome-light hover:text-cyan">Shop</Link>
        <span className="mx-2">/</span>
        <Link href={`/shop/${product.slug}`} className="text-chrome-light hover:text-cyan">{product.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-pure-paper">Customize</span>
      </nav>

      <div className="space-y-10">
        <div>
          <h1 className="heading-section text-pure-paper">Customize your {product.name.toLowerCase()}</h1>
          <p className="mt-3 text-chrome-light">
            {isCalendar
              ? "Upload 12 photos, one for each month, and preview how your desk calendar will look before you pay."
              : "Choose your print option, upload artwork, and adjust placement in the Front and Back previews."}
          </p>
        </div>

        {optionVariant && optionChoices.length > 0 && (
          <div className="max-w-md">
            <label htmlFor="product-option" className="mb-1 block text-sm font-medium text-pure-paper">
              {optionVariant.name}
            </label>
            <select
              id="product-option"
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className={fieldClass}
            >
              {optionChoices.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {optionVariant && optionVariant.options.length > 0 && optionChoices.length === 0 && (
          <p className="text-sm text-amber-200">This product is temporarily out of stock for all options.</p>
        )}

        {sizeVariant && sizeChoices.length > 0 && (
          <div className="max-w-md">
            <label htmlFor="product-size" className="mb-1 block text-sm font-medium text-pure-paper">
              {sizeVariant.name}
            </label>
            <select
              id="product-size"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className={fieldClass}
            >
              {sizeChoices.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {sizeVariant && sizeVariant.options.length > 0 && sizeChoices.length === 0 && (
          <p className="text-sm text-amber-200">All sizes are currently out of stock.</p>
        )}

        {isCalendar ? (
          <CalendarMockupPreview
            productName={product.name}
            baseImageSrc={baseImage}
            monthImageUrls={getCalendarPreviewUrls(calendarSlots)}
            selectedMonth={previewMonth}
            onSelectMonth={setPreviewMonth}
            disclaimer={
              product.customizer?.previewDisclaimer ||
              "Rough draft only. Final placement, colour, and sizing may vary slightly."
            }
          />
        ) : dualSide ? (
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <ProductDualSideCustomizePreview
              productName={product.name}
              baseImageSrc={baseImage}
              backImageSrc={backBaseImage}
              frontArtworkUrls={getArtworkImagePreviewUrls(frontArtworkItems)}
              backArtworkUrls={backPreviewUrls}
              mockupConfig={mockupConfig}
              frontTransform={frontTransform}
              backTransform={backTransform}
              onFrontTransformChange={setFrontTransform}
              onBackTransformChange={setBackTransform}
              showFront={showFrontPreview}
              showBack={showBackPreview}
              disclaimer={
                product.customizer?.previewDisclaimer ||
                "Rough draft only. Final placement, colour, and sizing may vary slightly."
              }
            />
            <CustomizePrintPlanPanel
              printPlan={printPlan}
              onPrintPlanChange={setPrintPlan}
              planChoices={planChoices}
              currency={product.currency}
              frontArtworkItems={frontArtworkItems}
              backArtworkItems={backArtworkItems}
              onFrontArtworkChange={setFrontArtworkItems}
              onBackArtworkChange={setBackArtworkItems}
              rightsConfirmed={form.rightsConfirmed}
              customerNote={form.instructions}
            />
          </div>
        ) : null}

        {!isCalendar && dualSide && !designHelp && (
          <div className="space-y-3">
            {savedDesigns.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {savedDesigns.map((design, index) => (
                  <span
                    key={design.id}
                    className="rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-xs font-medium text-pure-paper"
                  >
                    Design {index + 1} saved
                  </span>
                ))}
              </div>
            )}
            {savedDesigns.length < MAX_CUSTOMIZE_DESIGNS - 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveAnotherDesign}
                disabled={uploading}
              >
                Add another design option ({savedDesigns.length + 1}/{MAX_CUSTOMIZE_DESIGNS})
              </Button>
            )}
            <p className="text-xs text-chrome-mid">
              Save your current front/back artwork, then start a fresh preview for another option (up to{" "}
              {MAX_CUSTOMIZE_DESIGNS} per order). All saved designs are sent when you pay.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="max-w-6xl space-y-5 rounded-xl border border-white/10 bg-[#0a0c14] p-6 shadow-[0_0_40px_rgba(6,94,229,0.12)]"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-pure-paper">First name</label>
              <input
                required
                className={fieldClass}
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-pure-paper">Last name</label>
              <input
                required
                className={fieldClass}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-pure-paper">Email</label>
            <input
              required
              type="email"
              className={fieldClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-pure-paper">Phone</label>
            <input
              required
              className={fieldClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-pure-paper">Quantity</label>
            <input
              type="number"
              min={product.minQuantity}
              className={cn(fieldClass, "w-28")}
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: parseInt(e.target.value, 10) || product.minQuantity })
              }
            />
          </div>

          {isCalendar ? (
            <CalendarArtworkUpload
              slots={calendarSlots}
              onChange={setCalendarSlots}
              rightsConfirmed={form.rightsConfirmed}
              customerNote={form.instructions}
              onMonthFocus={setPreviewMonth}
            />
          ) : null}
          {uploading && <p className="text-xs text-chrome-mid">Uploading...</p>}

          <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm text-pure-paper">
            <input
              type="checkbox"
              checked={designHelp}
              onChange={(e) => {
                const checked = e.target.checked;
                setDesignHelp(checked);
                if (checked) setSavedDesigns([]);
              }}
              className="mt-1 accent-cyan"
            />
            <span>
              <strong>Customize by our way</strong>
              <br />
              <span className="text-chrome-light">
                Our team designs for you (+{formatCurrency(designFee, product.currency)}). Describe what you want in the
                notes below. You can still upload reference photos above.
              </span>
            </span>
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium text-pure-paper">
              {designHelp ? "Design notes (required)" : "Special instructions (optional)"}
            </label>
            <textarea
              className={fieldClass}
              rows={designHelp ? 4 : 3}
              placeholder={
                designHelp
                  ? "Example: I want your design - use navy and gold, include our logo, text: Happy Birthday..."
                  : undefined
              }
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            />
          </div>

          {needsArtworkRights && (
            <label className="flex items-start gap-2 text-sm text-chrome-light">
              <input
                type="checkbox"
                checked={form.rightsConfirmed}
                onChange={(e) => handleRightsChange(e.target.checked)}
                className="mt-1 accent-cyan"
              />
              I confirm I have the rights to use this artwork for printing.
            </label>
          )}

          <h2 className="font-display text-lg font-semibold text-pure-paper pt-2">Checkout - your details</h2>
          <p className="text-xs text-chrome-mid">
            Enter your address and postal code to calculate shipping and tax. Tax is included in your total and on the
            payment screen.
          </p>
          <h3 className="text-sm font-medium text-pure-paper">Shipping address</h3>
          <div>
            <label className="mb-1 block text-sm font-medium text-pure-paper">Address line 1</label>
            <AddressAutocomplete
              id="customize-address1"
              value={form.address1}
              cityHint={form.city}
              onChange={(value) => setForm((prev) => ({ ...prev, address1: value }))}
              onAddressSelect={(addr) => {
                setForm((prev) => {
                  const postal = formatCanadianPostalCode(addr.postalCode || "") || addr.postalCode || prev.postalCode;
                  const provinceFromPostal = postal ? provinceFromPostalCode(postal) : null;
                  const provinceCode = addr.province
                    ? normalizeProvinceCode(addr.province) || prev.province
                    : provinceFromPostal || prev.province;
                  return {
                    ...prev,
                    address1: addr.address1,
                    city: addr.city || prev.city,
                    province: provinceCode,
                    postalCode: postal,
                  };
                });
              }}
              className={fieldClass}
              placeholder="e.g. 28 Sinclair St"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-pure-paper">City</label>
              <input required className={fieldClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-pure-paper">Province</label>
              <select required className={fieldClass} value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>
                <option value="">Select province</option>
                {CANADIAN_PROVINCES.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-pure-paper">Postal code</label>
              <input
                required
                className={fieldClass}
                placeholder="A1A 1A1"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                onBlur={(e) => {
                  const formatted = formatCanadianPostalCode(e.target.value);
                  if (formatted) {
                    const provinceFromPostal = provinceFromPostalCode(formatted);
                    setForm((prev) => ({
                      ...prev,
                      postalCode: formatted,
                      province: provinceFromPostal || prev.province,
                    }));
                  }
                }}
              />
            </div>
          </div>

          <h2 className="font-display text-lg font-semibold text-pure-paper">Delivery method</h2>
          {rateSummary?.rateSource === "estimate" && (
            <p className="rounded-sm border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Showing estimated shipping. Live Canada Post rates are not connected yet.
            </p>
          )}
          {ratesLoading && <p className="text-sm text-chrome-mid">Calculating Canada Post rates...</p>}
          {shippingRatesError && !ratesLoading && (
            <p className="rounded-sm border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {shippingRatesError} Check your postal code and province, or try again in a moment.
            </p>
          )}
          {!ratesLoading && !shippingRatesError && (rateSummary?.rates?.length ?? 0) === 0 && form.postalCode.replace(/\s/g, "").length >= 6 && (
            <p className="text-sm text-chrome-mid">
              Enter a valid Canadian postal code to see delivery options and tax.
            </p>
          )}
          <div className="space-y-3">
            {(rateSummary?.rates || []).map((rate) => (
              <label
                key={rate.id}
                className={`flex cursor-pointer items-start gap-3 rounded-sm border p-4 transition-colors ${
                  form.shippingMethod === rate.id
                    ? "border-cyan bg-cyan/10"
                    : "border-white/10 hover:border-cyan/40"
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value={rate.id}
                  checked={form.shippingMethod === rate.id}
                  className="mt-1"
                  onChange={() => {
                    setForm((prev) => ({ ...prev, shippingMethod: rate.id }));
                    fetchRates(form.postalCode, form.province, rate.id);
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-pure-paper">{rate.label}</p>
                  <p className="text-sm text-chrome-mid">{rate.description}</p>
                </div>
                <span className="shrink-0 font-semibold text-pure-paper">
                  {rate.price === 0 ? "Free" : formatCurrency(rate.price, rate.currency)}
                </span>
              </label>
            ))}
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm">
            <p className="font-semibold text-pure-paper">Order total</p>
            <div className="mt-3 space-y-2 text-chrome-light">
              <p className="flex justify-between">
                <span>Product</span>
                <span>{formatCurrency(rateSummary?.subtotal ?? basePrice * form.quantity, product.currency)}</span>
              </p>
              {(rateSummary?.printSurcharge ?? printSurcharge) > 0 && (
                <p className="flex justify-between">
                  <span>Printing</span>
                  <span>
                    {formatCurrency(rateSummary?.printSurcharge ?? printSurcharge, product.currency)}
                  </span>
                </p>
              )}
              {designHelp && (
                <p className="flex justify-between">
                  <span>Customize by our way</span>
                  <span>{formatCurrency(rateSummary?.designFee ?? designFee, product.currency)}</span>
                </p>
              )}
              <p className="flex justify-between border-t border-white/10 pt-2">
                <span>Subtotal (before shipping)</span>
                <span>
                  {formatCurrency(
                    rateSummary?.merchandiseTotal ??
                      basePrice * form.quantity + printSurcharge + (designHelp ? designFee : 0),
                    product.currency
                  )}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Shipping</span>
                <span>{rateSummary ? formatCurrency(rateSummary.shippingCost, rateSummary.currency) : "-"}</span>
              </p>
              <p className="flex justify-between">
                <span>{rateSummary?.taxLabel || "Tax (HST/GST)"}</span>
                <span>
                  {rateSummary
                    ? formatCurrency(rateSummary.tax, rateSummary.currency)
                    : form.postalCode.replace(/\s/g, "").length >= 6
                      ? ratesLoading
                        ? "Calculating..."
                        : "-"
                      : "After postal code"}
                </span>
              </p>
              <p className="flex justify-between border-t border-white/10 pt-2 text-lg font-bold text-cyan">
                <span>Total due today</span>
                <span>{formatCurrency(displayTotal, product.currency)}</span>
              </p>
            </div>
            {!rateSummary && form.postalCode.replace(/\s/g, "").length >= 6 && !ratesLoading && (
              <p className="mt-2 text-xs text-chrome-mid">Enter your address and postal code to calculate shipping and tax.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={submitting || uploading || ratesLoading || !checkoutReady}
              className={cn(!checkoutReady && !ratesLoading && "cursor-not-allowed opacity-60")}
            >
              {submitting || uploading ? "Processing..." : `Pay ${formatCurrency(displayTotal, product.currency)} now`}
            </Button>
            {!checkoutReady && !ratesLoading && form.postalCode.replace(/\s/g, "").length >= 6 && (
              <p className="w-full text-xs text-amber-200">
                Choose a delivery method above before paying. The button stays inactive until shipping and tax are
                calculated.
              </p>
            )}
            <Link href={`/shop/${product.slug}`} className={buttonVariants("secondary")}>Back to product</Link>
          </div>
        </form>
      </div>

      {pendingPayment && (
        <MonerisCheckout
          ticket={pendingPayment.ticket}
          mode={pendingPayment.mode}
          onComplete={handleMonerisComplete}
          onCancel={() => {
            setPendingPayment(null);
            toast.message("Payment cancelled. You can try again when ready.");
          }}
          onError={(message) => toast.error(message)}
        />
      )}
    </Container>
    </section>
  );
}
