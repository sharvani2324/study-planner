import { isDateStr, toDateStr } from './dates.js';

// Applies a status change while recording when/at what local hour the task was completed.
export function applyStatusChange(plan, newStatus, localDate, localHour) {
  if (newStatus === 'Completed' && plan.status !== 'Completed') {
    plan.completedAt = new Date();
    plan.completedDate = isDateStr(localDate) ? localDate : toDateStr(new Date());
    plan.completedHour = Number.isInteger(localHour) && localHour >= 0 && localHour <= 23 ? localHour : new Date().getHours();
  } else if (newStatus === 'Pending') {
    plan.completedAt = null;
    plan.completedDate = null;
    plan.completedHour = null;
  }
  plan.status = newStatus;
}
