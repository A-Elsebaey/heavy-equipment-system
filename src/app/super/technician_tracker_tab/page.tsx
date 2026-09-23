import TrackerTab from "@/components/TrackerTab";

export default function Page() {
  return (
    <TrackerTab
      title="Technician tracker"
      subtitle="Traffic analytics for technician accounts"
      roleFilter="technician"
    />
  );
}