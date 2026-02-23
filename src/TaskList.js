import { randomBytes } from "node:crypto";
import { Task } from "./Task.js"

class TaskList {

    #tasks = {}
    #timeline = []

    constructor(...tasks) {

        for (const task of tasks) {
            if (task == null) {
                continue;
            }

            if (!(task instanceof Task)) {
                continue;
            }

            this.#addTask_prv(task);
        }

        if (this.taskCount() > 0) {
            this.organizeTasks();
        }
    }

    #generateUniqueID() {
        let output = "";
        let isUnique = false;

        while (!isUnique) {
            output = randomBytes(5).toString("hex");
            let keys = Object.keys(this.#tasks) || [];
            isUnique = !keys.includes(output);
        }

        return output;
    }

    /**
     * This method returns the total number of tasks within this tasklist.
     * @returns {Number} Returns the total number of tasks.
     */
    taskCount() {
        try {
            return Object.keys(this.#tasks).length
        } catch (err) {
            return 0;
        }
    }

    /**
     * All tasks are placed on the time line within a slot, and tasks with the same execution time share a slot.
     * This method returns the total number of slots.
     * @returns {Number} Returns the total number of timeline slots.
     */
    timelineLength() {
        return this.#timeline.length;
    }

    /**
     * All tasks are placed on the time line within a slot, and tasks with the same execution time share a slot.
     * This task generates the slots, places tasks within those slots and then orders the slots by the associated execution time.
     * Tasks with the earliest execution time appear first.
     */
    organizeTasks() {
        const newTimeline = [];

        // delays keys are calculated by subtracting the task's creation time from the execution time
        // the resulting value is used in as a key for the delays json object
        // the value is an array of tasks ids coorpsonding to the tasks with that delay        
        const delays = {};
        for (const task of Object.values(this.#tasks)) {
            const delay = task.getExectutionTime() - task.getCreationTime();
            const id = task.getId();
            let elements = delays[delay];

            if (elements == null) {
                elements = [id];
                delays[delay] = elements;
            } else {
                elements.push(id);
            }
        }

        // loop
        // each iteration removes the items with the smallest delay out of the delays json object and 
        // adds them to the new time line object
        // remember: each item is an array
        let cont = true;
        while (cont) {
            if (Object.keys(delays).length < 1) {
                cont = false;
                continue;
            }
            const convertedKeys = Object.keys(delays).map(key => Number(key))
            const smallestDelay = Math.min(...convertedKeys);

            const ids = delays[smallestDelay];

            if (ids != null) {
                if (ids.length > 0) {
                    newTimeline.push(ids);
                }
            }

            delete delays[smallestDelay];
        }

        this.#timeline = newTimeline;
    }

    getTimelineCopy() {
        const output = [];
        for (const ids of this.#timeline) {
            output.push([...ids]);
        }
        return output;
    }

    getTasksCopy() {
        const output = {};
        for (const [key, value] of Object.entries(this.#tasks)) {
            output[key] = value.getCopy();
        }

        return output;
    }

    getCopy() {
        const output = new TaskList();

        output.#tasks = this.getTasksCopy();
        output.#timeline = this.getTimelineCopy();

        return output;
    }

    #addTask_prv(newTask) {
        const newEleTask = newTask.getCopy();
        const newId = this.#generateUniqueID();
        newEleTask.setId(newId);
        this.#tasks[newId] = newEleTask;
    }

    addTasks(...newTasks) {
        if (newTasks == null) {
            return false;
        }

        let changed = false;
        for (const newTask of newTasks) {
            if (!(newTask instanceof Task)) {
                //throw new TypeError("The new task must be of type Task.");
                //return false;
                continue;
            }

            this.#addTask_prv(newTask);
            changed = true;
        }

        if (changed) {
            this.organizeTasks();
            return true;
        }
        return false;
    }

    removeTasks(...taskIds) {
        let changed = false;

        for (const taskId of taskIds) {
            if (this.#tasks[taskId] != null) {
                delete this.#tasks[taskId];
                changed = true;
            }
        }

        if (changed) {
            this.organizeTasks();
            return true;
        }

        return false;
    }

    getNextTaskIds() {
        const output = this.#timeline[0];
        if (output != null && output.length > 0) {
            return [...output];
        }
        return [];
    }

    /**
     * The TaskList groups Tasks if they have the same execution time and orders these groups, 
     * with earlier execution times appearing first. This method returns the group of tasks found at the given index.
     * @param {Number} index This must be an integer.
     * @returns {Task[]} Returns the tasks at the given index within the execution timeline.
     */
    getTasks_timelineIndex(index) {
        if (!Number.isInteger(index)) {
            throw new TypeError("The given index must be an integer.");
        }

        if (index < 0 || index > this.timelineLength()) {
            throw new RangeError(`The given index must be greater than 0 and less than ${this.timelineLength()}.`);
        }

        const elements = [];
        const ids = this.#timeline[index];

        if (ids != null && ids.length > 0) {
            for (const id of ids) {
                const task = this.#tasks[id].getCopy();
                elements.push(task);
            }
        }

        return elements;
    }

    /**
     * The TaskList groups Tasks if they have the same execution time and orders these groups, 
     * with earlier execution times appearing first. This method returns the group of tasks to be executed next.
     * @param {Number} index This must be an integer.
     * @returns {Task[]} Returns the tasks to be executed next.
     */
    getNextTasks() {
        return this.getTasks_timelineIndex(0);
    }

    getTasks_id(...taskIds) {
        const output = []
        for (const taskId of taskIds) {
            const element = this.#tasks[taskId];
            if (element != null) {
                output.push(element.getCopy());
            }
        }

        return output;
    }

    findTasksByName(taskName, caseSensitive = true) {
        const foundTasks = {};

        const searchVal = caseSensitive ? taskName : `${taskName}`.toLowerCase();
        for (const element of Object.values(this.#tasks)) {
            const searchTarget = caseSensitive ? element.getName() : element.getName().toLowerCase();
            if (searchTarget.includes(searchVal)) {
                foundTasks[element.getId()] = element.getCopy();
            }
        }

        const output = new TaskList();
        output.#tasks = foundTasks;
        output.organizeTasks();

        return output;
    }

    findTasksWithinExecutionTimefram(startTime, endTime) {
        if (!(startTime instanceof Data)) {
            throw new TypeError("The startTime must be an instance of the Date class.");
        }

        if (!(endTime instanceof Data)) {
            throw new TypeError("The endTime must be an instance of the Date class.");
        }

        const foundTasks = {};

        for (const element of Object.values(this.#tasks)) {
            const searchVal = element.getExectutionTime();
            const match = ((searchVal >= startTime) && (searchVal <= endTime)) ? true : false;
            if (match) {
                foundTasks[element.getId()] = element.getCopy();
            }
        }

        const output = new TaskList();
        output.#tasks = foundTasks;
        output.organizeTasks();

        return output;
    }

    findTasksWithinCreationTimefram(startTime, endTime) {
        if (!(startTime instanceof Data)) {
            throw new TypeError("The startTime must be an instance of the Date class.");
        }

        if (!(endTime instanceof Data)) {
            throw new TypeError("The endTime must be an instance of the Date class.");
        }

        const foundTasks = {};

        for (const element of Object.values(this.#tasks)) {
            const searchVal = element.getCreationTime();
            const match = ((searchVal >= startTime) && (searchVal <= endTime)) ? true : false;
            if (match) {
                foundTasks[element.getId()] = element.getCopy();
            }
        }

        const output = new TaskList();
        output.#tasks = foundTasks;
        output.organizeTasks();

        return output;
    }

    toJson() {
        const copy = this.getCopy();
        const tasks = {};
        const timeline = copy.getTimelineCopy();

        for (const [key, value] of Object.entries(copy.#tasks)) {
            tasks[key] = value.toJson();
        }

        return { tasks, timeline };
    }
}

export { Task, TaskList }