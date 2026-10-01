import { getSettings } from "@/lib/settings";
import { serialize } from "@/lib/serialize";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return <SettingsForm initialData={serialize(settings) as unknown as Parameters<typeof SettingsForm>[0]["initialData"]} />;
}
