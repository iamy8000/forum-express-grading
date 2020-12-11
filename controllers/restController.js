const restService = require('../services/restService')

const restController = {
  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, (data) => {
      return res.render('restaurants', data)
    })
  },
  getRestaurant: (req, res) => {
    restService.getRestaurant(req, res, (data) => {
      return res.render('restaurant', data)
    })
  },
  getFeeds: (req, res) => {
    restService.getFeeds(req, res, (data) => {
      return res.render('feeds', data)
    })
  },
  getDashboard: (req, res) => {
    return Promise.all([
      Comment.findAndCountAll({
        where: { RestaurantId: req.params.id },
        include: [Restaurant],
      }),
      Restaurant.findByPk(req.params.id, {
        include: [Category]
      }),
      Favorite.findAndCountAll({
        where: { RestaurantId: req.params.id },
      })
    ])
      .then(([comment, restaurant, favorite]) => {
        return res.render('restDashboard', {
          comment: comment,
          restaurant: restaurant.toJSON(),
          favorite: favorite
        })
      })
  },
  getTopRest: (req, res) => {
    return Restaurant.findAll({
      include: [
        { model: User, as: 'FavoritedUsers' }
      ],
      order: [['name', 'DESC']]
    }).then(restaurants => {
      restaurants = restaurants.map(restaurant => ({
        ...restaurant.dataValues,
        description: restaurant.dataValues.description.substring(0, 50),
        FavoritedUsersCount: restaurant.FavoritedUsers.length,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(restaurant.id),
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(restaurant.id)
      }))
      restaurants = restaurants.sort((a, b) => b.FavoritedUsersCount - a.FavoritedUsersCount)
      restaurants = restaurants.slice(0, 10)
      return res.render('topRest', {
        restaurants: restaurants,
      })
    })
  }
}
module.exports = restController