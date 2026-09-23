import OwnerPage from "@/components/OwnerPage";

export default function Page() {
  return (
    <OwnerPage
      config={{
        role: "fst_owner",
        title: "Owner 1 Dashboard",
        subtitle: "Workshop ownership overview — 1st owner",
        navLabel: "Owner 1",
      }}
    />
  );
}