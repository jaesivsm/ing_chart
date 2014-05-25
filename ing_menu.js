$(document).ready(function(){
  $('#menu').height($(document).height() - 60);
  $('#ing_csv').on('change', extractData);
  $('input[type=button][value=Tous]').on('click', function(){
    for(var i=0; i<$('.category').length; i++) {
      $('.category')[i].checked = true;
    }
    buildDataSets(false);
  });
  $('input[type=button][value=Rien]').on('click', function(){
    $('.category').removeAttr('checked');
    buildDataSets(false)
  });
  $('input[type=radio][name=chart]').on('change', function(){
    var pie_chart = $(this).attr('value') == 'pie';
    if(pie_chart && $('input[name=only]:checked').val() == 'both'){
      $('#only_both').prop('checked', '');
      $('#only_spending').prop('checked', 'checked');
      agregate(false);
    } else {
      buildDataSets(false);
    }
    if(pie_chart) {
      $('#only_both').attr('disabled', true);
      $('input[name=agreg]').attr('disabled', true);
      $('#selectors_agreg').css('color', '#777');
    } else {
      $('#only_both').attr('disabled', false);
      $('input[name=agreg]').attr('disabled', false);
      $('#selectors_agreg').css('color', '#333');
    }
  });
  $('input[type=radio]').filter('[name=only],[name=agreg]').on('change', function(){
    agregate(false);
  });
  $('#legend').on('click', 'input',function(){buildDataSets(false);});
  $('input[name=start]').datepicker({
    changeMonth: true,
    changeYear: true,
    onClose: function(){buildDataSets(false);},
  });
  $('input[name=stop]').datepicker({
    changeMonth: true,
    changeYear: true,
    onClose: function(){buildDataSets(false);},
  });
});
