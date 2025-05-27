import React, { useState, useEffect } from 'react';

const LCOM: React.FC = () => {
  const [methodPairs, setMethodPairs] = useState<number>(0);
  const [sharedAttributePairs, setSharedAttributePairs] = useState<number>(0);
  const [lcomValue, setLcomValue] = useState<number>(0);
  
  // Sample class for visualization
  const [methods, setMethods] = useState<string[]>(['metodo1', 'metodo2', 'metodo3']);
  const [attributes, setAttributes] = useState<string[]>(['atributo1', 'atributo2', 'atributo3']);
  const [connections, setConnections] = useState<{[key: string]: string[]}>({
    'metodo1': ['atributo1', 'atributo2'],
    'metodo2': ['atributo2'],
    'metodo3': ['atributo3'],
  });
  
  // Calculate LCOM value
  useEffect(() => {
    const lcom = Math.max(0, methodPairs - sharedAttributePairs);
    setLcomValue(lcom);
  }, [methodPairs, sharedAttributePairs]);
  
  // Evaluate LCOM standards
  const getLCOMStandard = () => {
    if (lcomValue === 0) return { text: "Alta cohesión: Todos los métodos están relacionados", color: "text-green-600" };
    if (lcomValue <= 3) return { text: "Cohesión moderada: La mayoría de métodos comparten atributos", color: "text-yellow-600" };
    if (lcomValue <= 7) return { text: "Baja cohesión: Pocos métodos comparten atributos", color: "text-orange-600" };
    return { text: "Muy baja cohesión: La clase puede necesitar ser dividida", color: "text-red-600" };
  };

  // Visual representation of a class with methods and attributes
  const renderClassDiagram = () => {
    return (
      <div className="p-4 bg-gray-50 rounded-lg my-4">
        <h4 className="text-center font-medium mb-2">Visualización de Cohesión</h4>
        <div className="flex justify-between">
          {/* Methods column */}
          <div className="w-1/3">
            <div className="text-center font-medium mb-2">Métodos</div>
            <div className="space-y-2">
              {methods.map((method, index) => (
                <div key={index} className="p-2 bg-blue-100 rounded border border-blue-300 text-center">
                  {method}
                </div>
              ))}
            </div>
          </div>
          
          {/* Connections visualization */}
          <div className="w-1/3 flex items-center justify-center">
            <div className="w-full h-full relative">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                {methods.map((method, mIdx) => 
                  (connections[method] || []).map((attr, aIdx) => {
                    const attrIndex = attributes.indexOf(attr);
                    if (attrIndex >= 0) {
                      return (
                        <line 
                          key={`${mIdx}-${attrIndex}`}
                          x1="0" 
                          y1={(mIdx * 30) + 15} 
                          x2="100" 
                          y2={(attrIndex * 30) + 15}
                          stroke={`hsl(${(mIdx * 60) % 360}, 70%, 50%)`}
                          strokeWidth="2"
                        />
                      );
                    }
                    return null;
                  })
                )}
              </svg>
            </div>
          </div>
          
          {/* Attributes column */}
          <div className="w-1/3">
            <div className="text-center font-medium mb-2">Atributos</div>
            <div className="space-y-2">
              {attributes.map((attr, index) => (
                <div key={index} className="p-2 bg-green-100 rounded border border-green-300 text-center">
                  {attr}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          Una clase con alta cohesión tendrá muchas conexiones entre métodos y atributos
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Cohesión (LCOM)</h2>
      <p className="text-center mb-6">
        Mide la Falta de Cohesión en los Métodos (LCOM). Una clase altamente cohesiva tiene sus métodos estrechamente relacionados a través de los atributos que utilizan.
      </p>
      
      <div className="w-full max-w-md mb-8 p-6 border rounded-md bg-white shadow-sm">
        <h3 className="text-lg font-bold mb-4">Fórmula: LCOM = |P| - |Q|</h3>
        <p className="mb-4 text-sm">
          Donde:<br />
          • P = conjunto de pares de métodos que NO comparten atributos<br />
          • Q = conjunto de pares de métodos que SÍ comparten atributos<br />
          • Si |P| - |Q| &lt; 0, entonces LCOM = 0
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Pares sin atributos compartidos |P|</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded-md"
              value={methodPairs || ''}
              onChange={(e) => setMethodPairs(Math.max(0, Number(e.target.value)))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pares con atributos compartidos |Q|</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded-md"
              value={sharedAttributePairs || ''}
              onChange={(e) => setSharedAttributePairs(Math.max(0, Number(e.target.value)))}
            />
          </div>
        </div>
        
        {renderClassDiagram()}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium">Resultado:</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{lcomValue}</p>
              <p className={`text-sm font-medium ${getLCOMStandard().color}`}>
                {getLCOMStandard().text}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" 
                 style={{
                   backgroundColor: lcomValue === 0 ? '#10B981' : 
                                   lcomValue <= 3 ? '#FBBF24' :
                                   lcomValue <= 7 ? '#F97316' : '#EF4444',
                   color: '#FFFFFF',
                   fontSize: '24px',
                   fontWeight: 'bold'
                 }}>
              {lcomValue}
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-md p-6 border rounded-md bg-white shadow-sm">
        <h3 className="text-lg font-bold mb-2">Interpretación</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><span className="font-medium text-green-600">LCOM = 0:</span> Alta cohesión. Todos los métodos comparten atributos.</li>
          <li><span className="font-medium text-yellow-600">LCOM = 1-3:</span> Cohesión moderada. La mayoría de métodos están relacionados.</li>
          <li><span className="font-medium text-orange-600">LCOM = 4-7:</span> Baja cohesión. Pocos métodos están relacionados.</li>
          <li><span className="font-medium text-red-600">LCOM &gt; 7:</span> Muy baja cohesión. La clase probablemente tiene múltiples responsabilidades y debería ser dividida.</li>
        </ul>
        <p className="mt-4 text-sm">
          Un valor bajo de LCOM es deseable, ya que indica una mayor cohesión en la clase.
        </p>
      </div>
    </div>
  );
};

export default LCOM; 