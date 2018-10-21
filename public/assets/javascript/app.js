$(document).ready(function() {
  getNewsArticles();
  scrapeNewArticles();
  clearArticles();
  toggleArticleIsSavedState();
  saveArticleIconStyleToggleOnHover();
  $("[data-toggle=\"tooltip\"]").tooltip();
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
        articleContainer.append("<a href=\"./index.html\"><button type=\"button\" class=\"btn btn-primary\">Go Back to Homepage</button></a>");
      }
  }
}

function createArticleHtml(article) {
  var articleContainer = $("<div class=\"article border rounded m-1\">");
  articleContainer.append("<h4 class=\"article-headline\"><a href=\"" + article.url + "\" target=\"_blank\">" + article.headline + "</a></h4>");
  articleContainer.append("<p class=\"summary\">" + article.summary + "</p>");
  articleContainer.append("<hr>");
  var innerRow = $("<div class=\"row\">");
  innerRow.append("<div class=\"col-md-4\"><p class=\"category\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Category\">" + article.category + "</p></div>");
  innerRow.append("<div class=\"col-md-4\"><p class=\"sub-category\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Sub-category\">" + article.subCategory + "</p></div>");
  if (!article.isSaved) {
    innerRow.append("<div class=\"col-md-4\"><i class=\"fa fa-star-o fa-3x\" aria-hidden=\"true\" data-article-id=\"" + article._id + "\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Save Article!\"></i></div>");
  } else {
    innerRow.append("<div class=\"col-md-4\"><i class=\"fa fa-star fa-3x\" aria-hidden=\"true\" data-article-id=\"" + article._id + "\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Remove Article!\"></i></div>");
  }

  articleContainer.append(innerRow);

  return articleContainer;
}

function toggleArticleIsSavedState() {
  $(document).on("click", ".fa", function(event) {
    var articleId = $(this).attr("data-article-id");
    $.ajax({
      url: "/articles/save-toggle",
      type: "POST",
      data: {"articleId": articleId},
      success: function(result) {
        console.log("Toggled the isSaved variable state of the articled with id: " + articleId);
        getNewsArticles();
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert("Sorry, invalid request.");
        console.log("textStatus: " + textStatus + " errorThrown: " + errorThrown);
      }
    });
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