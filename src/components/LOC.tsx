import React, { useState } from 'react';

const LOC: React.FC = () => {
  const [loc, setLoc] = useState<number>(0);
  const [persons, setPersons] = useState<number>(0);
  const [days, setDays] = useState<number>(0);
  const [defects, setDefects] = useState<number>(0);
  const [functionPoints, setFunctionPoints] = useState<number>(0);
  
  // Cálculos
  const productivity = persons && days ? loc / (persons * days) : 0;
  const defectsPerKLOC = loc ? defects / (loc / 1000) : 0;
  const efficiency = functionPoints ? loc / functionPoints : 0;
  
  // Evaluación de estándares con colores
  const getProductivityStandard = () => {
    if (productivity === 0) return { text: "", color: "text-gray-500" };
    if (productivity < 100) return { text: "Baja productividad (menos de 100 LOC/persona/día)", color: "text-red-600" };
    if (productivity <= 300) return { text: "Productividad dentro del rango común (100-300 LOC/persona/día)", color: "text-gray-600" };
    return { text: "Alta productividad (más de 300 LOC/persona/día)", color: "text-green-600" };
  };
  
  const getQualityStandard = () => {
    if (defectsPerKLOC === 0) return { text: "", color: "text-gray-500" };
    if (defectsPerKLOC < 2) return { text: "Excelente calidad (menos de 2 defectos/KLOC)", color: "text-green-600" };
    if (defectsPerKLOC < 5) return { text: "Calidad aceptable (2-5 defectos/KLOC)", color: "text-gray-600" };
    return { text: "Baja calidad (más de 5 defectos/KLOC)", color: "text-red-600" };
  };
  
  const getEfficiencyStandard = () => {
    if (efficiency === 0) return { text: "", color: "text-gray-500" };
    if (efficiency < 40) return { text: "Alta eficiencia (menos de 40 LOC/FP)", color: "text-green-600" };
    if (efficiency <= 80) return { text: "Eficiencia promedio (40-80 LOC/FP)", color: "text-gray-600" };
    return { text: "Baja eficiencia (más de 80 LOC/FP)", color: "text-red-600" };
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Líneas de Código (LOC)</h2>
      <p className="text-center mb-6">
        Mide la cantidad de líneas escritas en el código fuente y la relaciona con el esfuerzo, tiempo, costo y
        complejidad.
      </p>
      
      <div className="w-full max-w-md mb-8">
        <div className="space-y-2">
          <label htmlFor="loc-input" className="block text-sm font-medium">
            Número de líneas de código
          </label>
          <input
            id="loc-input"
            type="number"
            className="w-full p-2 border rounded-md"
            placeholder="Ingrese el número de líneas"
            value={loc || ''}
            onChange={(e) => setLoc(Number(e.target.value))}
          />
        </div>
      </div>
      
      {/* Cálculo de LOC y Productividad */}
      <div className="w-full max-w-md mb-8 border p-4 rounded-md">
        <h3 className="text-lg font-bold mb-2">1. Cálculo de LOC y Productividad</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Número de personas</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                value={persons || ''}
                onChange={(e) => setPersons(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Días de desarrollo</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                value={days || ''}
                onChange={(e) => setDays(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium">Resultado:</h4>
            <p>Productividad = {loc} / ({persons} * {days}) = {productivity.toFixed(2)} LOC/persona/día</p>
            <p className={`text-sm font-medium mt-1 ${getProductivityStandard().color}`}>{getProductivityStandard().text}</p>
          </div>
        </div>
      </div>
      
      {/* Cálculo de LOC y Calidad */}
      <div className="w-full max-w-md mb-8 border p-4 rounded-md">
        <h3 className="text-lg font-bold mb-2">2. Cálculo de LOC y Calidad</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Número de defectos</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              value={defects || ''}
              onChange={(e) => setDefects(Number(e.target.value))}
            />
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium">Resultado:</h4>
            <p>Defectos por KLOC = {defects} / ({loc} / 1000) = {defectsPerKLOC.toFixed(2)} defectos/KLOC</p>
            <p className={`text-sm font-medium mt-1 ${getQualityStandard().color}`}>{getQualityStandard().text}</p>
          </div>
        </div>
      </div>
      
      {/* Cálculo de LOC y Eficiencia */}
      <div className="w-full max-w-md mb-8 border p-4 rounded-md">
        <h3 className="text-lg font-bold mb-2">3. Cálculo de LOC y Eficiencia</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Puntos de función (PF)</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              value={functionPoints || ''}
              onChange={(e) => setFunctionPoints(Number(e.target.value))}
            />
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium">Resultado:</h4>
            <p>Eficiencia = {loc} / {functionPoints} = {efficiency.toFixed(2)} LOC/PF</p>
            <p className={`text-sm font-medium mt-1 ${getEfficiencyStandard().color}`}>{getEfficiencyStandard().text}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LOC; 