

$(document).on('ready', function(){

  var CONGRESS_URL = 'https://congress.api.sunlightfoundation.com';
  var API_KEY = '8d0caa0295254038a5b61878a06d80ec';
  function getLegislators(zip, cb) {
    $.getJSON(CONGRESS_URL + '/legislators/locate?apikey=' + API_KEY + '&zip=' +
      zip, function (legislators) {
      cb(legislators.results);
    });
  }
  function showLegislatorTweets(results) {
    $('.target-tweets-container').html('').hide();
    var template = $('#target-tweet-template').html();
    var message = $('#campaign-tweet-text').text();
    _.each(results, function(result){
      $('.target-tweets-container').append(_.template(template, {target: result, message: message}));
    });
    $('.target-tweets-container').slideDown(500);
  }

  $('.zipcode-form').on('submit', function(ev){
    var form = $(ev.currentTarget);
    var zipcode = $('.zipcode-input').val();
    console.log(zipcode);
    getLegislators(zipcode, function (results){
      console.log(results);
      if(results.length > 0) {
        showLegislatorTweets(results);
      } else {
        $('.target-tweets-container').html('<div class="alert alert-warning">No legislators found for this zipcode, try again please.</div>');
      }
    });
    return false;
  })

  $( "body" ).on('click', '.tweet-this', function(ev) {
      var url = $(this).attr("href");
      window.open(url,"Twitter","width=550,height=420");
      $.get('/tweeted/' + $('[data-public-code]').attr('data-public-code'), {});
      //$(ev.currentTarget).parents('.tweet-container').html('Awesome work!')
      return false;
  })

  $('textarea').autosize();
})
