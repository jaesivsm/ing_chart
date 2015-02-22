datas = [];
grouped = {datas: {}, dates: []};
var color_codes = {};
function stringToColorCode(str) {
  // from http://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
  var hash, colour;
  for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
  for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
  return colour;
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
  reader.onload = function(e) {
    parseLines(e.target.result.split("\n"));
    agregate(true);
  }
}
function parseLines(lines) {
  datas = [];
  var lines;
  var earliest = new Date();
  var latest = new Date();
  for(var i=0; i < lines.length; i++) {
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
function getYearWeekNo(date) {
  return Math.ceil((((date - new Date(date.getFullYear(), 0, 1)) / 86400000) + 1) / 7)
}
function agregDate(date, agreg) {
  line_date = date.getFullYear() * 10000;
  if(agreg == 'day') {
    line_date += date.getMonth() * 100 + date.getDate();
  } else if(agreg == 'week') {
    line_date += getYearWeekNo(date);
  } else if(agreg == 'month') {
    line_date += date.getMonth();
  } else if(agreg == 'bi') {
    line_date += parseInt(date.getMonth() / 2) + 1;
  } else if(agreg == 'tri') {
    line_date += parseInt(date.getMonth() / 3) + 1;
  } else if(agreg == 'six') {
    line_date += parseInt(date.getMonth() / 6) + 1;
  }
  return line_date;
}
function isInTimeRange(date, start, stop, agreg) { // we can't be more precise than the agregagtion
  return agregDate(start, agreg) <= date && date <= agregDate(stop, agreg);
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

    line_date = agregDate(datas[i].date.obj, period);

    if(!(line_date in grouped.datas[datas[i].category])) {
      grouped.datas[datas[i].category][line_date] = 0.0;
    }
    if(only=='both' || only=='spending' && datas[i].amount < 0 || only=='earning' && datas[i].amount > 0) {
      grouped.datas[datas[i].category][line_date] += datas[i].amount;
    }
    if (passed_date.indexOf(line_date) == -1) {
      if(period == 'week') {
        line_key = "w" + getYearWeekNo(datas[i].date.obj) + datas[i].date.str.slice(5);
      } else if(period == 'month') {
        line_key = datas[i].date.str.slice(3);
      } else if(period == 'six') {
        line_key = "sem" + (parseInt(datas[i].date.obj.getMonth() / 6) + 1) + datas[i].date.str.slice(5);
      } else if(period == 'tri') {
        line_key = "trim" + (parseInt(datas[i].date.obj.getMonth() / 3) + 1) + datas[i].date.str.slice(5);
      } else if(period == 'bi') {
        line_key = "bim" + (parseInt(datas[i].date.obj.getMonth() / 2) + 1) + datas[i].date.str.slice(5);
      } else if(period == 'year') {
        line_key = datas[i].date.str.slice(6);
      } else {
        line_key = datas[i].date.str;
      }

      passed_date.push(line_date);
      grouped.dates.push({key: line_key, num: line_date});
    }
  }
  grouped.dates.sort(function(a, b){return a.num - b.num;});
  buildDataSets(init);
}
function buildDataSets(init, start, stop) {
  var charts;
  var chart_width = $(document).width() - 300;
  var chart_height = $(document).height() - 100;
  var agreg = $('input[type=radio][name=agreg]:checked').val();
  var pie_chart = $('input[name=chart]:checked').val() == 'pie';
  if(!start) {var start = toDate($('input[name=start]').val());}
  if(!stop) {var stop = toDate($('input[name=stop]').val());}
  $('#chart_div').show();
  $('#chart_div').empty();
  $('#menu').width(300);
  $('#chart_div').append('<canvas id="myChart" width="'+chart_width+'px" height="'+chart_height+'px"></canvas>');

  if(init) {
      $('#legend').empty().show();
      $('#menu>div').show();
  }
  if(pie_chart) {
    charts = [];
  } else {
    charts = {labels: [], datasets: []};
    for(var i=0; i < grouped.dates.length; i++){
      if(isInTimeRange(grouped.dates[i].num, start, stop, agreg)) {charts.labels.push(grouped.dates[i].key);}
    }
  }
  for(var category in grouped.datas){
    if(!init && !($('input[type=checkbox][name="'+category+'"]')[0].checked)) {continue;}
    if(pie_chart) {
      charts.push({value: 0, color: stringToColorCode(category)});
    } else {
      charts.datasets.push({
        data: [],
        strokeColor : stringToColorCode(category),
        pointColor : stringToColorCode(category),
        pointStrokeColor : stringToColorCode(category),
      });
    }
    if(init) {
      $('#legend').append($('<li />').css('color', stringToColorCode(category)).append(
        $("<input type='checkbox' class='category' checked />").attr('id', category.replace(' ', '_')).attr('name', category)).append(
        $("<label />").attr('for', category.replace(' ', '_')).text(category)));
    }
    for(var i=0; i < grouped.dates.length; i++){
      if(isInTimeRange(grouped.dates[i].num, start, stop, agreg)) {
        if(grouped.dates[i].num in grouped.datas[category]){
          if(pie_chart) {
            charts[charts.length-1].value += grouped.datas[category][grouped.dates[i].num];
          } else {
            charts.datasets[charts.datasets.length-1].data.push(grouped.datas[category][grouped.dates[i].num] * -1);
          }
        } else if(!pie_chart) {
          charts.datasets[charts.datasets.length-1].data.push(0);
        }
      }
    }
  }
  var ctx = document.getElementById("myChart").getContext("2d");
  var options = {scaleOverlay: true, animationSteps: 12, datasetFill: false};
  if(pie_chart) {
    new Chart(ctx).Pie(charts, options);
  } else {
    new Chart(ctx).Line(charts, options);
  }
}
