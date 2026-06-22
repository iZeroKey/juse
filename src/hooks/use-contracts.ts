import { ContractsContext } from "@/context/contracts-context";
import { useContext } from "react";

export function useContracts() {
  const context = useContext(ContractsContext);
  if (!context) {
    throw new Error("useContracts must be used within a ContractsProvider");
  }
  return context;
}
