
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  FileText
} from "lucide-react";
import { fetchJobs, deleteJob, Job } from "@/services/jobService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Jobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch jobs with search and sort
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs', searchTerm, sortBy, sortOrder],
    queryFn: () => fetchJobs(searchTerm, sortBy, sortOrder),
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "ลบงานสำเร็จ",
        description: "งานถูกลบออกจากระบบแล้ว"
      });
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบงานได้",
        variant: "destructive"
      });
      console.error("Error deleting job:", error);
    }
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleEditJob = (job: Job) => {
    // Navigate to calculator with job data
    navigate('/', { state: { jobData: job } });
  };

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบงานนี้?')) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">เกิดข้อผิดพลาด</h1>
            <p className="text-gray-600 mt-2">ไม่สามารถโหลดข้อมูลงานได้</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">จัดการงาน</h1>
          <Button onClick={() => navigate('/')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            สร้างงานใหม่
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายการงานทั้งหมด</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ค้นหาชื่องาน, ลูกค้า, หรือผู้ทำใบราคา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('job_name')}
                      >
                        <div className="flex items-center gap-2">
                          ชื่องาน
                          {getSortIcon('job_name')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('customer_name')}
                      >
                        <div className="flex items-center gap-2">
                          ลูกค้า
                          {getSortIcon('customer_name')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('quote_by')}
                      >
                        <div className="flex items-center gap-2">
                          ผู้ทำใบราคา
                          {getSortIcon('quote_by')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center gap-2">
                          วันที่สร้าง
                          {getSortIcon('created_at')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('updated_at')}
                      >
                        <div className="flex items-center gap-2">
                          อัพเดทล่าสุด
                          {getSortIcon('updated_at')}
                        </div>
                      </TableHead>
                      <TableHead>จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs && jobs.length > 0 ? (
                      jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.job_name}</TableCell>
                          <TableCell>{job.customer_name}</TableCell>
                          <TableCell>{job.quote_by}</TableCell>
                          <TableCell>
                            {format(new Date(job.created_at), 'dd/MM/yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            {format(new Date(job.updated_at), 'dd/MM/yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditJob(job)}
                                className="flex items-center gap-1"
                              >
                                <Edit className="h-3 w-3" />
                                แก้ไข
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteJob(job.id)}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                ลบ
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          {searchTerm ? 'ไม่พบงานที่ตรงกับการค้นหา' : 'ยังไม่มีงานในระบบ'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Jobs;
