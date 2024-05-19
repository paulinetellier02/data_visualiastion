console.log("Hello")
async function fetchData(){
    url="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    const reponse=await fetch(url);
    const data =await reponse.json();
    return data;
}

function processData(geoData){
    //map list[a] => list[b]
    return geoData.features.map(feature => {
        return {
        coordinates:feature.geometry.coordinates,
        magnitude:feature.properties.mag,
        time: new Date(feature.properties.time)}

    });
}

function plotData(earthquakeData){
    plotMap(earthquakeData);
    plotMagnitudeHistogram(earthquakeData)
    plotTimeSeries(earthquakeData)
    plotMagnitudevsDepth(earthquakeData)

}

function plotMap(earthquakeData){
    const trace1={
        type:'scattergeo',
        locationmode:'world',
        lon:earthquakeData.map(d => d.coordinates[0]),
        lat:earthquakeData.map(d => d.coordinates[1]),
        text:earthquakeData.map(d => `Magnitude: ${d.magnitude} Time : ${new Date(d.time)}`),
        marker : {
            size: earthquakeData.map(d => d.magnitude * 4),
            color: earthquakeData.map(d => d.magnitude),
            cmin:0,
            cmax:0,
            colorscale:"Viridis",
            colorbar:{
                title:"Magnitude"
            }

        }
    };

    const layout1={
        title:'Global',
        geo:{
            scope:'world',
            projection:{
                type:'natural earth'
            },
            showland:true,
            landcolor:'rgb(243,243,243)',
            countrycolor:'rgb(204,204,204)',

        }
    };
    Plotly.newPlot('earthquakePlot',[trace1],layout1);

}

function plotMagnitudeHistogram(earthquakeData){
    const magnitudes= earthquakeData.map(d => d.magnitude);
    const trace={
        x:magnitudes,
        type:'histogram',
        marker : {
            color: 'blue',
            }
        }

    const layout={
        title:'Histogram',
        xaxis:{title:'Magnitude'},
        yaxis:{title:'Frequency'}

    };
    Plotly.newPlot('MangitudeHistogram',[trace],layout);

}

function plotTimeSeries(earthquakeData){

    const dates= earthquakeData.map(d => d.time.toISOString().slice(0,10));
    const dateCounts= dates.reduce((acc,date) =>{
        acc[date]= (acc[date] || 0)+1;
        return acc;
        }, {});

    const trace={
        x:Object.keys(dateCounts),
        y:Object.values(dateCounts),
        type:'scatter',
        mode:'lines+marker',
        marker : {color: 'red',}
            };

    const layout={
        title:'Plot Time Series',
        xaxis:{title:'Date'},
        yaxis:{title:'Frequency'}

    };
    Plotly.newPlot('timeSeriePlot',[trace],layout);

}

function plotMagnitudevsDepth(earthquakeData){
    const magnitudes = earthquakeData.map(d=>d.magnitude);
    const depths=earthquakeData.map(d=>d.coordinates[2]);
    const trace={
        x:magnitudes,
        y:depths,
        mode:'markers',
        type:'scatter',
        marker:{size:8,color:'green'}
    }
    const layout={
        title:'Magnitude vs depth plot',
        xaxis:{title:'Magnitude'},
        yaxis:{title:'Depth (km)'},
        height:600
    };
    Plotly.newPlot('magnitudeDepthPlot',[trace],layout);
}



fetchData()
    .then(rawData => processData(rawData))
    .then(cleanData=>plotData(cleanData))