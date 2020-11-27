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

const tasks = new Array(1000).fill(task)


const callBatchOfTasks = async () => {
    printProcess()

    // Terminate recursion when there is no task ro process
    if (!tasks.length) return;

    // Split tasks array into a bunch of 50 tasks in each 10 seconds
    const bunchOfTasks = tasks.splice(0, 50);

    Promise.allSettled(bunchOfTasks.map(eachTask => eachTask()))
        .then((setteledTasks) => {
            // Regenerate failed tasks, and push them to the tasks queue
            setteledTasks
                .filter(
                    proccessedTasks => proccessedTasks.status === 'rejected'
                )
                .forEach(() => {
                    tasks.push(task)
                })

            // It guarantees that we process just 50 requests each 10 seconds,
            // so we never cross the limitation.
            setTimeout(() => {
                callBatchOfTasks()
            }, 10000)
        })
}

const printProcess = () => {
    console.clear();
    console.log(`${Math.floor((new Date() - start) / 1000)} seconds elapsed & there is ${tasks.length} tasks left.`)
}

const start = new Date()
callBatchOfTasks()

