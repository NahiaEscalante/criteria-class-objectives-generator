import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiBadge } from "@/components/AiBadge";
import { Upload, FileText, Sparkles, Loader2, Check, Edit2, Save, Plus, Download, Copy, Bookmark, Video, Music, Image as ImageIcon, FileCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import type { Session, LearningObjective, EvaluationCriterion, UploadedFile, AiGenerationResponse, Resource, ResourceType, MaterialType, MaterialGenerationResponse } from "@/types";

const Generar = () => {
  const { toast } = useToast();
  const [fileName, setFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    area: "",
    competencia: "",
    capacidad: "",
    desempeno: "",
    grado: "",
    producto: "",
    evidencia: "",
    contexto: "",
    objetivo: ""
  });

  // Results state
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [criterios, setCriterios] = useState<string[]>([]);
  const [recursos, setRecursos] = useState({
    videos: [] as Array<Resource>,
    audios: [] as Array<Resource>,
    imagenes: [] as Array<Resource>,
  });
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [resourcesGenerating, setResourcesGenerating] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [editingObjetivo, setEditingObjetivo] = useState<number | null>(null);
  const [editingCriterio, setEditingCriterio] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // Material generation state
  const [isGeneratingMaterial, setIsGeneratingMaterial] = useState(false);
  const [generatedMaterial, setGeneratedMaterial] = useState<MaterialGenerationResponse | null>(null);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [selectedMaterialType, setSelectedMaterialType] = useState<MaterialType>('rubrica');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      // Subir archivo al backend (simulación)
      try {
        const result = await apiService.uploadFile(file);
        setUploadedFile(result.file);
        toast({
          title: "Archivo subido",
          description: "El archivo se subió correctamente",
        });
      } catch (error: any) {
        toast({
          title: "Error al subir archivo",
          description: error.message || "No se pudo subir el archivo",
          variant: "destructive",
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.area) {
      newErrors.area = "El área curricular es requerida";
    }
    if (!formData.competencia) {
      newErrors.competencia = "La competencia es requerida";
    }
    if (!formData.capacidad) {
      newErrors.capacidad = "La capacidad es requerida";
    }
    if (!formData.desempeno) {
      newErrors.desempeno = "El desempeño esperado es requerido";
    }
    if (!formData.grado) {
      newErrors.grado = "El grado es requerido";
    }
    if (!formData.producto.trim()) {
      newErrors.producto = "El producto es requerido";
    }
    if (!formData.evidencia.trim()) {
      newErrors.evidencia = "La evidencia es requerida";
    }
    if (!formData.contexto.trim()) {
      newErrors.contexto = "El contexto es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) {
      toast({
        title: "Formulario incompleto",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setShowResults(false);
    setErrors({});
    
    try {
      // Llamar al endpoint de IA
      const response = await apiService.generateAI({
        curriculum: {
          area: formData.area,
          competencia: formData.competencia,
          capacidad: formData.capacidad,
          desempeno: formData.desempeno,
          grado: formData.grado,
        },
        classInfo: {
          producto: formData.producto,
          evidencia: formData.evidencia,
          contexto: formData.contexto,
          objetivo: formData.objetivo || undefined,
        },
        fileId: uploadedFile?.id,
      });

      // Convertir respuesta al formato del componente
      setObjetivos(response.objectives.map(obj => obj.text));
      setCriterios(response.criteria.map(crit => crit.text));
      
      // Guardar generationId si existe (para polling de recursos)
      if (response.generationId) {
        setGenerationId(response.generationId);
        setResourcesGenerating(response.resourcesGenerating || false);
      }
      
      // Convertir recursos al formato esperado (ahora con URLs y estados)
      const recursosData = {
        videos: [] as Array<Resource>,
        audios: [] as Array<Resource>,
        imagenes: [] as Array<Resource>,
      };
      
      response.resources.forEach((resource: Resource) => {
        // Validar estructura de cada recurso antes de procesarlo
        if (!resource || !resource.id || !resource.type || !['video', 'audio', 'image'].includes(resource.type)) {
          console.warn('Recurso con estructura inválida ignorado:', resource);
          return;
        }
        
        if (resource.type === 'video') {
          recursosData.videos.push(resource);
        } else if (resource.type === 'audio') {
          recursosData.audios.push(resource);
        } else if (resource.type === 'image') {
          recursosData.imagenes.push(resource);
        }
      });
      
      setRecursos(recursosData);
      setShowResults(true);
      
      // Si hay recursos generándose, iniciar polling
      if (response.resourcesGenerating && response.generationId) {
        startResourcePolling(response.generationId);
      }
      
      toast({
        title: "Generación completada",
        description: "Los objetivos y criterios han sido generados exitosamente",
      });
    } catch (error: any) {
      toast({
        title: "Error al generar",
        description: error.message || "No se pudieron generar los objetivos y criterios",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startEditObjetivo = (index: number) => {
    setEditingObjetivo(index);
    setEditText(objetivos[index]);
  };

  const saveObjetivo = (index: number) => {
    const newObjetivos = [...objetivos];
    newObjetivos[index] = editText;
    setObjetivos(newObjetivos);
    setEditingObjetivo(null);
  };

  const startEditCriterio = (index: number) => {
    setEditingCriterio(index);
    setEditText(criterios[index]);
  };

  const saveCriterio = (index: number) => {
    const newCriterios = [...criterios];
    newCriterios[index] = editText;
    setCriterios(newCriterios);
    setEditingCriterio(null);
  };

  const addCriterio = () => {
    setCriterios([...criterios, "Nuevo criterio..."]);
  };

  const handleDownloadPDF = async () => {
    // Necesitamos el ID de la sesión, pero aún no está guardada
    // Por ahora, solo mostramos el toast
    // En el futuro, podríamos guardar primero y luego exportar
    toast({
      title: "PDF generado",
      description: "Tu documento está listo para descargar (simulación)",
    });
  };

  const handleCopy = async () => {
    try {
      const texto = criterios.join("\n");
      await navigator.clipboard.writeText(texto);
      toast({
        title: "Criterios copiados",
        description: "Los criterios se copiaron al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };

  const handleGenerateMaterial = async () => {
    if (!showResults || criterios.length === 0) {
      toast({
        title: "Error",
        description: "Debes generar los criterios primero",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingMaterial(true);
    
    try {
      // Convertir criterios de string[] a EvaluationCriterion[]
      const criteriaObjects: EvaluationCriterion[] = criterios.map((text, index) => ({
        id: `crit-${Date.now()}-${index}`,
        text,
        order: index + 1,
      }));

      const response = await apiService.generateMaterial({
        criteria: criteriaObjects,
        curriculum: {
          area: formData.area,
          competencia: formData.competencia,
          capacidad: formData.capacidad,
          desempeno: formData.desempeno,
          grado: formData.grado,
        },
        classInfo: {
          producto: formData.producto,
          evidencia: formData.evidencia,
          contexto: formData.contexto,
          objetivo: formData.objetivo || undefined,
        },
        materialType: selectedMaterialType,
      });

      setGeneratedMaterial(response);
      setIsMaterialDialogOpen(true);
      
      toast({
        title: "Material generado",
        description: `Se generó ${selectedMaterialType === 'rubrica' ? 'la rúbrica' : selectedMaterialType === 'ejercicios' ? 'los ejercicios' : selectedMaterialType === 'guia' ? 'la guía' : 'los ejemplos'} exitosamente`,
      });
    } catch (error: any) {
      toast({
        title: "Error al generar material",
        description: error.message || "No se pudo generar el material",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMaterial(false);
    }
  };

  // Polling para verificar estado de recursos en generación
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRetryCountRef = useRef<number>(0);
  const emptyResourcesCountRef = useRef<number>(0);
  const MAX_RETRIES = 3;
  const MAX_EMPTY_RESOURCES = 12; // Máximo 12 intentos (1 minuto) con recursos vacíos
  const POLLING_INTERVAL = 5000; // 5 segundos

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    pollingRetryCountRef.current = 0;
    emptyResourcesCountRef.current = 0;
    setResourcesGenerating(false);
  };

  const startResourcePolling = async (genId: string) => {
    // Limpiar polling anterior si existe
    stopPolling();

    // Validar que generationId sea válido
    if (!genId || typeof genId !== 'string' || genId.trim() === '') {
      toast({
        title: "Error",
        description: "ID de generación inválido",
        variant: "destructive",
      });
      return;
    }

    setResourcesGenerating(true);
    pollingRetryCountRef.current = 0;
    emptyResourcesCountRef.current = 0;

    const pollResources = async () => {
      try {
        const status = await apiService.getGenerationStatus(genId);
        
        // Validar estructura de respuesta
        if (!status || !Array.isArray(status.resources)) {
          throw new Error('Respuesta del servidor tiene un formato inválido');
        }
        
        // Actualizar recursos con nuevos estados/URLs
        const recursosData = {
          videos: [] as Array<Resource>,
          audios: [] as Array<Resource>,
          imagenes: [] as Array<Resource>,
        };
        
        status.resources.forEach((resource: Resource) => {
          // Validar estructura de cada recurso
          if (!resource || !resource.id || !resource.type || !['video', 'audio', 'image'].includes(resource.type)) {
            console.warn('Recurso con estructura inválida:', resource);
            return;
          }
          
          if (resource.type === 'video') {
            recursosData.videos.push(resource);
          } else if (resource.type === 'audio') {
            recursosData.audios.push(resource);
          } else if (resource.type === 'image') {
            recursosData.imagenes.push(resource);
          }
        });
        
        setRecursos(recursosData);
        
        // Resetear contador de reintentos en caso de éxito
        pollingRetryCountRef.current = 0;
        
        // Si no hay recursos, el backend aún no ha iniciado la generación
        // Continuar polling pero con límite de tiempo
        if (status.resources.length === 0) {
          emptyResourcesCountRef.current += 1;
          
          // Si después de MAX_EMPTY_RESOURCES intentos aún no hay recursos, detener polling
          if (emptyResourcesCountRef.current >= MAX_EMPTY_RESOURCES) {
            stopPolling();
            toast({
              title: "Tiempo de espera agotado",
              description: "Los recursos no se han generado después de un minuto. Por favor, intenta generar nuevamente.",
              variant: "destructive",
            });
            return;
          }
          
          return;
        }
        
        // Si hay recursos, resetear contador de recursos vacíos
        emptyResourcesCountRef.current = 0;
        
        // Si todos los recursos están listos, detener polling
        const allReady = status.resources.every(
          (r: Resource) => r.status === 'ready' || r.status === 'error'
        );
        
        if (allReady) {
          stopPolling();
          
          toast({
            title: "Recursos generados",
            description: "Todos los recursos multimedia están listos",
          });
        }
      } catch (error: any) {
        console.error('Error polling resources:', error);
        
        // Manejar errores específicos
        if (error.message?.includes('Generación no encontrada') || error.message?.includes('404')) {
          // 404: Generación no existe, detener polling
          stopPolling();
          toast({
            title: "Error",
            description: "La generación de recursos no fue encontrada. Por favor, intenta generar nuevamente.",
            variant: "destructive",
          });
          return;
        }
        
        if (error.message?.includes('Sesión expirada') || error.message?.includes('401')) {
          // 401: Token expirado, detener polling y redirigir
          stopPolling();
          toast({
            title: "Sesión expirada",
            description: "Por favor, inicia sesión nuevamente",
            variant: "destructive",
          });
          // El handleAuthError ya redirige, pero por si acaso
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        
        // Otros errores: reintentar con backoff exponencial
        pollingRetryCountRef.current += 1;
        
        if (pollingRetryCountRef.current >= MAX_RETRIES) {
          // Máximo de reintentos alcanzado, detener polling
          stopPolling();
          toast({
            title: "Error de conexión",
            description: "No se pudo verificar el estado de los recursos. Por favor, recarga la página.",
            variant: "destructive",
          });
          return;
        }
        
        // Backoff exponencial: esperar más tiempo antes del siguiente intento
        const backoffDelay = Math.min(POLLING_INTERVAL * Math.pow(2, pollingRetryCountRef.current), 30000);
        console.log(`Reintentando en ${backoffDelay}ms (intento ${pollingRetryCountRef.current}/${MAX_RETRIES})`);
        
        // Detener el intervalo actual
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        
        // Limpiar timeout anterior si existe
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
        }
        
        // Reiniciar después del backoff
        pollingTimeoutRef.current = setTimeout(() => {
          pollingTimeoutRef.current = null;
          if (pollingIntervalRef.current === null && pollingRetryCountRef.current < MAX_RETRIES) {
            // Solo reiniciar si el polling no fue detenido manualmente y no se alcanzó el máximo de reintentos
            pollingIntervalRef.current = setInterval(pollResources, POLLING_INTERVAL);
            pollResources(); // Ejecutar inmediatamente
          }
        }, backoffDelay);
      }
    };

    // Polling cada 5 segundos
    pollingIntervalRef.current = setInterval(pollResources, POLLING_INTERVAL);
    
    // Primera verificación inmediata
    pollResources();
  };

  // Limpiar polling al desmontar
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const handleSave = async () => {
    if (!showResults || objetivos.length === 0 || criterios.length === 0) {
      toast({
        title: "Error al guardar",
        description: "Debes generar los objetivos y criterios primero",
        variant: "destructive",
      });
      return;
    }

    try {
      const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();

      // Convertir objetivos y criterios al formato correcto
      const learningObjectives: LearningObjective[] = objetivos.map((text, index) => ({
        id: `${sessionId}-obj-${index}`,
        text,
        order: index + 1,
      }));

      const evaluationCriteria: EvaluationCriterion[] = criterios.map((text, index) => ({
        id: `${sessionId}-crit-${index}`,
        text,
        order: index + 1,
      }));

      // Generar nombre de sesión basado en el producto
      const sessionName = formData.producto || `Sesión ${now.toLocaleDateString()}`;

      // Convertir recursos al formato de Resource (ya están en formato correcto)
      const resources: Resource[] = [
        ...recursos.videos,
        ...recursos.audios,
        ...recursos.imagenes,
      ];

      const session: Session = {
        id: sessionId,
        nombre: sessionName,
        curriculum: {
          area: formData.area,
          competencia: formData.competencia,
          capacidad: formData.capacidad,
          desempeno: formData.desempeno,
          grado: formData.grado,
        },
        classInfo: {
          producto: formData.producto,
          evidencia: formData.evidencia,
          contexto: formData.contexto,
          objetivo: formData.objetivo || undefined,
        },
        file: uploadedFile || (fileName
          ? {
              id: `${sessionId}-file`,
              name: fileName,
              size: 0,
              type: "application/vnd.ms-powerpoint",
              uploadedAt: now,
            }
          : undefined),
        generation: {
          objectives: learningObjectives,
          criteria: evaluationCriteria,
          resources: resources,
          generatedAt: now,
        },
        createdAt: now,
        updatedAt: now,
      };

      await apiService.saveSession(session);
      
      toast({
        title: "Guardado exitoso",
        description: "La sesión se guardó en tu historial",
      });
    } catch (error: any) {
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudo guardar la sesión",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Generar objetivos y criterios con IA
          </h1>
          <p className="text-muted-foreground">
            Completa la información de tu clase y CriterIA generará propuestas alineadas a la Currícula Nacional.
          </p>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            {/* Block 1: Upload PPT */}
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Sube la PPT de tu sesión
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Adjunta la presentación de tu clase. En esta versión es solo un ejemplo visual.
                  </p>
                  
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-secondary transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".ppt,.pptx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        {fileName || "Arrastra tu archivo o haz clic para subir"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Formatos: PPT, PPTX
                      </p>
                    </label>
                  </div>

                  {fileName && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-secondary">
                      <FileText className="w-4 h-4" />
                      <span>{fileName}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Block 2: Curriculum Selection */}
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Selecciona elementos de la Currícula Nacional
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Estos campos se conectarán a la currícula en el backend, pero aquí solo necesitamos la estructura.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="area">Área curricular</Label>
                      <Select value={formData.area} onValueChange={(val) => {
                        setFormData({...formData, area: val});
                        if (errors.area) {
                          setErrors({...errors, area: ""});
                        }
                      }}>
                        <SelectTrigger id="area" className={errors.area ? "border-destructive" : ""}>
                          <SelectValue placeholder="Selecciona un área" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="comunicacion">Comunicación</SelectItem>
                          <SelectItem value="matematica">Matemática</SelectItem>
                          <SelectItem value="ciencias">Ciencia y Tecnología</SelectItem>
                          <SelectItem value="sociales">Ciencias Sociales</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.area && <p className="text-sm text-destructive mt-1">{errors.area}</p>}
                    </div>

                    <div>
                      <Label htmlFor="competencia">Competencia</Label>
                      <Select value={formData.competencia} onValueChange={(val) => {
                        setFormData({...formData, competencia: val});
                        if (errors.competencia) {
                          setErrors({...errors, competencia: ""});
                        }
                      }}>
                        <SelectTrigger id="competencia" className={errors.competencia ? "border-destructive" : ""}>
                          <SelectValue placeholder="Selecciona una competencia" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="escribe">Escribe diversos tipos de textos</SelectItem>
                          <SelectItem value="lee">Lee diversos tipos de textos escritos</SelectItem>
                          <SelectItem value="comunica">Se comunica oralmente</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.competencia && <p className="text-sm text-destructive mt-1">{errors.competencia}</p>}
                    </div>

                    <div>
                      <Label htmlFor="capacidad">Capacidad</Label>
                      <Select value={formData.capacidad} onValueChange={(val) => {
                        setFormData({...formData, capacidad: val});
                        if (errors.capacidad) {
                          setErrors({...errors, capacidad: ""});
                        }
                      }}>
                        <SelectTrigger id="capacidad" className={errors.capacidad ? "border-destructive" : ""}>
                          <SelectValue placeholder="Selecciona una capacidad" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="adecua">Adecúa el texto a la situación comunicativa</SelectItem>
                          <SelectItem value="organiza">Organiza y desarrolla las ideas de forma coherente</SelectItem>
                          <SelectItem value="utiliza">Utiliza convenciones del lenguaje escrito</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.capacidad && <p className="text-sm text-destructive mt-1">{errors.capacidad}</p>}
                    </div>

                    <div>
                      <Label htmlFor="desempeno">Desempeño esperado</Label>
                      <Select value={formData.desempeno} onValueChange={(val) => {
                        setFormData({...formData, desempeno: val});
                        if (errors.desempeno) {
                          setErrors({...errors, desempeno: ""});
                        }
                      }}>
                        <SelectTrigger id="desempeno" className={errors.desempeno ? "border-destructive" : ""}>
                          <SelectValue placeholder="Selecciona un desempeño" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="d1">Escribe textos descriptivos utilizando adjetivos</SelectItem>
                          <SelectItem value="d2">Organiza sus ideas en torno a un tema central</SelectItem>
                          <SelectItem value="d3">Utiliza recursos ortográficos básicos</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.desempeno && <p className="text-sm text-destructive mt-1">{errors.desempeno}</p>}
                    </div>

                    <div>
                      <Label htmlFor="grado">Grado y nivel</Label>
                      <Select value={formData.grado} onValueChange={(val) => {
                        setFormData({...formData, grado: val});
                        if (errors.grado) {
                          setErrors({...errors, grado: ""});
                        }
                      }}>
                        <SelectTrigger id="grado" className={errors.grado ? "border-destructive" : ""}>
                          <SelectValue placeholder="Selecciona el grado" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="4p">4to de Primaria</SelectItem>
                          <SelectItem value="5p">5to de Primaria</SelectItem>
                          <SelectItem value="6p">6to de Primaria</SelectItem>
                          <SelectItem value="1s">1ro de Secundaria</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.grado && <p className="text-sm text-destructive mt-1">{errors.grado}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Block 3: Activity Description */}
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Describe tu actividad y contexto
                  </h2>
                  
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="producto">Producto</Label>
                      <Input
                        id="producto"
                        placeholder="Ej: Texto descriptivo, Afiche informativo"
                        value={formData.producto}
                        onChange={(e) => {
                          setFormData({...formData, producto: e.target.value});
                          if (errors.producto) {
                            setErrors({...errors, producto: ""});
                          }
                        }}
                        className={errors.producto ? "border-destructive" : ""}
                      />
                      {errors.producto && <p className="text-sm text-destructive mt-1">{errors.producto}</p>}
                    </div>

                    <div>
                      <Label htmlFor="evidencia">Evidencia</Label>
                      <Textarea
                        id="evidencia"
                        placeholder="Ej: Producción escrita individual de una página"
                        value={formData.evidencia}
                        onChange={(e) => {
                          setFormData({...formData, evidencia: e.target.value});
                          if (errors.evidencia) {
                            setErrors({...errors, evidencia: ""});
                          }
                        }}
                        rows={3}
                        className={errors.evidencia ? "border-destructive" : ""}
                      />
                      {errors.evidencia && <p className="text-sm text-destructive mt-1">{errors.evidencia}</p>}
                    </div>

                    <div>
                      <Label htmlFor="contexto">Contexto de los estudiantes</Label>
                      <Textarea
                        id="contexto"
                        placeholder="Ej: Estudiantes de 4to de primaria de escuela pública, nivel heterogéneo..."
                        value={formData.contexto}
                        onChange={(e) => {
                          setFormData({...formData, contexto: e.target.value});
                          if (errors.contexto) {
                            setErrors({...errors, contexto: ""});
                          }
                        }}
                        rows={4}
                        className={errors.contexto ? "border-destructive" : ""}
                      />
                      {errors.contexto && <p className="text-sm text-destructive mt-1">{errors.contexto}</p>}
                    </div>

                    <div>
                      <Label htmlFor="objetivo">Objetivo general de la sesión (opcional)</Label>
                      <Textarea
                        id="objetivo"
                        placeholder="Describe el objetivo principal de la clase"
                        value={formData.objetivo}
                        onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Generate Button */}
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full text-base h-12"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  Generar objetivos y criterios con IA
                  <Sparkles className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          {/* Right Column - AI Results */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="p-6">
              {!showResults && !isGenerating && (
                <div className="text-center py-16">
                  <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aquí verás los resultados generados por IA
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="text-center py-16">
                  <Loader2 className="w-16 h-16 text-secondary mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    La IA está analizando tu PPT, currícula y contexto...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Generando objetivos, criterios de evaluación y recursos sugeridos.
                  </p>
                </div>
              )}

              {showResults && (
                <div className="space-y-6">
                  {/* AI Badge */}
                  <div className="flex justify-center">
                    <AiBadge />
                  </div>

                  {/* Learning Objectives */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Objetivos de aprendizaje sugeridos
                    </h3>
                    <div className="space-y-3">
                      {objetivos.map((objetivo, index) => (
                        <div key={index} className="bg-muted/50 rounded-lg p-4">
                          {editingObjetivo === index ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={3}
                              />
                              <Button size="sm" onClick={() => saveObjetivo(index)}>
                                <Save className="w-4 h-4 mr-1" />
                                Guardar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-foreground flex-1">{objetivo}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditObjetivo(index)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evaluation Criteria */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Criterios de evaluación
                    </h3>
                    <ul className="space-y-3">
                      {criterios.map((criterio, index) => (
                        <li key={index} className="bg-muted/50 rounded-lg p-4">
                          {editingCriterio === index ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={3}
                              />
                              <Button size="sm" onClick={() => saveCriterio(index)}>
                                <Save className="w-4 h-4 mr-1" />
                                Guardar
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-foreground flex-1">{criterio}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditCriterio(index)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addCriterio}
                      className="mt-3"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar criterio
                    </Button>
                  </div>

                  {/* Suggested Resources */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        Recursos sugeridos por IA
                      </h3>
                      {resourcesGenerating && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generando recursos...</span>
                        </div>
                      )}
                    </div>
                    <Tabs defaultValue="videos" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="videos">
                          <Video className="w-4 h-4 mr-1" />
                          Videos
                        </TabsTrigger>
                        <TabsTrigger value="audios">
                          <Music className="w-4 h-4 mr-1" />
                          Audios
                        </TabsTrigger>
                        <TabsTrigger value="imagenes">
                          <ImageIcon className="w-4 h-4 mr-1" />
                          Imágenes
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="videos" className="space-y-3">
                        {recursos.videos.length > 0 ? (
                          recursos.videos.map((video) => (
                            <Card key={video.id} className="p-4">
                              {video.status === 'generating' && (
                                <div className="flex items-center gap-3 mb-3">
                                  <Loader2 className="w-5 h-5 text-secondary animate-spin" />
                                  <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                      Generando video...
                                    </p>
                                    {video.progress !== undefined && (
                                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                                        <div
                                          className="bg-secondary h-2 rounded-full transition-all"
                                          style={{ width: `${video.progress}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {video.status === 'ready' && video.url && (
                                <div className="space-y-3">
                                  <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                                    <video
                                      src={video.url}
                                      controls
                                      poster={video.thumbnail}
                                      className="w-full h-full object-cover"
                                    >
                                      Tu navegador no soporta el elemento de video.
                                    </video>
                                  </div>
                                  {video.duration && (
                                    <p className="text-xs text-muted-foreground">
                                      Duración: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {video.status === 'error' && (
                                <div className="flex items-center gap-2 text-destructive mb-3">
                                  <p className="text-sm">Error al generar video</p>
                                  {video.error && (
                                    <p className="text-xs text-muted-foreground">{video.error}</p>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-start gap-3">
                                {!video.url && (
                                  <div className="w-10 h-10 bg-secondary/10 rounded flex items-center justify-center flex-shrink-0">
                                    <Video className="w-5 h-5 text-secondary" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-foreground">
                                    {video.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {video.description}
                                  </p>
                                  {video.url && (
                                    <a
                                      href={video.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline mt-2 inline-block"
                                    >
                                      Abrir en nueva pestaña
                                    </a>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No hay videos sugeridos
                          </p>
                        )}
                      </TabsContent>
                      <TabsContent value="audios" className="space-y-3">
                        {recursos.audios.length > 0 ? (
                          recursos.audios.map((audio) => (
                            <Card key={audio.id} className="p-4">
                              {audio.status === 'generating' && (
                                <div className="flex items-center gap-3 mb-3">
                                  <Loader2 className="w-5 h-5 text-secondary animate-spin" />
                                  <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                      Generando audio...
                                    </p>
                                    {audio.progress !== undefined && (
                                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                                        <div
                                          className="bg-secondary h-2 rounded-full transition-all"
                                          style={{ width: `${audio.progress}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {audio.status === 'ready' && audio.url && (
                                <div className="space-y-3 mb-3">
                                  <audio
                                    src={audio.url}
                                    controls
                                    className="w-full"
                                  >
                                    Tu navegador no soporta el elemento de audio.
                                  </audio>
                                  {audio.duration && (
                                    <p className="text-xs text-muted-foreground">
                                      Duración: {Math.floor(audio.duration / 60)}:{(audio.duration % 60).toString().padStart(2, '0')}
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {audio.status === 'error' && (
                                <div className="flex items-center gap-2 text-destructive mb-3">
                                  <p className="text-sm">Error al generar audio</p>
                                  {audio.error && (
                                    <p className="text-xs text-muted-foreground">{audio.error}</p>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-start gap-3">
                                {!audio.url && (
                                  <div className="w-10 h-10 bg-secondary/10 rounded flex items-center justify-center flex-shrink-0">
                                    <Music className="w-5 h-5 text-secondary" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-foreground">
                                    {audio.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {audio.description}
                                  </p>
                                  {audio.url && (
                                    <a
                                      href={audio.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline mt-2 inline-block"
                                    >
                                      Descargar audio
                                    </a>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No hay audios sugeridos
                          </p>
                        )}
                      </TabsContent>
                      <TabsContent value="imagenes" className="space-y-3">
                        {recursos.imagenes.length > 0 ? (
                          recursos.imagenes.map((imagen) => (
                            <Card key={imagen.id} className="p-4">
                              {imagen.status === 'generating' && (
                                <div className="flex items-center gap-3 mb-3">
                                  <Loader2 className="w-5 h-5 text-secondary animate-spin" />
                                  <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                      Generando imagen...
                                    </p>
                                    {imagen.progress !== undefined && (
                                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                                        <div
                                          className="bg-secondary h-2 rounded-full transition-all"
                                          style={{ width: `${imagen.progress}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {imagen.status === 'ready' && imagen.url && (
                                <div className="mb-3">
                                  <img
                                    src={imagen.url}
                                    alt={imagen.title}
                                    className="w-full rounded-lg object-cover max-h-64"
                                    loading="lazy"
                                  />
                                </div>
                              )}
                              
                              {imagen.status === 'error' && (
                                <div className="flex items-center gap-2 text-destructive mb-3">
                                  <p className="text-sm">Error al generar imagen</p>
                                  {imagen.error && (
                                    <p className="text-xs text-muted-foreground">{imagen.error}</p>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-start gap-3">
                                {!imagen.url && (
                                  <div className="w-10 h-10 bg-secondary/10 rounded flex items-center justify-center flex-shrink-0">
                                    <ImageIcon className="w-5 h-5 text-secondary" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-foreground">
                                    {imagen.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {imagen.description}
                                  </p>
                                  {imagen.url && (
                                    <a
                                      href={imagen.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline mt-2 inline-block"
                                    >
                                      Ver imagen completa
                                    </a>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No hay imágenes sugeridas
                          </p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4 border-t">
                    {/* Generate Material Section */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Generar material educativo</Label>
                      <div className="flex gap-2">
                        <Select value={selectedMaterialType} onValueChange={(val) => setSelectedMaterialType(val as MaterialType)}>
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rubrica">Rúbrica de evaluación</SelectItem>
                            <SelectItem value="ejercicios">Ejercicios prácticos</SelectItem>
                            <SelectItem value="guia">Guía de retroalimentación</SelectItem>
                            <SelectItem value="ejemplos">Ejemplos de trabajos</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={handleGenerateMaterial}
                          disabled={isGeneratingMaterial}
                          className="flex-1"
                        >
                          {isGeneratingMaterial ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <FileCheck className="w-4 h-4 mr-2" />
                              Generar material
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button className="w-full" onClick={handleDownloadPDF}>
                      <Download className="w-4 h-4 mr-2" />
                      Descargar PDF
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" onClick={handleCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar criterios
                      </Button>
                      <Button variant="outline" onClick={handleSave}>
                        <Bookmark className="w-4 h-4 mr-2" />
                        Guardar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Material Dialog */}
      <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMaterialType === 'rubrica' && 'Rúbrica de Evaluación'}
              {selectedMaterialType === 'ejercicios' && 'Ejercicios Prácticos'}
              {selectedMaterialType === 'guia' && 'Guía de Retroalimentación'}
              {selectedMaterialType === 'ejemplos' && 'Ejemplos de Trabajos'}
            </DialogTitle>
            <DialogDescription>
              Material generado basado en los criterios de evaluación
            </DialogDescription>
          </DialogHeader>
          
          {generatedMaterial && (
            <div className="mt-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap text-sm font-sans bg-muted/50 p-4 rounded-lg border overflow-x-auto">
                  {generatedMaterial.material}
                </pre>
              </div>
              
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(generatedMaterial.material);
                  toast({
                    title: "Copiado",
                    description: "El material se copió al portapapeles",
                  });
                }}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                <Button onClick={() => setIsMaterialDialogOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Generar;
