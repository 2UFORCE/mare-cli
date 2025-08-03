import React, { useState } from 'react';
import RootConnectorExercise from './RootConnectorExercise.js';
import ComprehensionQuiz from './ComprehensionQuiz.js';

// O componente agora recebe a lição gerada como uma prop 'lesson'
const LessonView = ({ lesson }) => {
  const [selectedWord, setSelectedWord] = useState(null);
  const [lessonPhase, setLessonPhase] = useState('desafio'); // 'desafio', 'treinamento', 'recompensa'
  const [showingQuiz, setShowingQuiz] = useState(false);

  // Se nenhuma lição for passada, exibe uma mensagem de carregamento/erro.
  if (!lesson) {
    return <p>Carregando lição...</p>;
  }

  const handleWordClick = (palavra) => {
    if (lessonPhase === 'recompensa') {
      setSelectedWord(palavra);
    }
  };

  const renderLessonContent = (isInteractive) => (
    <div>
      <h2>Frase Chave: {lesson.frase_chave}</h2>
      <h3>Palavras:</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {lesson.palavras.map((palavra, index) => (
          <li 
            key={index} 
            onClick={() => isInteractive && handleWordClick(palavra)} 
            style={{ cursor: isInteractive ? 'pointer' : 'default', marginBottom: '10px' }}
          >
            <strong style={{ fontSize: '1.2em' }}>{palavra.palavra_hebraica}</strong>
          </li>
        ))}
      </ul>
      {isInteractive && selectedWord && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Detalhes da Palavra</h3>
          <p><strong>Hebraico:</strong> {selectedWord.palavra_hebraica}</p>
          <p><strong>Transliteração:</strong> {selectedWord.transliteracao}</p>
          <p><strong>Tradução:</strong> {selectedWord.traducao}</p>
          <p><strong>Raiz (Shoresh):</strong> {selectedWord.raiz_shoresh}</p>
          <p><strong>Binyan:</strong> {selectedWord.binyan}</p>
          <p><strong>Notas Gramaticais:</strong> {selectedWord.notas_gramaticais}</p>
        </div>
      )}
    </div>
  );

  if (showingQuiz) {
    return (
      <ComprehensionQuiz 
        questions={lesson.perguntas} 
        onQuizComplete={() => setShowingQuiz(false)} 
      />
    );
  }

  return (
    <div>
      <h1>Lição</h1>
      <div>
        {lessonPhase === 'desafio' && (
          <div>
            {renderLessonContent(false)}
            <button onClick={() => setLessonPhase('treinamento')}>Começar Treinamento</button>
          </div>
        )}

        {lessonPhase === 'treinamento' && (
          <div>
            <RootConnectorExercise currentLesson={lesson} />
            <button onClick={() => setLessonPhase('recompensa')} style={{ marginTop: '20px' }}>Concluir Treinamento</button>
          </div>
        )}

        {lessonPhase === 'recompensa' && (
          <div>
            {renderLessonContent(true)}
            <button onClick={() => setShowingQuiz(true)}>Testar Compreensão</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonView;
