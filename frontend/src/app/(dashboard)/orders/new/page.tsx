"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ChargeBreakdownDisplay } from "@/components/ChargeBreakdown";
import { apiService } from "@/lib/api";

const steps = ["Addresses", "Package", "Delivery", "Price Preview"];

type FormField =
  | "pickupAddress"
  | "pickupPincode"
  | "dropAddress"
  | "dropPincode"
  | "length"
  | "breadth"
  | "height"
  | "actualWeight"
  | "type"
  | "paymentType";

type FormData = Record<FormField, string>;
type FormErrors = Partial<Record<FormField, string>>;

const initialFormData: FormData = {
  pickupAddress: "",
  pickupPincode: "",
  dropAddress: "",
  dropPincode: "",
  length: "",
  breadth: "",
  height: "",
  actualWeight: "",
  type: "B2C",
  paymentType: "PREPAID",
};

const positiveNumberError = (value: string) =>
  !value || !Number.isFinite(Number(value)) || Number(value) <= 0
    ? "Enter a value greater than 0"
    : undefined;

export default function CreateOrder() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [chargeData, setChargeData] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  const [creating, setCreating] = useState(false);

  const volumetricWeight = useMemo(() => {
    const length = Number(formData.length);
    const breadth = Number(formData.breadth);
    const height = Number(formData.height);
    return length > 0 && breadth > 0 && height > 0
      ? (length * breadth * height) / 5000
      : 0;
  }, [formData.length, formData.breadth, formData.height]);

  const actualWeight = Number(formData.actualWeight) || 0;
  const billableWeight = Math.max(actualWeight, volumetricWeight);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const field = event.target.name as FormField;
    setFormData((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setChargeData(null);
  };

  const validate = (targetStep: number) => {
    const nextErrors: FormErrors = {};

    if (targetStep >= 0) {
      if (!formData.pickupAddress.trim())
        nextErrors.pickupAddress = "Pickup address is required";
      if (!/^\d{6}$/.test(formData.pickupPincode))
        nextErrors.pickupPincode = "Enter a valid 6-digit pincode";
      if (!formData.dropAddress.trim())
        nextErrors.dropAddress = "Drop address is required";
      if (!/^\d{6}$/.test(formData.dropPincode))
        nextErrors.dropPincode = "Enter a valid 6-digit pincode";
    }

    if (targetStep >= 1) {
      nextErrors.length = positiveNumberError(formData.length);
      nextErrors.breadth = positiveNumberError(formData.breadth);
      nextErrors.height = positiveNumberError(formData.height);
      nextErrors.actualWeight = positiveNumberError(formData.actualWeight);
    }

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key as FormField]) delete nextErrors[key as FormField];
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const payload = () => ({
    pickupAddress: formData.pickupAddress.trim(),
    pickupPincode: formData.pickupPincode,
    dropAddress: formData.dropAddress.trim(),
    dropPincode: formData.dropPincode,
    packageLength: Number(formData.length),
    packageBreadth: Number(formData.breadth),
    packageHeight: Number(formData.height),
    actualWeight: Number(formData.actualWeight),
    orderType: formData.type,
    paymentType: formData.paymentType,
  });

  const calculateCharge = async () => {
    if (!validate(2)) return;
    setCalculating(true);
    try {
      const res = await apiService.orders.calculateCharge(payload());
      setChargeData(res.data);
      setStep(3);
      toast.success("Price calculated");
    } catch (err: any) {
      setChargeData(null);
      toast.error(
        err.response?.data?.message ||
          "Unable to calculate charge for this route",
      );
    } finally {
      setCalculating(false);
    }
  };

  const goNext = async () => {
    if (step < 2) {
      if (validate(step)) setStep((current) => current + 1);
      return;
    }
    if (step === 2) await calculateCharge();
  };

  const handleSubmit = async () => {
    if (!chargeData || !validate(2)) {
      toast.error("Recalculate the price before creating this order");
      setStep(2);
      return;
    }

    setCreating(true);
    try {
      const res = await apiService.orders.createOrder(payload());
      toast.success("Order created successfully");
      router.push(`/orders/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 pb-28 sm:gap-6">
      <header>
        <p className="mb-1 font-mono text-xs font-black uppercase tracking-widest">
          New shipment
        </p>
        <h1 className="inline-block border-4 border-neo-black bg-neo-green px-4 py-2 text-3xl font-black text-neo-white shadow-neo sm:text-4xl">
          CREATE ORDER
        </h1>
      </header>

      <nav aria-label="Order creation progress">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((label, index) => (
            <li
              key={label}
              className={`border-4 border-neo-black p-2 font-mono text-xs font-black uppercase sm:p-3 ${
                index === step
                  ? "bg-neo-yellow shadow-neo"
                  : index < step
                    ? "bg-neo-green text-neo-white"
                    : "bg-neo-white"
              }`}
              aria-current={index === step ? "step" : undefined}
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center border-2 border-current">
                {index + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
      </nav>

      {step === 0 && (
        <Card>
          <div className="mb-5 border-b-4 border-neo-black pb-3">
            <p className="font-mono text-xs font-black uppercase">
              Step 1 of 4
            </p>
            <h2 className="text-2xl font-black">WHERE IS IT GOING?</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-4 border-4 border-neo-black bg-neo-gray p-4">
              <h3 className="font-mono font-black uppercase">Pickup</h3>
              <Input
                label="Full address"
                name="pickupAddress"
                autoComplete="street-address"
                value={formData.pickupAddress}
                onChange={handleChange}
                error={errors.pickupAddress}
              />
              <Input
                label="Pincode"
                name="pickupPincode"
                inputMode="numeric"
                maxLength={6}
                value={formData.pickupPincode}
                onChange={handleChange}
                error={errors.pickupPincode}
              />
            </div>
            <div className="flex flex-col gap-4 border-4 border-neo-black bg-neo-yellow p-4">
              <h3 className="font-mono font-black uppercase">Drop</h3>
              <Input
                label="Full address"
                name="dropAddress"
                autoComplete="street-address"
                value={formData.dropAddress}
                onChange={handleChange}
                error={errors.dropAddress}
              />
              <Input
                label="Pincode"
                name="dropPincode"
                inputMode="numeric"
                maxLength={6}
                value={formData.dropPincode}
                onChange={handleChange}
                error={errors.dropPincode}
              />
            </div>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <div className="mb-5 border-b-4 border-neo-black pb-3">
            <p className="font-mono text-xs font-black uppercase">
              Step 2 of 4
            </p>
            <h2 className="text-2xl font-black">PACKAGE SIZE & WEIGHT</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="Length (cm)"
                name="length"
                type="number"
                min="0"
                step="0.1"
                value={formData.length}
                onChange={handleChange}
                error={errors.length}
              />
              <Input
                label="Breadth (cm)"
                name="breadth"
                type="number"
                min="0"
                step="0.1"
                value={formData.breadth}
                onChange={handleChange}
                error={errors.breadth}
              />
              <Input
                label="Height (cm)"
                name="height"
                type="number"
                min="0"
                step="0.1"
                value={formData.height}
                onChange={handleChange}
                error={errors.height}
              />
              <div className="sm:col-span-3">
                <Input
                  label="Actual weight (kg)"
                  name="actualWeight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.actualWeight}
                  onChange={handleChange}
                  error={errors.actualWeight}
                />
              </div>
            </div>
            <aside className="border-4 border-neo-black bg-neo-yellow p-4">
              <p className="font-mono text-xs font-black uppercase">
                Live weight preview
              </p>
              <dl className="mt-3 flex flex-col gap-3 font-mono text-sm">
                <div>
                  <dt className="font-bold">Volumetric</dt>
                  <dd className="text-2xl font-black">
                    {volumetricWeight.toFixed(2)} kg
                  </dd>
                </div>
                <div className="border-t-2 border-neo-black pt-3">
                  <dt className="font-bold">Billable</dt>
                  <dd className="text-2xl font-black">
                    {billableWeight.toFixed(2)} kg
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs font-medium">
                Calculated as L × B × H ÷ 5000. Billing uses the higher of
                actual and volumetric weight.
              </p>
            </aside>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <div className="mb-5 border-b-4 border-neo-black pb-3">
            <p className="font-mono text-xs font-black uppercase">
              Step 3 of 4
            </p>
            <h2 className="text-2xl font-black">DELIVERY OPTIONS</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Select
              label="Order type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={[
                { value: "B2C", label: "B2C · BUSINESS TO CUSTOMER" },
                { value: "B2B", label: "B2B · BUSINESS TO BUSINESS" },
              ]}
            />
            <Select
              label="Payment type"
              name="paymentType"
              value={formData.paymentType}
              onChange={handleChange}
              options={[
                { value: "PREPAID", label: "PREPAID" },
                { value: "COD", label: "CASH ON DELIVERY (COD)" },
              ]}
            />
          </div>
          <div className="mt-6 border-4 border-neo-black bg-neo-gray p-4">
            <p className="font-mono text-xs font-black uppercase">
              Ready to price
            </p>
            <p className="mt-1 text-sm">
              The next step securely calculates the charge for{" "}
              {formData.pickupPincode} → {formData.dropPincode} using{" "}
              {billableWeight.toFixed(2)} kg billable weight.
            </p>
          </div>
        </Card>
      )}

      {step === 3 && chargeData && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <ChargeBreakdownDisplay data={chargeData} />
          <Card>
            <p className="font-mono text-xs font-black uppercase">
              Confirm shipment
            </p>
            <h2 className="mt-1 text-2xl font-black">ORDER SUMMARY</h2>
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div className="border-t-2 border-neo-black pt-2">
                <dt className="font-mono text-xs font-bold uppercase">Route</dt>
                <dd>
                  {formData.pickupPincode} → {formData.dropPincode}
                </dd>
              </div>
              <div className="border-t-2 border-neo-black pt-2">
                <dt className="font-mono text-xs font-bold uppercase">
                  Package
                </dt>
                <dd>
                  {formData.length} × {formData.breadth} × {formData.height} cm
                  · {actualWeight.toFixed(2)} kg actual
                </dd>
              </div>
              <div className="border-t-2 border-neo-black pt-2">
                <dt className="font-mono text-xs font-bold uppercase">
                  Delivery
                </dt>
                <dd>
                  {formData.type} · {formData.paymentType}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      )}

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t-4 border-neo-black bg-neo-white p-3 sm:static sm:border-4 sm:p-4 sm:shadow-neo">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0 || calculating || creating}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
          >
            BACK
          </Button>
          <p className="hidden font-mono text-xs font-black uppercase sm:block">
            Step {step + 1} of {steps.length}
          </p>
          {step < 3 ? (
            <Button type="button" disabled={calculating} onClick={goNext}>
              {calculating
                ? "CALCULATING…"
                : step === 2
                  ? "CALCULATE & PREVIEW"
                  : "NEXT"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="success"
              disabled={creating || !chargeData}
              onClick={handleSubmit}
            >
              {creating ? "CREATING…" : "CONFIRM & CREATE"}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
