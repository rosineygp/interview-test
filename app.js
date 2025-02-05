var fs = require('fs');

function pilotFilter(pilotId, list) {
  return list.filter(function (a) {
    return a.code === pilotId
  }).sort(function (a, b) {
    return a.lap - b.lap
  })
}

function laps(pilotRace) {
  return pilotRace.length
}

function bestLap(pilotRace) {
  return pilotRace.sort(function(a, b){
    return a.laptime - b.laptime
  }).shift().laptime
}

function bestRaceLap(race){
  return race.sort(function (a, b){
    return a.best - b.best
  }).shift()
}

function raceMediaSpeed(pilotRace) {
  return (pilotRace.map(function (el) {
    return el.media
  }).reduce(function (a, b) {
    return a + b
  }, 0) / pilotRace.length)
}


function name(pilotRace) {
  return pilotRace[0].pilot
}

function totalTime(pilotRace) {
  return pilotRace.map(function (el) {
    return el.laptime
  }).reduce(function (a, b) {
    return (a + b)
  })

}

fs.readFile(__dirname + '/data.txt', function (err, data) {
  if (err) {
    throw err;
  }

  //file cleanup
  csv = data.toString()
    .trim()
    .replace(/–/g, '')
    .replace(/\ +/g, ';')
    .replace(/\t+/g, ';')
    .replace(/\;\;/g, ';')

  var list = []
  var code = []
  var result = []
  csv.split("\n").forEach(function (element, index) {

    line = element.split(";")

    if (line[4].length == 8)
      line[4] = '0' + line[4];

    list[index] = {
      'time': new Date('1970-01-01T' + line[0] + 'Z'),
      'code': line[1],
      'pilot': line[2],
      'lap': line[3],
      'laptime': new Date('1970-01-01T00:' + line[4] + 'Z').getTime(),
      'media': parseFloat(line[5].replace(/,/g, "."))
    }

    code.push(line[1].toString())

  });

  code = [...new Set(code)] //unique values

  code.forEach(function (element, index) {
    let pilotRace = pilotFilter(element, list)

    result[index] = {
      code: element,
      name: name(pilotRace),
      laps: laps(pilotRace),
      time: totalTime(pilotRace),
      best: bestLap(pilotRace),
      media: raceMediaSpeed(pilotRace)
    }
  })

  result.sort(function(a, b){
    return a.time - b.time
  }).forEach(function(element, index){
    element['position'] = index + 1
  })

 result.forEach(function(element, index){
   element['elapsed_time'] = element.time - result[0].time
 })

  // printing results

  console.log("Posiçao de chegada \tCódigo do Piloto \tNome do Piloto \tQtde Voltas Completadas \tTempo Total de Prova \tMelhor Volta \tVelocidade Média \tTempo de atraso")

  result.forEach(function(element){
    let td = new Date(element.time) //total time
    let bp = new Date(element.best) // melhor volta
    let el = new Date(element.elapsed_time) //tempo decorrido
    console.log(
      element.position + "\t\t\t" +
      element.code + "\t\t\t" +
      element.name + " \t" +
      element.laps + "\t\t\t\t" +
      td.getMinutes() + ':' + td.getSeconds() + '.' + td.getMilliseconds() + " \t\t" +
      bp.getMinutes() + ':' + bp.getSeconds() + '.' + bp.getMilliseconds() + "\t\t" +
      element.media.toFixed(3) + '\t\t\t' +
      "+" + el.getMinutes() + ':' + el.getSeconds() + '.' + el.getMilliseconds()
    )
  })

  brl = bestRaceLap(result) //best race lap result
  brlt = new Date(brl.best) //best race lap time

  console.log(
    "\n" +
    "Melhor Volta:\n" +
    "Piloto: " + brl.name + ", " +
    "Tempo da Volta " +  brlt.getMinutes() + ':' + brlt.getSeconds() + '.' + brlt.getMilliseconds()
  )
});