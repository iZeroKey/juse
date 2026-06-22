import { PackagesContext } from "@/context/packages-context";
import { useContext } from "react";

export function usePackages() {
  const context = useContext(PackagesContext);
  if (!context) {
    throw new Error("usePackages must be used within a PackagesProvider");
  }
  return context;
}
