
import { supabase } from "@/integrations/supabase/client";

export interface Job {
  id: string;
  job_name: string;
  customer_name: string;
  quote_by: string;
  created_at: string;
  updated_at: string;
  
  // Basic job information
  job_type?: string;
  paper_type?: string;
  paper_grammage?: string;
  supplier?: string;
  width?: string;
  height?: string;
  size_unit?: string;
  colors?: number;
  base_colors?: number;
  
  // Paper and plate settings
  selected_paper_size?: any;
  plate_type?: string;
  print_per_sheet?: number;
  
  // Coating and special options
  selected_coating?: string;
  selected_coating_size?: string;
  has_spot_uv?: boolean;
  selected_spot_uv_size?: string;
  
  // Optional costs
  has_die_cut?: boolean;
  die_cut_cost?: number;
  has_base_print?: boolean;
  base_print_cost?: number;
  shipping_cost?: number;
  packaging_cost?: number;
  
  // Additional costs
  additional_costs?: any[];
  
  // Quantities and settings
  quantities?: number[];
  wastage?: number;
  profit_margin?: number;
  
  // Calculation results
  results?: any;
  breakdowns?: any;
  selected_quantity_index?: number;
}

export const createJob = async (jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
  console.log("Creating job with data:", jobData);
  
  const { data, error } = await supabase
    .from('jobs' as any)
    .insert([jobData])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating job:", error);
    throw error;
  }
  
  console.log("Job created successfully:", data);
  return data;
};

export const updateJob = async (id: string, jobData: Partial<Job>) => {
  console.log("Updating job with id:", id, "data:", jobData);
  
  const { data, error } = await supabase
    .from('jobs' as any)
    .update(jobData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating job:", error);
    throw error;
  }
  
  console.log("Job updated successfully:", data);
  return data;
};

export const fetchJobs = async (searchTerm?: string, sortBy: string = 'created_at', sortOrder: 'asc' | 'desc' = 'desc'): Promise<Job[]> => {
  console.log("Fetching jobs with search:", searchTerm, "sort:", sortBy, sortOrder);
  
  let query = supabase
    .from('jobs' as any)
    .select('*');
  
  if (searchTerm && searchTerm.trim()) {
    query = query.or(`job_name.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,quote_by.ilike.%${searchTerm}%`);
  }
  
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
  
  console.log("Jobs fetched successfully:", data?.length, "jobs");
  return data as Job[];
};

export const fetchJobById = async (id: string): Promise<Job | null> => {
  console.log("Fetching job by id:", id);
  
  const { data, error } = await supabase
    .from('jobs' as any)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching job:", error);
    throw error;
  }
  
  console.log("Job fetched:", data);
  return data as Job | null;
};

export const deleteJob = async (id: string) => {
  console.log("Deleting job with id:", id);
  
  const { error } = await supabase
    .from('jobs' as any)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting job:", error);
    throw error;
  }
  
  console.log("Job deleted successfully");
  return true;
};
