import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ClassNode {
  id: string;
  name: string;
  type: 'import' | 'method' | 'inheritance' | 'reference' | 'instance';
  x: number;
  y: number;
}

const CBO: React.FC = () => {
  const [couplingCount, setCouplingCount] = useState<number>(0);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassNode[]>([]);
  const diagramRef = useRef<HTMLDivElement>(null);
  
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
  
  // Generate class nodes whenever coupling details change
  useEffect(() => {
    const newClasses: ClassNode[] = [];
    const types = [
      { key: 'imports', label: 'Import', type: 'import' as const, color: '#2563EB' },
      { key: 'methodCalls', label: 'Método', type: 'method' as const, color: '#10B981' },
      { key: 'inheritance', label: 'Herencia', type: 'inheritance' as const, color: '#F97316' },
      { key: 'references', label: 'Referencia', type: 'reference' as const, color: '#8B5CF6' },
      { key: 'instanceCreation', label: 'Instancia', type: 'instance' as const, color: '#EC4899' }
    ];
    
    // Generate classes for each coupling type
    types.forEach(typeInfo => {
      const count = couplingDetails[typeInfo.key as keyof typeof couplingDetails];
      for (let i = 0; i < count; i++) {
        // Calculate angle based on total classes and current index
        const currentIndex = newClasses.length;
        const angle = (currentIndex / Math.max(1, totalClasses)) * 2 * Math.PI;
        const radius = 90; // Distance from center
        
        newClasses.push({
          id: `${typeInfo.key}-${i}`,
          name: `${typeInfo.label}${i + 1}`,
          type: typeInfo.type,
          x: 50 + radius * Math.cos(angle),
          y: 50 + radius * Math.sin(angle)
        });
      }
    });
    
    setClasses(newClasses);
  }, [couplingDetails]);
  
  // Total number of classes for layout calculations
  const totalClasses = Object.values(couplingDetails).reduce((sum, val) => sum + val, 0);
  
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
  
  // Mouse handlers for dragging
  const handleMouseDown = useCallback((classId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(classId);
  }, []);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !diagramRef.current) return;
    
    const rect = diagramRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setClasses(prevClasses => 
      prevClasses.map(cls => 
        cls.id === isDragging 
          ? { ...cls, x: Math.min(Math.max(10, x), 90), y: Math.min(Math.max(10, y), 90) }
          : cls
      )
    );
  }, [isDragging]);

  // Get color for class node based on type
  const getClassColor = (type: string) => {
    switch (type) {
      case 'import': return { bg: '#DBEAFE', border: '#2563EB', text: '#1E40AF' };
      case 'method': return { bg: '#DCFCE7', border: '#10B981', text: '#047857' };
      case 'inheritance': return { bg: '#FFEDD5', border: '#F97316', text: '#C2410C' };
      case 'reference': return { bg: '#F3E8FF', border: '#8B5CF6', text: '#6D28D9' };
      case 'instance': return { bg: '#FCE7F3', border: '#EC4899', text: '#BE185D' };
      default: return { bg: '#F3F4F6', border: '#9CA3AF', text: '#4B5563' };
    }
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

  // Improved dynamic class coupling diagram
  const renderClassDiagram = () => {
    if (couplingCount === 0) return null;
    
    return (
      <div className="p-4 bg-gray-50 rounded-lg my-4">
        <h4 className="text-center font-medium mb-2">Diagrama de Acoplamiento</h4>
        <p className="text-center text-xs text-gray-500 mb-2">
          Puedes arrastrar las clases para reorganizar el diagrama
        </p>
        <div 
          ref={diagramRef}
          className="relative w-full h-64 bg-white rounded-md border border-gray-200 mt-2 overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Center class */}
          <div 
            className="absolute bg-blue-500 text-white p-2 rounded-lg shadow-md z-20 cursor-pointer"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            onClick={() => setSelectedClass('MiClase')}
          >
            MiClase
          </div>
          
          {/* Connection lines to all classes */}
          <svg 
            className="absolute w-full h-full top-0 left-0"
            viewBox="0 0 100 100"
            style={{ zIndex: 0 }}
          >
            {classes.map((cls) => {
              const isSelected = selectedClass === cls.id;
              return (
                <line 
                  key={`line-${cls.id}`}
                  x1="50" y1="50"
                  x2={cls.x} y2={cls.y}
                  stroke={getClassColor(cls.type).border}
                  strokeWidth={isSelected ? 2 : 1}
                  strokeOpacity={isSelected ? 0.9 : 0.5}
                  strokeDasharray={cls.type === 'inheritance' ? "none" : "4"}
                />
              );
            })}
          </svg>
          
          {/* Connected classes */}
          {classes.map((cls) => {
            const colors = getClassColor(cls.type);
            const isSelected = selectedClass === cls.id;
            
            return (
              <div 
                key={cls.id}
                className="absolute p-2 rounded shadow-sm text-xs transition-all"
                style={{ 
                  left: `${cls.x}%`, 
                  top: `${cls.y}%`, 
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                  border: isSelected ? `2px solid ${colors.border}` : `1px solid ${colors.border}`,
                  zIndex: isSelected ? 15 : 10,
                  cursor: 'grab',
                  opacity: isDragging === cls.id ? 0.8 : 1,
                  boxShadow: isSelected ? `0 0 6px ${colors.border}` : 'none',
                  fontWeight: isSelected ? 'bold' : 'normal'
                }}
                onClick={(e) => { e.stopPropagation(); setSelectedClass(cls.id); }}
                onMouseDown={(e) => handleMouseDown(cls.id, e)}
              >
                {cls.name}
              </div>
            );
          })}
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
            <span className="text-xs">MiClase</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: '#2563EB'}}></div>
            <span className="text-xs">Imports</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: '#10B981'}}></div>
            <span className="text-xs">Métodos</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: '#F97316'}}></div>
            <span className="text-xs">Herencia</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: '#8B5CF6'}}></div>
            <span className="text-xs">Referencias</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: '#EC4899'}}></div>
            <span className="text-xs">Instancias</span>
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
        
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h4 className="font-medium mb-1">¿Cómo reducir el acoplamiento?</h4>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Aplicar el principio de inyección de dependencias</li>
            <li>Utilizar interfaces y abstracciones en lugar de clases concretas</li>
            <li>Limitar el uso de herencia en favor de la composición</li>
            <li>Seguir el principio de responsabilidad única (SRP)</li>
            <li>Minimizar la exposición de detalles internos de implementación</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CBO; 