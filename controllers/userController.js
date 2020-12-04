const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const bcrypt = require('bcryptjs')
const db = require('../models')
const fs = require('fs')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const helper = require('../_helpers')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不符！')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '此信箱已註冊過！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          })
            .then(user => {
              req.flash('success_messages', '成功註冊帳號！')
              return res.redirect('/signin')
            })
        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res) => {
    Comment.findAll({
      raw: true,
      nest: true,
      where: { UserId: req.params.id },
      include: [Restaurant]
    }).then(comments => {
      return User.findByPk(req.params.id, { raw: true })
        .then(user => {
          return res.render('user/profile', { profile: user, comments: comments })
        })
    })

  },
  editUser: (req, res) => {
    return User.findByPk(req.params.id, { raw: true })
      .then(user => {
        return res.render('user/editUser', { user: user })
      })
  },
  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "請輸入name!")
      return res.redirect('back')
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
            req.flash('success_messages', 'user was successfully to update')
            res.redirect(`/users/${req.params.id}`)
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
          req.flash('success_messages', 'user was successfully to update')
          res.redirect(`/users/${req.params.id}`)
        })
    }

  },
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then((restaurant) => {
        return res.redirect('back')
      })
  },
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            return res.redirect('back')
          })
      })
  },
  likeRest: (req, res) => {
    const user = helper.getUser(req)
    return Like.create({
      UserId: user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(() => {
        return res.redirect('back')
      })
  },
  unlikeRest: (req, res) => {
    const user = helper.getUser(req)
    return Like.findOne({
      where: {
        UserId: user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        like.destroy()
          .then(() => {
            return res.redirect('back')
          })
      })
  },
  getTopUser: (req, res) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(user => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowerd: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
  }
}

module.exports = userController