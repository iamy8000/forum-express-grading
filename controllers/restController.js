const db = require('../models')
const restaurant = require('../models/restaurant')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const Favorite = db.Favorite
const helpers = require('../_helpers')

const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    let offset = 0
    const whereQuery = {}
    let categoryId = ''

    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }
    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      offset: offset,
      limit: pageLimit
    }).then(result => {
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > page ? pages : page + 1

      //clean up restaurant data
      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name,
        isFavorited: helpers.getUser(req).FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: helpers.getUser(req).LikedRestaurants.map(d => d.id).includes(r.id)
      }))
      Category.findAll({
        raw: true,
        nest: true
      }).then(categories => {
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
        })
      })
    })
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' },
        { model: Comment, include: [User] },
      ]
    }).then(restaurant => {
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(helpers.getUser(req).id)
      const isLiked = restaurant.LikedUsers.map(e => e.id).includes(helpers.getUser(req).id)
      return restaurant.increment({ 'viewCounts': 1 })
        .then(restaurant => {
          return res.render('restaurant', {
            restaurant: restaurant.toJSON(),
            isFavorited: isFavorited,
            isLiked: isLiked
          })
        })
    })
  },
  getFeeds: (req, res) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
      return res.render('feeds', {
        restaurants: restaurants,
        comments: comments
      })
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