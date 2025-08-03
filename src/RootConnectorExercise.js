import React, { useState, useMemo, useEffect } from 'react';

const RootConnectorExercise = ({ currentLesson }) => {
  // 1. Encontra todas as raízes únicas e não nulas e as armazena.
  const uniqueRoots = useMemo(() => {
    if (!currentLesson || !currentLesson.palavras) return [];
    const roots = currentLesson.palavras
      .map(p => p.raiz_shoresh)
      .filter(r => r); // Filtra raízes nulas ou vazias
    return [...new Set(roots)]; // Cria um array de raízes únicas
  }, [currentLesson]);

  // 2. Gerencia o estado do desafio atual.
  const [currentRootIndex, setCurrentRootIndex] = useState(0);
  const [wordStatuses, setWordStatuses] = useState({});
  const [correctlyGuessed, setCorrectlyGuessed] = useState(new Set());

  const targetRoot = uniqueRoots[currentRootIndex];
  const totalWordsForThisRoot = useMemo(() => 
    currentLesson.palavras.filter(p => p.raiz_shoresh === targetRoot).length,
    [targetRoot, currentLesson.palavras]
  );

  // Reseta o estado quando a raiz alvo muda.
  useEffect(() => {
    setWordStatuses({});
    setCorrectlyGuessed(new Set());
  }, [currentRootIndex]);

  const handleWordClick = (palavra) => {
    // Não faz nada se a palavra já foi marcada.
    if (wordStatuses[palavra.palavra_hebraica]) return;

    const isCorrect = palavra.raiz_shoresh === targetRoot;
    const status = isCorrect ? 'correct' : 'incorrect';

    setWordStatuses(prev => ({ ...prev, [palavra.palavra_hebraica]: status }));

    if (isCorrect) {
      setCorrectlyGuessed(prev => new Set(prev).add(palavra.palavra_hebraica));
    }
  };

  const handleNextRoot = () => {
    if (currentRootIndex < uniqueRoots.length - 1) {
      setCurrentRootIndex(prevIndex => prevIndex + 1);
    }
  };

  const isChallengeComplete = correctlyGuessed.size === totalWordsForThisRoot;
  const areAllChallengesDone = currentRootIndex >= uniqueRoots.length - 1 && isChallengeComplete;

  if (uniqueRoots.length === 0) {
    return <p>Não há raízes para este exercício.</p>;
  }

  // 6. Tela de conclusão.
  if (areAllChallengesDone) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Parabéns!</h3>
        <p>Você completou todos os desafios de conexão de raiz.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '25px' }}>
        Exercício: Conecte as Palavras ({currentRootIndex + 1}/{uniqueRoots.length})
      </h3>
      <p style={{ textAlign: 'center', fontSize: '1.2em' }}>
        Clique nas palavras que pertencem à raiz: <strong style={{ fontSize: '1.5em', color: '#005a9e' }}>{targetRoot}</strong>
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px', marginTop: '20px' }}>
        {currentLesson.palavras.map((palavra, index) => {
          const status = wordStatuses[palavra.palavra_hebraica] || 'default';
          let backgroundColor = '#f0f0f0';
          if (status === 'correct') backgroundColor = '#d4edda';
          else if (status === 'incorrect') backgroundColor = '#f8d7da';

          return (
            <button
              key={index}
              onClick={() => handleWordClick(palavra)}
              disabled={status !== 'default'}
              style={{
                padding: '15px',
                border: 'none',
                borderRadius: '5px',
                backgroundColor,
                cursor: status === 'default' ? 'pointer' : 'not-allowed',
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
      {/* 4. Botão "Próxima Raiz" */}
      {isChallengeComplete && (
        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <button onClick={handleNextRoot} style={{ padding: '10px 20px', fontSize: '1em' }}>
            Próxima Raiz
          </button>
        </div>
      )}
    </div>
  );
};

export default RootConnectorExercise;
