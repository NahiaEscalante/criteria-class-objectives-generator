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

const Generar = () => {
  const { toast } = useToast();
  const [fileName, setFileName] = useState("");
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
  const [objetivos, setObjetivos] = useState([
    "Identificar y utilizar adjetivos descriptivos para caracterizar personas, objetos y lugares en textos escritos.",
    "Producir textos descriptivos coherentes aplicando estructura textual apropiada para el grado.",
    "Emplear vocabulario variado y preciso para enriquecer las descripciones en sus producciones escritas."
  ]);

  const [criterios, setCriterios] = useState([
    "El texto incluye al menos 5 adjetivos descriptivos variados y apropiados al contexto.",
    "La descripción sigue una estructura clara: introducción, desarrollo con características físicas y emocionales, cierre.",
    "Utiliza conectores textuales (además, también, por otro lado) para organizar las ideas.",
    "Presenta ortografía adecuada en palabras de uso frecuente y respeta las normas de puntuación básicas."
  ]);

  const [editingObjetivo, setEditingObjetivo] = useState<number | null>(null);
  const [editingCriterio, setEditingCriterio] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setShowResults(false);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
      setShowResults(true);
    }, 2000);
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

  const handleDownloadPDF = () => {
    toast({
      title: "PDF generado",
      description: "Tu documento está listo para descargar",
    });
  };

  const handleCopy = () => {
    toast({
      title: "Criterios copiados",
      description: "Los criterios se copiaron al portapapeles",
    });
  };

  const handleSave = () => {
    toast({
      title: "Guardado exitoso",
      description: "La sesión se guardó en tu historial",
    });
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
                      <Select value={formData.area} onValueChange={(val) => setFormData({...formData, area: val})}>
                        <SelectTrigger id="area">
                          <SelectValue placeholder="Selecciona un área" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="comunicacion">Comunicación</SelectItem>
                          <SelectItem value="matematica">Matemática</SelectItem>
                          <SelectItem value="ciencias">Ciencia y Tecnología</SelectItem>
                          <SelectItem value="sociales">Ciencias Sociales</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="competencia">Competencia</Label>
                      <Select value={formData.competencia} onValueChange={(val) => setFormData({...formData, competencia: val})}>
                        <SelectTrigger id="competencia">
                          <SelectValue placeholder="Selecciona una competencia" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="escribe">Escribe diversos tipos de textos</SelectItem>
                          <SelectItem value="lee">Lee diversos tipos de textos escritos</SelectItem>
                          <SelectItem value="comunica">Se comunica oralmente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="capacidad">Capacidad</Label>
                      <Select value={formData.capacidad} onValueChange={(val) => setFormData({...formData, capacidad: val})}>
                        <SelectTrigger id="capacidad">
                          <SelectValue placeholder="Selecciona una capacidad" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="adecua">Adecúa el texto a la situación comunicativa</SelectItem>
                          <SelectItem value="organiza">Organiza y desarrolla las ideas de forma coherente</SelectItem>
                          <SelectItem value="utiliza">Utiliza convenciones del lenguaje escrito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="desempeno">Desempeño esperado</Label>
                      <Select value={formData.desempeno} onValueChange={(val) => setFormData({...formData, desempeno: val})}>
                        <SelectTrigger id="desempeno">
                          <SelectValue placeholder="Selecciona un desempeño" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="d1">Escribe textos descriptivos utilizando adjetivos</SelectItem>
                          <SelectItem value="d2">Organiza sus ideas en torno a un tema central</SelectItem>
                          <SelectItem value="d3">Utiliza recursos ortográficos básicos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="grado">Grado y nivel</Label>
                      <Select value={formData.grado} onValueChange={(val) => setFormData({...formData, grado: val})}>
                        <SelectTrigger id="grado">
                          <SelectValue placeholder="Selecciona el grado" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="4p">4to de Primaria</SelectItem>
                          <SelectItem value="5p">5to de Primaria</SelectItem>
                          <SelectItem value="6p">6to de Primaria</SelectItem>
                          <SelectItem value="1s">1ro de Secundaria</SelectItem>
                        </SelectContent>
                      </Select>
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
                        onChange={(e) => setFormData({...formData, producto: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="evidencia">Evidencia</Label>
                      <Textarea
                        id="evidencia"
                        placeholder="Ej: Producción escrita individual de una página"
                        value={formData.evidencia}
                        onChange={(e) => setFormData({...formData, evidencia: e.target.value})}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contexto">Contexto de los estudiantes</Label>
                      <Textarea
                        id="contexto"
                        placeholder="Ej: Estudiantes de 4to de primaria de escuela pública, nivel heterogéneo..."
                        value={formData.contexto}
                        onChange={(e) => setFormData({...formData, contexto: e.target.value})}
                        rows={4}
                      />
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
                        <Card className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-secondary/10 rounded flex items-center justify-center flex-shrink-0">
                              <Video className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-foreground">
                                Los adjetivos descriptivos
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Video educativo que explica el uso de adjetivos calificativos
                              </p>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-secondary/10 rounded flex items-center justify-center flex-shrink-0">
                              <Video className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-foreground">
                                Estructura del texto descriptivo
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Tutorial sobre cómo organizar una descripción
                              </p>
                            </div>
                          </div>
                        </Card>
                      </TabsContent>
                      <TabsContent value="audios" className="space-y-3">
                        <Card className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-secondary/10 rounded flex items-center justify-center flex-shrink-0">
                              <Music className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-foreground">
                                Podcast: Escribir descripciones vívidas
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Audio con ejemplos prácticos para el aula
                              </p>
                            </div>
                          </div>
                        </Card>
                      </TabsContent>
                      <TabsContent value="imagenes" className="space-y-3">
                        <Card className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-secondary/10 rounded flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-foreground">
                                Infografía de adjetivos
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Material visual con clasificación de adjetivos
                              </p>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-secondary/10 rounded flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-foreground">
                                Ejemplo de ficha descriptiva
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Modelo para que los estudiantes tomen de referencia
                              </p>
                            </div>
                          </div>
                        </Card>
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
