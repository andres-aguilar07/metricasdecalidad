import React, { useState, useEffect, useRef, useCallback } from 'react';

interface NodePosition {
  x: number;
  y: number;
}

interface Node {
  id: string;
  label: string;
}

interface Link {
  source: string;
  target: string;
}

const Complejidad: React.FC = () => {
  const [edges, setEdges] = useState<number>(0);
  const [nodes, setNodes] = useState<number>(0);
  const [components, setComponents] = useState<number>(1);
  const [complexity, setComplexity] = useState<number>(0);
  const [graphData, setGraphData] = useState<{nodes: Node[], links: Link[]}>({ nodes: [], links: [] });
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>({});
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Calculate cyclomatic complexity
  useEffect(() => {
    const m = edges - nodes + 2 * components;
    setComplexity(m > 0 ? m : 0);
  }, [edges, nodes, components]);
  
  // Generate graph data when inputs change
  useEffect(() => {
    // Only create graph if we have nodes
    if (nodes <= 0) {
      setGraphData({ nodes: [], links: [] });
      setNodePositions({});
      return;
    }
    
    // Create nodes
    const newNodes = Array.from({ length: nodes }, (_, i) => ({
      id: `node${i + 1}`,
      label: `${i + 1}`,
    }));
    
    // Create random connections (edges) between nodes
    const newLinks = [];
    let remainingEdges = Math.min(edges, nodes * (nodes - 1) / 2); // Cap at max possible edges
    
    // Create a connected graph first (ensure all nodes are connected)
    for (let i = 1; i < nodes; i++) {
      newLinks.push({
        source: `node${i}`,
        target: `node${i + 1}`,
      });
      remainingEdges--;
      if (remainingEdges <= 0) break;
    }
    
    // Add remaining random edges
    const possibleEdges = [];
    for (let i = 1; i <= nodes; i++) {
      for (let j = i + 1; j <= nodes; j++) {
        // Skip if this edge already exists
        if (!newLinks.some(link => 
          (link.source === `node${i}` && link.target === `node${j}`) || 
          (link.source === `node${j}` && link.target === `node${i}`)
        )) {
          possibleEdges.push({ source: `node${i}`, target: `node${j}` });
        }
      }
    }
    
    // Shuffle and take remaining edges
    for (let i = 0; i < remainingEdges && possibleEdges.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * possibleEdges.length);
      const edge = possibleEdges.splice(randomIndex, 1)[0];
      newLinks.push(edge);
    }
    
    setGraphData({ nodes: newNodes, links: newLinks });
    
    // Initialize node positions in a circle
    const width = 320;
    const height = 240;
    const newNodePositions: Record<string, NodePosition> = {};
    
    newNodes.forEach((node, index) => {
      const angle = (index / newNodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.35;
      newNodePositions[node.id] = {
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle)
      };
    });
    
    setNodePositions(newNodePositions);
  }, [nodes, edges]);
  
  // Evaluate complexity standards
  const getComplexityStandard = () => {
    if (complexity === 0) return { text: "", color: "text-gray-500" };
    if (complexity <= 10) return { text: "Complejidad baja (1-10): Código simple y fácil de mantener", color: "text-green-600" };
    if (complexity <= 20) return { text: "Complejidad moderada (11-20): Riesgo moderado", color: "text-yellow-600" };
    if (complexity <= 50) return { text: "Complejidad alta (21-50): Código complejo, difícil de mantener", color: "text-orange-600" };
    return { text: "Complejidad muy alta (>50): Código extremadamente complejo, alto riesgo", color: "text-red-600" };
  };

  // Handle mouse events for dragging
  const handleMouseDown = useCallback((nodeId: string) => {
    setDraggingNode(nodeId);
  }, []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingNode || !svgRef.current) return;
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    
    // Transform to SVG coordinates
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    setNodePositions(prev => ({
      ...prev,
      [draggingNode]: {
        x: Math.max(20, Math.min(300, svgP.x)),
        y: Math.max(20, Math.min(220, svgP.y))
      }
    }));
  }, [draggingNode]);
  
  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setDraggingNode(null);
  }, []);

  // Advanced graph visualization
  const renderAdvancedGraph = () => {
    if (graphData.nodes.length === 0) return null;
    
    const width = 320;
    const height = 240;
    const nodeRadius = 15;
    
    return (
      <div className="w-full max-w-md mx-auto my-6 border rounded-lg p-4 bg-white shadow-sm">
        <h4 className="text-center font-medium mb-2">Grafo de flujo</h4>
        <p className="text-center text-xs text-gray-500 mb-2">Puedes arrastrar los nodos para reorganizar el grafo</p>
        <svg 
          ref={svgRef}
          width={width} 
          height={height} 
          className="mx-auto bg-gray-50 rounded-md"
          viewBox={`0 0 ${width} ${height}`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Draw edges */}
          {graphData.links.map((link, index) => {
            const source = nodePositions[link.source];
            const target = nodePositions[link.target];
            const isHighlighted = hoverNode === link.source || hoverNode === link.target;
            
            if (!source || !target) return null;
            
            return (
              <line 
                key={`link-${index}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isHighlighted ? "#3B82F6" : "#94A3B8"}
                strokeWidth={isHighlighted ? 3 : 2}
                strokeOpacity={isHighlighted ? 0.9 : 0.7}
              />
            );
          })}
          
          {/* Draw nodes */}
          {graphData.nodes.map((node) => {
            const pos = nodePositions[node.id];
            const isHighlighted = hoverNode === node.id;
            const isDragging = draggingNode === node.id;
            
            if (!pos) return null;
            
            return (
              <g 
                key={node.id}
                onMouseDown={() => handleMouseDown(node.id)}
                onMouseOver={() => setHoverNode(node.id)}
                onMouseOut={() => setHoverNode(null)}
                style={{ cursor: 'grab' }}
              >
                {/* Shadow effect for hovering */}
                {(isHighlighted || isDragging) && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius + 3}
                    fill="#3B82F6"
                    opacity={0.3}
                  />
                )}
                
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill={isHighlighted || isDragging ? "#2563EB" : "#3B82F6"}
                  stroke={isHighlighted || isDragging ? "#1E40AF" : "#2563EB"}
                  strokeWidth={1.5}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12px"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
        
        <div className="mt-2 text-center text-sm text-gray-600">
          Grafo con {nodes} nodos y {edges} aristas
        </div>
        
        <div className="mt-4 text-sm">
          <div className="flex justify-between mb-1">
            <span>Nodos (N)</span>
            <span>{nodes}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Aristas (E)</span>
            <span>{edges}</span>
          </div>
          <div className="flex justify-between">
            <span>Componentes (P)</span>
            <span>{components}</span>
          </div>
          <div className="mt-3 p-2 bg-blue-50 rounded-md text-center font-medium">
            M = E - N + 2P = {edges} - {nodes} + 2({components}) = {complexity}
          </div>
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
        
        {nodes > 0 && renderAdvancedGraph()}
        
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
        
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h4 className="font-medium mb-1">¿Cómo mejorar la complejidad ciclomática?</h4>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Dividir funciones grandes en funciones más pequeñas y específicas</li>
            <li>Reducir la cantidad de estructuras de control anidadas</li>
            <li>Utilizar el patrón "early return" para reducir la anidación</li>
            <li>Simplificar expresiones condicionales complejas</li>
            <li>Aplicar principios de programación como SOLID</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Complejidad; 