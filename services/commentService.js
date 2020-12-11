const db = require('../models')
const Comment = db.Comment

let commentService = {
  postComment: (req, res, callback) => {
    console.log(req.body)
    return Comment.create({
      text: req.body.text,
      RestaurantId: req.body.restaurantId,
      UserId: req.user.id
    })
      .then((comment) => {
        console.log('comment', comment)
        return callback({ status: 'success', message: '', RestaurantId: comment.RestaurantId })
      })
  },
  deleteComment: (req, res, callback) => {
    return Comment.findByPk(req.params.id)
      .then((comment) => {
        comment.destroy()
          .then((comment) => {
            return callback({ status: 'success', message: '', RestaurantId: comment.RestaurantId })
          })
      })
  }
}

module.exports = commentService