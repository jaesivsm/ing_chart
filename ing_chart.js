datas = [];
grouped = {datas: {}, dates: []};
function selectAllCategories() {
  for(var i=0; i<$('.category').length; i++) {
    $('.category')[i].checked = true;
  }
}
var color_codes = {};
function stringToColorCode(str) {
  // from http://stackoverflow.com/questions/17845584/converting-a-random-string-into-a-hex-colour
  return (str in color_codes) ? color_codes[str] : (color_codes[str] = '#'+ ('000000' + (Math.random()*0xFFFFFF<<0).toString(16)).slice(-6));
}
function extractData() {
  var lines = [];
  var reader = new FileReader();
  reader.readAsText($("#ing_csv").get(0).files[0], 'ISO-8859-1');
  reader.onload = function(e) {
    parseLines(e.target.result.split("\n"));
    agregate('month', true);
  }
}
function parseLines(lines) {
  datas = [];
  var lines;
  for(var i=0; i < lines.length; i++) {
    if(lines[i] == "") {continue;}
    datas[i] = {};
    line = lines[i].split(";");
    datas[i]['date'] = line[0];
    datas[i]['amount'] = parseFloat(line[3].replace(",", "."));
    datas[i]['category'] = line[5];
  }
  return datas;
}
function agregate(period, init) {
  grouped = {datas: {}, dates: []};
  var line_date, line_date_obj;
  var passed_date = [];
  for(var i=0; i < datas.length; i++){
    if(!(datas[i]['category'] in grouped['datas'])) {
      grouped['datas'][datas[i]['category']] = {};
    }

    if(period == 'month') {
      line_date = datas[i]['date'].slice(3);
      line_date_obj = line_date.split('/')
      line_date_obj = new Date(parseInt(line_date_obj[1]), parseInt(line_date_obj[0]));
    } else if(period == 'year') {
      line_date = datas[i]['date'].slice(6);
      line_date_obj = new Date(parseInt(line_date));
    } else {
      line_date = datas[i]['date'];
      line_date_obj = line_date.split('/')
      line_date_obj = new Date(parseInt(line_date_obj[2]), parseInt(line_date_obj[1]), parseInt(line_date_obj[0]));
    }

    if(!(line_date in grouped['datas'][datas[i]['category']])) {
      grouped['datas'][datas[i]['category']][line_date] = 0.0;
    }
    grouped['datas'][datas[i]['category']][line_date] += datas[i]['amount'];
    if (passed_date.indexOf(line_date) == -1) {
      passed_date.push(line_date);
      grouped.dates.push({key: line_date, obj: line_date_obj});
    }
  }
  grouped['dates'].sort(function(a, b){return a.obj - b.obj;});
  buildDataSets(init);
}
function buildDataSets(init) {
  var charts = {labels: [], datasets: []};

  if(init) {
      $('#legend').empty();
      $('input[type=button]').show();
  }
  for(var i=0; i < grouped['dates'].length; i++){
    charts.labels[charts.labels.length] = grouped['dates'][i]['key'];
  }
  for(var category in grouped['datas']){
    if(!init && !($('input[type=checkbox][name="'+category+'"]')[0].checked)) {
      continue;
    }
    charts.datasets.push({
      data: [],
      strokeColor : stringToColorCode(category),
      pointColor : stringToColorCode(category),
      pointStrokeColor : stringToColorCode(category),
    });
    if(init) {
      $('#legend').append("<li style='color:"+stringToColorCode(category)+"'><input type='checkbox' name='"+category+"' class='category' onchange='buildDataSets(false)' checked>"+category+"</li>");
    }
    for(var i=0; i < grouped['dates'].length; i++){
      var value = 0;
      if(grouped['dates'][i]['key'] in grouped['datas'][category]){
        value = grouped['datas'][category][grouped['dates'][i]['key']] * -1;
      }
      charts.datasets[charts.datasets.length-1].data.push(value);
    }
  }
  var ctx = document.getElementById("myChart").getContext("2d");
  var myNewChart = new Chart(ctx).Line(charts, {animationSteps: 12, datasetFill: false});
}
