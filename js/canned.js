(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  //close the side bar when it's open and you click outside it
  $(window).click(function(event) {
    if(!event.target.classList.contains('stopProp')){
      if(event.target.id !== 'mCSB_1'){
        $('#sidebarNav').removeClass('active');
        }
      }  
    });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#sideNav'
  });
  
  //Initilaize custom scroll bar
  $("#sidebarNav").mCustomScrollbar({
    theme: "minimal"
  });

  
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })

  //SidebarNav Toggle
  $('#dismiss, .overlay').on('click', function () {
    // hide sidebar
    $('#sidebarNav').removeClass('active');
    // hide overlay
    $('.overlay').removeClass('active');
  });

  $('#sidebarNavCollapse').on('click', function () {
    //Open or close nav bar
    $('#sidebarNav').toggleClass('active');
    $('#content').toggleClass('active');
    $('.overlay').addClass('active');
    // close dropdowns
    $('.collapse.in').toggleClass('in');
    // and also adjust aria-expanded attributes we use for the open/closed arrows
    // in our CSS
    $('a[aria-expanded=true]').attr('aria-expanded', 'false');
  });


})(jQuery); // End of use strict
