import TrackerTab from "@/components/TrackerTab";

export default function Page() {
  return (
    <TrackerTab
      title="Owner 1 tracker"
      subtitle="Traffic analytics for the first owner account"
      roleFilter="fst_owner"
    />
  );
}