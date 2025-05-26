
import { supabase } from "@/integrations/supabase/client";

export interface PaperVariant {
  id: string;
  paper_type_id: string;
  paper_size_id: string;
  paper_gsm_id: string;
  supplier_id: string;
  sheets_per_pack: number;
  price_per_pack: number;
  price_per_kg?: number;
  price_per_ream?: number;
  created_at: string;
  updated_at: string;
}

export interface PaperVariantWithDetails extends PaperVariant {
  paper_type?: { label: string; name: string };
  paper_size?: { name: string; width: number; height: number };
  paper_grammage?: { grammage: string };
  supplier?: { name: string };
}

// Fetch all paper variants with filtering
export const fetchPaperVariants = async (filters?: {
  paper_type_id?: string;
  supplier_id?: string;
  paper_size_id?: string;
  paper_gsm_id?: string;
}) => {
  console.log("Fetching paper variants with filters:", filters);
  
  let query = supabase
    .from('paper_variant')
    .select(`
      *,
      paper_types:paper_type_id(label, name),
      paper_sizes:paper_size_id(name, width, height),
      paper_grammages:paper_gsm_id(grammage),
      suppliers:supplier_id(name)
    `)
    .order('created_at', { ascending: false });

  if (filters) {
    if (filters.paper_type_id) {
      query = query.eq('paper_type_id', filters.paper_type_id);
    }
    if (filters.supplier_id) {
      query = query.eq('supplier_id', filters.supplier_id);
    }
    if (filters.paper_size_id) {
      query = query.eq('paper_size_id', filters.paper_size_id);
    }
    if (filters.paper_gsm_id) {
      query = query.eq('paper_gsm_id', filters.paper_gsm_id);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching paper variants:", error);
    throw error;
  }

  console.log("Paper variants fetched:", data);
  return data as PaperVariantWithDetails[];
};

// Get a specific paper variant for calculation purposes
export const fetchPaperVariantForCalculation = async (
  paperTypeId: string,
  grammageId: string,
  sizeId: string,
  supplierId: string
) => {
  console.log("Fetching paper variant for calculation:", { paperTypeId, grammageId, sizeId, supplierId });
  
  const { data, error } = await supabase
    .from('paper_variant')
    .select(`
      *,
      suppliers:supplier_id(name, sheets_per_pack)
    `)
    .eq('paper_type_id', paperTypeId)
    .eq('paper_gsm_id', grammageId)
    .eq('paper_size_id', sizeId)
    .eq('supplier_id', supplierId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching paper variant for calculation:", error);
    throw error;
  }

  console.log("Paper variant for calculation result:", data);
  return data;
};

// Create new paper variant
export const createPaperVariant = async (variantData: Omit<PaperVariant, 'id' | 'created_at' | 'updated_at'>) => {
  console.log("Creating paper variant:", variantData);
  
  const { data, error } = await supabase
    .from('paper_variant')
    .insert([variantData])
    .select()
    .single();

  if (error) {
    console.error("Error creating paper variant:", error);
    throw error;
  }

  console.log("Paper variant created:", data);
  return data;
};

// Update paper variant
export const updatePaperVariant = async (id: string, updates: Partial<PaperVariant>) => {
  console.log("Updating paper variant:", { id, updates });
  
  const { data, error } = await supabase
    .from('paper_variant')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating paper variant:", error);
    throw error;
  }

  console.log("Paper variant updated:", data);
  return data;
};

// Delete paper variant
export const deletePaperVariant = async (id: string) => {
  console.log("Deleting paper variant:", id);
  
  const { error } = await supabase
    .from('paper_variant')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting paper variant:", error);
    throw error;
  }

  console.log("Paper variant deleted successfully");
  return true;
};

// Bulk import paper variants
export const bulkImportPaperVariants = async (variants: Omit<PaperVariant, 'id' | 'created_at' | 'updated_at'>[]) => {
  console.log("Bulk importing paper variants:", variants.length, "items");
  
  const { data, error } = await supabase
    .from('paper_variant')
    .insert(variants)
    .select();

  if (error) {
    console.error("Error bulk importing paper variants:", error);
    throw error;
  }

  console.log("Paper variants bulk imported:", data?.length, "items");
  return data;
};
