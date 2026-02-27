import { useState } from "react";
import { useFields, type Field } from "@/hooks/useFields";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import FieldCard from "@/components/FieldCard";
import CreateFieldDialog from "@/components/CreateFieldDialog";
import { Loader2, Sprout, LayoutGrid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const { fields, isLoading, deleteField } = useFields();
  const [editField, setEditField] = useState<Field | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this field? This cannot be undone.")) return;
    try {
      await deleteField.mutateAsync(id);
      toast({ title: "Field deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Farmer";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-1">Welcome, {firstName} 👋</h1>
            <p className="text-muted-foreground">
              {fields.length > 0
                ? `You have ${fields.length} field${fields.length > 1 ? "s" : ""} under management.`
                : "Get started by creating your first field analysis."}
            </p>
          </div>
          <CreateFieldDialog />
        </div>

        {/* Fields Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : fields.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <LayoutGrid className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-display font-semibold">No fields yet</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Create your first field analysis to get smart irrigation and fertilizer recommendations.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => (
              <FieldCard key={field.id} field={field} onEdit={setEditField} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        {editField && (
          <CreateFieldDialog editField={editField} open={!!editField} onClose={() => setEditField(null)} />
        )}
      </main>
    </div>
  );
}
