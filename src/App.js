import React, { useState } from 'react';
import LessonView from './LessonView.js';
import LessonGenerator from './LessonGenerator.js';
import './App.css';

function App() {
  // Estado para armazenar a lição que vem do back-end.
  const [generatedLesson, setGeneratedLesson] = useState(null);

  // Função que será passada para o LessonGenerator para atualizar o estado.
  const handleLessonGenerated = (lessonData) => {
    setGeneratedLesson(lessonData);
  };

  return (
    <div className="App">
      <header className="App-header">
        {generatedLesson ? (
          // Se uma lição foi gerada, mostra o LessonView com os dados.
          <LessonView lesson={generatedLesson} />
        ) : (
          // Caso contrário, mostra o gerador para criar uma nova lição.
          <LessonGenerator onLessonGenerated={handleLessonGenerated} />
        )}
      </header>
    </div>
  );
}

export default App;
