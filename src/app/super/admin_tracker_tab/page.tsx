import TrackerTab from "@/components/TrackerTab";

export default function Page() {
  return (
    <TrackerTab
      title="Admin tracker"
      subtitle="Traffic analytics for the regular administrator account"
      roleFilter="admin"
    />
  );
}