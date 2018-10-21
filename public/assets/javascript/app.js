$(document).ready(function() {
  getNewsArticles(populateNewsContainer);
  scrapeNewArtiles();
  clearArticles();
  saveArticleIconStyleToggleOnHover();
  $("[data-toggle=\"tooltip\"]").tooltip();
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
  articleContainer.append("<hr>");
  var innerRow = $("<div class=\"row\">");
  innerRow.append("<div class=\"col-md-4\"><p class=\"category\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Category\">" + article.category + "</p></div>");
  innerRow.append("<div class=\"col-md-4\"><p class=\"sub-category\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Sub-category\">" + article.subCategory + "</p></div>");
  /*
  window.location.pathname
"/saved-articles.html"
  */
  if (!article.isSaved) {
    innerRow.append("<div class=\"col-md-4\"><i class=\"fa fa-star-o fa-3x\" aria-hidden=\"true\" data-article-id=\"" + article._id + "\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Save Article!\"></i></div>");
  } else {
    innerRow.append("<div class=\"col-md-4\"><i class=\"fa fa-star fa-3x\" aria-hidden=\"true\" data-article-id=\"" + article._id + "\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Remove Article!\"></i></div>");
  }

  articleContainer.append(innerRow);
  // articleContainer.append("<p>" + article.isSaved + "</p>");
  // articleContainer.append("<p>" + article._id + "</p>");
  return articleContainer;
}

function saveArticleIconStyleToggleOnHover() {
  $(document).on("mouseenter", ".fa", function(event) {
    console.log("inside mouseenter");
    if ($(this).hasClass("fa-star")) {
      $(this).removeClass("fa-star");
      $(this).addClass("fa-star-o");
    } else if ($(this).hasClass("fa-star-o")) {
      $(this).removeClass("fa-star-o");
      $(this).addClass("fa-star");
    }
  });
  $(document).on("mouseleave", ".fa", function(event) {
    console.log("inside mouseleave");
    if ($(this).hasClass("fa-star")) {
      $(this).removeClass("fa-star");
      $(this).addClass("fa-star-o");
    } else if ($(this).hasClass("fa-star-o")) {
      $(this).removeClass("fa-star-o");
      $(this).addClass("fa-star");
    }
  });
}