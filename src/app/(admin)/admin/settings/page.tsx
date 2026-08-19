import { getAllSettings } from "@/lib/data/settings";
import { CompanyProfileForm } from "@/components/admin/settings/company-profile-form";
import { EventTypesEditor } from "@/components/admin/settings/event-types-editor";
import { ServiceCatalogEditor } from "@/components/admin/settings/service-catalog-editor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Company branding and reference data used across the app.
        </p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          <TabsTrigger value="event-types">Event Types</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="max-w-2xl">
          <CompanyProfileForm initialValues={settings.companyProfile} />
        </TabsContent>
        <TabsContent value="event-types" className="max-w-2xl">
          <EventTypesEditor initialValues={settings.eventTypes} />
        </TabsContent>
        <TabsContent value="services" className="max-w-2xl">
          <ServiceCatalogEditor initialValues={settings.serviceCatalog} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
