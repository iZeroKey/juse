import { useTheme } from "@/components/theme-provider";
import { Toaster } from "sileo";

export function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      position='top-right'
      offset={{ top: 48, right: 16 }}
      theme={theme === "system" ? undefined : theme}
    />
  );
}
