/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const ReportsController = () => import('../app/controllers/reports_controller.ts')
const TradeController = () => import('../app/controllers/trades_controller.ts')
const ItemsPointsController = () => import('../app/controllers/items_points_controller.ts')
const SurvivorsController = () => import('../app/controllers/survivors_controller.ts')

// survivors Controller
router.post('survivor/create', [SurvivorsController, 'create'])
router.put('survivor/:name/update-location', [SurvivorsController, 'updateLocation'])
router.put('survivor/:id/report-contamination', [SurvivorsController, 'reportContamination'])

// items points Controller
router.post('item/point/create', [ItemsPointsController, 'create'])
router.put('item/point/update', [ItemsPointsController, 'update'])
router.get('item/point/list', [ItemsPointsController, 'list'])
router.delete('item/point/delete', [ItemsPointsController, 'delete'])

// trade Controller
router.post('trade/start', [TradeController, 'performTrade'])

// reports Controller
router.get('report/infected', [ReportsController, 'getInfectedSurvivors'])
router.get('report/non-infected', [ReportsController, 'getNonInfectedSurvivors'])
router.get('report/resources', [ReportsController, 'getAverageResourcesPerSurvivor'])
router.get('report/lost-points', [ReportsController, 'getLostPoints'])
