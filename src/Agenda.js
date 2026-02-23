import { Task, TaskList } from "./TaskList.js";

class Agenda {

    //#region singleton code

    static #agenda

    /**
     * Grants access to the static Agenda singleton instance. Must be executed before the Agenda object can be used.
     * @returns {Agenda} Returns the agenda singleton.
     */
    static getAgenda() {
        if (Agenda.#agenda == null) {
            Agenda.#init();
        }
        return Agenda.#agenda;
    }

    /**
     * Initializes the static Agenda singleton instance. Must be executed before the Agenda object can be used.
     */
    static #init() {
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

    /**
     * Give the total number of tasks still waiting to be executed.
     * @returns {Number} The number of tasks on the Agenda as an integer.
     */
    getTaskCount() {
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

    /**
     * Adds one or more tasks to the Agenda. Returns the total number of tasks after they addition.
     * Once a task is added, it will execute automatically once its execution time has arrived.
     * @param  {...Task} newTasks The tasks to be added.
     * @returns {Number} The number of tasks on the Agenda.
     */
    addTasks(...newTasks) {
        const changed = this.#tasks.addTasks(...newTasks);
        if (changed) {
            this.#checkNextTasks();
        }
        return this.getTaskCount();
    }

    /**
     * Removes all of the tasks with the given ids. Returns the count of the remain tasks after the subtraction.
     * @param  {...String} taskIds The unique identifiers of the tasks to be deleted.
     * @returns {Number} The number of tasks remaining on the Agenda.
     */
    removeTask(...taskIds) {
        const changed = this.#tasks.removeTasks(taskIds);
        if (changed) {
            this.#checkNextTasks();
        }
        return this.getTaskCount();
    }

    /**
     * Searches for a specific task using the given taskId. If one is found, it is exeuted.
     * @param {String} taskId The task id to search for.
     * @param {Boolean} removeAfterExecution Should the task be removed from the agenda after execution? By default, this is true.
     * @returns {Number} The number of remaining tasks.
     */
    executeTaskNow(taskId, removeAfterExecution = true) {
        const tasks = this.#tasks.getTasks_id(taskId)
        if (tasks != null && tasks.length > 0) {
            tasks[0].execute();
            if (removeAfterExecution) {
                this.removeTask(taskId);
            }
        }
        return this.getTaskCount();
    }

    /**
     * Returns a read only copy of the task list. Any changes to the copy won't affect the agenda.
     * @returns {TaskList} Readonly copy of task list.
     */
    getTaskList() {
        return this.#tasks.getCopy();
    }

    /**
     * Attempts to generate a human readable copy of the contents of this object. Results vary.
     * @returns {Object} Human readable copy of contents.
     */
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