import cron from "node-cron";
import EventService from "../../event/eventService";

let task: cron.ScheduledTask | null = null;
const eventService = new EventService();

export function startScheduler() {
  if (task) {
    console.log("Scheduler is already running");
    return;
  }

  task = cron.schedule("* * * * *", async () => {
    await eventService.checkExpiredEvents();
    console.log("Scheduler check expired events");
  });

  console.log("Scheduler started");
}

export function stopScheduler() {
  if (!task) {
    console.log("Scheduler is not running");
    return;
  }

  task.stop();
  task = null;

  console.log("Scheduler stopped");
}
