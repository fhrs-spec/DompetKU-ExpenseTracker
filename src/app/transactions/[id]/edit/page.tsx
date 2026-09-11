import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTransactionById } from "@/lib/db/transactions";
import { AppLayout } from "@/components/layout/app-layout";
import { TransactionForm } from "@/components/transactions/transaction-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EditTransactionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const transaction = await getTransactionById(id);

  if (!transaction) {
    notFound();
  }

  return (
    <AppLayout
      userName={user?.user_metadata?.name}
      userEmail={user?.email}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Transaksi
        </Link>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Transaksi</CardTitle>
            <CardDescription>
              Perbarui rincian nominal, kategori, atau tanggal transaksi Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm initialData={transaction} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
