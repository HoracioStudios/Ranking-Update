
const DEBUGLOG = false;

const maxRatingPeriods = 100;
const minRD = 20;
const q = 0.0057565;

const defaultParameters = { rating: 1500, RD: 350 };

function Cvalue()
{
    return Math.sqrt((defaultParameters.RD**2 - 50**2)/maxRatingPeriods);
}

function newRD(RDold, t){
    val = Math.min(Math.sqrt(RDold**2 + Cvalue()**2*t), defaultParameters.RD);
    if (val < minRD) 
        val = minRD;
    return val;
}

function getPlayersForMatch(playerID, data){
    var playerPoints = data[playerID].rating;
    var playerRD = data[playerID].RD;

    var players = [];
    for (let i = 0; i < Object.keys(data).length; i++){
        if(data[i] != data[playerID])
        {
            //Aquí se modifican las condiciones para seleccionar qué rivales son adecuados para enfrentarse al jugador.
            if(data[i].rating >= (playerPoints - playerRD) && data[i].rating <= (playerPoints + playerRD)){
                players.push(data[i]);
            }
        }
    }

    return players;
}

function g(RD){
    return 1/(Math.sqrt((1 + 3*(q**2)*(RD**2))/Math.PI**2));
}

function E(rivalD, playerPoints, rivalPoints){
    elevateG = -g(rivalD)*(playerPoints-rivalPoints)/400;
    return 1/(1+10**elevateG);
}

function calculateD(sum){
    return 1/(q**2 * sum);
}

function getRD(RD, d){
    return Math.sqrt(1/((1/(RD**2))+(1/(d))));
}

function calculateRSum(player, rival, result)
{
    return g(rival.RD) * (result - E(rival.RD, player.rating, rival.rating));
}

function calculateDSum(player, rival)
{
    return g(rival.RD)**2 * E(rival.RD, player.rating, rival.rating) * (1 - E(rival.RD, player.rating, rival.rating));
}

function newPoints(player, rSum, dSum)
{
    let d = calculateD(dSum);

    var add = ((q/(1/(player.RD**2) + 1/d)) * rSum);
    //Actualizar valores del jugador
    var poi = (player.rating + add);

    if(DEBUGLOG)
    {
        console.log("Sum: ", sum);
        console.log("D: ", d);

        console.log("Sin sumar: ", add, " typeof: ", typeof(add));
        console.log("Player Points: ", player.rating, " typeof: ", typeof(player.rating));
        console.log("Tras sumar: ", poi, " typeof: ", typeof(poi));
    }

    let nuRD = getRD(player.RD, d);

    return [poi, nuRD];
}

function prediction(RD1, RD2, r1, r2){
    let elevateG = -g(Math.sqrt(RD1**2 + RD2**2))*(r1-r2)/400;
    return 1/(1+10**elevateG);
}

function generateGames(player, rivals){
    var playerPoints = player.rating;
    var playerRD = player.RD;

    var results = [];
    for (let i = 0; i < Object.keys(rivals).length; i++){
        var result = prediction(playerRD, rivals[i].RD, playerPoints, rivals[i].rating);
        let match = Math.random();
        if(match < result){
            results.push(1);
        } else {
            results.push(0);
        }
    }

    return results;
}

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

module.exports = { getPlayersForMatch, getRandom, generateGames, newPoints, calculateDSum, calculateRSum, newRD, defaultParameters };

//export { getPlayersForMatch, getRandom, generateGames, newPoints };