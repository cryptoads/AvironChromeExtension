
let exportCSV = document.getElementById("toCSV");



exportCSV.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getBearer,
    });
  });
  
  // The body of this function will be executed as a content script inside the
  // current page
 async function getBearer() {
    let bearerToken = sessionStorage.getItem('gsvToken') 
    if (!window.location.href.toString().includes('https://accounts.avironactive.com/')){
        if (window.confirm('You must be logged into your Aviron profile to continue. Click OK to be redirected to the Aviron website, Cancel to do nothing'))
        {
        window.open('https://accounts.avironactive.com/workout_history', '_blank');
        };
    }
    else if (bearerToken === null) {
        location.reload()
        window.alert("you're not logged in")
    }
    else{
        console.log(bearerToken)
    }
    console.log(bearerToken)
    let response = await fetch("https://social.prod.avironactive.net/v2/rpc/user_workouts_list?unwrap", {
  "headers": {
    "authorization": "Bearer "+ bearerToken.toString(),                         
    "content-type": "application/json;charset=UTF-8"
  },
  "body": "{\"timeRange\":0,\"page\":1,\"pageSize\":999999999}",
  "method": "POST"
});
let data = await response.json();
var history = await data.workoutHistories
console.log(history)
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