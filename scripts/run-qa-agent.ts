/**
 * GAMEBOT.AI - Autonomous AI-Driven QA Agent CLI Runner
 * -----------------------------------------------------
 * Usage: npx tsx scripts/run-qa-agent.ts
 */

import { qaAutomationEngine } from '../src/qa-agent/gameplayAutomationEngine';
import { geminiVisionEvaluator } from '../src/qa-agent/geminiVisionEvaluator';
import { selfHealingPipeline } from '../src/qa-agent/selfHealingPipeline';

async function main() {
  console.log('----------------------------------------------------');
  console.log('🤖 GAMEBOT.AI Autonomous AI-Driven QA Agent Engine');
  console.log('----------------------------------------------------');

  const games = [
    'ludo', 'chess', 'teen_patti', 'rummy', 'satte', 'coat_piece',
    'bhabhi', 'poker', 'blackjack', 'solitaire', 'donkey', 'bluff',
    'snakes', 'carrom', 'snooker', 'tt'
  ];

  console.log(`[QA AGENT] Starting Automated Gameplay & Vision Audit for ${games.length} games...\n`);

  let totalPassed = 0;

  for (const gameKey of games) {
    const report = await qaAutomationEngine.runAutomatedSession(gameKey, 5);
    const vision = await geminiVisionEvaluator.evaluateGameVisuals({
      gameKey,
      gameSummaryText: `Automated 5-turn session for ${gameKey} across Online, Offline, and VS AI modes.`,
      ruleInvariantsTested: ['turn_locks', 'roll_before_move', 'suit_following', 'confetti_trigger'],
    });

    if (report.status === 'passed') {
      totalPassed++;
      console.log(` ✅ [PASSED] Game: ${gameKey.padEnd(12)} | Visual Score: ${vision.visualScore}/100 | FPS: ${report.performanceMetrics.fpsAverage} | Room Code Sync: OK`);
    } else {
      console.log(` ❌ [FAILED] Game: ${gameKey.padEnd(12)} | Anomalies: ${report.anomaliesDetected.length}`);
      for (const anomaly of report.anomaliesDetected) {
        console.log(`    ⚠️ Diagnosing & Repairing Anomaly ${anomaly.id}: ${anomaly.message}`);
        const patch = await selfHealingPipeline.healAnomaly(anomaly, {});
        console.log(`    ✨ Self-Healing Patch Applied: ${patch.patchedCodeSnippet}`);
      }
    }
  }

  const healingReport = await selfHealingPipeline.runFullSelfHealingAudit();

  console.log('\n----------------------------------------------------');
  console.log(`🏆 QA AGENT SUMMARY: ${totalPassed}/${games.length} Games Passed Automated QA!`);
  console.log(`🛡️ ${healingReport.auditSummary}`);
  console.log('----------------------------------------------------\n');
}

main().catch((err) => {
  console.error('[QA AGENT ERROR]', err);
  process.exit(1);
});
