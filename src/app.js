const task = function () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                //Random error generator with 10% chance of error
                if (Math.random() > 0.9) throw new Error("Something went wrong!");

                resolve("Done")
            } catch (err) {
                reject(err)
            }
        }, 100)
    })
}

const tasks = new Array(40).fill(task)


const callBatchOfTasks = async (tasksList) => {
    printProcess()

    // Terminate recursion when there is no task ro process
    if (!tasksList.length) return;

    // Split tasks array into a bunch of 50 tasks in each 10 seconds
    const bunchOfTasks = tasksList.splice(0, 50);

    // Concurrenct process batch of 50 tasks
    Promise.allSettled(bunchOfTasks.map(eachTask => eachTask()))
        .then(async (setteledTasks) => {
            await processFailedTasks(setteledTasks);

            // It guarantees that we process just 50 requests each 10 seconds,
            // so we never cross the limitation.
            setTimeout(() => {
                callBatchOfTasks(tasksList)
            }, 10000)
        })
}

async function processFailedTasks(setteledTasks) {
    return new Promise((resolve) => {
        // Regenerate failed tasks, and make a new tasks list
        const failedTasks = setteledTasks
            .filter(
                proccessedTasks => proccessedTasks.status === 'rejected'
            )
            .map(() => task);

        // Process failed tasks right now, befoe another batch
        if(failedTasks.length > 0){
            setTimeout(async () => {
                await callBatchOfTasks(failedTasks);
    
                resolve(failedTasks)
            }, 10000)
        }else{
            resolve([]) 
        }   
    })
}


const printProcess = () => {
    console.clear();
    console.log(`${Math.floor((new Date() - start) / 1000)} seconds elapsed & there is ${tasks.length} tasks left.`)
}

const start = new Date()
callBatchOfTasks(tasks)


