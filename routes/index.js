const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController')

module.exports = app => {
  app.get('/', (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', restController.getRestaurants)

  app.get('/admin', (req, res) => res.redirect('/admin/restaurants')) // 連到 /admin 頁面就轉到 /admin/restaurants
  app.get('/admin/restaurants', adminController.getRestaurants)  // 在 /admin/restaurants 底下則交給 adminController.getRestaurants 處理
}

