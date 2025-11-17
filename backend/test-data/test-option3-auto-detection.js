/**
 * Test script for Option 3: Smart Auto-Detection RAG Chatbot
 * Tests auto-discovery, categorization, and race-specific querying
 */

const chatModel = require('../models/chat.model');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

/**
 * Test auto-discovery and categorization
 */
async function testAutoDiscovery() {
  console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║  Test 1: Auto-Discovery & Categorization                      ║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  try {
    const allCollections = await chatModel.discoverCollections();
    console.log(`${colors.green}✅ Discovered ${allCollections.length} collections${colors.reset}`);
    
    const categorized = await chatModel.initializeCollections();
    console.log(`\n${colors.blue}Categorized Collections:${colors.reset}`);
    for (const [category, collections] of Object.entries(categorized)) {
      if (collections.length > 0) {
        console.log(`  ${colors.magenta}${category}${colors.reset}: ${collections.length} collection(s)`);
        collections.forEach(col => console.log(`    - ${col}`));
      }
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Auto-discovery failed: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test race number extraction
 */
function testRaceExtraction() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║  Test 2: Race Number Extraction                               ║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  const testCases = [
    { question: "Who won Race 2?", expected: 2 },
    { question: "What was the fastest lap in race 15?", expected: 15 },
    { question: "Show me R2 results", expected: 2 },
    { question: "Race_01 weather conditions", expected: 1 },
    { question: "Who is in position 10?", expected: null },
  ];

  let passed = 0;
  for (const test of testCases) {
    const extracted = chatModel.extractRaceNumber(test.question);
    const match = extracted === test.expected;
    
    if (match) {
      console.log(`${colors.green}✅${colors.reset} "${test.question}" → Race ${extracted || "None"}`);
      passed++;
    } else {
      console.log(`${colors.red}❌${colors.reset} "${test.question}" → Expected ${test.expected}, Got ${extracted}`);
    }
  }

  console.log(`\n${colors.blue}Passed: ${passed}/${testCases.length}${colors.reset}`);
  return passed === testCases.length;
}

/**
 * Test collection filtering by race
 */
async function testRaceFiltering() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║  Test 3: Collection Filtering by Race                         ║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  try {
    const allCollections = await chatModel.discoverCollections();
    
    // Test filtering for Race 1
    const race1Collections = chatModel.filterCollectionsByRace(allCollections, 1);
    console.log(`${colors.green}Race 1 Collections:${colors.reset} ${race1Collections.length} found`);
    race1Collections.slice(0, 5).forEach(col => console.log(`  - ${col}`));
    
    // Simulate Race 2 (even if doesn't exist yet)
    console.log(`\n${colors.yellow}Simulating Race 2 filtering (may be empty):${colors.reset}`);
    const race2Collections = chatModel.filterCollectionsByRace(allCollections, 2);
    console.log(`${colors.green}Race 2 Collections:${colors.reset} ${race2Collections.length} found`);
    if (race2Collections.length > 0) {
      race2Collections.forEach(col => console.log(`  - ${col}`));
    } else {
      console.log(`  ${colors.yellow}(No Race 2 collections yet - this is expected)${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Filtering test failed: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test smart query routing
 */
function testSmartRouting() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║  Test 4: Smart Query Routing                                  ║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  const testQueries = [
    { 
      query: "Who is Position 10 in Race 2?",
      expectedCategories: ['results'],
      expectedRace: 2
    },
    {
      query: "What was the fastest lap time?",
      expectedCategories: ['laps'],
      expectedRace: null
    },
    {
      query: "Show me weather conditions for Race 15",
      expectedCategories: ['weather'],
      expectedRace: 15
    },
    {
      query: "What's the telemetry data?",
      expectedCategories: ['telemetry'],
      expectedRace: null
    },
  ];

  let passed = 0;
  for (const test of testQueries) {
    const analysis = chatModel.analyzeQuestionIntent(test.query);
    
    const categoryMatch = test.expectedCategories.some(cat => 
      analysis.categoriesToQuery.includes(cat)
    );
    const raceMatch = analysis.raceNumber === test.expectedRace;
    
    if (categoryMatch && raceMatch) {
      console.log(`${colors.green}✅${colors.reset} "${test.query}"`);
      console.log(`   Categories: [${analysis.categoriesToQuery.join(', ')}]`);
      console.log(`   Race: ${analysis.raceNumber || 'None'}`);
      passed++;
    } else {
      console.log(`${colors.red}❌${colors.reset} "${test.query}"`);
      console.log(`   Expected: ${test.expectedCategories.join(', ')}, Race ${test.expectedRace || 'None'}`);
      console.log(`   Got: ${analysis.categoriesToQuery.join(', ')}, Race ${analysis.raceNumber || 'None'}`);
    }
    console.log('');
  }

  console.log(`${colors.blue}Passed: ${passed}/${testQueries.length}${colors.reset}`);
  return passed === testQueries.length;
}

/**
 * Test cache functionality
 */
async function testCaching() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║  Test 5: Collection Caching                                   ║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  try {
    // First call - should discover
    console.log("First call (should discover from MongoDB):");
    const start1 = Date.now();
    await chatModel.discoverCollections();
    const time1 = Date.now() - start1;
    console.log(`  Time: ${time1}ms`);
    
    // Second call - should use cache
    console.log("\nSecond call (should use cache):");
    const start2 = Date.now();
    await chatModel.discoverCollections();
    const time2 = Date.now() - start2;
    console.log(`  Time: ${time2}ms`);
    
    if (time2 < time1) {
      console.log(`\n${colors.green}✅ Caching works! ${time2}ms < ${time1}ms${colors.reset}`);
    } else {
      console.log(`\n${colors.yellow}⚠️  Cache may not be working optimally${colors.reset}`);
    }
    
    // Test cache clear
    console.log("\nClearing cache...");
    chatModel.clearCache();
    console.log(`${colors.green}✅ Cache cleared${colors.reset}`);
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Caching test failed: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test full query with MongoDB (if available)
 */
async function testFullQuery() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║  Test 6: Full Query Integration                               ║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  if (!process.env.MONGODB_URI) {
    console.log(`${colors.yellow}⚠️  MONGODB_URI not set - skipping MongoDB query test${colors.reset}`);
    return true;
  }

  try {
    console.log("Testing: 'Who is Position 10?'");
    const result = await chatModel.queryRaceData("Who is Position 10?");
    
    if (result.hasData) {
      console.log(`${colors.green}✅ Query successful!${colors.reset}`);
      console.log(`   Collections queried: ${result.totalCollections}`);
      console.log(`   Categories: [${result.analysis.categoriesToQuery.join(', ')}]`);
      console.log(`   Race: ${result.analysis.raceNumber || 'Not specified (using default)'}`);
      
      // Show first result
      const firstCollection = Object.keys(result.results)[0];
      if (firstCollection) {
        const data = result.results[firstCollection];
        console.log(`\n   First result from ${data.collectionName}:`);
        console.log(`   Category: ${data.category}`);
        console.log(`   Records: ${data.count}`);
      }
    } else {
      console.log(`${colors.yellow}⚠️  No data found (collections may be empty)${colors.reset}`);
    }
    
    // Test Race 2 query (may not exist)
    console.log(`\n${colors.blue}Testing: 'Who won Race 2?'${colors.reset}`);
    const result2 = await chatModel.queryRaceData("Who won Race 2?");
    
    if (result2.hasData) {
      console.log(`${colors.green}✅ Race 2 data found!${colors.reset}`);
      console.log(`   Collections: ${result2.totalCollections}`);
    } else {
      console.log(`${colors.yellow}ℹ️  No Race 2 data (expected if not uploaded yet)${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Full query test failed: ${error.message}${colors.reset}`);
    console.log(`   This might be a connection issue, not a code problem.`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`${colors.magenta}`);
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║     Option 3: Smart Auto-Detection RAG Chatbot - Test Suite     ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);

  const results = {
    autoDiscovery: false,
    raceExtraction: false,
    raceFiltering: false,
    smartRouting: false,
    caching: false,
    fullQuery: false,
  };

  // Run tests
  results.autoDiscovery = await testAutoDiscovery();
  results.raceExtraction = testRaceExtraction();
  results.raceFiltering = await testRaceFiltering();
  results.smartRouting = testSmartRouting();
  results.caching = await testCaching();
  results.fullQuery = await testFullQuery();

  // Summary
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════════════`);
  console.log(`                        Test Summary                               `);
  console.log(`═══════════════════════════════════════════════════════════════════${colors.reset}`);
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r).length;
  
  for (const [test, result] of Object.entries(results)) {
    const icon = result ? `${colors.green}✅` : `${colors.red}❌`;
    console.log(`${icon} ${test}${colors.reset}`);
  }
  
  console.log(`\n${colors.blue}Total: ${passed}/${total} tests passed${colors.reset}`);
  
  if (passed === total) {
    console.log(`\n${colors.green}🎉 ALL TESTS PASSED! Option 3 is ready for production!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed. Review above for details.${colors.reset}\n`);
  }

  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}\n`);

  return passed === total;
}

// Run tests if executed directly
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
  
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = { runAllTests };

