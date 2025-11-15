import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Calendar, Trash2, ExternalLink } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { SessionListItem, Session } from "@/types";

const Historial = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const sessionList = await apiService.getSessionList();
      setSessions(sessionList);
    } catch (error: any) {
      toast({
        title: "Error al cargar historial",
        description: error.message || "No se pudieron cargar las sesiones",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = async (sessionId: string) => {
    try {
      const session = await apiService.getSessionById(sessionId);
      if (session) {
        setSelectedSession(session);
        setIsDialogOpen(true);
      } else {
        toast({
          title: "Error",
          description: "No se encontró la sesión",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se encontró la sesión",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("¿Estás seguro de que deseas eliminar esta sesión?")) {
      try {
        await apiService.deleteSession(sessionId);
        await loadSessions();
        toast({
          title: "Sesión eliminada",
          description: "La sesión se eliminó correctamente",
        });
      } catch (error: any) {
        toast({
          title: "Error al eliminar",
          description: error.message || "No se pudo eliminar la sesión",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = () => {
    if (selectedSession) {
      setIsDialogOpen(false);
      // Navegar a Generar con los datos de la sesión
      navigate("/generar", { state: { session: selectedSession } });
    }
  };

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

        <div className="max-w-4xl mx-auto">
          {sessions.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay sesiones guardadas
              </h3>
              <p className="text-muted-foreground mb-4">
                Genera tus primeros objetivos y criterios para verlos aquí
              </p>
              <Button onClick={() => navigate("/generar")}>
                Crear nueva sesión
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessions.map((sesion) => (
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
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(sesion.id)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver detalles
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => handleDelete(sesion.id, e)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Dialog de detalles */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedSession?.nombre}</DialogTitle>
              <DialogDescription>
                Detalles de la sesión generada
              </DialogDescription>
            </DialogHeader>
            
            {selectedSession && (
              <div className="space-y-6 mt-4">
                {/* Información curricular */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Información Curricular</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Área:</span>
                      <span className="ml-2 text-foreground">{selectedSession.curriculum.area}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Grado:</span>
                      <span className="ml-2 text-foreground">{selectedSession.curriculum.grado}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Competencia:</span>
                      <span className="ml-2 text-foreground">{selectedSession.curriculum.competencia}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Capacidad:</span>
                      <span className="ml-2 text-foreground">{selectedSession.curriculum.capacidad}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Desempeño:</span>
                      <span className="ml-2 text-foreground">{selectedSession.curriculum.desempeno}</span>
                    </div>
                  </div>
                </div>

                {/* Información de la clase */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Información de la Clase</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Producto:</span>
                      <span className="ml-2 text-foreground">{selectedSession.classInfo.producto}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Evidencia:</span>
                      <p className="ml-2 text-foreground mt-1">{selectedSession.classInfo.evidencia}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Contexto:</span>
                      <p className="ml-2 text-foreground mt-1">{selectedSession.classInfo.contexto}</p>
                    </div>
                    {selectedSession.classInfo.objetivo && (
                      <div>
                        <span className="text-muted-foreground">Objetivo:</span>
                        <p className="ml-2 text-foreground mt-1">{selectedSession.classInfo.objetivo}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Objetivos de aprendizaje */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Objetivos de Aprendizaje</h3>
                  <ul className="space-y-2">
                    {selectedSession.generation.objectives.map((obj, index) => (
                      <li key={obj.id} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-secondary font-semibold">{index + 1}.</span>
                        <span>{obj.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Criterios de evaluación */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Criterios de Evaluación</h3>
                  <ul className="space-y-2">
                    {selectedSession.generation.criteria.map((crit, index) => (
                      <li key={crit.id} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-secondary font-semibold">{index + 1}.</span>
                        <span>{crit.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cerrar
                  </Button>
                  <Button onClick={handleEdit}>
                    Editar sesión
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Historial;
