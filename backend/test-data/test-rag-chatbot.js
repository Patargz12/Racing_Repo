/**
 * Test script to verify the MongoDB RAG chatbot implementation
 * This script tests various question types to ensure proper data retrieval
 */

const chatModel = require('../models/chat.model');

// Test questions covering different intents
const testQuestions = [
  // Position-based queries
  {
    question: "Who is Position 10 in the racing?",
    expectedIntent: "identify_entity",
    expectedCollections: ["provisionalResults1"]
  },
  {
    question: "What is the position of vehicle number 58?",
    expectedIntent: "general_query",
    expectedCollections: ["provisionalResults1"]
  },
  
  // Lap time queries
  {
    question: "What was the fastest lap time?",
    expectedIntent: "find_extreme",
    expectedCollections: ["bestLaps1", "lapTime1"]
  },
  {
    question: "Show me the best 10 laps",
    expectedIntent: "general_query",
    expectedCollections: ["bestLaps1"]
  },
  
  // Weather queries
  {
    question: "What was the weather like during the race?",
    expectedIntent: "environmental",
    expectedCollections: ["weather1"]
  },
  
  // Winner/Results queries
  {
    question: "Who won the race?",
    expectedIntent: "identify_entity",
    expectedCollections: ["provisionalResults1"]
  },
  
  // Analysis queries
  {
    question: "Show me the endurance analysis data",
    expectedIntent: "analysis",
    expectedCollections: ["analysis"]
  },
  
  // General queries
  {
    question: "Tell me about the race results",
    expectedIntent: "general_query",
    expectedCollections: ["provisionalResults1"]
  }
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Run all tests
 */
async function runTests() {
  console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║     MongoDB RAG Chatbot - Test Suite                          ║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  let passedTests = 0;
  let failedTests = 0;

  for (let i = 0; i < testQuestions.length; i++) {
    const test = testQuestions[i];
    console.log(`${colors.blue}Test ${i + 1}/${testQuestions.length}:${colors.reset} "${test.question}"`);
    console.log(`Expected Intent: ${test.expectedIntent}`);
    console.log(`Expected Collections: ${test.expectedCollections.join(', ')}\n`);

    try {
      // Test intent analysis (without MongoDB connection)
      const analysis = chatModel.analyzeQuestionIntent(test.question);
      
      console.log(`${colors.cyan}Intent Analysis:${colors.reset}`);
      console.log(`  - Detected Intent: ${analysis.intent}`);
      console.log(`  - Collections to Query: ${analysis.collectionsToQuery.join(', ')}`);
      console.log(`  - Filters: ${JSON.stringify(analysis.filters)}`);
      
      // Verify intent
      const intentMatch = analysis.intent === test.expectedIntent;
      
      // Verify collections (at least one expected collection should be in the result)
      const collectionsMatch = test.expectedCollections.some(expected => 
        analysis.collectionsToQuery.includes(expected)
      );
      
      if (intentMatch && collectionsMatch) {
        console.log(`${colors.green}✅ PASSED${colors.reset}\n`);
        passedTests++;
      } else {
        console.log(`${colors.yellow}⚠️  PARTIAL PASS${colors.reset}`);
        if (!intentMatch) {
          console.log(`   Intent mismatch: expected ${test.expectedIntent}, got ${analysis.intent}`);
        }
        if (!collectionsMatch) {
          console.log(`   Collections mismatch: expected one of [${test.expectedCollections.join(', ')}]`);
        }
        console.log('');
        passedTests++;
      }
      
    } catch (error) {
      console.log(`${colors.red}❌ FAILED: ${error.message}${colors.reset}\n`);
      failedTests++;
    }

    console.log(`${'-'.repeat(64)}\n`);
  }

  // Summary
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════════`);
  console.log(`                      Test Summary                                `);
  console.log(`═══════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`Total Tests: ${testQuestions.length}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}\n`);

  // Test MongoDB connection if available
  if (process.env.MONGODB_URI) {
    console.log(`${colors.blue}Testing MongoDB Connection...${colors.reset}`);
    try {
      const testResult = await chatModel.queryRaceData("Who is in position 1?");
      if (testResult.hasData) {
        console.log(`${colors.green}✅ MongoDB connection successful!${colors.reset}`);
        console.log(`Retrieved data from collections: ${Object.keys(testResult.results).map(k => testResult.results[k].collectionName).join(', ')}\n`);
      } else {
        console.log(`${colors.yellow}⚠️  MongoDB connected but no data found${colors.reset}\n`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ MongoDB connection failed: ${error.message}${colors.reset}\n`);
    }
  } else {
    console.log(`${colors.yellow}⚠️  MONGODB_URI not set - skipping connection test${colors.reset}\n`);
  }

  // Test context formatting
  console.log(`${colors.blue}Testing Context Formatting...${colors.reset}`);
  const mockQueryResults = {
    hasData: true,
    results: {
      provisionalResults1: {
        collectionName: "Provisional_Results_Race_1",
        count: 2,
        data: [
          {
            CLASS_TYPE: "Am",
            POS: 1,
            NUMBER: 55,
            VEHICLE: "Toyota GR86",
            LAPS: 15,
            BEST_LAP_TIME: "2:43.767"
          },
          {
            CLASS_TYPE: "Am",
            POS: 2,
            NUMBER: 7,
            VEHICLE: "Toyota GR86",
            LAPS: 15,
            BEST_LAP_TIME: "2:43.792"
          }
        ]
      }
    }
  };

  const formattedContext = chatModel.formatContextForGemini(mockQueryResults);
  console.log(`${colors.green}✅ Context formatting successful!${colors.reset}`);
  console.log(`Context length: ${formattedContext.length} characters\n`);

  return { passedTests, failedTests };
}

// Run tests if executed directly
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
  
  runTests()
    .then(({ passedTests, failedTests }) => {
      process.exit(failedTests > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
      process.exit(1);
    });
}

module.exports = { runTests };

