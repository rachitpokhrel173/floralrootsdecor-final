import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function PhasePlaceholder({
  icon: Icon,
  title,
  description,
  phase,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
            <Icon className="h-6 w-6" />
          </div>
          <p className="font-display text-lg">{title} is scaffolded and ready to build</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            This section&apos;s route, layout, and navigation are wired up. Full functionality
            ships in <span className="font-medium text-foreground">{phase}</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
