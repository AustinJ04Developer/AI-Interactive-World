import { scenarioEngine } from '../services/scenarioEngine.js';
import { CANONICAL_SCENARIOS } from '../scenariosData.js';
import { connectDB } from '../db.js';

async function runTests() {
  console.log('=======================================================');
  console.log('🧪 RUNNING AI INTERACTIVE WORLD SCENARIO & SESSION TESTS');
  console.log('=======================================================');
  await connectDB();

  let passed = 0;
  let failed = 0;

  // Test 1: Detective Non-Repetition Across Consecutive Students
  console.log('\n[TEST 1] Testing consecutive student non-repetition in Detective Portal...');
  const student1Session = 'SESSION-TEST-001';
  const student2Session = 'SESSION-TEST-002';
  const student3Session = 'SESSION-TEST-003';

  const s1 = await scenarioEngine.assignScenario('detective', student1Session);
  const s2 = await scenarioEngine.assignScenario('detective', student2Session);
  const s3 = await scenarioEngine.assignScenario('detective', student3Session);

  console.log(`Student 1 received: ${s1.scenarioId} - "${s1.title}"`);
  console.log(`Student 2 received: ${s2.scenarioId} - "${s2.title}"`);
  console.log(`Student 3 received: ${s3.scenarioId} - "${s3.title}"`);

  if (s1.scenarioId !== s2.scenarioId && s2.scenarioId !== s3.scenarioId && s1.scenarioId !== s3.scenarioId) {
    console.log('✅ PASSED: Consecutive students received 3 completely distinct scenarios!');
    passed++;
  } else {
    console.error('❌ FAILED: Duplicate scenario assigned to consecutive students');
    failed++;
  }

  // Test 2: Multi-Portal Independent Isolation
  console.log('\n[TEST 2] Testing Multi-Portal Scenario Assignment...');
  const cityScenario = await scenarioEngine.assignScenario('smart-city', 'SESSION-CITY-1');
  const defenseScenario = await scenarioEngine.assignScenario('ai-defense', 'SESSION-DEF-1');
  const movieScenario = await scenarioEngine.assignScenario('last-signal', 'SESSION-MOV-1');

  console.log(`Smart City assigned: ${cityScenario.scenarioId} - "${cityScenario.title}"`);
  console.log(`AI Defense assigned: ${defenseScenario.scenarioId} - "${defenseScenario.title}"`);
  console.log(`Space Movie assigned: ${movieScenario.scenarioId} - "${movieScenario.title}"`);

  if (
    cityScenario.portal === 'smart-city' &&
    defenseScenario.portal === 'ai-defense' &&
    movieScenario.portal === 'last-signal'
  ) {
    console.log('✅ PASSED: All 4 portals assign correct portal-specific scenarios!');
    passed++;
  } else {
    console.error('❌ FAILED: Portal assignment mismatched');
    failed++;
  }

  // Test 3: Total Scenario Pool Depth Verification
  console.log('\n[TEST 3] Verifying 40+ Scenarios Depth...');
  const detectiveCount = CANONICAL_SCENARIOS.filter(s => s.portal === 'detective').length;
  const cityCount = CANONICAL_SCENARIOS.filter(s => s.portal === 'smart-city').length;
  const defenseCount = CANONICAL_SCENARIOS.filter(s => s.portal === 'ai-defense').length;
  const movieCount = CANONICAL_SCENARIOS.filter(s => s.portal === 'last-signal').length;
  const total = CANONICAL_SCENARIOS.length;

  console.log(`Detective Scenarios: ${detectiveCount} (Target: >= 10)`);
  console.log(`Smart City Scenarios: ${cityCount} (Target: >= 10)`);
  console.log(`AI Defense Scenarios: ${defenseCount} (Target: >= 10)`);
  console.log(`Space Movie Scenarios: ${movieCount} (Target: >= 10)`);
  console.log(`Total Scenario Pool: ${total} (Target: >= 40)`);

  if (detectiveCount >= 10 && cityCount >= 10 && defenseCount >= 10 && movieCount >= 10 && total >= 40) {
    console.log('✅ PASSED: Scenario pool exceeds 40+ canonical scenarios with 10+ per portal!');
    passed++;
  } else {
    console.error('❌ FAILED: Scenario count below minimum requirement of 40');
    failed++;
  }

  console.log('\n=======================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=======================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
