# Batch API Requests Issue

DO NOT REQUIRE any JS packages unless you need to write test cases
Do NOT spend more than two hours on this coding challenge

Write a function to call an API endpoint 1000 times and returns a list of failed operations.
Limitations:
  * The endpoint only allows batches of 50 concurrent requests every 10 seconds.
  * The time to finish a task might be varied from one second to an hour.
  * We need to make sure all the requests resolved in each batch to send another batch to the server.


Assuming this function calls the API endpoint, mocked by timeout method for simplicity

```js
const task = function() {
 return new Promise((resolve, reject) => {
   setTimeout(() => {
     try{
       //uncomment the line below if you need to test the failed tasks
       //throw new Error("Something went wrong!")
       resolve()
     }catch(err){
       reject(err)
     }
   }, 100)
 })
}
```

All the tasks we need to run in 50 batches every 10 seconds 

```js
const tasks = new Array(1000).fill(task)
```

write your code here and use tasks as a list of async calls