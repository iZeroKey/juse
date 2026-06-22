import { AnimatePresence, motion } from "framer-motion";
import { ContractsTable } from "./contracts-table";
import { PackagesTable } from "./packages-table";
interface ContractsPageProps {
  activeTab: "contracts" | "packages";
}

export function ContractsPage({ activeTab }: ContractsPageProps) {
  return (
    <div className='flex flex-col h-full bg-background overflow-hidden'>
      <main className='flex-1 overflow-hidden bg-background relative p-4 md:p-6'>
        <AnimatePresence mode='wait'>
          {activeTab === "contracts" ? (
            <motion.div
              key='contracts'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className='absolute inset-4 md:inset-6'>
              <ContractsTable />
            </motion.div>
          ) : (
            <motion.div
              key='packages'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className='absolute inset-4 md:inset-6'>
              <PackagesTable />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
