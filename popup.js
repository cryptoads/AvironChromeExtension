
let exportCSV = document.getElementById("toCSV");



exportCSV.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: workoutCount,
    });
  });
  


async function workoutCount(){
//csv creation function
  const makeCSV = async function(history) {
    const replacer = (key, value) => value === null ? '' : value
    const header = Object.keys(history[0])
    console.log(header)
    const csv = [header.join(','),
        ...history.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n')
  
    let csvContent = "data:text/csv;charset=utf-8," + csv
    console.log(csv)
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_data.csv");
    document.body.appendChild(link); // Required for FF
    link.click(); 
    // var metrics = await data.workoutMetrics
    // console.log(metrics)
    // const header2 = Object.keys(metrics)
    // console.log(header2)
    // const csv2 = [header2.join(','),
    //     ...metrics.map(row => header2.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    // ].join('\r\n')
  
    // console.log(csv2)
  }

    let workouts=[]
    let workouts1=[]

    //grab bearer token from the aviron page to pull user data from the api
    let bearerToken = sessionStorage.getItem('gsvToken') 
    if (!window.location.href.toString().includes('https://accounts.avironactive.com/')){
        if (window.confirm('You must be logged into your Aviron profile to continue. Click OK to be redirected to the Aviron website, Cancel to do nothing'))
        {
        window.open('https://accounts.avironactive.com/workout_history', '_blank');
        };
    }
    else if (bearerToken === null) {
        
        try {
          window.alert("Reloading your auth token, please try again")
          location.reload()
        } catch (error) {
          window.alert("you're not logged in")
        }
        
    }
    else{
        console.log(bearerToken)
    }
    
    //fetch the data
    let response = await fetch("https://social.prod.avironactive.net/v2/rpc/user_workouts_list?unwrap", {
    "headers": {
      "authorization": "Bearer "+ bearerToken.toString(),                         
      "content-type": "application/json;charset=UTF-8"
    },
    "body": "{\"timeRange\":0,\"page\":1,\"pageSize\":999999999}",
    "method": "POST"
    });
    let data = await response.json();
    const history = await data.workoutHistories
    history.forEach(element =>{
      try {
        workouts.push(element.id)
      } catch (error) {
        console.log(error)
      } 
    })

    //fetch individual workout data
    const allWorkouts =  async function(item){
      let body = JSON.stringify({
        "matchid": item
      });
      console.log(body)
      let res = await fetch("https://social.prod.avironactive.net/v2/rpc/user_workouts?unwrap", {
        "headers": {
          "authorization": "Bearer "+ bearerToken.toString(),                         
          "content-type": "application/json;charset=UTF-8"
        },
        "body": body,
        "method": "POST"
        });
        let data1 = await res.json();
        const history1 = await data1
        console.log(history1)
        // history1.forEach(element =>{
        //   try {
        //     workouts1.push(element.id)
        //   } catch (error) {
        //     console.log(error)
        //   } 
        // });
      }
workouts.forEach(allWorkouts)
//turn the json response into a csv
    try {
      makeCSV(history)
    } catch (error) {
      console.log(error)
    }
    
}
