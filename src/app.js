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

const tasks = new Array(100).fill(task)


const callBatchOfTasks = async (tasksList) => {
    const startTimer = new Date()

    // Terminate recursion when there is no task ro process
    if (!tasksList.length) return;

    // Split tasks array into a bunch of 50 tasks in each 10 seconds
    const bunchOfTasks = tasksList.splice(0, 50);

    // Concurrenct process batch of 50 tasks
    const setteledTasks = await Promise.allSettled(bunchOfTasks.map(eachTask => eachTask()))

    await processFailedTasks(setteledTasks, startTimer);

    // It guarantees that we process just 50 requests each 10 seconds,
    // so we never cross the limitation.
    setTimeout(() => {
        callBatchOfTasks(tasksList)
    }, getNeededWaiting(startTimer))
}

async function processFailedTasks(setteledTasks, startTimer) {
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
                // Prevent js refrenced object type issue
                await callBatchOfTasks([].concat(failedTasks));

                resolve(failedTasks)
            }, getNeededWaiting(startTimer))
        }else{
            resolve([]) 
        }   
    })
}

// Helper to calculate if wee need wait more before send new requests
const getNeededWaiting = (start) => {
    const needed = 10 - (new Date() - start)/1000
    return needed > 0 ? needed*1000 : 0
}

callBatchOfTasks(tasks)




