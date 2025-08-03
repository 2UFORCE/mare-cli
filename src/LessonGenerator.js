import React, { useState } from 'react';

const LessonGenerator = ({ onLessonGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [text, setText] = useState('הוּא קוֹרֵא סֵפֶר'); // Texto de exemplo

  const handleGenerateClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/.netlify/functions/generateLesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        // Lança um erro se a resposta não for bem-sucedida (status não for 2xx)
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const lessonData = await response.json();
      onLessonGenerated(lessonData);

    } catch (err) {
      console.error("Erro ao gerar a lição:", err);
      setError(`Não foi possível gerar a lição. Detalhes: ${err.message}`);
      setIsLoading(false);
    }
    // O isLoading será naturalmente false no sucesso, pois o componente será desmontado.
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', textAlign: 'center' }}>
      <h2>Gerador de Lições</h2>
      <p>Insira uma frase em hebraico para gerar uma lição interativa.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows="3"
        style={{ width: '100%', padding: '10px', fontSize: '1.2em', direction: 'rtl' }}
        placeholder="...הקלד כאן"
      />
      <button
        onClick={handleGenerateClick}
        disabled={isLoading}
        style={{ marginTop: '15px', padding: '12px 25px', fontSize: '1.1em', cursor: 'pointer' }}
      >
        {isLoading ? 'Gerando...' : 'Gerar Lição'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
    </div>
  );
};

export default LessonGenerator;
