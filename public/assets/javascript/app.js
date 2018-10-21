$(document).ready(function() {
  getNewsArticles(populateNewsContainer);
  scrapeNewArtiles();
  clearArticles();
});

function scrapeNewArtiles() {
  $(document).on("click", "#scrape-new-articles", function(event) {
    $.ajax({
      url: "/scrape-new-articles",
      success: function() {
        getNewsArticles(populateNewsContainer);
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
        getNewsArticles(populateNewsContainer);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert("Sorry, invalid request.");
        console.log("textStatus: " + textStatus + " errorThrown: " + errorThrown);
      }
    });
  });
}

function getNewsArticles(populateNewsContainer) {
  $.ajax({
    url: "/articles",
    success: function(articles) {
      populateNewsContainer(articles);
      // console.log(articles);
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
    articleContainer.append("<h3>Uh Oh. Looks like we don't have any new articles at this time.</h3>");
  }
}

function createArticleHtml(article) {
  var articleContainer = $("<div class=\"article border rounded m-1\">");
  articleContainer.append("<h4 class=\"article-headline\"><a href=\"" + article.url + "\" target=\"_blank\">" + article.headline + "</a></h4>");
  articleContainer.append("<p class=\"summary\">" + article.summary + "</p>");
  var innerRow = $("<div class=\"row\">");
  innerRow.append("<div class=\"col-md-4\"><p class=\"category\">" + article.category + "</p></div>");
  innerRow.append("<div class=\"col-md-4\"><p class=\"sub-category\">" + article.subCategory + "</p></div>");
  /*
  window.location.pathname
"/saved-articles.html"
  */
  innerRow.append("<div class=\"col-md-4\"><button type=\"button\" class=\"btn btn-warning save-article\" data-article-id=\"" + article._id + "\">Save Article!</button></div>");
  articleContainer.append(innerRow);
  // articleContainer.append("<p>" + article.isSaved + "</p>");
  // articleContainer.append("<p>" + article._id + "</p>");
  return articleContainer;
}