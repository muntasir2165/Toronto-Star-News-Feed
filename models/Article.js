var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new ArticleSchema object
var ArticleSchema = new Schema({
  // `headline` is required and of type String
  headline: {
    type: String,
    required: true
  },
  // `summmary` is required and of type String
  summary: {
    type: String,
    required: true
  },
  // `url` is required and of type String
  url: {
    type: String,
    required: true
  },
  // `category` is required and of type String
  category: {
    type: String,
    required: true
  },
  // `subCategory` is required and of type String
  subCategory: {
    type: String,
    required: true
  },
  // `isSaved` is required and of type Boolean
  isSaved: {
    type: Boolean,
    required: true
  },
  // `comments` is an array of objects that stores Comment id(s)
  // The ref property links the ObjectId to the Comment model
  // This allows us to populate the Article with associated Comment(s)
  comments: [{
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }]
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
