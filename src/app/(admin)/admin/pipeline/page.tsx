import { PipelineBoard } from "@/components/admin/pipeline/pipeline-board";

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Drag bookings across stages to update their status in real time.
        </p>
      </div>
      <PipelineBoard />
    </div>
  );
}
