import React, { useState, useEffect } from 'react';

const Complejidad: React.FC = () => {
  const [edges, setEdges] = useState<number>(0);
  const [nodes, setNodes] = useState<number>(0);
  const [components, setComponents] = useState<number>(1);
  const [complexity, setComplexity] = useState<number>(0);
  
  // Calculate cyclomatic complexity
  useEffect(() => {
    const m = edges - nodes + 2 * components;
    setComplexity(m > 0 ? m : 0);
  }, [edges, nodes, components]);
  
  // Evaluate complexity standards
  const getComplexityStandard = () => {
    if (complexity === 0) return { text: "", color: "text-gray-500" };
    if (complexity <= 10) return { text: "Complejidad baja (1-10): Código simple y fácil de mantener", color: "text-green-600" };
    if (complexity <= 20) return { text: "Complejidad moderada (11-20): Riesgo moderado", color: "text-yellow-600" };
    if (complexity <= 50) return { text: "Complejidad alta (21-50): Código complejo, difícil de mantener", color: "text-orange-600" };
    return { text: "Complejidad muy alta (>50): Código extremadamente complejo, alto riesgo", color: "text-red-600" };
  };

  // Simple graph node
  const GraphNode = ({ id, isActive }: { id: number, isActive: boolean }) => (
    <div 
      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold
                 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
    >
      {id}
    </div>
  );

  // Simple graph visualization
  const renderGraph = () => {
    const maxNodes = Math.min(nodes, 7); // Limit visual representation
    const nodeElements = [];
    
    for (let i = 1; i <= maxNodes; i++) {
      nodeElements.push(
        <GraphNode key={i} id={i} isActive={true} />
      );
    }
    
    if (nodes > 7) {
      nodeElements.push(
        <div key="more" className="text-lg font-bold">...</div>
      );
    }
    
    return (
      <div className="flex flex-wrap gap-4 justify-center my-4 p-4 bg-gray-50 rounded-lg">
        {nodeElements}
        <div className="w-full text-center mt-2 text-sm text-gray-600">
          Representación visual simplificada del grafo ({edges} aristas entre {nodes} nodos)
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Complejidad Ciclomática</h2>
      <p className="text-center mb-6">
        Mide la complejidad estructural del código calculando el número de caminos linealmente independientes a través del programa.
      </p>
      
      <div className="w-full max-w-md mb-8 p-6 border rounded-md bg-white shadow-sm">
        <h3 className="text-lg font-bold mb-4">Fórmula: M = E - N + 2P</h3>
        <p className="mb-4 text-sm">
          Donde:<br />
          • M = Complejidad ciclomática<br />
          • E = Número de aristas del grafo<br />
          • N = Número de nodos del grafo<br />
          • P = Número de componentes conexos (nodos de salida)
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Aristas (E)</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded-md"
              value={edges || ''}
              onChange={(e) => setEdges(Math.max(0, Number(e.target.value)))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nodos (N)</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded-md"
              value={nodes || ''}
              onChange={(e) => setNodes(Math.max(0, Number(e.target.value)))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Componentes (P)</label>
            <input
              type="number"
              min="1"
              className="w-full p-2 border rounded-md"
              value={components || ''}
              onChange={(e) => setComponents(Math.max(1, Number(e.target.value)))}
            />
          </div>
        </div>
        
        {nodes > 0 && renderGraph()}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium">Resultado:</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{complexity}</p>
              <p className={`text-sm font-medium ${getComplexityStandard().color}`}>
                {getComplexityStandard().text}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" 
                 style={{
                   backgroundColor: complexity <= 10 ? '#10B981' : 
                                   complexity <= 20 ? '#FBBF24' :
                                   complexity <= 50 ? '#F97316' : '#EF4444',
                   color: '#FFFFFF',
                   fontSize: '24px',
                   fontWeight: 'bold'
                 }}>
              {complexity}
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-md p-6 border rounded-md bg-white shadow-sm">
        <h3 className="text-lg font-bold mb-2">Interpretación</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><span className="font-medium text-green-600">1-10:</span> Código simple, fácil de entender y mantener.</li>
          <li><span className="font-medium text-yellow-600">11-20:</span> Complejidad moderada, riesgo moderado.</li>
          <li><span className="font-medium text-orange-600">21-50:</span> Código complejo, difícil de mantener y testear.</li>
          <li><span className="font-medium text-red-600">&gt;50:</span> Código extremadamente complejo, alto riesgo de errores.</li>
        </ul>
      </div>
    </div>
  );
};

export default Complejidad; 