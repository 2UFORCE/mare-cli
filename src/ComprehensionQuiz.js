import React, { useState } from 'react';

const ComprehensionQuiz = ({ questions, onQuizComplete }) => {
  const [currentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerClick = (option) => {
    if (isAnswered) return; // Previne múltiplas respostas

    setSelectedAnswer(option);
    setIsAnswered(true);
  };

  const getButtonColor = (option) => {
    if (!isAnswered) return '#f0f0f0'; // Cor padrão

    const isCorrect = option === currentQuestion.resposta_correta;
    if (option === selectedAnswer) {
      return isCorrect ? '#d4edda' : '#f8d7da'; // Verde se correta, Vermelho se incorreta
    }
    if (isCorrect) {
      return '#d4edda'; // Mostra a correta em verde mesmo que não tenha sido a selecionada
    }
    return '#f0f0f0'; // Cor padrão para as outras opções
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff', color: '#333' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '25px' }}>Teste de Compreensão</h3>
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '1.2em' }}>{currentQuestion.pergunta}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {currentQuestion.opcoes.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(option)}
              disabled={isAnswered}
              style={{
                padding: '15px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                backgroundColor: getButtonColor(option),
                cursor: isAnswered ? 'not-allowed' : 'pointer',
                fontSize: '1em',
                textAlign: 'left',
                transition: 'background-color 0.3s ease'
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      {isAnswered && (
        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <button onClick={onQuizComplete} style={{ padding: '10px 20px', fontSize: '1em' }}>
            Voltar à Lição
          </button>
        </div>
      )}
    </div>
  );
};

export default ComprehensionQuiz;
