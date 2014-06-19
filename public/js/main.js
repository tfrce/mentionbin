

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
      var thanks = ['Thank you! Keep up the good work!', 'Awesome job! Make sure you share this site with friends!', 'Wonderful!', 'Excellent.', 'Share this site as well!']
      $(ev.currentTarget).parents('.tweet-container').html(thanks[Math.ceil(Math.random()*5)]);
      return false;
  })
  $( ".fblinkthis" ).click(function() {
    var url = $(this).attr("href");
    window.open(url, "Share on Facebook", "width=650,height=500");
    return false;
  })
  $( ".twlinkthis" ).click(function() {
      var url = $(this).attr("href");
      window.open(url,"Twitter","width=550,height=420");
      return false;
  })
  $( ".gpluslinkthis" ).click(function() {
      var url = $(this).attr("href");
      window.open(url,"Share on Google Plus","width=500,height=436");
      return false;
  })
  $('textarea').autosize();

  var shareUrl = window.location.href;
  $.ajax('https://d28jjwuneuxo3n.cloudfront.net/?networks=facebook,twitter,googleplus&url=' + shareUrl, {
      success: function(res, err) {
          $.each(res, function(network, value) {
              var count = value;
              if (count / 10000 > 1) {
                  count = Math.ceil(count / 1000) + 'k'
              }
              $('[data-network="' + network + '"]').attr('count', count);
          })
      },
      dataType: 'jsonp',
      cache         : true,
      jsonpCallback : 'myCallback'
  });

})
