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
  }

}

module.exports = userService