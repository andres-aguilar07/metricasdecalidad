import React, { useState, useEffect } from 'react';

const SatisfaccionCliente: React.FC = () => {
  const [numPreguntas, setNumPreguntas] = useState<number>(10);
  const [respuestas, setRespuestas] = useState<number[]>([]);

  useEffect(() => {
    // Inicializar array de respuestas con valores por defecto
    setRespuestas(new Array(numPreguntas).fill(3));
  }, [numPreguntas]);

  const calcularPuntajePregunta = (valor: number, index: number): number => {
    // Para preguntas impares: respuesta - 1
    // Para preguntas pares: 5 - respuesta
    return (index + 1) % 2 === 0 ? 5 - valor : valor - 1;
  };

  const calcularPuntajeTotal = (respuestasActuales: number[]): number => {
    const suma = respuestasActuales.reduce((acc, valor, index) => {
      return acc + calcularPuntajePregunta(valor, index);
    }, 0);
    return suma * 2.5;
  };

  const getInterpretacion = (puntaje: number): {texto: string, color: string} => {
    if (puntaje >= 85) return { texto: "Excelente / Altamente Satisfactorio", color: "text-green-600" };
    if (puntaje >= 70) return { texto: "Bueno / Aceptable", color: "text-blue-600" };
    if (puntaje >= 50) return { texto: "Regular / Necesita mejoras", color: "text-yellow-600" };
    return { texto: "Deficiente / Insatisfactorio", color: "text-red-600" };
  };

  const handleRespuestaChange = (index: number, valor: number) => {
    setRespuestas(prevRespuestas => {
      const nuevasRespuestas = [...prevRespuestas];
      nuevasRespuestas[index] = valor;
      return nuevasRespuestas;
    });
  };

  // Calcular el puntaje total solo cuando se necesite renderizar
  const sumaTotal = respuestas.reduce((acc, valor, index) => {
    return acc + calcularPuntajePregunta(valor, index);
  }, 0);
  const puntajeTotal = calcularPuntajeTotal(respuestas);

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-2xl font-bold mb-4">Satisfacción del Cliente</h2>
      
      <div className="w-full max-w-md mb-6">
        <label className="block text-sm font-medium mb-2">
          Número de preguntas (10-15 recomendado):
        </label>
        <input
          type="number"
          min="1"
          max="20"
          value={numPreguntas}
          onChange={(e) => setNumPreguntas(parseInt(e.target.value) || 1)}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="w-full max-w-md">
        <form className="space-y-6">
          {respuestas.map((valor, index) => (
            <div key={index} className="border p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">
                Pregunta {index + 1}
                <span className="text-sm ml-2 text-gray-600">
                  ({(index + 1) % 2 === 0 ? 'Par: 5 - respuesta' : 'Impar: respuesta - 1'})
                </span>
              </h3>
              <div className="flex justify-between items-center space-x-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <label key={num} className="flex flex-col items-center">
                    <input
                      type="radio"
                      name={`pregunta-${index}`}
                      value={num}
                      checked={valor === num}
                      onChange={() => handleRespuestaChange(index, num)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="mt-1 text-sm">{num}</span>
                  </label>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Puntaje: {calcularPuntajePregunta(valor, index)}
              </div>
            </div>
          ))}
        </form>
        
        <div className="mt-6 p-4 border rounded-md">
          <h3 className="text-lg font-medium mb-2">Resultado</h3>
          <p className="mb-2">
            Suma total: <span className="font-bold">{sumaTotal}</span>
          </p>
          <p className="mb-2">
            Puntaje Total (Suma total * 2.5): <span className="font-bold">{puntajeTotal.toFixed(1)}</span>
          </p>
          <p className={`font-medium ${getInterpretacion(puntajeTotal).color}`}>
            Interpretación: {getInterpretacion(puntajeTotal).texto}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SatisfaccionCliente; 