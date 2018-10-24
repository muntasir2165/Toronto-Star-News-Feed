var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/torontoStar", { useNewUrlParser: true });

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/torontoStar";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping the Toronto Star website
app.get("/scrape-new-articles", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.thestar.com/", function(error, response, body) {

    // If the request is successful (i.e. if the response status code is 200)
    if (!error && response.statusCode === 200) {

      // Parse the body of the returned HTML and pick out the article information (headline, summary and url)
       // console.log(body);
       // console.log(body.data); // => undefined
       var $ = cheerio.load(body);
       // console.log($);
       $(".story__body span span").each(function(i, element) {
        var newArticle = {};
        newArticle.headline = null;
        newArticle.summary = null;
        newArticle.category = null;
        newArticle.subCategory = null;
        newArticle.isSaved = false;
        newArticle.url = null;
        newArticle.url = $(this).children("a").attr("href");
        if (newArticle.url && !newArticle.url.includes("http:")) {
          // category = url.split("/")[1];
          // var matchingPattern = /\/(.*?)\//;
          var splitUrl = newArticle.url.split("/");
          newArticle.category = splitUrl[1].toUpperCase();
          newArticle.subCategory = isNaN(splitUrl[2]) ? splitUrl[2].toUpperCase() : "- - -";
          newArticle.headline = $(this).children("a").children("span").text();
          if (newArticle.headline) {
            newArticle.summary = $(this).children("a").children("p").text();
            if (newArticle.summary) {
              // console.log("headline: " + newArticle.headline);
              // console.log("summary: " + newArticle.summary);
              // console.log("url: " + newArticle.url);
              // set the absolute url to the Toronto Star website
              newArticle.url = "https://www.thestar.com" + newArticle.url;
              // console.log("category: " + newArticle.category);
              // console.log("subCategory: " + newArticle.subCategory);
              // console.log("isSaved: " + newArticle.isSaved);
              // console.log();
              db.Article.find({"headline": newArticle.headline}).count()
                .then(function(count) {
                  if (count >= 1) {
                    console.log("\nThe news article with the headline '" + newArticle.headline + "' has already been scraped!\n");
                  } else {
                    db.Article.create(newArticle)
                      .then(function(dbArticle) {
                        // View the added result in the console
                        console.log("\nAdded the article with headline '" + dbArticle.headline + "' to the database!\n");
                      })
                      .catch(function(err) {
                        // If an error occurred, send it to the client
                        console.log("-".repeat(20));
                        console.log(err);
                        console.log("-".repeat(20));
                        return res.json(err);
                    });
                  }
                })
                .catch(function(err) {
                  // If an error occurred, send it to the client
                  console.log("-".repeat(20));
                  console.log(err);
                  console.log("-".repeat(20));
                  return res.json(err);
              });
            }
          }
        }
       });
      // If we were able to successfully scrape and save an Article, send a message to the client
      res.send("Scrape Complete");
    } else {
      console.log("Sorry, invalid request.\n" + "ERROR: " + error);
    // logger.error("Sorry, invalid request.\n" + "ERROR: " + error);
    }
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticles) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticles);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for getting all unsaved Articles from the db
app.get("/articles/unsaved", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({"isSaved": false})
    .then(function(dbArticles) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticles);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for getting all saved Articles from the db
app.get("/articles/saved", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({"isSaved": true})
    .then(function(dbArticles) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticles);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// A GET route for deleting all the saved articles
app.get("/clear-articles", function(req, res) {
  db.Article.remove({})
    .then(function(result) {
      console.log("-".repeat(20));
      console.log("Result of clearing all articles from the database: " + result);
      console.log("-".repeat(20));
      // If we were able to successfully delete all Articles, send a message to the client
      res.send("Deletion Complete");
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      console.log("-".repeat(20));
      console.log(err);
      console.log("-".repeat(20));
      return res.json(err);
  });
});

// Route for grabbing a specific Article by id, populate it with it's comment(s)
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the comments associated with it
    .populate("comment")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for toggling an Article's isSaved variable state
app.post("/articles/save-toggle", function(req, res) {
  // console.log(req.body.articleId);
  db.Article.find({"_id": req.body.articleId})
    .then(function(dbArticle) {
      console.log("Found Article: " + dbArticle.length); //example output => 1
      console.log("Found Article Stringify: " + JSON.stringify(dbArticle)); //example output => [{"comments":[],"_id":"5bccc9e5741b082d32bfae15","headline":"‘We are more than mercury’: The youth from a place known for poisoned land and water are sending a message","summary":"The Anishinabek community in northwestern Ontario has been famous for the wrong reasons. Now its youth are sending a message to anyone willing to listen.","category":"NEWS","subCategory":"CANADA","isSaved":true,"url":"https://www.thestar.com/news/canada/2018/10/21/we-are-more-than-mercury-the-youth-from-a-place-known-for-poisoned-land-and-water-are-sending-a-message.html","__v":0,"isaSaved":true}]
      // res.json(dbArticle);
      db.Article.update({"_id": req.body.articleId}, {$set: {"isSaved": !dbArticle[0].isSaved}})
        .then(function(dbArticleUpdated) {
          console.log("\nArticle update info:" + JSON.stringify(dbArticleUpdated) + "\n");
          res.json(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
});

// Route for grabbing a specific Article's comments
app.get("/articles/comments/:articleId", function(req, res) {
  // Using the articleId passed in the articleId parameter, prepare a query that finds the matching articleId in our db...
  db.Article.findOne({ _id: req.params.articleId })
    // ..and populate all of the comments associated with it
    .populate("comments")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

/*
//example route: http://localhost:3000/articles/comments/5bcce82ec195d72e325f6ef1/
app.get("/articles/test/comments/:articleId/", function(req, res) {
  // Using the articleId passed in the articleId parameter, prepare a query that finds the matching article in our db...
  db.Comment.create({ "commentText": "This is the first comment" })
    .then(function(dbComment) {
      // console.log(dbComment); //sample output =>  { _id: 5bcd60a685732f2ff5967abb, commentText: 'This is a comment', __v: 0 }
      // If we were able to successfully find an Article with the given id, send it back to the client
      return db.Article.findOneAndUpdate({ _id: req.params.articleId }, { $push: { comments: dbComment._id } }, { new: true }).populate("comments");
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      console.log("dbArticle: " + dbArticle);
      // sample output =>
      // { comments:
      //  [ { _id: 5bcd6061266b142ff36a76b0,
      //      commentText: 'This is a comment',
      //      __v: 0 },
      //    { _id: 5bcd60a685732f2ff5967abb,
      //      commentText: 'This is another comment',
      //      __v: 0 } ],
      // _id: 5bcce82ec195d72e325f6ef1,
      //   headline: '‘We are more than mercury’: The youth from a place known for poisoned land and water are sending a message',
      // summary: 'The Anishinabek community in northwestern Ontario has been famous for the wrong reasons. Now its youth are sending a message to anyone willing to listen.',
      // category: 'NEWS',
      // subCategory: 'CANADA',
      // isSaved: true,
      // url: 'https://www.thestar.com/news/canada/2018/10/21/we-are-more-than-mercury-the-youth-from-a-place-known-for-poisoned-land-and-water-are-sending-a-message.html',
      // __v: 0 }

      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
*/

// Route for saving a new comment for an Article
app.post("/articles/new-comment/:articleId", function(req, res) {
  // Create a new comment and pass the req.body.commentText to the entry
  db.Comment.create({"commentText": req.body.commentText})
    .then(function(dbComment) {
      // If a Comment was created successfully, find one Article with an `_id` equal to `req.params.articleId`. Update the Article to be associated with the new Comment
      // { new: true } tells the query that we want it to return the updated Article -- it returns the original by default
      return db.Article.findOneAndUpdate({ _id: req.params.articleId }, { $push: { comments: dbComment._id } }, { new: true }).populate("comments");
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for deleting a comment for an Article
app.delete("/comments/delete-comment/:articleId/:commentId", function(req, res) {
  // Create a new comment and pass the req.body.commentText to the entry
  db.Comment.findOneAndDelete({ _id: req.params.commentId })
    .then(function(result) {
      console.log("--------deletion result: " + JSON.stringify(result));
      // If a Comment was deleted successfully, find one Article with an `_id` equal to `req.params.articleId`. Update the Article by removing the deleted comment's id
      // { new: true } tells the query that we want it to return the updated Article -- it returns the original by default
      return db.Article.findOneAndUpdate({ _id: req.params.articleId }, { $pull: { comments: req.params.commendId } }, { new: true }).populate("comments");
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      console.log("--------deletion dbArticle: " + dbArticle);
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
