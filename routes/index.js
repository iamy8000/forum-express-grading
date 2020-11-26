const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.isAdmin) { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }

  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', authenticated, restController.getRestaurants)

  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants')) // 連到 /admin 頁面就轉到 /admin/restaurants
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)  // 在 /admin/restaurants 底下則交給 adminController.getRestaurants 處理

  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
  app.post('/admin/restaurants', authenticatedAdmin, adminController.postRestaurant)

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)
}

