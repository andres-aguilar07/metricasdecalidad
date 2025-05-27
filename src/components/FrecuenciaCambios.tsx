import React, { useState, useEffect } from 'react';

interface Modulo {
  id: string;
  nombre: string;
  cambios: number;
}

const FrecuenciaCambios: React.FC = () => {
  const [modulos, setModulos] = useState<Modulo[]>([
    { id: '1', nombre: 'Módulo 1', cambios: 5 },
    { id: '2', nombre: 'Módulo 2', cambios: 12 },
    { id: '3', nombre: 'Módulo 3', cambios: 3 },
  ]);
  const [periodoTiempo, setPeriodoTiempo] = useState<number>(4);
  const [unidadTiempo, setUnidadTiempo] = useState<string>('semanas');
  const [cambiosTotales, setCambiosTotales] = useState<number>(0);
  const [moduloSeleccionado, setModuloSeleccionado] = useState<string | null>(null);
  
  // Calcular cambios totales
  useEffect(() => {
    const total = modulos.reduce((sum, modulo) => sum + modulo.cambios, 0);
    setCambiosTotales(total);
  }, [modulos]);
  
  // Agregar un nuevo módulo
  const agregarModulo = () => {
    const nuevoModulo: Modulo = {
      id: Date.now().toString(),
      nombre: `Módulo ${modulos.length + 1}`,
      cambios: 0
    };
    setModulos([...modulos, nuevoModulo]);
  };
  
  // Actualizar número de cambios de un módulo
  const actualizarCambios = (id: string, cambios: number) => {
    setModulos(modulos.map(modulo => 
      modulo.id === id ? { ...modulo, cambios: Math.max(0, cambios) } : modulo
    ));
  };
  
  // Actualizar nombre de un módulo
  const actualizarNombre = (id: string, nombre: string) => {
    setModulos(modulos.map(modulo => 
      modulo.id === id ? { ...modulo, nombre } : modulo
    ));
  };
  
  // Eliminar un módulo
  const eliminarModulo = (id: string) => {
    setModulos(modulos.filter(modulo => modulo.id !== id));
  };
  
  // Calcular frecuencia de cambio para un módulo
  const calcularFrecuencia = (cambios: number): number => {
    return periodoTiempo > 0 ? cambios / periodoTiempo : 0;
  };
  
  // Calcular frecuencia relativa para un módulo
  const calcularFrecuenciaRelativa = (cambios: number): number => {
    return cambiosTotales > 0 ? (cambios / cambiosTotales) * 100 : 0;
  };
  
  // Evaluación de la frecuencia de cambios
  const evaluarFrecuencia = (frecuencia: number): { texto: string, color: string } => {
    if (frecuencia < 0.5) return { texto: "Baja: El módulo es estable", color: "text-green-600" };
    if (frecuencia < 1.5) return { texto: "Media: El módulo tiene cambios ocasionales", color: "text-yellow-600" };
    if (frecuencia < 3) return { texto: "Alta: El módulo cambia frecuentemente", color: "text-orange-600" };
    return { texto: "Muy alta: El módulo es inestable y puede requerir refactorización", color: "text-red-600" };
  };
  
  // Evaluación de la frecuencia relativa
  const evaluarFrecuenciaRelativa = (porcentaje: number): { texto: string, color: string } => {
    if (porcentaje < 10) return { texto: "Baja: El módulo representa pocos cambios en el sistema", color: "text-green-600" };
    if (porcentaje < 25) return { texto: "Media: El módulo representa una parte moderada de los cambios", color: "text-yellow-600" };
    if (porcentaje < 40) return { texto: "Alta: El módulo representa muchos cambios en el sistema", color: "text-orange-600" };
    return { texto: "Muy alta: El módulo concentra la mayoría de los cambios del sistema", color: "text-red-600" };
  };

  // Generar datos para el gráfico de barras
  const generarDatosGrafico = () => {
    return modulos.map(modulo => ({
      nombre: modulo.nombre,
      frecuencia: calcularFrecuencia(modulo.cambios),
      frecuenciaRelativa: calcularFrecuenciaRelativa(modulo.cambios)
    }));
  };
  
  // Renderizar gráfico de barras
  const renderizarGrafico = () => {
    const datos = generarDatosGrafico();
    const maxFrecuencia = Math.max(...datos.map(d => d.frecuencia), 1);
    
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-center font-medium mb-4">Visualización de frecuencia de cambios</h4>
        <div className="flex flex-col">
          {datos.map((dato, index) => (
            <div 
              key={index} 
              className="mb-3 flex items-center"
              onClick={() => setModuloSeleccionado(modulos[index].id)}
            >
              <div className="w-24 truncate mr-2">{dato.nombre}</div>
              <div className="flex-1 h-8 bg-gray-200 rounded-md overflow-hidden">
                <div 
                  className="h-full rounded-md flex items-center pl-2 text-white text-sm"
                  style={{
                    width: `${Math.min(100, (dato.frecuencia / maxFrecuencia) * 100)}%`,
                    backgroundColor: dato.frecuencia < 0.5 ? '#10B981' : 
                                    dato.frecuencia < 1.5 ? '#FBBF24' :
                                    dato.frecuencia < 3 ? '#F97316' : '#EF4444'
                  }}
                >
                  {dato.frecuencia.toFixed(2)}
                </div>
              </div>
              <div className="ml-2 w-16 text-sm text-right">{dato.frecuenciaRelativa.toFixed(1)}%</div>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-gray-500 mt-2">
          Cambios por {unidadTiempo}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Frecuencia de Cambios por Módulo</h2>
      <p className="text-center mb-6">
        Mide qué tan frecuentemente se modifica cada módulo del sistema, lo que puede indicar inestabilidad o fragilidad.
      </p>
      
      <div className="w-full max-w-md mb-8 p-6 border rounded-md bg-white shadow-sm">
        <h3 className="text-lg font-bold mb-4">Fórmulas</h3>
        <div className="mb-4 bg-gray-50 p-3 rounded-md">
          <p className="text-sm font-medium mb-1">Frecuencia de cambio:</p>
          <div className="text-center italic">
            Frecuencia = Número de cambios / Periodo de tiempo
          </div>
          
          <p className="text-sm font-medium mt-3 mb-1">Frecuencia relativa:</p>
          <div className="text-center italic">
            Frecuencia relativa = (Cambios en el módulo / Cambios totales) × 100
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Periodo de tiempo:</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              className="w-full p-2 border rounded-md"
              value={periodoTiempo}
              onChange={(e) => setPeriodoTiempo(Math.max(1, Number(e.target.value)))}
            />
            <select
              className="p-2 border rounded-md"
              value={unidadTiempo}
              onChange={(e) => setUnidadTiempo(e.target.value)}
            >
              <option value="días">Días</option>
              <option value="semanas">Semanas</option>
              <option value="meses">Meses</option>
              <option value="años">Años</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Módulos:</label>
            <button 
              className="text-sm bg-blue-500 text-white px-2 py-1 rounded"
              onClick={agregarModulo}
            >
              + Agregar
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {modulos.map((modulo) => (
              <div 
                key={modulo.id} 
                className={`p-3 border rounded-md ${moduloSeleccionado === modulo.id ? 'border-blue-500 bg-blue-50' : ''}`}
                onClick={() => setModuloSeleccionado(modulo.id)}
              >
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 p-1 border rounded text-sm"
                    value={modulo.nombre}
                    onChange={(e) => actualizarNombre(modulo.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button 
                    className="text-red-500 px-2 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarModulo(modulo.id);
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs">Cambios:</label>
                  <input
                    type="number"
                    min="0"
                    className="w-16 p-1 border rounded text-sm"
                    value={modulo.cambios}
                    onChange={(e) => actualizarCambios(modulo.id, Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 text-right text-xs">
                    <span className="font-medium">Frecuencia:</span> {calcularFrecuencia(modulo.cambios).toFixed(2)} por {unidadTiempo}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {renderizarGrafico()}
        
        {moduloSeleccionado && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-2">Análisis del módulo seleccionado:</h4>
            {(() => {
              const modulo = modulos.find(m => m.id === moduloSeleccionado);
              if (!modulo) return null;
              
              const frecuencia = calcularFrecuencia(modulo.cambios);
              const frecuenciaRelativa = calcularFrecuenciaRelativa(modulo.cambios);
              const evaluacionFrecuencia = evaluarFrecuencia(frecuencia);
              const evaluacionRelativa = evaluarFrecuenciaRelativa(frecuenciaRelativa);
              
              return (
                <div>
                  <div className="mb-2">
                    <p className="text-sm"><span className="font-medium">Módulo:</span> {modulo.nombre}</p>
                    <p className="text-sm"><span className="font-medium">Cambios:</span> {modulo.cambios} en {periodoTiempo} {unidadTiempo}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Frecuencia:</p>
                      <p className="text-2xl font-bold">{frecuencia.toFixed(2)}</p>
                      <p className={`text-xs ${evaluacionFrecuencia.color}`}>
                        {evaluacionFrecuencia.texto}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Frecuencia relativa:</p>
                      <p className="text-2xl font-bold">{frecuenciaRelativa.toFixed(1)}%</p>
                      <p className={`text-xs ${evaluacionRelativa.color}`}>
                        {evaluacionRelativa.texto}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
      
      <div className="w-full max-w-md p-6 border rounded-md bg-white shadow-sm">
        <h3 className="text-lg font-bold mb-2">Interpretación</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><span className="font-medium text-green-600">Baja frecuencia:</span> Módulo estable con pocos cambios.</li>
          <li><span className="font-medium text-yellow-600">Frecuencia media:</span> Módulo con cambios ocasionales.</li>
          <li><span className="font-medium text-orange-600">Alta frecuencia:</span> Módulo con muchos cambios, posible señal de problemas de diseño.</li>
          <li><span className="font-medium text-red-600">Muy alta frecuencia:</span> Módulo inestable, probablemente requiere refactorización.</li>
        </ul>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm">
          <p className="font-medium text-blue-700">Consideraciones importantes:</p>
          <ul className="list-disc pl-5 mt-1 text-blue-700">
            <li>Un módulo con alta frecuencia de cambios puede indicar un diseño deficiente o requisitos inestables.</li>
            <li>La frecuencia relativa alta muestra módulos que concentran los cambios y pueden ser cuellos de botella.</li>
            <li>Los módulos que cambian juntos frecuentemente pueden tener un acoplamiento alto no identificado.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FrecuenciaCambios; 