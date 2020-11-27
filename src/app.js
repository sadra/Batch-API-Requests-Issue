const task = function () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        //Random error generator with 10% chance of error
        if (Math.random() > 0.9) throw new Error('Something went wrong!');

        resolve('Done');
      } catch (err) {
        reject(err);
      }
    }, 100);
  });
};

const tasks = new Array(1000).fill(task);

const callBatchOfTasks = async (tasksList, failedTasks) => {
  const startTimer = new Date();

  if (!tasksList.length) return failedTasks;

  // Split tasks array into a bunch of 50 tasks in each 10 seconds
  const bunchOfTasks = tasksList.splice(0, 50);

  // Concurrenct process batch of 50 tasks
  const setteledTasks = await Promise.allSettled(
    bunchOfTasks.map((eachTask) => eachTask())
  );

  // Collect failed tasks in each batch
  const faileds = await processFailedTasks(setteledTasks, startTimer);
  failedTasks = failedTasks.concat(faileds);

  // It guarantees that we process just 50 requests each 10 seconds,
  // so we never cross the limitation.
  await asyncTimeout(getNeededWaiting(startTimer));

  return await callBatchOfTasks(tasksList, failedTasks);
};

async function processFailedTasks(setteledTasks, startTimer) {
  // Regenerate failed tasks, and make a new tasks list
  const failedTasks = setteledTasks
    .filter((proccessedTasks) => proccessedTasks.status === 'rejected')
    .map(() => task);

  // Process failed tasks right now, befoe another batch
  if (failedTasks.length > 0) {
    await asyncTimeout(getNeededWaiting(startTimer));

    // Prevent js refrenced type object issue
    await callBatchOfTasks([].concat(failedTasks), []);
  }

  return failedTasks;
}

// Helper to calculate if wee need wait more before send new requests
const getNeededWaiting = (start) => {
  const needed = 10 - (new Date() - start) / 1000;
  return needed > 0 ? needed * 1000 : 0;
};

// An async timeout function
const asyncTimeout = (timeOutOnSeconds) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeOutOnSeconds);
  });
};

// Process starter
(async function () {
  const faileds = await callBatchOfTasks(tasks, []);
  clearInterval(timer);

  console.clear();
  console.log(
    `There were ${faileds.length} failed tasks, but we proccessed again and resolved them.`
  );
})();

// Process verbose
const start = new Date();
const timer = setInterval(() => {
  console.clear();
  console.log(
    `${Math.floor((new Date() - start) / 1000)} seconds elapsed & there is ${
      tasks.length
    } tasks left.`
  );
}, 1000);
