import React, { useState, useMemo, useEffect } from 'react';

const RootConnectorExercise = ({ currentLesson }) => {
  // Memoize the calculation of unique roots to avoid re-computing on every render
  const uniqueRoots = useMemo(() => {
    if (!currentLesson || !currentLesson.palavras) return [];
    const roots = currentLesson.palavras
      .map(p => p.raiz_shoresh)
      .filter(Boolean); // Filter out null/undefined roots
    return [...new Set(roots)]; // Get unique roots
  }, [currentLesson]);

  const [currentRootIndex, setCurrentRootIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState({}); // Tracks status: 'correct' or 'incorrect'
  const [isCurrentRootCompleted, setIsCurrentRootCompleted] = useState(false);

  const totalDeRaizes = uniqueRoots.length;
  const targetRoot = uniqueRoots[currentRootIndex];

  // Memoize the words that belong to the current target root
  const correctWordsForCurrentRoot = useMemo(() => 
    new Set(
      currentLesson.palavras
        .filter(p => p.raiz_shoresh === targetRoot)
        .map(p => p.palavra_hebraica)
    ),
    [targetRoot, currentLesson.palavras]
  );

  // Effect to check for completion of the current root's challenge
  useEffect(() => {
    const correctlySelectedWords = Object.keys(selectedWords)
      .filter(word => selectedWords[word] === 'correct');
    
    if (correctlySelectedWords.length === correctWordsForCurrentRoot.size) {
      setIsCurrentRootCompleted(true);
    }
  }, [selectedWords, correctWordsForCurrentRoot]);

  // Reset state when moving to the next root
  useEffect(() => {
    setSelectedWords({});
    setIsCurrentRootCompleted(false);
  }, [currentRootIndex]);

  const handleWordClick = (palavra) => {
    if (selectedWords[palavra.palavra_hebraica] || isCurrentRootCompleted) {
      return; // Don't allow changes after selection or completion
    }

    const isCorrect = correctWordsForCurrentRoot.has(palavra.palavra_hebraica);
    setSelectedWords({
      ...selectedWords,
      [palavra.palavra_hebraica]: isCorrect ? 'correct' : 'incorrect',
    });
  };

  const handleNextRoot = () => {
    if (currentRootIndex < totalDeRaizes - 1) {
      setCurrentRootIndex(prevIndex => prevIndex + 1);
    }
  };

  if (totalDeRaizes === 0) {
    return <p>Não há raízes para este exercício nesta lição.</p>;
  }

  const isExerciseFinished = isCurrentRootCompleted && currentRootIndex >= totalDeRaizes - 1;

  if (isExerciseFinished) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', border: '1px solid #d4edda', borderRadius: '8px' }}>
        <h3>Parabéns!</h3>
        <p>Você completou todos os desafios de conexão de raiz.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '25px' }}>
        Exercício: Conecte as Palavras ({currentRootIndex + 1}/{totalDeRaizes})
      </h3>
      <p style={{ textAlign: 'center', fontSize: '1.2em' }}>
        Clique nas palavras que pertencem à raiz: <strong style={{ fontSize: '1.5em', color: '#005a9e' }}>{targetRoot}</strong>
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px', marginTop: '20px' }}>
        {currentLesson.palavras.map((palavra, index) => {
          const status = selectedWords[palavra.palavra_hebraica];
          let backgroundColor = '#f0f0f0';
          if (status === 'correct') backgroundColor = '#d4edda'; // Green
          if (status === 'incorrect') backgroundColor = '#f8d7da'; // Red

          return (
            <button
              key={index}
              onClick={() => handleWordClick(palavra)}
              disabled={!!status} // Disable button if it has been clicked
              style={{
                padding: '15px',
                border: 'none',
                borderRadius: '5px',
                backgroundColor,
                cursor: !status ? 'pointer' : 'not-allowed',
                fontSize: '1.1em',
                fontWeight: 'bold',
                transition: 'background-color 0.3s ease'
              }}
            >
              {palavra.palavra_hebraica}
            </button>
          );
        })}
      </div>
      
      {isCurrentRootCompleted && !isExerciseFinished && (
        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <button onClick={handleNextRoot} style={{ padding: '10px 20px', fontSize: '1em', cursor: 'pointer' }}>
            Próxima Raiz
          </button>
        </div>
      )}
    </div>
  );
};

export default RootConnectorExercise;
