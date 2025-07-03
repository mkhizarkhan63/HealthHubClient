import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-card shadow-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center">
              <img 
                src="/mbspro-logo.png" 
                alt="MBSPro Logo" 
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">MBSPro</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">AI receptionist</p>
            </div>
          </div>
          
          {/* Settings Section */}
          <div className="flex items-center">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="p-2">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
