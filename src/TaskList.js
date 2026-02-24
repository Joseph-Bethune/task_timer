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

    /**
     * Generates a random string of characters to be used as a new unique id.
     * The new string is checked against existing ids to ensure uniqueness.
     * @returns {String} The unique id.
     */
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
            const delay = Math.max(task.getExectutionTime() - task.getCreationTime(), 0);
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

    /**
     * This method gives a copy this TaskList's time line.
     * The timeline is an array of array of strings.
     * Each string is a Task id.
     * Each array of strings (named here as a "group") represents Tasks scheduled to execute at the same time.
     * The groups are ordered in the outer most array by their execution times, with the earliest appearing first.
     * @returns {String[]} Generates a copy of the timeline.
     */
    getTimelineCopy() {
        const output = [];
        for (const ids of this.#timeline) {
            output.push([...ids]);
        }
        return output;
    }

    /**
     * This method copies each of the Tasks and saves them into a dictionary of key-value pairs.
     * The values in each pair are the individual Tasks.
     * They keys paired with those values are the Task's id.
     * @returns {Object} Generates a copy of the task dictionary.
     */
    getTasksCopy() {
        const output = {};
        for (const [key, value] of Object.entries(this.#tasks)) {
            output[key] = value.getCopy();
        }

        return output;
    }

    /**
     * Returns a copy of this object. The copy is an exact duplicate, but shares none of the same object references.
     * Any changes to either the original or the copy will have no affect on the other.
     * @returns {TaskList} The copy of this object.
     */
    getCopy() {
        const output = new TaskList();

        output.#tasks = this.getTasksCopy();
        output.#timeline = this.getTimelineCopy();

        return output;
    }

    /**
     * Adds the task to this TaskList. 
     * This method performs no safety checks.
     * @param {Task} newTask The new task to be added. 
     */
    #addTask_prv(newTask) {
        const newEleTask = newTask.getCopy();
        const newId = this.#generateUniqueID();
        newEleTask.setId(newId);
        this.#tasks[newId] = newEleTask;
    }

    /**
     * Adds one or more tasks to the tasklist. Each element is defensively copied before added.
     * If any changes are made to the TaskList, then all elements are re-ordered to ensure they remain organized.
     * @param  {...Task} newTasks Tasks to be added.
     * @returns {Boolean} Returns true if the tasklist was altered, or else false.
     */
    addTasks(...newTasks) {
        if (newTasks == null) {
            return false;
        }

        let changed = false;
        for (const newTask of newTasks) {
            if (!(newTask instanceof Task)) {
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

    /**
     * Removes one or more tasks from the tasklist.
     * If any changes are made to the TaskList, then all elements are re-ordered to ensure they remain organized.
     * @param  {...String} taskIds Ids of the tasks to be removed.
     * @returns {Boolean} Returns true if the tasklist was altered, or else false.
     */
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

    /**
     * Gives the ids of the next tasks to execute as an array of strings.
     * If there are no values to return, then an empty array is given.
     * @returns {String[]} Returns the ids of the next tasks schedule to execute, or an empty array. 
     */
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

    /**
     * Finds all tasks within this list whose ids match the given search values.
     * The found tasks are copied and those copies are placed within the output array.
     * There is no specific order.
     * @param  {...String} taskIds Search values to match against.
     * @returns {Task[]} Returns an array of all found tasks.
     */
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

    /**
     * Finds all tasks within this list whose task name contains the search string. 
     * The copies of the found items are placed into a new TaskList.
     * The new TaskList is not orderd. 
     * @param {String} searchString The search criteria. 
     * @param {Boolean} caseSensitive Whether or not case will be ignored during search.
     * @returns {TaskList} Returns a TaskList containing all elements that found during search. Not ordered.
     */
    findTasksByName(searchString, caseSensitive = true) {
        const foundTasks = {};

        const searchVal = caseSensitive ? searchString : `${searchString}`.toLowerCase();
        for (const element of Object.values(this.#tasks)) {
            const searchTarget = caseSensitive ? element.getName() : element.getName().toLowerCase();
            if (searchTarget.includes(searchVal)) {
                foundTasks[element.getId()] = element.getCopy();
            }
        }

        const output = new TaskList();
        output.#tasks = foundTasks;
        //output.organizeTasks();

        return output;
    }

    /**
     * Finds all tasks within this list whose execution time lies within the given time frame.
     * The time frame is inclusive: elements that lie exactly on the edges of the time frame will be included. 
     * The copies of the found items are placed into a new TaskList.
     * The new TaskList is not orderd.
     * @param {Date} startTime Inclusive start of the search time frame.
     * @param {Date} endTime Inclusive end fo the search time frame.
     * @returns {TaskList} Returns a TaskList containing all elements that found during search. Not ordered.
     */
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
        //output.organizeTasks();

        return output;
    }

    /**
     * Finds all tasks within this list whose creation time lies within the given time frame.
     * The time frame is inclusive: elements that lie exactly on the edges of the time frame will be included. 
     * The copies of the found items are placed into a new TaskList.
     * The new TaskList is not orderd.
     * @param {Date} startTime Inclusive start of the search time frame.
     * @param {Date} endTime Inclusive end fo the search time frame.
     * @returns {TaskList} Returns a TaskList containing all elements that found during search. Not ordered.
     */
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
        //output.organizeTasks();

        return output;
    }

    /**
     * Attempts to generate a human readable copy of the contents of this object. Results vary.
     * @returns {Object} Human readable copy of contents.
     */
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