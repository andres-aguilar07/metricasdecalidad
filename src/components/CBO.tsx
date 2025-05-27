import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ClassNode {
  id: string;
  name: string;
  x: number;
  y: number;
  couplingScore: number;
}

interface CouplingRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'import' | 'method' | 'inheritance' | 'reference' | 'instance';
}

const CBO: React.FC = () => {
  const [classes, setClasses] = useState<ClassNode[]>([]);
  const [relations, setRelations] = useState<CouplingRelation[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState<string>('');
  const [selectedRelation, setSelectedRelation] = useState<{
    sourceId: string;
    targetId: string;
    type: 'import' | 'method' | 'inheritance' | 'reference' | 'instance';
  } | null>(null);
  
  // Añadimos un estado para las métricas del sistema para evitar la dependencia circular
  const [systemMetrics, setSystemMetrics] = useState({
    totalCBO: 0,
    averageCBO: 0,
    maxCBO: 0,
    classCounts: 0
  });
  
  const diagramRef = useRef<HTMLDivElement>(null);

  // Calculate total CBO for the entire system
  useEffect(() => {
    // Count unique relations per class
    const classCouplings = new Map<string, Set<string>>();
    
    relations.forEach(relation => {
      if (!classCouplings.has(relation.sourceId)) {
        classCouplings.set(relation.sourceId, new Set<string>());
      }
      classCouplings.get(relation.sourceId)?.add(relation.targetId);
      
      // For bidirectional coupling (except inheritance which is one-way)
      if (relation.type !== 'inheritance') {
        if (!classCouplings.has(relation.targetId)) {
          classCouplings.set(relation.targetId, new Set<string>());
        }
        classCouplings.get(relation.targetId)?.add(relation.sourceId);
      }
    });
    
    // Calculate average CBO
    let totalCBO = 0;
    classCouplings.forEach((coupledClasses) => {
      totalCBO += coupledClasses.size;
    });
    
    // Update class coupling scores
    setClasses(prevClasses => prevClasses.map(cls => {
      const couplingSet = classCouplings.get(cls.id) || new Set();
      return {
        ...cls,
        couplingScore: couplingSet.size
      };
    }));
    
    // Actualizamos las métricas del sistema
    setSystemMetrics({
      totalCBO,
      averageCBO: classes.length > 0 ? totalCBO / classes.length : 0,
      maxCBO: Math.max(...Array.from(classCouplings.values()).map(set => set.size), 0),
      classCounts: classes.length
    });
    
  }, [classes.length, relations]);
  
  // Count relation types
  const relationCounts = relations.reduce((counts, relation) => {
    counts[relation.type] = (counts[relation.type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  // Handle adding a new class
  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    
    // Calculate position for new class
    const angle = (classes.length / Math.max(1, 8)) * 2 * Math.PI;
    const radius = 120; // Distance from center
    
    const newClass: ClassNode = {
      id: `class-${Date.now()}`,
      name: newClassName.trim(),
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle),
      couplingScore: 0
    };
    
    setClasses([...classes, newClass]);
    setNewClassName('');
  };
  
  // Handle adding a relation
  const handleAddRelation = () => {
    if (!selectedRelation || !selectedRelation.sourceId || !selectedRelation.targetId) return;
    
    // Check if relation already exists
    const relationExists = relations.some(
      rel => rel.sourceId === selectedRelation.sourceId && 
             rel.targetId === selectedRelation.targetId &&
             rel.type === selectedRelation.type
    );
    
    if (relationExists) return;
    
    const newRelation: CouplingRelation = {
      id: `relation-${Date.now()}`,
      ...selectedRelation
    };
    
    setRelations([...relations, newRelation]);
    setSelectedRelation({
      sourceId: '',
      targetId: '',
      type: 'import'
    });
  };
  
  // Remove a class and its relations
  const handleRemoveClass = (classId: string) => {
    setClasses(classes.filter(cls => cls.id !== classId));
    setRelations(relations.filter(rel => rel.sourceId !== classId && rel.targetId !== classId));
    setSelectedClass(null);
  };
  
  // Remove a relation
  const handleRemoveRelation = (relationId: string) => {
    setRelations(relations.filter(rel => rel.id !== relationId));
  };
  
  // Mouse handlers for dragging
  const handleMouseDown = useCallback((classId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(classId);
    setSelectedClass(classId);
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

  // Get color for relation based on type
  const getRelationColor = (type: string) => {
    switch (type) {
      case 'import': return '#2563EB';
      case 'method': return '#10B981';
      case 'inheritance': return '#F97316';
      case 'reference': return '#8B5CF6';
      case 'instance': return '#EC4899';
      default: return '#9CA3AF';
    }
  };
  
  // Get class node color based on coupling score
  const getClassColor = (couplingScore: number) => {
    if (couplingScore === 0) return { bg: '#F3F4F6', border: '#9CA3AF' };
    if (couplingScore <= 2) return { bg: '#DCFCE7', border: '#10B981' };
    if (couplingScore <= 5) return { bg: '#FEF3C7', border: '#F59E0B' };
    if (couplingScore <= 10) return { bg: '#FEE2E2', border: '#EF4444' };
    return { bg: '#FECACA', border: '#B91C1C' };
  };
  
  // Get CBO standard text
  const getCBOStandard = (cbo: number) => {
    if (cbo === 0) return { text: "Sin acoplamiento", color: "text-gray-500" };
    if (cbo <= 5) return { text: "Bajo acoplamiento: Buena modularidad", color: "text-green-600" };
    if (cbo <= 10) return { text: "Acoplamiento moderado: Aceptable", color: "text-yellow-600" };
    if (cbo <= 15) return { text: "Alto acoplamiento: Considerar refactorización", color: "text-orange-600" };
    return { text: "Acoplamiento excesivo: Sistema muy dependiente y frágil", color: "text-red-600" };
  };
  
  // Render coupling distribution visualization
  const renderCouplingDistribution = () => {
    const types = [
      { key: 'import', label: 'Imports', color: '#2563EB' },
      { key: 'method', label: 'Llamadas a métodos', color: '#10B981' },
      { key: 'inheritance', label: 'Herencia', color: '#F97316' },
      { key: 'reference', label: 'Referencias', color: '#8B5CF6' },
      { key: 'instance', label: 'Creación de instancias', color: '#EC4899' }
    ];
    
    const max = Math.max(...types.map(type => relationCounts[type.key] || 0), 5); // Min 5 for scale
    
    return (
      <div className="p-4 bg-gray-50 rounded-lg my-4">
        <h4 className="text-center font-medium mb-2">Distribución de Acoplamientos</h4>
        <div className="space-y-3">
          {types.map(type => {
            const value = relationCounts[type.key] || 0;
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

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Acoplamiento entre Clases (CBO)</h2>
      <p className="text-center mb-6">
        Mide el Acoplamiento entre Objetos (CBO) en un sistema completo. Cuantifica las dependencias entre múltiples clases.
      </p>
      
      <div className="w-full max-w-6xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - System Controls */}
          <div className="p-4 border rounded-md bg-white shadow-sm">
            <h3 className="text-lg font-bold mb-4">Gestión del Diagrama</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Añadir Clase</label>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded-l-md text-sm"
                    placeholder="Nombre de la clase"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
                    style={{ maxWidth: "70%" }}
                  />
                  <button 
                    className="bg-blue-500 text-white px-2 py-2 rounded-r-md hover:bg-blue-600 text-sm whitespace-nowrap"
                    onClick={handleAddClass}
                    style={{ maxWidth: "30%" }}
                  >
                    Añadir
                  </button>
                </div>
              </div>
              
              {classes.length >= 2 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Añadir Relación</label>
                  <div className="space-y-2">
                    <select 
                      className="w-full p-2 border rounded-md text-sm"
                      value={selectedRelation?.sourceId || ''}
                      onChange={(e) => setSelectedRelation({
                        ...selectedRelation || { targetId: '', type: 'import' },
                        sourceId: e.target.value
                      })}
                    >
                      <option value="">Selecciona clase origen</option>
                      {classes.map(cls => (
                        <option key={`source-${cls.id}`} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                    
                    <select 
                      className="w-full p-2 border rounded-md text-sm"
                      value={selectedRelation?.targetId || ''}
                      onChange={(e) => setSelectedRelation({
                        ...selectedRelation || { sourceId: '', type: 'import' },
                        targetId: e.target.value
                      })}
                    >
                      <option value="">Selecciona clase destino</option>
                      {classes
                        .filter(cls => cls.id !== selectedRelation?.sourceId)
                        .map(cls => (
                          <option key={`target-${cls.id}`} value={cls.id}>{cls.name}</option>
                        ))
                      }
                    </select>
                    
                    <select 
                      className="w-full p-2 border rounded-md text-sm"
                      value={selectedRelation?.type || 'import'}
                      onChange={(e) => setSelectedRelation({
                        ...selectedRelation || { sourceId: '', targetId: '' },
                        type: e.target.value as any
                      })}
                    >
                      <option value="import">Import/Dependencia</option>
                      <option value="method">Llamada a método</option>
                      <option value="inheritance">Herencia</option>
                      <option value="reference">Referencia</option>
                      <option value="instance">Instancia</option>
                    </select>
                    
                    <button 
                      className="w-full bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                      onClick={handleAddRelation}
                      disabled={!selectedRelation?.sourceId || !selectedRelation?.targetId}
                    >
                      Añadir Relación
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Classes list */}
            {classes.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Clases ({classes.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {classes.map(cls => (
                    <div 
                      key={cls.id} 
                      className={`p-2 border rounded flex justify-between items-center ${
                        selectedClass === cls.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedClass(cls.id)}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: getClassColor(cls.couplingScore).border }}
                        ></div>
                        <span className="text-sm">{cls.name}</span>
                        <span className="ml-2 text-xs text-gray-500">CBO: {cls.couplingScore}</span>
                      </div>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={(e) => { e.stopPropagation(); handleRemoveClass(cls.id); }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Relations list */}
            {relations.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Relaciones ({relations.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {relations.map(relation => {
                    const sourceClass = classes.find(c => c.id === relation.sourceId);
                    const targetClass = classes.find(c => c.id === relation.targetId);
                    
                    return (
                      <div 
                        key={relation.id} 
                        className="p-2 border rounded flex justify-between items-center"
                      >
                        <div className="flex items-center text-sm">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: getRelationColor(relation.type) }}
                          ></div>
                          <span>{sourceClass?.name || 'Desconocido'}</span>
                          <span className="mx-2">→</span>
                          <span>{targetClass?.name || 'Desconocido'}</span>
                          <span className="ml-2 text-xs text-gray-500">({relation.type})</span>
                        </div>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveRelation(relation.id)}
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {renderCouplingDistribution()}
          </div>
          
          {/* Middle column - Class diagram */}
          <div className="md:col-span-2">
            <div className="p-4 bg-white rounded-lg border border-gray-200 h-full">
              <h4 className="text-center font-medium mb-2">Diagrama de Clases y Acoplamiento</h4>
              <p className="text-center text-xs text-gray-500 mb-2">
                Arrastra las clases para reorganizar el diagrama
              </p>
              <div 
                ref={diagramRef}
                className="relative w-full h-96 bg-white rounded-md border border-gray-200 mt-2 overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ position: 'relative' }}
              >
                {/* Class nodes - Renderizamos primero para asegurar que aparezcan */}
                {classes.map((cls) => {
                  const colors = getClassColor(cls.couplingScore);
                  const isSelected = selectedClass === cls.id;
                  
                  return (
                    <div 
                      key={cls.id}
                      className="absolute p-3 rounded-md shadow-sm transition-all cursor-grab"
                      style={{ 
                        left: `${cls.x}%`, 
                        top: `${cls.y}%`, 
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                        border: isSelected ? `2px solid ${colors.border}` : `1px solid ${colors.border}`,
                        zIndex: 15,
                        opacity: isDragging === cls.id ? 0.8 : 1,
                        boxShadow: isSelected ? `0 0 6px ${colors.border}` : 'none',
                        minWidth: '70px',
                        maxWidth: '100px',
                        textAlign: 'center',
                        position: 'absolute'
                      }}
                      onClick={(e) => { e.stopPropagation(); setSelectedClass(cls.id); }}
                      onMouseDown={(e) => handleMouseDown(cls.id, e)}
                    >
                      <div className="font-medium text-sm">{cls.name}</div>
                      <div className="text-xs mt-1">CBO: {cls.couplingScore}</div>
                    </div>
                  );
                })}
                
                {/* Relation lines */}
                <svg 
                  className="absolute w-full h-full top-0 left-0"
                  viewBox="0 0 100 100"
                  style={{ zIndex: 10, position: 'absolute' }}
                >
                  {relations.map((relation) => {
                    const source = classes.find(c => c.id === relation.sourceId);
                    const target = classes.find(c => c.id === relation.targetId);
                    
                    if (!source || !target) return null;
                    
                    // For inheritance, add an arrow tip
                    const isInheritance = relation.type === 'inheritance';
                    const color = getRelationColor(relation.type);
                    
                    // Calculate the angle for placing arrow
                    const dx = target.x - source.x;
                    const dy = target.y - source.y;
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    
                    // Arrow head size
                    const arrowSize = 1.5;
                    
                    return (
                      <g key={relation.id}>
                        <line 
                          x1={source.x} y1={source.y}
                          x2={target.x} y2={target.y}
                          stroke={color}
                          strokeWidth={1.5}
                          strokeDasharray={relation.type === 'inheritance' ? "none" : 
                                           relation.type === 'import' ? "5,3" : "3,2"}
                        />
                        
                        {isInheritance && (
                          <polygon 
                            points={`
                              ${target.x},${target.y}
                              ${target.x - arrowSize - (arrowSize * Math.cos((angle + 30) * Math.PI / 180))},
                              ${target.y - arrowSize - (arrowSize * Math.sin((angle + 30) * Math.PI / 180))}
                              ${target.x - arrowSize - (arrowSize * Math.cos((angle - 30) * Math.PI / 180))},
                              ${target.y - arrowSize - (arrowSize * Math.sin((angle - 30) * Math.PI / 180))}
                            `}
                            fill={color}
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
                
                {/* Message when no classes */}
                {classes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                    Añade clases para comenzar a modelar tu sistema
                  </div>
                )}
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: '#2563EB'}}></div>
                  <span className="text-xs">Import</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: '#10B981'}}></div>
                  <span className="text-xs">Método</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: '#F97316'}}></div>
                  <span className="text-xs">Herencia</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: '#8B5CF6'}}></div>
                  <span className="text-xs">Referencia</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: '#EC4899'}}></div>
                  <span className="text-xs">Instancia</span>
                </div>
              </div>
              
              {/* System CBO metrics */}
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Métricas del Sistema</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded border">
                    <div className="text-sm text-gray-600">Total de Clases</div>
                    <div className="text-xl font-bold">{classes.length}</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="text-sm text-gray-600">Total de Relaciones</div>
                    <div className="text-xl font-bold">{relations.length}</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="text-sm text-gray-600">CBO Promedio</div>
                    <div className="text-xl font-bold">
                      {systemMetrics.averageCBO.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="text-sm text-gray-600">CBO Máximo</div>
                    <div className="text-xl font-bold">{systemMetrics.maxCBO}</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium mb-1">Evaluación del sistema:</p>
                      <p className={`text-sm font-medium ${getCBOStandard(systemMetrics.averageCBO).color}`}>
                        {getCBOStandard(systemMetrics.averageCBO).text}
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" 
                        style={{
                          backgroundColor: 
                            systemMetrics.averageCBO <= 5 ? '#10B981' : 
                            systemMetrics.averageCBO <= 10 ? '#FBBF24' :
                            systemMetrics.averageCBO <= 15 ? '#F97316' : '#EF4444',
                          color: '#FFFFFF',
                          fontSize: '20px',
                          fontWeight: 'bold'
                        }}>
                      {systemMetrics.averageCBO.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium mb-2">¿Cómo mejorar el acoplamiento?</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Aplicar el principio de inyección de dependencias</li>
                  <li>Utilizar interfaces y abstracciones en lugar de clases concretas</li>
                  <li>Limitar el uso de herencia en favor de la composición</li>
                  <li>Seguir el principio de responsabilidad única (SRP)</li>
                  <li>Implementar patrones de diseño como Facade, Mediator o Observer</li>
                  <li>Reducir la cantidad de llamadas a métodos entre clases</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CBO; 