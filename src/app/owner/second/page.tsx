import OwnerPage from "@/components/OwnerPage";

export default function Page() {
  return (
    <OwnerPage
      config={{
        role: "scd_owner",
        title: "Owner 2 Dashboard",
        subtitle: "Workshop ownership overview — 2nd owner",
        navLabel: "Owner 2",
      }}
    />
  );
}