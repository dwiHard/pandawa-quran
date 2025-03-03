
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuNavigation } from "@/components/MenuNavigation";
import { Toaster } from "sonner";

interface Name {
  id: number;
  latin: string;
  arab: string;
  arti: string;
}

const fetchAsmaulHusna = async () => {
  const response = await fetch("https://api.myquran.com/v2/husna/semua");
  if (!response.ok) {
    throw new Error("Failed to fetch Asmaul Husna");
  }
  const data = await response.json();
  return data.data as Name[];
};

const AsmaulHusna = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["asmaulHusna"],
    queryFn: fetchAsmaulHusna,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-medium mb-2">Asmaul Husna</h1>
            <p className="text-muted-foreground">The 99 Names of Allah</p>
            
            <MenuNavigation activeSection="asmaul-husna" />
          </header>
          
          <div className="flex justify-center">
            <div className="w-12 h-12 border-2 border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-medium mb-2">Asmaul Husna</h1>
            <p className="text-muted-foreground">The 99 Names of Allah</p>
            
            <MenuNavigation activeSection="asmaul-husna" />
          </header>
          
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            <p>Failed to load Asmaul Husna. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-medium mb-2">Asmaul Husna</h1>
          <p className="text-muted-foreground">The 99 Names of Allah</p>
          
          <MenuNavigation activeSection="asmaul-husna" />
        </header>

        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Arabic</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Latin</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.map((name) => (
                  <tr key={name.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm">{name.id}</td>
                    <td className="px-4 py-3 text-xl text-right font-arabic">{name.arab}</td>
                    <td className="px-4 py-3 text-sm">{name.latin}</td>
                    <td className="px-4 py-3 text-sm">{name.arti}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsmaulHusna;
