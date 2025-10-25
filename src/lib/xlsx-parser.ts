import { ParsedSafetyData } from '@/types/safety';
import * as XLSX from 'xlsx';

export const parseSafetyDataFile = async (file: File): Promise<ParsedSafetyData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        const parsedData: ParsedSafetyData[] = jsonData.map(row => ({
          nature: row['Natureza'],
          monthlyData: {
            janeiro: Number(row['Janeiro']) || 0,
            fevereiro: Number(row['Fevereiro']) || 0,
            marco: Number(row['Março']) || 0,
            abril: Number(row['Abril']) || 0,
            maio: Number(row['Maio']) || 0,
            junho: Number(row['Junho']) || 0,
            julho: Number(row['Julho']) || 0,
            agosto: Number(row['Agosto']) || 0,
            setembro: Number(row['Setembro']) || 0,
            outubro: Number(row['Outubro']) || 0,
            novembro: Number(row['Novembro']) || 0,
            dezembro: Number(row['Dezembro']) || 0
          },
          total: Number(row['Total']) || 0
        }));

        // Validate data
        const invalidRows = parsedData.filter(row => 
          !row.nature || 
          Object.values(row.monthlyData).some(val => isNaN(Number(val))) ||
          isNaN(Number(row.total))
        );

        if (invalidRows.length > 0) {
          reject(new Error('O arquivo contém dados inválidos. Verifique se todas as células contêm valores numéricos válidos.'));
          return;
        }

        resolve(parsedData);
      } catch (error) {
        reject(new Error('Erro ao processar o arquivo. Verifique se o formato está correto.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo.'));
    };

    reader.readAsArrayBuffer(file);
  });
};