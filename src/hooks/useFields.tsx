import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Field {
  id: string;
  user_id: string;
  field_name: string;
  crop_type: string;
  plantation_date: string;
  soil_type: string;
  irrigation_type: string;
  soil_moisture: string;
  location: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useFields() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ✅ FETCH FIELDS (User specific)
  const fieldsQuery = useQuery({
    queryKey: ["fields", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fields")
        .select("*")
        .eq("user_id", user!.id) // 🔥 IMPORTANT
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Field[];
    },
    enabled: !!user,
  });

  // ✅ CREATE FIELD
  const createField = useMutation({
    mutationFn: async (
      field: Omit<Field, "id" | "user_id" | "created_at" | "updated_at">
    ) => {
      const { data, error } = await supabase
        .from("fields")
        .insert({
          ...field,
          user_id: user!.id, // 🔥 REQUIRED for RLS
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fields", user?.id] }),
  });

  // ✅ UPDATE FIELD (User Safe)
  const updateField = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Field> & { id: string }) => {
      const { data, error } = await supabase
        .from("fields")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user!.id) // 🔥 SECURITY
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fields", user?.id] }),
  });

  // ✅ DELETE FIELD (User Safe)
  const deleteField = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("fields")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id); // 🔥 SECURITY

      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fields", user?.id] }),
  });

  return {
    fields: fieldsQuery.data ?? [],
    isLoading: fieldsQuery.isLoading,
    error: fieldsQuery.error,
    createField,
    updateField,
    deleteField,
  };
}