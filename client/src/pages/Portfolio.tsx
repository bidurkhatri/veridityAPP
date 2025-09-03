import { ProofPortfolio } from "@/components/ProofPortfolio";
import { AdvancedProofFeatures } from "@/components/AdvancedProofFeatures";
import { PageTransition } from "@/components/MicroAnimations";
import { useLocation } from "wouter";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Portfolio() {
  const [, navigate] = useLocation();

  const handleSelectProof = (proof: any) => {
    navigate(`/share?proofId=${proof.id}`);
  };

  const handleGenerateNew = (category: string) => {
    navigate(`/prove?category=${category}`);
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="w-full">
            <TabsTrigger value="portfolio" className="flex-1">Portfolio</TabsTrigger>
            <TabsTrigger value="advanced" className="flex-1">Advanced Features</TabsTrigger>
          </TabsList>
          
          <TabsContent value="portfolio">
            <ProofPortfolio
              onSelectProof={handleSelectProof}
              onGenerateNew={handleGenerateNew}
            />
          </TabsContent>
          
          <TabsContent value="advanced">
            <AdvancedProofFeatures />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}