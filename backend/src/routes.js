const express = require('express');
const controllers = require('./controllers');

const router = express.Router();

router.post('/scan/address', controllers.scanAddress);
router.post('/ai/score', controllers.aiScore);
router.post('/agent/decision', controllers.agentDecision);
router.post('/contract/log', controllers.contractLog);
router.get('/risk/history/:address', controllers.getHistory);

module.exports = router;
