$(document).ready(function() {
  getNewsArticles();
  scrapeNewArticles();
  clearArticles();
  toggleArticleIsSavedState();
  saveArticleIconStyleToggleOnHover();
  $("[data-toggle=\"tooltip\"]").tooltip();
  showArticleComments();
  saveNewComment();
});

function scrapeNewArticles() {
  $(document).on("click", "#scrape-new-articles", function(event) {
    $.ajax({
      url: "/scrape-new-articles",
      success: function() {
        getNewsArticles();
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert("Sorry, invalid request.");
        console.log("textStatus: " + textStatus + " errorThrown: " + errorThrown);
      }
    });
  });
}

function clearArticles() {
  $(document).on("click", "#clear-articles", function(event) {
    $.ajax({
      url: "/clear-articles",
      success: function() {
        getNewsArticles();
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert("Sorry, invalid request.");
        console.log("textStatus: " + textStatus + " errorThrown: " + errorThrown);
      }
    });
  });
}

function getNewsArticles() {
  var articleSearchUrl = "/articles";
  if (window.location.pathname === "/index.html") {
    articleSearchUrl = "/articles/unsaved";
  } else if (window.location.pathname === "/saved-articles.html") {
    articleSearchUrl = "/articles/saved";
  }
  $.ajax({
    url: articleSearchUrl,
    success: function(articles) {
      populateNewsContainer(articles);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      alert("Sorry, invalid request.");
      console.log("textStatus: " + textStatus + " errorThrown: " + errorThrown);
    }
  });
}

function populateNewsContainer(articles) {
  var articleContainer = $("#articleContainer");
  articleContainer.empty();
  if (articles.length) {
    articles.forEach(function(article) {
      var articleHtml = createArticleHtml(article);
      articleContainer.append(articleHtml);
    });
  } else {
      if (window.location.pathname === "/index.html") {
        articleContainer.append("<h3>Uh Oh. Looks like we don't have any new articles at this time.</h3>");
      } else if (window.location.pathname === "/saved-articles.html") {
        articleContainer.append("<h3>Uh Oh. Looks like we don't have any saved articles at this time.</h3>");
        articleContainer.append("<a href=\"./index.html\"><button type=\"button\" class=\"btn btn-primary\">Browse Scraped Articles</button></a>");
      }
  }
}

function createArticleHtml(article) {
  var articleContainer = $("<div class=\"article border rounded m-1\">");
  articleContainer.append("<h4 class=\"article-headline\"><a href=\"" + article.url + "\" target=\"_blank\">" + article.headline + "</a></h4>");
  articleContainer.append("<p class=\"summary\">" + article.summary + "</p>");
  articleContainer.append("<hr>");
  var innerRow = $("<div class=\"row\">");

  if (window.location.pathname === "/index.html") {
    innerRow.append("<div class=\"col-md-4\"><p class=\"category\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Category\">" + article.category + "</p></div>");
    innerRow.append("<div class=\"col-md-4\"><p class=\"sub-category\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Sub-category\">" + article.subCategory + "</p></div>");
    innerRow.append("<div class=\"col-md-4\"><i class=\"fa fa-star-o fa-3x save-article\" aria-hidden=\"true\" data-article-id=\"" + article._id + "\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Save Article!\"></i></div>");
  } else if (window.location.pathname === "/saved-articles.html") {
    innerRow.append("<div class=\"col-md-3\"><p class=\"category\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Category\">" + article.category + "</p></div>");
    innerRow.append("<div class=\"col-md-3\"><p class=\"sub-category\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Sub-category\">" + article.subCategory + "</p></div>");
    innerRow.append("<div class=\"col-md-3\"><i class=\"fa fa-star fa-3x save-article\" aria-hidden=\"true\" data-article-id=\"" + article._id + "\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Remove Article!\"></i></div>");
    innerRow.append("<div class=\"col-md-3\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Comments For The Article!\"><i class=\"fa fa-comments fa-3x\" aria-hidden=\"true\" data-article-id=\"" + article._id + "\" data-toggle=\"modal\" data-target=\"#comment-modal\"></i></div>");
  }

  articleContainer.append(innerRow);

  return articleContainer;
}

function toggleArticleIsSavedState() {
  $(document).on("click", ".save-article", function(event) {
    var articleId = $(this).attr("data-article-id");
    $.ajax({
      url: "/articles/save-toggle",
      type: "POST",
      data: {"articleId": articleId},
      success: function(result) {
        console.log("Toggled the isSaved variable state of the article with id: " + articleId);
        getNewsArticles();
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert("Sorry, invalid request.");
        console.log("textStatus: " + textStatus + " errorThrown: " + errorThrown);
      }
    });
  });
}

function showArticleComments() {
  $(document).on("click", ".fa-comments", function(event) {
    var articleId = $(this).attr("data-article-id");
    $("#comment-modal-title").text("Comments For Article: " + articleId);
    $.ajax({
      url: "/articles/comments/" + articleId,
      success: function(articleWithPopulatedComments) {
        console.log("Article with populated comments: " + JSON.stringify(articleWithPopulatedComments));
        /*
        sample output of the above console.log =>
        Article with populated comments: {"comments":[{"_id":"5bcd6061266b142ff36a76b0","commentText":"This is the first comment","__v":0},{"_id":"5bcd60a685732f2ff5967abb","commentText":"This is the first comment","__v":0},{"_id":"5bcd615b684c942ffc4caf7a","commentText":"This is the first comment","__v":0},{"_id":"5bcd616b25f6a02ffea7ccb6","commentText":"This is the first comment","__v":0},{"_id":"5bcd618459ff0430016cd925","commentText":"This is the first comment","__v":0}],"_id":"5bcce82ec195d72e325f6ef1","headline":"‘We are more than mercury’: The youth from a place known for poisoned land and water are sending a message","summary":"The Anishinabek community in northwestern Ontario has been famous for the wrong reasons. Now its youth are sending a message to anyone willing to listen.","category":"NEWS","subCategory":"CANADA","isSaved":true,"url":"https://www.thestar.com/news/canada/2018/10/21/we-are-more-than-mercury-the-youth-from-a-place-known-for-poisoned-land-and-water-are-sending-a-message.html","__v":0}
        */
        var commentListing = $("#comment-listing");
        commentListing.empty();
        var commentsArray = articleWithPopulatedComments.comments;
        commentsArray.forEach(function(comment) {
          commentListing.append("<p>" + comment.commentText + "</p>");
        });
        $("#new-comment").attr("data-article-id", articleId);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert("Sorry, invalid request.");
        console.log("textStatus: " + textStatus + " errorThrown: " + errorThrown);
      }
    });
  });
}

function saveNewComment() {
  $(document).on("click", "#save-comment-submit", function(event) {
    var newComment = $("#new-comment");
    if (newComment.val()) {
      var articleId = newComment.attr("data-article-id");
      $.ajax({
        url: "/articles/" + articleId,
        type: "POST",
        data: {"commentText": newComment.val().trim()},
        success: function(articleWithUpdatedComments) {
          console.log("Article with updated comments: " + JSON.stringify(articleWithUpdatedComments));
          newComment.val("");
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          alert("Sorry, invalid request.");
          console.log("textStatus: " + textStatus + " errorThrown: " + errorThrown);
        }
      });
    }
  });
}

function saveArticleIconStyleToggleOnHover() {
  $(document).on("mouseenter", ".fa", function(event) {
    if ($(this).hasClass("fa-star")) {
      $(this).removeClass("fa-star");
      $(this).addClass("fa-star-o");
    } else if ($(this).hasClass("fa-star-o")) {
      $(this).removeClass("fa-star-o");
      $(this).addClass("fa-star");
    }
  });
  $(document).on("mouseleave", ".fa", function(event) {
    if ($(this).hasClass("fa-star")) {
      $(this).removeClass("fa-star");
      $(this).addClass("fa-star-o");
    } else if ($(this).hasClass("fa-star-o")) {
      $(this).removeClass("fa-star-o");
      $(this).addClass("fa-star");
    }
  });
}