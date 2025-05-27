import React, { useState, useEffect } from 'react';

const IndiceMantenibilidad: React.FC = () => {
  // Estados para los valores de entrada
  const [halsteadVolume, setHalsteadVolume] = useState<number>(0);
  const [complejidadCiclomatica, setComplejidadCiclomatica] = useState<number>(10);
  const [lineasCodigo, setLineasCodigo] = useState<number>(100);
  
  // Estado para el resultado
  const [indiceMantenibilidad, setIndiceMantenibilidad] = useState<number>(0);
  const [indiceAjustado, setIndiceAjustado] = useState<number>(0);
  
  // Estado para el modo visual
  const [modoVisual, setModoVisual] = useState<boolean>(false);
  const [mostrarCalcHalstead, setMostrarCalcHalstead] = useState<boolean>(false);
  
  // Estados para el cálculo del volumen de Halstead
  const [operadoresUnicos, setOperadoresUnicos] = useState<number>(10);
  const [operandosUnicos, setOperandosUnicos] = useState<number>(15);
  const [totalOperadores, setTotalOperadores] = useState<number>(30);
  const [totalOperandos, setTotalOperandos] = useState<number>(40);
  const [halsteadCalculado, setHalsteadCalculado] = useState<number>(0);
  
  // Calcular el volumen de Halstead cuando cambian los parámetros
  useEffect(() => {
    const n1 = operadoresUnicos;
    const n2 = operandosUnicos;
    const N1 = totalOperadores;
    const N2 = totalOperandos;
    
    const vocabulario = n1 + n2;
    const longitud = N1 + N2;
    const volumen = longitud * Math.log2(vocabulario);
    
    setHalsteadCalculado(volumen);
  }, [operadoresUnicos, operandosUnicos, totalOperadores, totalOperandos]);
  
  // Calcular el índice de mantenibilidad
  useEffect(() => {
    // Usar el valor calculado de Halstead si está en modo visual, de lo contrario usar el valor directo
    const halsteadUsado = modoVisual ? halsteadCalculado : halsteadVolume;
    
    // Evitar logaritmos de cero o números negativos
    const halsteadTermino = halsteadUsado > 0 ? 5.2 * Math.log(halsteadUsado) : 0;
    const locTermino = lineasCodigo > 0 ? 16.2 * Math.log(lineasCodigo) : 0;
    
    // Calcular MI según la fórmula
    const mi = 171 - halsteadTermino - 0.23 * complejidadCiclomatica - locTermino;
    
    // Ajustar a un rango de 0-100 (como en Visual Studio)
    const miAjustado = Math.max(0, Math.min(100, mi * 100 / 171));
    
    setIndiceMantenibilidad(mi);
    setIndiceAjustado(miAjustado);
  }, [halsteadVolume, complejidadCiclomatica, lineasCodigo, modoVisual, halsteadCalculado]);
  
  // Evaluar el nivel de mantenibilidad
  const evaluarMantenibilidad = (): { texto: string, color: string } => {
    if (indiceMantenibilidad >= 85) return { texto: "Alta mantenibilidad", color: "text-green-600" };
    if (indiceMantenibilidad >= 65) return { texto: "Mantenibilidad aceptable", color: "text-yellow-600" };
    return { texto: "Pobre mantenibilidad", color: "text-red-600" };
  };
  
  // Obtener color para el indicador visual
  const obtenerColorIndicador = (): string => {
    if (indiceMantenibilidad >= 85) return '#10B981'; // verde
    if (indiceMantenibilidad >= 65) return '#FBBF24'; // amarillo
    return '#EF4444'; // rojo
  };
  
  // Renderizar sección de cálculo de Halstead
  const renderizarCalculoHalstead = () => {
    return (
      <div className={`mt-4 p-4 bg-gray-50 rounded-lg border transition-all ${mostrarCalcHalstead ? 'max-h-[500px]' : 'max-h-12 overflow-hidden'}`}>
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setMostrarCalcHalstead(!mostrarCalcHalstead)}
        >
          <h4 className="font-medium">Cálculo del Volumen de Halstead</h4>
          <span>{mostrarCalcHalstead ? '▲' : '▼'}</span>
        </div>
        
        {mostrarCalcHalstead && (
          <div className="mt-3">
            <p className="text-sm mb-3">
              El volumen de Halstead mide la complejidad del código basada en operadores y operandos.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Operadores únicos (n₁):</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded-md"
                  value={operadoresUnicos}
                  onChange={(e) => setOperadoresUnicos(Math.max(1, Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Operandos únicos (n₂):</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded-md"
                  value={operandosUnicos}
                  onChange={(e) => setOperandosUnicos(Math.max(1, Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total operadores (N₁):</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded-md"
                  value={totalOperadores}
                  onChange={(e) => setTotalOperadores(Math.max(1, Number(e.target.value)))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total operandos (N₂):</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded-md"
                  value={totalOperandos}
                  onChange={(e) => setTotalOperandos(Math.max(1, Number(e.target.value)))}
                />
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-md border text-sm">
              <div className="mb-2">
                <span className="font-medium">Vocabulario (n):</span> {operadoresUnicos + operandosUnicos}
              </div>
              <div className="mb-2">
                <span className="font-medium">Longitud (N):</span> {totalOperadores + totalOperandos}
              </div>
              <div>
                <span className="font-medium">Volumen calculado:</span> {halsteadCalculado.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Renderizar una representación visual del índice de mantenibilidad
  const renderizarIndicadorVisual = () => {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-center font-medium mb-4">Índice de Mantenibilidad</h4>
        
        <div className="flex justify-center mb-4">
          <div className="w-64 h-32 relative">
            <svg width="100%" height="100%" viewBox="0 0 200 100">
              {/* Escala de fondo */}
              <rect x="0" y="70" width="200" height="30" rx="15" fill="#f3f4f6" />
              
              {/* Zonas de color */}
              <rect x="0" y="70" width="76" height="30" rx="15" fill="#EF4444" />
              <rect x="76" y="70" width="59" height="30" rx="0" fill="#FBBF24" />
              <rect x="135" y="70" width="65" height="30" rx="15" fill="#10B981" />
              
              {/* Marcas y etiquetas */}
              <line x1="76" y1="65" x2="76" y2="75" stroke="#6B7280" strokeWidth="1" />
              <text x="76" y="60" textAnchor="middle" fill="#6B7280" fontSize="10">65</text>
              
              <line x1="135" y1="65" x2="135" y2="75" stroke="#6B7280" strokeWidth="1" />
              <text x="135" y="60" textAnchor="middle" fill="#6B7280" fontSize="10">85</text>
              
              {/* Aguja indicadora */}
              <g transform={`translate(${indiceMantenibilidad >= 171 ? 200 : Math.max(0, Math.min(200, indiceMantenibilidad * 200 / 171))}, 70) rotate(0)`}>
                <circle cx="0" cy="0" r="10" fill={obtenerColorIndicador()} />
                <text x="0" y="3" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">{Math.round(indiceAjustado)}</text>
              </g>
            </svg>
          </div>
        </div>
        
        <div className="text-center text-sm">
          <span className={evaluarMantenibilidad().color + " font-medium"}>
            {evaluarMantenibilidad().texto}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Índice de Mantenibilidad (MI)</h2>
      <p className="text-center mb-6">
        Estima qué tan fácil es mantener el código a través de una métrica compuesta que considera complejidad, volumen y tamaño.
      </p>
      
      <div className="w-full max-w-md mb-8 p-6 border rounded-md bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Cálculo del MI</h3>
          <div className="flex items-center">
            <span className="text-sm mr-2">Modo visual</span>
            <button 
              className={`w-12 h-6 rounded-full transition-all ${modoVisual ? 'bg-blue-500' : 'bg-gray-300'}`}
              onClick={() => setModoVisual(!modoVisual)}
            >
              <div 
                className={`w-5 h-5 rounded-full bg-white transition-all ${modoVisual ? 'ml-7' : 'ml-1'}`}
              ></div>
            </button>
          </div>
        </div>
        
        <div className="mb-4 bg-gray-50 p-3 rounded-md">
          <p className="text-sm font-medium mb-1">Fórmula:</p>
          <div className="text-center italic">
            MI = 171 - 5.2 · ln(Halstead Volume) - 0.23 · CC - 16.2 · ln(LOC)
          </div>
        </div>
        
        {modoVisual ? (
          // Modo visual con calculadora de Halstead
          <>
            {renderizarCalculoHalstead()}
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Complejidad ciclomática (CC):</label>
              <input
                type="number"
                min="1"
                className="w-full p-2 border rounded-md"
                value={complejidadCiclomatica}
                onChange={(e) => setComplejidadCiclomatica(Math.max(1, Number(e.target.value)))}
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Líneas de código (LOC):</label>
              <input
                type="number"
                min="1"
                className="w-full p-2 border rounded-md"
                value={lineasCodigo}
                onChange={(e) => setLineasCodigo(Math.max(1, Number(e.target.value)))}
              />
            </div>
          </>
        ) : (
          // Modo simple con entrada directa de valores
          <>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Volumen de Halstead:</label>
              <input
                type="number"
                min="0"
                className="w-full p-2 border rounded-md"
                value={halsteadVolume}
                onChange={(e) => setHalsteadVolume(Math.max(0, Number(e.target.value)))}
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Complejidad ciclomática (CC):</label>
              <input
                type="number"
                min="1"
                className="w-full p-2 border rounded-md"
                value={complejidadCiclomatica}
                onChange={(e) => setComplejidadCiclomatica(Math.max(1, Number(e.target.value)))}
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Líneas de código (LOC):</label>
              <input
                type="number"
                min="1"
                className="w-full p-2 border rounded-md"
                value={lineasCodigo}
                onChange={(e) => setLineasCodigo(Math.max(1, Number(e.target.value)))}
              />
            </div>
          </>
        )}
        
        {renderizarIndicadorVisual()}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium mb-2">Resultados:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Índice original:</p>
              <p className="text-2xl font-bold">{indiceMantenibilidad.toFixed(2)}</p>
              <p className={`text-xs ${evaluarMantenibilidad().color}`}>
                {evaluarMantenibilidad().texto}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Índice ajustado (0-100):</p>
              <p className="text-2xl font-bold">{indiceAjustado.toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                Escala normalizada (Visual Studio)
              </p>
            </div>
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            <p>Los términos de la fórmula:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Halstead: {(halsteadVolume > 0 ? 5.2 * Math.log(modoVisual ? halsteadCalculado : halsteadVolume) : 0).toFixed(2)}</li>
              <li>Complejidad: {(0.23 * complejidadCiclomatica).toFixed(2)}</li>
              <li>LOC: {(lineasCodigo > 0 ? 16.2 * Math.log(lineasCodigo) : 0).toFixed(2)}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-md p-6 border rounded-md bg-white shadow-sm">
        <h3 className="text-lg font-bold mb-2">Interpretación</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><span className="font-medium text-green-600">MI ≥ 85:</span> Alta mantenibilidad. El código es fácil de entender y modificar.</li>
          <li><span className="font-medium text-yellow-600">65 ≤ MI &lt; 85:</span> Mantenibilidad aceptable. El código requiere un esfuerzo moderado para realizar cambios.</li>
          <li><span className="font-medium text-red-600">MI &lt; 65:</span> Pobre mantenibilidad. El código es difícil de mantener y debería considerarse una refactorización.</li>
        </ul>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm">
          <p className="font-medium text-blue-700 mb-2">Sobre los componentes del MI:</p>
          <ul className="list-disc pl-5 text-blue-700">
            <li><strong>Volumen de Halstead:</strong> Mide la complejidad del código basado en operadores y operandos únicos y totales.</li>
            <li><strong>Complejidad ciclomática:</strong> Mide el número de caminos independientes a través del código.</li>
            <li><strong>Líneas de código (LOC):</strong> Mide el tamaño físico del código.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IndiceMantenibilidad; 