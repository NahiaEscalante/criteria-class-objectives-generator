import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar } from "lucide-react";

const mockHistorial = [
  {
    id: 1,
    nombre: "Texto descriptivo - Animales",
    area: "Comunicación",
    grado: "4to de Primaria",
    fecha: "15 de noviembre, 2025",
  },
  {
    id: 2,
    nombre: "Ecuaciones lineales",
    area: "Matemática",
    grado: "1ro de Secundaria",
    fecha: "10 de noviembre, 2025",
  },
  {
    id: 3,
    nombre: "El ciclo del agua",
    area: "Ciencia y Tecnología",
    grado: "5to de Primaria",
    fecha: "8 de noviembre, 2025",
  },
];

const Historial = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Historial de clases
          </h1>
          <p className="text-muted-foreground">
            Accede a tus sesiones generadas anteriormente
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {mockHistorial.map((sesion) => (
            <Card key={sesion.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {sesion.nombre}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>{sesion.area}</span>
                      <span>•</span>
                      <span>{sesion.grado}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                      <Calendar className="w-4 h-4" />
                      <span>{sesion.fecha}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline">
                  Ver detalles
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Historial;
