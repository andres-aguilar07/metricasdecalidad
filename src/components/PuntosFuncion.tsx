import React, { useState, useEffect } from 'react';

interface Item {
  id: string;
  tipo: string;
  nombre: string;
  complejidad: string;
  valor: number;
}

interface FactorInfluencia {
  nombre: string;
  valor: number;
}

const PuntosFuncion: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [factores, setFactores] = useState<FactorInfluencia[]>([
    { nombre: 'Comunicaciones de datos', valor: 0 },
    { nombre: 'Procesamiento distribuido', valor: 0 },
    { nombre: 'Objetivos de rendimiento', valor: 0 },
    { nombre: 'Configuración de uso intensivo', valor: 0 },
    { nombre: 'Tasas de transacción rápidas', valor: 0 },
    { nombre: 'Entrada de datos en línea', valor: 0 },
    { nombre: 'Amigabilidad en el diseño', valor: 0 },
    { nombre: 'Actualización de datos en línea', valor: 0 },
    { nombre: 'Procesamiento complejo', valor: 0 },
    { nombre: 'Reusabilidad', valor: 0 },
    { nombre: 'Facilidad de instalación', valor: 0 },
    { nombre: 'Facilidad operacional', valor: 0 },
    { nombre: 'Adaptabilidad', valor: 0 },
    { nombre: 'Versatilidad', valor: 0 },
  ]);
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(true);

  const tipos = {
    'EE': { nombre: 'Entrada Externa', ponderaciones: { bajo: 3, medio: 4, alto: 6 } },
    'SE': { nombre: 'Salida Externa', ponderaciones: { bajo: 4, medio: 5, alto: 7 } },
    'CE': { nombre: 'Consulta Externa', ponderaciones: { bajo: 3, medio: 4, alto: 6 } },
    'ALI': { nombre: 'Archivo Lógico Interno', ponderaciones: { bajo: 7, medio: 10, alto: 15 } },
    'AIE': { nombre: 'Archivo de Interfaz Externa', ponderaciones: { bajo: 5, medio: 7, alto: 10 } },
  };

  const [cuentaTotal, setCuentaTotal] = useState(0);
  const [totalGI, setTotalGI] = useState(0);
  const [puntoFuncion, setPuntoFuncion] = useState(0);

  const addItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      tipo: 'EE',
      nombre: '',
      complejidad: 'bajo',
      valor: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof Item, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateFactor = (index: number, valor: number) => {
    const newFactores = [...factores];
    newFactores[index].valor = valor;
    setFactores(newFactores);
  };

  useEffect(() => {
    // Calcular CUENTA_TOTAL
    const total = items.reduce((sum, item) => {
      const ponderacion = tipos[item.tipo as keyof typeof tipos].ponderaciones[item.complejidad as keyof typeof tipos['EE']['ponderaciones']];
      return sum + (ponderacion * item.valor);
    }, 0);
    setCuentaTotal(total);

    // Calcular TOTAL_GI
    const gi = factores.reduce((sum, factor) => sum + factor.valor, 0);
    setTotalGI(gi);

    // Calcular PUNTO_FUNCION
    const pf = total * (0.65 + 0.01 * gi);
    setPuntoFuncion(pf);
  }, [items, factores]);

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Puntos por Función</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna 1: Items */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Elementos de Dominio de Información</h3>
          
          <div className="mb-6">
            <button
              onClick={() => setMostrarInstrucciones(!mostrarInstrucciones)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
            >
              <span className="mr-2">{mostrarInstrucciones ? '▼' : '▶'}</span>
              <span className="font-medium">
                {mostrarInstrucciones ? 'Ocultar instrucciones' : 'Mostrar instrucciones'}
              </span>
            </button>
            
            {mostrarInstrucciones && (
              <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700 transition-all duration-300">
                <p className="mb-2"><strong>Instrucciones:</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Añada cada elemento de dominio de información de su sistema usando el botón "Añadir Elemento".</li>
                  <li>Para cada elemento, seleccione su tipo, asigne un nombre descriptivo, indique su complejidad y especifique la cuenta.</li>
                  <li>Los tipos disponibles incluyen Entradas, Salidas, Consultas y Archivos, cada uno con su propia ponderación según su complejidad.</li>
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={addItem}
            className="mb-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            Añadir Elemento
          </button>

          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="p-4 border rounded-md bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">Tipo de Elemento</label>
                    <select
                      value={item.tipo}
                      onChange={(e) => updateItem(item.id, 'tipo', e.target.value)}
                      className="p-2 border rounded-md"
                    >
                      {Object.entries(tipos).map(([key, value]) => (
                        <option key={key} value={key}>{value.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">Nombre Descriptivo</label>
                    <input
                      type="text"
                      value={item.nombre}
                      onChange={(e) => updateItem(item.id, 'nombre', e.target.value)}
                      placeholder="Ej: Registro de Usuario"
                      className="p-2 border rounded-md"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">Nivel de Complejidad</label>
                    <select
                      value={item.complejidad}
                      onChange={(e) => updateItem(item.id, 'complejidad', e.target.value)}
                      className="p-2 border rounded-md"
                    >
                      <option value="bajo">Baja</option>
                      <option value="medio">Media</option>
                      <option value="alto">Alta</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">Cuenta</label>
                    <input
                      type="number"
                      value={item.valor}
                      onChange={(e) => updateItem(item.id, 'valor', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      className="p-2 border rounded-md"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Columna 2: Factores de Influencia */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Factores de Influencia</h3>
          <div className="space-y-3">
            {factores.map((factor, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{factor.nombre}</span>
                <select
                  value={factor.valor}
                  onChange={(e) => updateFactor(index, Number(e.target.value))}
                  className="p-2 border rounded-md"
                >
                  {[0, 1, 2, 3, 4, 5].map(val => (
                    <option key={val} value={val}>
                      {val} - {
                        val === 0 ? 'Sin influencia' :
                        val === 1 ? 'Incidental' :
                        val === 2 ? 'Moderada' :
                        val === 3 ? 'Promedio' :
                        val === 4 ? 'Significativa' :
                        'Esencial'
                      }
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-4">Resultados</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Cuenta Total:</span>
            <span className="text-lg">{cuentaTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Total GI:</span>
            <span className={`text-lg ${
              totalGI < 35 ? 'text-green-500' :
              totalGI > 65 ? 'text-red-500' :
              'text-yellow-500'
            }`}>{totalGI}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-bold">Punto Función Final:</span>
            <span className="text-2xl font-bold text-blue-600">{puntoFuncion.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuntosFuncion; 