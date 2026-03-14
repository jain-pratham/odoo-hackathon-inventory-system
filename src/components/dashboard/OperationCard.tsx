import Link from "next/link";
import { ArrowRight, AlertCircle, Clock, ListOrdered } from "lucide-react";

interface OperationCardProps {
  title: string;
  buttonText: string;
  stats: string[];
  route: string;
  type: "receipt" | "delivery"; // Used to color-code the card slightly
}

export default function OperationCard({ title, buttonText, stats, route, type }: OperationCardProps) {
  const isReceipt = type === "receipt";

  return (
    <div className="relative group bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-green-300 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
      
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
          {title}
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mt-auto">
        
        {/* Left Side: Main Action Button */}
        <Link 
          href={route}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 ${
            isReceipt 
              ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" 
              : "bg-green-600 hover:bg-green-700 shadow-green-600/20"
          }`}
        >
          {buttonText}
          <ArrowRight className="h-4 w-4" />
        </Link>

        {/* Right Side: Stats List */}
        <div className="space-y-2 text-sm font-medium">
          {stats.map((stat, index) => {
            // Add tiny visual cues based on keywords in your stats
            const isLate = stat.toLowerCase().includes("late");
            const isWaiting = stat.toLowerCase().includes("waiting");
            
            return (
              <div 
                key={index} 
                className={`flex items-center gap-2 ${
                  isLate ? "text-red-600" : isWaiting ? "text-amber-600" : "text-gray-600"
                }`}
              >
                {isLate && <AlertCircle className="h-4 w-4" />}
                {isWaiting && <Clock className="h-4 w-4" />}
                {!isLate && !isWaiting && <ListOrdered className="h-4 w-4 text-gray-400" />}
                
                <span>{stat}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}