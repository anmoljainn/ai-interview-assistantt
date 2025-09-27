// Sample questions for a full-stack (React/Node) role
const sampleQuestions = [
  // Easy questions
  {
    text: "What is JSX in React and how does it work?",
    difficulty: "Easy"
  },
  {
    text: "Explain the difference between state and props in React.",
    difficulty: "Easy"
  },
  // Medium questions
  {
    text: "How would you optimize a React application for performance? Provide at least three techniques.",
    difficulty: "Medium"
  },
  {
    text: "Explain the concept of middleware in Express.js and provide an example use case.",
    difficulty: "Medium"
  },
  // Hard questions
  {
    text: "Design a scalable architecture for a real-time chat application using React and Node.js. Discuss your choice of databases, WebSocket implementation, and how you would handle authentication.",
    difficulty: "Hard"
  },
  {
    text: "Describe how you would implement a custom hook in React that manages complex form state with validation, and explain the benefits of this approach over using a form library.",
    difficulty: "Hard"
  }
];

// Generate interview questions
export const generateQuestion = async (candidateData) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a shuffled copy of the sample questions
  return [...sampleQuestions].sort(() => Math.random() - 0.5);
};

// Evaluate candidate answers
export const evaluateAnswer = async (question, answer) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate a random score based on answer length and question difficulty
  let baseScore = 3; // Minimum score
  
  // Add points based on answer length (encouraging detailed answers)
  if (answer.length > 50) baseScore += 1;
  if (answer.length > 150) baseScore += 1;
  if (answer.length > 300) baseScore += 1;
  
  // Adjust based on question difficulty
  const difficultyMultiplier = {
    'Easy': 1.5,
    'Medium': 1.2,
    'Hard': 1.0
  }[question.difficulty] || 1.0;
  
  // Calculate final score (0-10)
  let score = Math.min(10, Math.round(baseScore * difficultyMultiplier));
  
  // Generate feedback based on score
  let feedback = '';
  if (score >= 8) {
    feedback = 'Excellent answer! You demonstrated a strong understanding of the concept.';
  } else if (score >= 6) {
    feedback = 'Good answer with some room for improvement. Consider exploring more aspects of this topic.';
  } else if (score >= 4) {
    feedback = 'Your answer addresses some basic points but lacks depth. More detail would improve your response.';
  } else {
    feedback = 'Your answer needs significant improvement. Please study this topic more thoroughly.';
  }
  
  return {
    score,
    feedback
  };
};