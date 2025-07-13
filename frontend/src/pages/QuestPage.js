import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Play, 
  RefreshCw, 
  Download, 
  Lightbulb, 
  CheckCircle,
  Star,
  ArrowRight,
  ArrowLeft,
  Code,
  Trophy,
  Timer,
  X
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import axios from 'axios';

const QuestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProgress, updateUserProgress } = useAuth();
  const [quest, setQuest] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    fetchQuest();
  }, [id]);

  const fetchQuest = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/quests/${id}`);
      setQuest(response.data);
      setCode(response.data.code_template);
    } catch (error) {
      console.error('Error fetching quest:', error);
      // Mock data for development
      const mockQuest = getMockQuest(id);
      setQuest(mockQuest);
      setCode(mockQuest.code_template);
    }
    setLoading(false);
  };

  const getMockQuest = (questId) => {
    const mockQuests = {
      'basic-1': {
        id: 'basic-1',
        title: 'Variables & Data Types',
        description: 'Learn the fundamentals of Python variables and basic data types. In this quest, you will create variables of different types and perform basic operations.',
        difficulty: 'beginner',
        category: 'basics',
        xp_reward: 50,
        estimated_time: '15 min',
        instructions: [
          'Create a variable named "name" with your name as a string',
          'Create a variable named "age" with your age as an integer',
          'Create a variable named "height" with your height as a float',
          'Create a variable named "is_student" with a boolean value',
          'Print all variables with descriptive messages'
        ],
        code_template: `# Welcome to your first Python quest!
# Let's learn about variables and data types

# TODO: Create a string variable for your name
name = "Your Name Here"

# TODO: Create an integer variable for your age
age = 25

# TODO: Create a float variable for your height in meters
height = 1.75

# TODO: Create a boolean variable for student status
is_student = True

# TODO: Print all variables with descriptive messages
print(f"Name: {name}")
print(f"Age: {age}")
print(f"Height: {height} meters")
print(f"Is student: {is_student}")

# Bonus: Try some basic operations
print(f"In 5 years, you will be {age + 5} years old")
`,
        expected_output: 'Variables should be printed with descriptive messages',
        test_cases: [
          {
            description: 'Check if name variable is defined',
            test: 'name variable should be a string',
            points: 10
          },
          {
            description: 'Check if age variable is defined',
            test: 'age variable should be an integer',
            points: 10
          },
          {
            description: 'Check if height variable is defined',
            test: 'height variable should be a float',
            points: 10
          },
          {
            description: 'Check if is_student variable is defined',
            test: 'is_student variable should be a boolean',
            points: 10
          },
          {
            description: 'Check if all variables are printed',
            test: 'All variables should be printed with descriptive messages',
            points: 10
          }
        ]
      },
      'basic-2': {
        id: 'basic-2',
        title: 'Control Flow',
        description: 'Master if statements, loops, and conditional logic to control the flow of your programs.',
        difficulty: 'beginner',
        category: 'basics',
        xp_reward: 75,
        estimated_time: '20 min',
        instructions: [
          'Create a program that checks if a number is positive, negative, or zero',
          'Use a for loop to print numbers from 1 to 10',
          'Use a while loop to find the sum of first 5 numbers',
          'Create a simple guessing game logic'
        ],
        code_template: `# Control Flow Quest
# Let's learn about if statements and loops

# TODO: Check if a number is positive, negative, or zero
number = 42

if number > 0:
    print(f"{number} is positive")
elif number < 0:
    print(f"{number} is negative")
else:
    print(f"{number} is zero")

# TODO: Use a for loop to print numbers from 1 to 10
print("Numbers from 1 to 10:")
for i in range(1, 11):
    print(i)

# TODO: Use a while loop to find sum of first 5 numbers
sum_result = 0
count = 1
while count <= 5:
    sum_result += count
    count += 1

print(f"Sum of first 5 numbers: {sum_result}")

# TODO: Simple guessing game logic
secret_number = 7
guess = 5

if guess == secret_number:
    print("Congratulations! You guessed it!")
elif guess < secret_number:
    print("Too low!")
else:
    print("Too high!")
`,
        expected_output: 'Program should demonstrate if statements and loops',
        test_cases: [
          {
            description: 'Check conditional logic',
            test: 'Number classification should work correctly',
            points: 15
          },
          {
            description: 'Check for loop',
            test: 'For loop should print numbers 1 to 10',
            points: 15
          },
          {
            description: 'Check while loop',
            test: 'While loop should calculate sum correctly',
            points: 15
          },
          {
            description: 'Check guessing game logic',
            test: 'Guessing game should provide correct feedback',
            points: 15
          }
        ]
      }
    };
    
    return mockQuests[questId] || mockQuests['basic-1'];
  };

  const executeCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    setExecuting(true);
    setShowOutput(true);
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/code/execute`, {
        code: code,
        quest_id: id
      });
      
      setOutput(response.data.output);
      setTestResults(response.data.test_results || []);
      
      if (response.data.success) {
        setIsCompleted(true);
        toast.success('Quest completed! 🎉');
        
        // Update user progress
        const newProgress = {
          ...userProgress,
          xp: userProgress.xp + quest.xp_reward,
          completedQuests: [...userProgress.completedQuests, id]
        };
        
        // Level up logic
        if (newProgress.xp >= newProgress.level * 100) {
          newProgress.level += 1;
          toast.success(`Level up! You are now level ${newProgress.level}! 🎊`);
        }
        
        updateUserProgress(newProgress);
      } else {
        toast.error('Some tests failed. Keep trying!');
      }
    } catch (error) {
      console.error('Error executing code:', error);
      // Mock execution for development
      mockExecuteCode();
    }
    
    setExecuting(false);
  };

  const mockExecuteCode = () => {
    setOutput(`Running your code...\n\n${code}\n\nOutput:\nCode executed successfully!`);
    const mockResults = quest.test_cases.map(test => ({
      description: test.description,
      passed: Math.random() > 0.3,
      points: test.points
    }));
    setTestResults(mockResults);
    
    const allPassed = mockResults.every(result => result.passed);
    if (allPassed) {
      setIsCompleted(true);
      toast.success('Quest completed! 🎉');
    }
  };

  const getHint = async () => {
    if (hint) {
      setShowHint(true);
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/code/hint`, {
        quest_id: id,
        code: code,
        user_progress: userProgress
      });
      
      setHint(response.data.hint);
      setShowHint(true);
    } catch (error) {
      console.error('Error getting hint:', error);
      // Mock hint for development
      setHint("Here's a hint: Make sure to follow the TODO comments and check your variable types. Remember that strings use quotes, integers are whole numbers, and floats have decimal points!");
      setShowHint(true);
    }
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${quest.title.replace(/\s+/g, '_').toLowerCase()}.py`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Code downloaded!');
  };

  const resetCode = () => {
    setCode(quest.code_template);
    setOutput('');
    setTestResults([]);
    setIsCompleted(false);
    setShowOutput(false);
    toast.success('Code reset to template');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold-400 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading quest...</p>
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Quest not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-gold-500 text-white px-6 py-2 rounded-lg hover:bg-gold-600 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Quests</span>
          </button>
          
          <div className="bg-glass-effect rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-fantasy font-bold text-white">
                {quest.title}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star className="h-5 w-5" />
                  <span className="font-semibold">{quest.xp_reward} XP</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-400">
                  <Timer className="h-5 w-5" />
                  <span>{quest.estimated_time}</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">{quest.description}</p>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Instructions:</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {quest.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Code Editor */}
          <div className="bg-glass-effect rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Code Editor</span>
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={getHint}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center space-x-1"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>Hint</span>
                </button>
                <button
                  onClick={resetCode}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center space-x-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={downloadCode}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center space-x-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            
            <div className="border border-gray-600 rounded-lg overflow-hidden">
              <Editor
                height="400px"
                language="python"
                value={code}
                onChange={(value) => setCode(value)}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={executeCode}
                disabled={executing}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <Play className="h-5 w-5" />
                <span>{executing ? 'Running...' : 'Run Code'}</span>
              </button>
              
              {isCompleted && (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Quest Completed!</span>
                </div>
              )}
            </div>
          </div>

          {/* Output and Tests */}
          <div className="space-y-6">
            {/* Output */}
            {showOutput && (
              <div className="bg-glass-effect rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Output</h2>
                <div className="bg-gray-800 rounded-lg p-4">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                    {output || 'No output yet. Run your code to see the results!'}
                  </pre>
                </div>
              </div>
            )}

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="bg-glass-effect rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.passed 
                          ? 'bg-green-900/20 border-green-500 text-green-300' 
                          : 'bg-red-900/20 border-red-500 text-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{result.description}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{result.points} pts</span>
                          {result.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <X className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hint */}
            {showHint && hint && (
              <div className="bg-glass-effect rounded-lg p-6 border border-yellow-500/50">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  <span>Hint</span>
                </h2>
                <p className="text-gray-300">{hint}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestPage;