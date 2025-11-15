import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const AiBadge = () => {
  return (
    <Badge variant="secondary" className="bg-ai-badge text-ai-badge-foreground">
      <Sparkles className="w-3 h-3 mr-1" />
      Generado con IA
    </Badge>
  );
};
