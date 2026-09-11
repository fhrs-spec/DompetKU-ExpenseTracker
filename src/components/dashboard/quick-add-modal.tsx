"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TransactionForm } from "@/components/transactions/transaction-form";

export function QuickAddModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2 shadow-soft hover:shadow-card transition-all"
      >
        <Plus className="h-4 w-4" />
        <span>Quick Add</span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Catat Transaksi Cepat"
        description="Tambahkan pemasukan atau pengeluaran baru langsung ke akun Anda."
      >
        <TransactionForm
          onSuccess={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
}
