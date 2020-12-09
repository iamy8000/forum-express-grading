const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const bcrypt = require('bcryptjs')
const db = require('../models')
const fs = require('fs')
const helper = require('../_helpers')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const userService = {
  getUser: (req, res, callback) => {
    Comment.findAll({
      raw: true,
      nest: true,
      where: { UserId: req.params.id },
      include: [Restaurant]
    }).then(comments => {
      return User.findByPk(req.params.id, { raw: true })
        .then(user => {
          callback({ profile: user, comments: comments })
        })
    })
  },
  editUser: (req, res, callback) => {
    return User.findByPk(req.params.id, { raw: true })
      .then(user => {
        callback({ user: user })
      })
  },
  putUser: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: '請輸入name!' })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then(user => {
            user.update({
              name: req.body.name,
              image: file ? img.data.link : user.image,
            })
          })
          .then((user) => {
            callback({ status: 'success', message: 'user was successfully to update' })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name,
            image: user.image
          })
        })
        .then((user) => {
          callback({ status: 'success', message: 'user was successfully to update' })
        })
    }
  },
  addFavorite: (req, res, callback) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        callback({ status: 'success', message: '' })
      })
  }

}

module.exports = userService