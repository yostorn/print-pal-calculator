import { supabase } from "@/integrations/supabase/client";

// Paper Types
export const fetchPaperTypes = async () => {
  console.log("Fetching paper types from Supabase");
  const { data, error } = await supabase
    .from('paper_types')
    .select('*')
    .order('label');
  
  if (error) {
    console.error("Error fetching paper types:", error);
    throw error;
  }
  console.log("Paper types fetched:", data);
  return data;
};

// Paper Sizes
export const fetchPaperSizes = async (paperTypeId?: string) => {
  console.log("Fetching paper sizes with paperTypeId:", paperTypeId);
  let query = supabase
    .from('paper_sizes')
    .select('*')
    .order('name');
  
  if (paperTypeId) {
    query = query.eq('paper_type_id', paperTypeId);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching paper sizes:", error);
    throw error;
  }
  console.log("Paper sizes fetched:", data);
  return data;
};

// Paper Grammages - Modified to fetch all grammages if no paper type ID is provided
export const fetchPaperGrammages = async (paperTypeId?: string) => {
  console.log("Fetching grammages with paperTypeId:", paperTypeId);
  let query = supabase
    .from('paper_grammages')
    .select('*')
    .order('grammage');
  
  if (paperTypeId) {
    query = query.eq('paper_type_id', paperTypeId);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching paper grammages:", error);
    throw error;
  }
  console.log("Paper grammages fetched:", data);
  return data;
};

// Suppliers - Updated to include sheets_per_pack
export const fetchSuppliers = async () => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*, sheets_per_pack')
    .order('name');
  
  if (error) throw error;
  return data;
};

// Paper Prices - Updated to include supplier sheets_per_pack data
export const fetchPaperPrice = async (paperTypeId: string, grammageId: string, supplierId: string) => {
  console.log("Fetching paper price with params:", { paperTypeId, grammageId, supplierId });
  
  const { data, error } = await supabase
    .from('paper_prices')
    .select(`
      *,
      suppliers!inner(
        id,
        name,
        sheets_per_pack
      )
    `)
    .eq('paper_type_id', paperTypeId)
    .eq('paper_grammage_id', grammageId)
    .eq('supplier_id', supplierId)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') { 
    console.error("Error fetching paper price:", error);
    throw error; 
  }
  
  console.log("Paper price result:", data);
  return data;
};

// Plate Costs
export const fetchPlateCosts = async () => {
  const { data, error } = await supabase
    .from('plate_costs')
    .select('*');
  
  if (error) throw error;
  return data;
};

// Formula Settings
export const fetchFormulaSettings = async () => {
  const { data, error } = await supabase
    .from('formula_settings')
    .select('*');
  
  if (error) {
    console.error("Error fetching formula settings:", error);
    throw error;
  }
  
  // Convert array to object for easier access
  const settings: Record<string, string> = {};
  data?.forEach(item => {
    settings[item.name] = item.value;
  });
  
  return settings;
};

export const updateFormulaSetting = async (name: string, value: string) => {
  const { data, error } = await supabase
    .from('formula_settings')
    .upsert({ name, value })
    .select()
    .single();
  
  if (error) {
    console.error("Error updating formula setting:", error);
    throw error;
  }
  
  return data;
};

export const updateFormulaSettings = async (settings: Record<string, string>) => {
  const upsertData = Object.entries(settings).map(([name, value]) => ({
    name,
    value
  }));
  
  const { data, error } = await supabase
    .from('formula_settings')
    .upsert(upsertData)
    .select();
  
  if (error) {
    console.error("Error batch updating formula settings:", error);
    throw error;
  }
  
  return data;
};

// Calculation Settings
export const fetchCalculationSettings = async () => {
  const { data, error } = await supabase
    .from('calculation_settings')
    .select('*');
  
  if (error) throw error;
  
  // Convert array to object for easier access
  const settings: Record<string, string> = {};
  data?.forEach(item => {
    settings[item.name] = item.value;
  });
  
  return settings;
};

// Coating Types
export const fetchCoatingTypes = async () => {
  const { data, error } = await supabase
    .from('coating_types')
    .select('*')
    .order('label');
  
  if (error) throw error;
  return data;
};

// Coating Sizes
export const fetchCoatingSizes = async (coatingTypeId?: string) => {
  let query = supabase
    .from('coating_sizes')
    .select('*')
    .order('width, height');
  
  if (coatingTypeId) {
    query = query.eq('coating_type_id', coatingTypeId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Ink Costs
export const fetchInkCosts = async () => {
  const { data, error } = await supabase
    .from('ink_costs')
    .select('*');
  
  if (error) throw error;
  return data;
};

// Spot UV Costs
export const fetchSpotUvCosts = async () => {
  const { data, error } = await supabase
    .from('spot_uv_costs')
    .select('*')
    .order('width, height');
  
  if (error) throw error;
  return data;
};

// Ink Cost Management Functions
export const createInkCost = async (inkCostData: {
  plate_type: string;
  ink_category: string;
  cost_per_sheet: number;
  minimum_cost: number;
}) => {
  const { data, error } = await supabase
    .from('ink_costs')
    .insert([inkCostData])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating ink cost:", error);
    throw error;
  }
  
  return data;
};

export const updateInkCost = async (id: string, inkCostData: {
  plate_type?: string;
  ink_category?: string;
  cost_per_sheet?: number;
  minimum_cost?: number;
}) => {
  const { data, error } = await supabase
    .from('ink_costs')
    .update(inkCostData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating ink cost:", error);
    throw error;
  }
  
  return data;
};

export const deleteInkCost = async (id: string) => {
  const { error } = await supabase
    .from('ink_costs')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting ink cost:", error);
    throw error;
  }
  
  return true;
};
