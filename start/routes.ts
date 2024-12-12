/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
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
