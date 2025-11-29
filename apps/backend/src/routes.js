import express from 'express';
import {
  postAiScore,
  postScanAddress,
  postAgentDecision,
  postContractLog,
  getRiskHistory,
} from './controllers.js';

const router = express.Router();

router.post('/ai/score', postAiScore);
router.post('/scan/address', postScanAddress);
router.post('/agent/decision', postAgentDecision);
router.post('/contract/log', postContractLog);
router.get('/risk/history/:address', getRiskHistory);

export default router;
