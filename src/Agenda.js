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

    #taskList = new TaskList();

    //#region Task tracker
    // Keeps track of what tasks will be executed by the existing timer object and when those tasks will execute.

    #nextTasksIds = null;
    #activeTimerId = null;
    #nextExecutionTime = null;

    /**
     * Gets the next tasks to be executed. If no values are found, then an empty array is given.
     * @returns {Task[]} Pulls copies of the next tasks to be executes for the tasklist, or an empty array.
     */
    #getTrackedTasks() {
        if (Array.isArray(this.#nextTasksIds) && this.#nextTasksIds.length > 0) {
            const tasks = this.#taskList.getTasks_id(...this.#nextTasksIds);
            return tasks;
        }

        return [];
    }

    #executeTrackedTasks() {
        const nextTasks = this.#getTrackedTasks();
        const executedTasksIds = [];
        for (const task of nextTasks) {
            if (task instanceof Task) {
                executedTasksIds.push(task.getId());
                task.execute();
            }
        }

        this.#taskList.removeTasks(...executedTasksIds);
        this.#clearTaskTracker();
        this.#setTaskTracker();
    }

    #setTaskTracker() {
        const newNextTaskIds = this.#taskList.getNextTaskIds();

        if (newNextTaskIds.length > 0) {
            const sampleTask = this.#taskList.getTasks_id(newNextTaskIds[0])[0];
            const delay = sampleTask.getTimeTillExecution();

            this.#nextExecutionTime = sampleTask.getExectutionTime();

            this.#nextTasksIds = newNextTaskIds;

            this.#activeTimerId = setTimeout(() => {
                this.#executeTrackedTasks();
            }, delay);

        } else {
            // do nothing
        }
    }

    #clearTaskTracker() {
        this.#nextTasksIds = null;
        this.#nextExecutionTime = null;
        if (this.#activeTimerId != null) {
            clearTimeout(this.#activeTimerId);
            this.#activeTimerId = null;
        }
    }

    /**
     * Checks the array of next-tasks-to-be-executed (called tracked tasks) that is stored within the Agenda object against the one stored within the Tasklist.
     * If the arrays contain the same elements (in any order) and are the same length, then nothing is done.
     * Otherwise, the Agenda's tracked tasks are updated to match the TaskList.
     */
    #checkTaskTracker() {
        const ids_them = this.#taskList.getNextTaskIds();
        const ids_mine = (Array.isArray(this.#nextTasksIds)) ?
            this.#nextTasksIds :
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
            this.#clearTaskTracker();
            this.#setTaskTracker();
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
        return this.#taskList.taskCount();
    }

    /**
     * Adds one or more tasks to the Agenda. Returns the total number of tasks after they addition.
     * Once a task is added, it will execute automatically once its execution time has arrived.
     * @param  {...Task} newTasks The tasks to be added.
     * @returns {Number} The number of tasks on the Agenda. See getTaskCount().
     */
    addTasks(...newTasks) {
        const changed = this.#taskList.addTasks(...newTasks);
        if (changed) {
            this.#checkTaskTracker();
        }
        return this.getTaskCount();
    }

    /**
     * Removes all of the tasks with the given ids. Returns the count of the remain tasks after the subtraction.
     * @param  {...String} taskIds The unique identifiers of the tasks to be deleted.
     * @returns {Number} The number of tasks remaining on the Agenda. See getTaskCount().
     */
    removeTask(...taskIds) {
        const changed = this.#taskList.removeTasks(taskIds);
        if (changed) {
            this.#checkTaskTracker();
        }
        return this.getTaskCount();
    }

    /**
     * Searches for a specific task using the given taskId. If one is found, it is exeuted.
     * @param {String} taskId The task id to search for.
     * @param {Boolean} removeAfterExecution Should the task be removed from the agenda after execution? By default, this is true.
     * @returns {Number} The number of remaining tasks. See getTaskCount().
     */
    executeTaskNow(taskId, removeAfterExecution = true) {
        const tasks = this.#taskList.getTasks_id(taskId)
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
        return this.#taskList.getCopy();
    }

    /**
     * Attempts to generate a human readable copy of the contents of this object. Results vary.
     * @returns {Object} Human readable copy of contents.
     */
    toJson() {
        const nextTaskIds = Array.isArray(this.#nextTasksIds) ? this.#nextTasksIds : [];
        const output = {
            tasklist: this.#taskList.toJson(),
            nextTaskIds: [...nextTaskIds],
            activeTimerId: this.#activeTimerId,
            nextExecutionTime: this.#nextExecutionTime,
        };

        return output;
    }
}

export { Task, TaskList, Agenda }