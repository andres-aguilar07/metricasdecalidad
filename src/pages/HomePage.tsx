import { useState } from 'react';
import { Button } from '../components/Button';
import LOC from '../components/LOC';
import PuntosFuncion from '../components/PuntosFuncion';
import SatisfaccionCliente from '../components/SatisfaccionCliente';

type MetricType = 'loc' | 'puntosFuncion' | 'satisfaccionCliente' | null;

function HomePage() {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>(null);

  return (
    <div 
      style={{ 
        backgroundColor: '#F5F5F5', 
        color: '#2C2C2C',
        minHeight: '100vh',
        overflow: 'auto'
      }}
      className="flex flex-col items-center p-6"
    >
      <div className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-4xl font-bold mt-10 mb-4 text-center">Métricas de software</h1>

        {
            !selectedMetric && (
                <>
                    <h2 className="text-xl text-center">Elige una métrica para empezar a realizar cálculos</h2>
                    <p className='text-center mb-2'>Hecho por: Andrés Aguilar</p>
                    <hr className="w-full border-t border-gray-300" />
                </>
            )
        }
        
        {!selectedMetric ? (
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-5">
            <Button 
              onClick={() => setSelectedMetric('loc')}
              className="min-w-32"
            >
              LOC
            </Button>

            <Button 
              onClick={() => setSelectedMetric('puntosFuncion')}
              className="min-w-32"
            >
              Puntos por función
            </Button>

            <Button 
              onClick={() => setSelectedMetric('satisfaccionCliente')}
              className="min-w-32"
            >
              Satisfacción del cliente
            </Button>
          </div>
        ) : (
          <div className="w-full">
            <Button 
              variant="outline" 
              onClick={() => setSelectedMetric(null)}
              className="mb-6"
            >
              ← Volver
            </Button>
            
            {selectedMetric === 'loc' && <LOC />}
            {selectedMetric === 'puntosFuncion' && <PuntosFuncion />}
            {selectedMetric === 'satisfaccionCliente' && <SatisfaccionCliente />}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;