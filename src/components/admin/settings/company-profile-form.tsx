"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { companyProfileSchema, type CompanyProfileValues } from "@/lib/validations/settings";
import { updateCompanyProfileAction } from "@/actions/settings-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogoUploader } from "./logo-uploader";

export function CompanyProfileForm({ initialValues }: { initialValues: CompanyProfileValues }) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CompanyProfileValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: initialValues,
  });

  const logoUrl = watch("logo_url") ?? "";

  function onSubmit(values: CompanyProfileValues) {
    startTransition(async () => {
      const res = await updateCompanyProfileAction(values);
      if (res.success) {
        toast.success("Company profile updated");
      } else {
        toast.error(res.error ?? "Failed to update — you may need admin/manager access");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg font-normal">Company Profile</CardTitle>
        <CardDescription>
          Used across the public site, PDF quotations, and invoices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" {...register("tagline")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
          </div>

          <div className="space-y-2">
            <Label>Company Logo</Label>
            <LogoUploader
              value={logoUrl}
              onChange={(url) => setValue("logo_url", url, { shouldDirty: true, shouldValidate: true })}
            />
            {errors.logo_url && (
              <p className="text-xs text-destructive">{errors.logo_url.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" {...register("currency")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_percent">Default Tax %</Label>
              <Input id="tax_percent" type="number" step="0.01" min={0} max={100} {...register("tax_percent")} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="luxury" disabled={isPending || !isDirty}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
