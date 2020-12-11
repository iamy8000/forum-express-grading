const commentService = require('../services/commentService')

let commentController = {
  postComment: (req, res) => {
    commentService.postComment(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect(`/restaurants/${data['RestaurantId']}`)
      }
    })
  },
  deleteComment: (req, res) => {
    commentService.deleteComment(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect(`/restaurants/${data['RestaurantId']}`)
      }
    })
  }
}

module.exports = commentController