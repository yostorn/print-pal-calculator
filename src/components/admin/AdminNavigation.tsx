
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const AdminNavigation = () => {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" asChild>
        <Link to="/" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          <span>กลับสู่หน้าหลัก</span>
        </Link>
      </Button>
    </div>
  );
};

export default AdminNavigation;
