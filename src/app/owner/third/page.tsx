import OwnerPage from "@/components/OwnerPage";

export default function Page() {
  return (
    <OwnerPage
      config={{
        role: "trd_owner",
        title: "Owner 3 Dashboard",
        subtitle: "Workshop ownership overview — 3rd owner",
        navLabel: "Owner 3",
      }}
    />
  );
}