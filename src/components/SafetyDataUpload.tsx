import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import LocationPicker from "./LocationPicker";
import { Button } from "./ui/button";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

const INCIDENT_TYPES = [
  { value: "roubo", label: "Roubo" },
  { value: "furto", label: "Furto" },
  { value: "homicidio", label: "Homicídio" },
  { value: "lesao_corporal", label: "Lesão Corporal (Agressão)" },
  { value: "outros", label: "Outros" },
] as const;

interface SafetyIncident {
  id: string;
  incident_type: string;
  latitude: number;
  longitude: number;
  incident_date: string;
  created_at: string;
}

const SafetyDataUpload = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [parameters, setParameters] = useState<{
    year: number;
    latitude: number;
    longitude: number;
    nature: string;
    date: string;
  }>({
    year: new Date().getFullYear(),
    latitude: 0,
    longitude: 0,
    nature: INCIDENT_TYPES[0].value,
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [date, setDate] = useState<Date>(new Date());

  const handleParameterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof parameters
  ) => {
    setParameters((prev) => ({
      ...prev,
      [field]: field === 'year' ? Number(e.target.value) : e.target.value,
    }));
  };

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('safety_incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) {
        console.error('Error fetching incidents:', error);
        return;
      }

      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [currentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLocation) {
      toast({
        title: "Localização não selecionada",
        description: "Por favor, selecione a localização da ocorrência no mapa.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('safety_incidents')
        .insert({
          incident_type: parameters.nature,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          incident_date: parameters.date,
        });

      if (error) {
        console.error("Error inserting data:", error);
        toast({
          title: "Erro ao registrar ocorrência",
          description: `Detalhes: ${error.message}`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Sucesso!",
        description: "A ocorrência foi registrada com sucesso.",
      });

      // Reset form
      setSelectedLocation(null);
      setDate(new Date());
      setParameters({
        year: new Date().getFullYear(),
        latitude: 0,
        longitude: 0,
        nature: INCIDENT_TYPES[0].value,
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      fetchIncidents(); // Refresh the list
    } catch (error) {
      setLoading(false);
      toast({
        title: "Erro ao enviar dados",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao registrar a ocorrência.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registro de Ocorrência</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nature">Natureza da Ocorrência</Label>
              <Select
                value={parameters.nature}
                onValueChange={(value) => setParameters(p => ({ ...p, nature: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a natureza" />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data da Ocorrência</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      if (d) {
                        setDate(d);
                        setParameters(p => ({ ...p, date: format(d, 'yyyy-MM-dd') }));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Localização da Ocorrência</Label>
            <p className="text-sm text-muted-foreground">
              Clique no mapa para definir o local exato da ocorrência.
            </p>
            <LocationPicker 
              onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })}
              selectedLocation={selectedLocation}
            />
            {selectedLocation && (
              <p className="text-sm text-green-600">
                Localização selecionada: Latitude {selectedLocation.lat.toFixed(5)}, Longitude {selectedLocation.lng.toFixed(5)}
              </p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Registrar Ocorrência
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-start p-6">
        <h3 className="font-semibold mb-4">Ocorrências Recentes</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Localização</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.length > 0 ? (
              incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>{format(new Date(incident.incident_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="capitalize">
                    {INCIDENT_TYPES.find(t => t.value === incident.incident_type)?.label || incident.incident_type}
                  </TableCell>
                  <TableCell>
                    {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Nenhuma ocorrência encontrada.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={incidents.length < itemsPerPage}
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SafetyDataUpload;