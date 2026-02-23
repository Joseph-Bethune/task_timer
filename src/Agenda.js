import { Task, TaskList } from "./TaskList.js";

class Agenda {

    //#region singleton code

    static #agenda

    /**
     * Grants access to the static Agenda singleton instance.
     * @returns {Agenda} Returns the agenda singleton.
     */
    static getAgenda() {
        return Agenda.#agenda;
    }

    /**
     * Initializes the static Agenda singleton instance. Must be executed before the Agenda object can be used.
     */
    static init() {
        Agenda.#agenda = new Agenda();
    }

    //#endregion

    #tasks = new TaskList();

    //#region next execution tracker variables and methods

    #nextTasks = null;
    #activeTimerId = null;
    #nextExecutionTime = null;

    #executeTrackedJob() {
        const ids = [];
        for (const task of this.#nextTasks) {
            if (task instanceof Task) {
                ids.push(task.getId());
                task.execute();
            }
        }

        this.#tasks.removeTasks(...ids);
        this.#clearNextTaskTracker();
        this.#updateNextTaskTracker();
    }

    #updateNextTaskTracker() {
        const newNextTasks = this.#tasks.getNextTasks();

        if (newNextTasks != null && newNextTasks.length > 0) {
            this.#nextTasks = newNextTasks;
            this.#nextExecutionTime = newNextTasks[0].getExectutionTime();
            const delay = newNextTasks[0].getTimeTillExecution();
            this.#activeTimerId = setTimeout(() => {
                this.#executeTrackedJob();
            }, delay);
        } else {
            // do nothing
        }
    }

    #clearNextTaskTracker() {
        this.#nextTasks = null;
        this.#nextExecutionTime = null;
        if (this.#activeTimerId != null) {
            clearTimeout(this.#activeTimerId);
            this.#activeTimerId = null;
        }
    }

    getNextExectutionTime() {
        return new Date(this.#nextExecutionTime);
    }

    //#endregion

    taskCount() {
        return this.#tasks.taskCount();
    }

    #checkNextTasks() {
        const ids_them = this.#tasks.getNextTaskIds();
        const ids_mine = (this.#nextTasks != null && Array.isArray(this.#nextTasks)) ?
            this.#nextTasks.map(task => task.getId()) :
            [];

        let changed = false;
        if (ids_mine.length == ids_them.length) {
            const missingElement = ids_mine.some(id_mine => {
                if (!ids_them.includes(id_mine)) {
                    return true;
                }
            });
            if (missingElement) {
                changed = true;
            }
        } else {
            changed = true;
        }

        if (changed) {
            this.#clearNextTaskTracker();
            this.#updateNextTaskTracker();
        }
    }

    addTasks(...newTasks) {
        const changed = this.#tasks.addTasks(...newTasks);
        if (changed) {
            this.#checkNextTasks();
        }
        return this.taskCount();
    }

    removeTask(...taskIds) {
        const changed = this.#tasks.removeTasks(taskIds);
        if (changed) {
            this.#checkNextTasks();
        }
        return this.taskCount();
    }

    executeTaskNow(taskId, removeAfterExecution = true) {
        const tasks = this.#tasks.getTasks_id(taskId)
        if (tasks != null && tasks.length > 0) {
            tasks[0].execute();
            if (removeAfterExecution) {
                this.removeTask(taskId);
            }
        }
    }

    getTaskList() {
        return this.#tasks.getCopy();
    }

    toJson() {
        const nextTasks = this.#nextTasks != null ? this.#nextTasks.map(task => task.toJson()) : null;
        const output = {
            tasks: this.#tasks.toJson(),
            nextTask: nextTasks,
            activeTimerId: this.#activeTimerId,
            nextExecutionTime: this.#nextExecutionTime,
        };

        return output;
    }
}

export { Task, TaskList, Agenda }