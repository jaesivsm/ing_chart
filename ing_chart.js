datas = [];
grouped = {datas: {}, dates: []};
var color_codes = {};
function stringToColorCode(str) {
  // from http://stackoverflow.com/questions/17845584/converting-a-random-string-into-a-hex-colour
  return (str in color_codes) ? color_codes[str] : (color_codes[str] = '#'+ ('000000' + (Math.random()*0xFFFFFF<<0).toString(16)).slice(-6));
}
function toDate(str) {
  var splited = str.split('/');
  return new Date(parseInt(splited[2]),
                  parseInt(splited[1]) - 1, // fuck you javascript
                  parseInt(splited[0]));
}
function extractData() {
  var lines = [];
  var reader = new FileReader();
  reader.readAsText($("#ing_csv").get(0).files[0], 'ISO-8859-1');
  reader.onload = function(e) {
    parseLines(e.target.result.split("\n"));
    agregate(true);
  }
}
function parseLines(lines) {
  datas = [];
  var lines;
  var earliest = new Date();
  var latest = new Date();
  for(var i=0; i < lines.length; i++) {
    if(lines[i] == "") {continue;}
    datas[i] = {};
    line = lines[i].split(";");
    datas[i].date = {str: line[0], obj: toDate(line[0])};
    if(datas[i].date.obj<earliest){var earliest=datas[i].date.obj;}
    if(datas[i].date.obj>latest){var latest=datas[i].date.obj;}
    datas[i].amount = parseFloat(line[3].replace(",", "."));
    if(line[5] == '') {
      datas[i].category = '_no_category_';
    } else {
      datas[i].category = line[5];
    }
  }
  $('input[name=start]').val(earliest.toLocaleDateString());
  $('input[name=stop]').val(latest.toLocaleDateString());
  return datas;
}
function agregate(init) {
  grouped = {datas: {}, dates: []};
  var line_date, line_date_obj;
  var passed_date = [];
  var only = $('input[type=radio][name=only]:checked').val();
  var period = $('input[type=radio][name=agreg]:checked').val();
  for(var i=0; i < datas.length; i++){
    if(!(datas[i].category in grouped.datas)) {
      grouped.datas[datas[i].category] = {};
    }

    if(period == 'month') {
      line_date = datas[i].date.str.slice(3);
    } else if(period == 'year') {
      line_date = datas[i].date.str.slice(6);
    } else {
      line_date = datas[i].date.str;
    }

    if(!(line_date in grouped.datas[datas[i].category])) {
      grouped.datas[datas[i].category][line_date] = 0.0;
    }
    if(only=='both' || only=='spending' && datas[i].amount < 0 || only=='earning' && datas[i].amount > 0) {
      grouped.datas[datas[i].category][line_date] += datas[i].amount;
    }
    if (passed_date.indexOf(line_date) == -1) {
      passed_date.push(line_date);
      grouped.dates.push({key: line_date, obj: datas[i].date.obj,});
    }
  }
  grouped.dates.sort(function(a, b){return a.obj - b.obj;});
  buildDataSets(init);
}
function buildDataSets(init, start, stop) {
  var charts = {labels: [], datasets: []};
  var chart_width = $(document).width() - 300;
  var chart_height = $(document).height() - 100;
  var agreg = $('input[type=radio][name=agreg]:checked').val();
  if(!start) {var start = toDate($('input[name=start]').val());}
  if(!stop) {var stop = toDate($('input[name=stop]').val());}
  $('#chart_div').show();
  $('#chart_div').empty();
  $('#menu').width(300);
  $('#chart_div').append('<canvas id="myChart" width="'+chart_width+'px" height="'+chart_height+'px"></canvas>');

  if(init) {
      $('#legend').empty().show();
      $('#menu>div').show();
  }
  function shouldPass(date, start, stop, agreg) { // we can't be more precise than the agregagtion
    if(agreg=='day'){
      return date > stop || date < start;
    } else {
      if(date.getFullYear() <= stop.getFullYear() && date.getFullYear() >= start.getFullYear()) {
        if(agreg == 'year') {
          return false;
        }
        if(start.getFullYear() == date.getFullYear() && date.getFullYear() == stop.getFullYear()) {
          return date.getMonth() < start.getMonth() || date.getMonth() > stop.getMonth();
        } else if(start.getFullYear() == date.getFullYear()){
          return date.getMonth() < start.getMonth();
        } else if(date.getFullYear() == stop.getFullYear()) {
          return date.getMonth() > stop.getMonth();
        } else {
          return false;
        }
      }
    }
    return true;
  }
  for(var i=0; i < grouped.dates.length; i++){
    if(shouldPass(grouped.dates[i].obj, start, stop, agreg)) {continue;}
    charts.labels.push(grouped.dates[i].key);
  }
  for(var category in grouped.datas){
    if(!init && !($('input[type=checkbox][name="'+category+'"]')[0].checked)) {continue;}
    charts.datasets.push({
      data: [],
      strokeColor : stringToColorCode(category),
      pointColor : stringToColorCode(category),
      pointStrokeColor : stringToColorCode(category),
    });
    if(init) {
      $('#legend').append("<li style='color:"+stringToColorCode(category)+"'><input type='checkbox' id='"+category.replace(' ', '_')+"'  name='"+category+"' class='category' onchange='buildDataSets(false)' checked><label for='"+category.replace(' ', '_')+"'>"+category+"</label></li>");
    }
    for(var i=0; i < grouped.dates.length; i++){
      if(shouldPass(grouped.dates[i].obj, start, stop, agreg)) {continue;}
      var value = 0;
      if(grouped.dates[i].key in grouped.datas[category]){
        value = grouped.datas[category][grouped.dates[i].key] * -1;
      }
      charts.datasets[charts.datasets.length-1].data.push(value);
    }
  }
  var ctx = document.getElementById("myChart").getContext("2d");
  var options = {scaleOverlay: true, animationSteps: 12, datasetFill: false};
  if($('input[name=chart]:checked').val() == 'pie') { // FIXME should be done at agregagtion level
    var pie_chart = [];
    for(i=0;i<charts.datasets.length;i++){
        var total = 0;
        $.each(charts.datasets[i].data,function(){total += this;});
        if(total < 0){total = total*-1;}
        else if (total == 0) {continue;}
        pie_chart.push({value: parseInt(total), color: charts.datasets[i].pointColor,});
    }
    new Chart(ctx).Pie(pie_chart, options);
  } else {
    new Chart(ctx).Line(charts, options);
  }
}
