import { calculateYarnCount, formatValue, classifyYarn, reverseCalculate } from './js/calculator.js';

function runTests() {
  console.log('--- Running Yarn Calculator Engine Tests ---');

  // Test 1: Standard example
  // L = 100 meters, g = 2.0 grams
  // Tex = (2 / 100) * 1000 = 20
  // eng = 590.5 / 20 = 29.525
  // Denier = 5315 / 29.525 = 179.9999... -> ~180
  // Metric = 29.525 / 0.59 = 50.04237...
  const res1 = calculateYarnCount(100, 2.0);
  console.assert(res1.isValid === true, 'Test 1 Valid failed');
  console.assert(Math.abs(res1.tex - 20) < 1e-6, `Test 1 Tex mismatch: expected 20, got ${res1.tex}`);
  console.assert(Math.abs(res1.eng - 29.525) < 1e-4, `Test 1 eng mismatch: expected 29.525, got ${res1.eng}`);
  console.assert(Math.abs(res1.denier - (5315 / 29.525)) < 1e-6, `Test 1 denier mismatch: expected ${5315 / 29.525}, got ${res1.denier}`);
  console.assert(Math.abs(res1.metric - 50.042) < 0.01, `Test 1 metric mismatch: expected ~50.042, got ${res1.metric}`);
  console.log('✅ Test 1 Passed: Standard Wrap Reel Sample (100m, 2g)');

  // Test 2: Cotton Lea Test 30s
  // L = 109.73m (120 yd), Ne = 30 -> Tex = 590.5 / 30 = 19.6833
  // g = (19.6833 * 109.73) / 1000 = 2.16g
  const res2 = calculateYarnCount(109.73, 2.16);
  console.assert(res2.isValid === true, 'Test 2 Valid failed');
  console.assert(Math.abs(res2.eng - 30) < 0.1, `Test 2 eng mismatch: expected ~30, got ${res2.eng}`);
  console.log(`✅ Test 2 Passed: Cotton Lea (Ne: ${formatValue(res2.eng, 2)}, Tex: ${formatValue(res2.tex, 2)})`);

  // Test 3: Filament Polyester 150 Denier
  // 150 Denier -> Tex = 150 / 9 = 16.6667
  // For L = 100m, g = 1.6667
  const res3 = calculateYarnCount(100, 1.6667);
  console.assert(Math.abs(res3.denier - 150) < 0.1, `Test 3 Denier mismatch: expected ~150, got ${res3.denier}`);
  console.log(`✅ Test 3 Passed: 150D Filament (Denier: ${formatValue(res3.denier, 1)}, Tex: ${formatValue(res3.tex, 2)})`);

  // Test 4: Denim Warp 10s Ne
  // L = 100m, g = 5.905g -> Tex = 59.05, Ne = 10.0
  const res4 = calculateYarnCount(100, 5.905);
  console.assert(Math.abs(res4.eng - 10.0) < 1e-4, `Test 4 eng mismatch: expected 10.0, got ${res4.eng}`);
  console.log(`✅ Test 4 Passed: Denim Warp 10s (Ne: ${formatValue(res4.eng, 2)}, Tex: ${formatValue(res4.tex, 2)})`);

  // Test 5: Edge cases (Zero, negative, invalid)
  const zeroL = calculateYarnCount(0, 5);
  console.assert(zeroL.isValid === false, 'Test 5 Zero L should be invalid');
  const negG = calculateYarnCount(100, -2);
  console.assert(negG.isValid === false, 'Test 5 Negative G should be invalid');
  const nanVal = calculateYarnCount("abc", 5);
  console.assert(nanVal.isValid === false, 'Test 5 NaN should be invalid');
  console.log('✅ Test 5 Passed: Zero, negative, and non-numeric inputs gracefully rejected');

  // Test 6: Formatting
  console.assert(formatValue(20.12345, 2) === '20.12', 'Test 6 2 decimals failed');
  console.assert(formatValue(20.12345, 4) === '20.1235', 'Test 6 4 decimals failed');
  console.assert(formatValue(null) === '--', 'Test 6 null failed');
  console.log('✅ Test 6 Passed: Formatting and precision controls');

  // Test 7: Reverse calculation
  // 30 Ne for 100m -> weight in grams?
  const rev = reverseCalculate({ type: 'eng', countValue: 30, targetLength: 100 });
  console.assert(Math.abs(rev.weightGrams - 1.968) < 0.01, `Test 7 Reverse weight failed: got ${rev.weightGrams}`);
  console.log(`✅ Test 7 Passed: Reverse calculation (30 Ne for 100m requires ${formatValue(rev.weightGrams, 3)}g)`);

  console.log('\n🎉 ALL 7 TESTS PASSED SUCCESSFULLY!');
}

runTests();
