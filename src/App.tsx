import React, { useState, useEffect } from 'react';
import { Brain, Flag, X, Bot, Trophy } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import Confetti from 'react-confetti';
import { questions } from './questions';
import { trainModel } from './ai-model';

function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'feedback' | 'end'>('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const initModel = async () => {
      const trainedModel = await trainModel();
      setModel(trainedModel);
    };
    initModel();
  }, []);

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestion].correctAnswer;
    
    if (correct) {
      setScore(score + 1);
    }
    
    if (model) {
      const features = tf.tensor2d([[correct ? 1 : 0, currentQuestion]]);
      const prediction = model.predict(features) as tf.Tensor;
      const needsExplanation = (await prediction.data())[0] > 0.5;
      
      if (needsExplanation || !correct) {
        setGameState('feedback');
      } else {
        handleNext();
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setGameState('playing');
    } else {
      setGameState('end');
    }
  };

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500 to-indigo-700 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Pixel art clouds */}
      <div className="absolute top-0 left-0 w-full">
        <div className="cloud"></div>
        <div className="cloud" style={{ animationDelay: '-5s' }}></div>
        <div className="cloud" style={{ animationDelay: '-10s' }}></div>
      </div>

      {/* Bottom decoration */}
      <div className="fixed bottom-0 w-full">
        <div className="pixel-ground"></div>
        <div className="fixed bottom-0 right-4">
          <Flag className="text-blue-400 w-8 h-8" />
        </div>
      </div>

      <h1 className="text-6xl font-bold text-white mb-8 pixel-font relative">QUIZ</h1>

      {gameState === 'start' && (
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full relative pixel-border">
          <Brain className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h2 className="text-2xl font-bold mb-4">Pronto para testar seus conhecimentos?</h2>
          <button
            onClick={() => setGameState('playing')}
            className="pixel-button bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Começar
          </button>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'feedback') && (
        <div className="w-full max-w-2xl mb-4 px-4">
          <div className="bg-white/20 h-4 rounded-full overflow-hidden pixel-border">
            <div
              className="h-full bg-green-400 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full pixel-border">
          <div className="flex justify-between items-center mb-6">
            <span className="text-purple-600 font-bold">Questão {currentQuestion + 1}/{questions.length}</span>
            <span className="text-purple-600 font-bold">Pontos: {score}</span>
          </div>
          
          <h2 className="text-xl mb-6">{questions[currentQuestion].question}</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`p-4 rounded-lg text-left transition pixel-button
                  ${selectedAnswer === option 
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'feedback' && (
        <div className="bg-red-100 p-8 rounded-lg shadow-xl max-w-2xl w-full pixel-border">
          <div className="flex items-start mb-4">
            <Bot className="w-8 h-8 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700">
              {selectedAnswer === questions[currentQuestion].correctAnswer
                ? "Correto! Vamos revisar mesmo assim:"
                : `Você escolheu "${selectedAnswer}", mas a resposta correta é "${questions[currentQuestion].correctAnswer}".`}
            </p>
          </div>
          
          <p className="text-gray-700 mb-6">{questions[currentQuestion].explanation}</p>
          
          <button
            onClick={handleNext}
            className="pixel-button bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition float-right"
          >
            Próxima →
          </button>
        </div>
      )}

      {gameState === 'end' && (
        <>
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={true}
            numberOfPieces={200}
          />
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full pixel-border relative">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <div className="pixel-trophy"></div>
            <h2 className="text-3xl font-bold mb-4">Parabéns!</h2>
            <p className="text-xl mb-6">Você acertou {score} de {questions.length} questões!</p>
            <button
              onClick={() => {
                setGameState('start');
                setCurrentQuestion(0);
                setScore(0);
              }}
              className="pixel-button bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Jogar Novamente
            </button>
          </div>
        </>
      )}

      {gameState !== 'start' && (
        <button
          onClick={() => setGameState('start')}
          className="fixed top-4 left-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}

export default App;