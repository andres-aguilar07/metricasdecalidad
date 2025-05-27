import React, { useState, useEffect } from 'react';

const CBO: React.FC = () => {
  const [couplingCount, setCouplingCount] = useState<number>(0);
  
  // State for visualization
  const [couplingDetails, setCouplingDetails] = useState<{
    imports: number;
    methodCalls: number;
    inheritance: number;
    references: number;
    instanceCreation: number;
  }>({
    imports: 0,
    methodCalls: 0,
    inheritance: 0,
    references: 0,
    instanceCreation: 0
  });

  // Update total coupling count
  useEffect(() => {
    const totalCoupling = Object.values(couplingDetails).reduce((sum, val) => sum + val, 0);
    setCouplingCount(totalCoupling);
  }, [couplingDetails]);
  
  // Evaluate CBO standards
  const getCBOStandard = () => {
    if (couplingCount === 0) return { text: "Sin acoplamiento", color: "text-gray-500" };
    if (couplingCount <= 5) return { text: "Bajo acoplamiento: Buena modularidad", color: "text-green-600" };
    if (couplingCount <= 10) return { text: "Acoplamiento moderado: Aceptable", color: "text-yellow-600" };
    if (couplingCount <= 15) return { text: "Alto acoplamiento: Considerar refactorización", color: "text-orange-600" };
    return { text: "Acoplamiento excesivo: La clase es muy dependiente y frágil", color: "text-red-600" };
  };

  // Handle change in coupling details
  const handleCouplingChange = (type: keyof typeof couplingDetails, value: number) => {
    setCouplingDetails(prev => ({
      ...prev,
      [type]: Math.max(0, value)
    }));
  };

  // Render coupling visualization
  const renderCouplingVisualization = () => {
    const types = [
      { key: 'imports', label: 'Imports', color: '#2563EB' },
      { key: 'methodCalls', label: 'Llamadas a métodos', color: '#10B981' },
      { key: 'inheritance', label: 'Herencia', color: '#F97316' },
      { key: 'references', label: 'Referencias', color: '#8B5CF6' },
      { key: 'instanceCreation', label: 'Creación de instancias', color: '#EC4899' }
    ];
    
    const max = Math.max(...Object.values(couplingDetails), 5); // Min 5 for scale
    
    return (
      <div className="p-4 bg-gray-50 rounded-lg my-4">
        <h4 className="text-center font-medium mb-2">Distribución de Acoplamientos</h4>
        <div className="space-y-3">
          {types.map(type => {
            const value = couplingDetails[type.key as keyof typeof couplingDetails];
            const percentage = max > 0 ? (value / max) * 100 : 0;
            
            return (
              <div key={type.key} className="flex items-center">
                <div className="w-1/3 text-sm">{type.label}</div>
                <div className="w-2/3 flex items-center">
                  <div 
                    className="h-6 rounded-md mr-2" 
                    style={{ 
                      width: `${percentage}%`, 
                      backgroundColor: type.color,
                      minWidth: value > 0 ? '20px' : '0'
                    }}
                  ></div>
                  <span className="text-sm">{value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Sample class coupling diagram
  const renderClassDiagram = () => {
    if (couplingCount === 0) return null;
    
    // Generate some "fake" class names based on coupling count
    const connectedClasses = [];
    for (let i = 1; i <= Math.min(couplingCount, 6); i++) {
      connectedClasses.push(`Clase${i}`);
    }
    
    return (
      <div className="p-4 bg-gray-50 rounded-lg my-4">
        <h4 className="text-center font-medium mb-2">Diagrama de Acoplamiento</h4>
        <div className="flex justify-center">
          <div className="relative w-64 h-64">
            {/* Center class */}
            <div 
              className="absolute bg-blue-500 text-white p-2 rounded-lg shadow-md z-10"
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            >
              MiClase
            </div>
            
            {/* Connected classes in a circle around the center */}
            {connectedClasses.map((className, index) => {
              const angle = (index * 2 * Math.PI) / connectedClasses.length;
              const radius = 90; // Distance from center
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              
              return (
                <React.Fragment key={className}>
                  {/* Connection line */}
                  <svg 
                    className="absolute w-full h-full top-0 left-0"
                    viewBox="0 0 100 100"
                    style={{ zIndex: 0 }}
                  >
                    <line 
                      x1="50" y1="50"
                      x2={x} y2={y}
                      stroke="#94A3B8"
                      strokeWidth="1"
                      strokeDasharray="4"
                    />
                  </svg>
                  
                  {/* Class node */}
                  <div 
                    className="absolute bg-gray-100 border border-gray-300 p-2 rounded shadow-sm text-xs"
                    style={{ 
                      left: `${x}%`, 
                      top: `${y}%`, 
                      transform: 'translate(-50%, -50%)',
                      zIndex: 5
                    }}
                  >
                    {className}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Acoplamiento (CBO)</h2>
      <p className="text-center mb-6">
        Mide el Acoplamiento entre Objetos (CBO). Cuantifica la cantidad de dependencias entre una clase y otras clases del sistema.
      </p>
      
      <div className="w-full max-w-md mb-8 p-6 border rounded-md bg-white shadow-sm">
        <h3 className="text-lg font-bold mb-4">CBO = Número de clases externas acopladas</h3>
        <p className="mb-4 text-sm">
          El acoplamiento ocurre cuando una clase:<br />
          • Usa atributos o métodos de otra clase<br />
          • Instancia objetos de otra clase<br />
          • Hereda de otra clase<br />
          • Tiene referencias a clases en parámetros o variables<br />
          • Llama métodos de otras clases directamente
        </p>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Imports/Dependencias</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded-md"
              value={couplingDetails.imports || ''}
              onChange={(e) => handleCouplingChange('imports', Number(e.target.value))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Llamadas a métodos externos</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded-md"
              value={couplingDetails.methodCalls || ''}
              onChange={(e) => handleCouplingChange('methodCalls', Number(e.target.value))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Herencia (clases padre)</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded-md"
              value={couplingDetails.inheritance || ''}
              onChange={(e) => handleCouplingChange('inheritance', Number(e.target.value))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Referencias en parámetros/variables</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded-md"
              value={couplingDetails.references || ''}
              onChange={(e) => handleCouplingChange('references', Number(e.target.value))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Creación de instancias</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded-md"
              value={couplingDetails.instanceCreation || ''}
              onChange={(e) => handleCouplingChange('instanceCreation', Number(e.target.value))}
            />
          </div>
        </div>
        
        {renderCouplingVisualization()}
        {renderClassDiagram()}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium">Resultado:</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{couplingCount}</p>
              <p className={`text-sm font-medium ${getCBOStandard().color}`}>
                {getCBOStandard().text}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" 
                 style={{
                   backgroundColor: couplingCount <= 5 ? '#10B981' : 
                                   couplingCount <= 10 ? '#FBBF24' :
                                   couplingCount <= 15 ? '#F97316' : '#EF4444',
                   color: '#FFFFFF',
                   fontSize: '24px',
                   fontWeight: 'bold'
                 }}>
              {couplingCount}
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-md p-6 border rounded-md bg-white shadow-sm">
        <h3 className="text-lg font-bold mb-2">Interpretación</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li><span className="font-medium text-green-600">CBO ≤ 5:</span> Bajo acoplamiento. Buen diseño modular.</li>
          <li><span className="font-medium text-yellow-600">CBO = 6-10:</span> Acoplamiento moderado. Aceptable en muchos casos.</li>
          <li><span className="font-medium text-orange-600">CBO = 11-15:</span> Alto acoplamiento. Considerar refactorización.</li>
          <li><span className="font-medium text-red-600">CBO &gt; 15:</span> Acoplamiento excesivo. Alta dependencia y fragilidad.</li>
        </ul>
        <p className="mt-4 text-sm">
          Un valor bajo de CBO es deseable, ya que indica menos dependencias y mayor facilidad de mantenimiento y reutilización.
        </p>
      </div>
    </div>
  );
};

export default CBO; 