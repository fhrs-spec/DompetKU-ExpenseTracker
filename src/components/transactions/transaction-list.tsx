"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Inbox,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Transaction } from "@/types/database";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteTransactionAction } from "@/app/transactions/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Card } from "@/components/ui/card";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types/database";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Search & Filter local states
  const [searchTerm, setSearchTerm] = React.useState(
    searchParams.get("search") || ""
  );
  const [selectedType, setSelectedType] = React.useState(
    searchParams.get("type") || "all"
  );
  const [selectedCategory, setSelectedCategory] = React.useState(
    searchParams.get("category") || "all"
  );
  const [startDate, setStartDate] = React.useState(
    searchParams.get("startDate") || ""
  );
  const [endDate, setEndDate] = React.useState(
    searchParams.get("endDate") || ""
  );

  // Delete modal state
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Sync filters to URL query params
  const applyFilters = React.useCallback(
    (overrides?: {
      search?: string;
      type?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      const s = overrides?.search !== undefined ? overrides.search : searchTerm;
      const t = overrides?.type !== undefined ? overrides.type : selectedType;
      const c =
        overrides?.category !== undefined ? overrides.category : selectedCategory;
      const sd =
        overrides?.startDate !== undefined ? overrides.startDate : startDate;
      const ed =
        overrides?.endDate !== undefined ? overrides.endDate : endDate;

      if (s) params.set("search", s);
      else params.delete("search");

      if (t && t !== "all") params.set("type", t);
      else params.delete("type");

      if (c && c !== "all") params.set("category", c);
      else params.delete("category");

      if (sd) params.set("startDate", sd);
      else params.delete("startDate");

      if (ed) params.set("endDate", ed);
      else params.delete("endDate");

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, searchTerm, selectedType, selectedCategory, startDate, endDate]
  );

  // Handle Search on Enter or debounce
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters({ search: searchTerm });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedCategory("all");
    setStartDate("");
    setEndDate("");
    router.push(pathname);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedType !== "all" ||
    selectedCategory !== "all" ||
    startDate ||
    endDate;

  // Handle Delete Confirmation
  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteTransactionAction(deletingId);
      if (!res.success) {
        toast.error(res.error || "Gagal menghapus transaksi");
        return;
      }
      toast.success("Transaksi berhasil dihapus");
      setDeletingId(null);
    } catch {
      toast.error("Terjadi kendala saat menghapus transaksi");
    } finally {
      setIsDeleting(false);
    }
  };

  const allCategories = Array.from(
    new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])
  );

  return (
    <div className="space-y-6">
      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 sm:gap-3.5">
          {/* Search Input */}
          <div className="sm:col-span-2 md:col-span-4 relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <div className="col-span-1 md:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                applyFilters({ type: e.target.value });
              }}
              className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Semua Tipe</option>
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="col-span-1 md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                applyFilters({ category: e.target.value });
              }}
              className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-base sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Semua Kategori</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="sm:col-span-2 md:col-span-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  applyFilters({ startDate: e.target.value });
                }}
                className="w-full text-xs sm:text-sm"
              />
            </div>
            <span className="text-muted-foreground text-xs font-bold">-</span>
            <div className="relative flex-1">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  applyFilters({ endDate: e.target.value });
                }}
                className="w-full text-xs sm:text-sm"
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleResetFilters}
                title="Reset filter"
                className="h-10 w-10 sm:h-9 sm:w-9 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Tidak ada transaksi ditemukan
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            {hasActiveFilters
              ? "Coba sesuaikan kata kunci atau bersihkan filter pencarian."
              : "Belum ada catatan transaksi. Mulai catat pemasukan dan pengeluaran Anda."}
          </p>
          <div className="mt-6 flex gap-3">
            {hasActiveFilters ? (
              <Button variant="outline" onClick={handleResetFilters}>
                Reset Filter
              </Button>
            ) : (
              <Link href="/transactions/add">
                <Button>Catat Transaksi Baru</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((t) => {
            const isIncome = t.type === "income";

            return (
              <Card
                key={t.id}
                className="p-3.5 sm:p-4.5 transition-all hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Icon, Title, Date, Category */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl ${
                        isIncome
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownLeft className="h-5 w-5" />
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground text-sm sm:text-base truncate max-w-[140px] xs:max-w-[200px] sm:max-w-md">
                          {t.title}
                        </h4>
                        <Badge
                          variant={isIncome ? "success" : "secondary"}
                          className="text-[10px] sm:text-[11px] py-0 shrink-0"
                        >
                          {t.category}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{formatDate(t.transaction_date)}</span>
                        {t.note && (
                          <>
                            <span>•</span>
                            <span className="italic truncate">{t.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Nominal & Actions */}
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <span
                      className={`text-sm sm:text-base font-bold font-mono tracking-tight ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-destructive"
                      }`}
                    >
                      {isIncome ? "+" : "-"} {formatCurrency(Number(t.amount))}
                    </span>

                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Link href={`/transactions/${t.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground active:scale-95"
                          title="Edit transaksi"
                        >
                          <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(t.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive active:scale-95"
                        title="Hapus transaksi"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Hapus Transaksi"
        description="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
      >
        <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-6">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>Data transaksi akan dihapus secara permanen dari akun Anda.</span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setDeletingId(null)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Ya, Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
