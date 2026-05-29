"use client";

import Image from "next/image";
import Link from "next/link";
import TransactionForm, { OPEN_MODAL_EVENT } from "./TransactionForm";
import { PlusCircle } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const handleOpenModal = () => {
    window.dispatchEvent(new CustomEvent(OPEN_MODAL_EVENT));
  };

  return (
    <nav className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-1 flex justify-start">
            <ThemeToggle />
          </div>

          <div className="flex-1 flex justify-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/finguard-logo.svg"
                alt="FinGuard Logo"
                width={160}
                height={48}
                priority
              />
            </Link>
          </div>

          <div className="flex-1 flex justify-end">
            <TransactionForm onSuccess={() => {}} />
          </div>
        </div>
      </div>
    </nav>
  );
}
