import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiBadge } from "@/components/AiBadge";
import { Upload, FileText, Sparkles, Loader2, Check, Edit2, Save, Plus, Download, Copy, Bookmark, Video, Music, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import type { Session, LearningObjective, EvaluationCriterion, UploadedFile, AiGenerationResponse, Resource, ResourceType } from "@/types";

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
    videos: [] as Array<{ title: string; description: string }>,
    audios: [] as Array<{ title: string; description: string }>,
    imagenes: [] as Array<{ title: string; description: string }>,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [editingObjetivo, setEditingObjetivo] = useState<number | null>(null);
  const [editingCriterio, setEditingCriterio] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

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
      
      // Convertir recursos al formato esperado
      const recursosData = {
        videos: [] as Array<{ title: string; description: string }>,
        audios: [] as Array<{ title: string; description: string }>,
        imagenes: [] as Array<{ title: string; description: string }>,
      };
      
      response.resources.forEach((resource: Resource) => {
        const item = { title: resource.title, description: resource.description };
        if (resource.type === 'video') {
          recursosData.videos.push(item);
        } else if (resource.type === 'audio') {
          recursosData.audios.push(item);
        } else if (resource.type === 'image') {
          recursosData.imagenes.push(item);
        }
      });
      
      setRecursos(recursosData);
      setShowResults(true);
      
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

      // Convertir recursos al formato de Resource
      const resources: Resource[] = [
        ...recursos.videos.map((v, i) => ({
          id: `${sessionId}-res-video-${i}`,
          type: 'video' as ResourceType,
          title: v.title,
          description: v.description,
        })),
        ...recursos.audios.map((a, i) => ({
          id: `${sessionId}-res-audio-${i}`,
          type: 'audio' as ResourceType,
          title: a.title,
          description: a.description,
        })),
        ...recursos.imagenes.map((img, i) => ({
          id: `${sessionId}-res-image-${i}`,
          type: 'image' as ResourceType,
          title: img.title,
          description: img.description,
        })),
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
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Recursos sugeridos por IA
                    </h3>
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
                          recursos.videos.map((video, index) => (
                            <Card key={index} className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-secondary/10 rounded flex items-center justify-center flex-shrink-0">
                                  <Video className="w-5 h-5 text-secondary" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-foreground">
                                    {video.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {video.description}
                                  </p>
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
                          recursos.audios.map((audio, index) => (
                            <Card key={index} className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-secondary/10 rounded flex items-center justify-center flex-shrink-0">
                                  <Music className="w-5 h-5 text-secondary" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-foreground">
                                    {audio.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {audio.description}
                                  </p>
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
                          recursos.imagenes.map((imagen, index) => (
                            <Card key={index} className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-secondary/10 rounded flex items-center justify-center flex-shrink-0">
                                  <ImageIcon className="w-5 h-5 text-secondary" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-foreground">
                                    {imagen.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {imagen.description}
                                  </p>
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
    </div>
  );
};

export default Generar;
