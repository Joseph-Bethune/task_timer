class Task {
    #id = ""
    #name = null
    #description = null
    #creationTime
    #executionTime
    #payloadFunction
    #payloadArguments

    /**
     * Creates a new Task object that can be used to schedule a delayed function execution once the designated time has arrived.
     * Must be added to an Agenda object in order to trigger automatically.
     * @param {Date} executionTime A Date object specifying when the execution function is to be triggered.
     * @param {Function} executionFunction The function to be executed when the exectuion time has been reached.
     * @param  {...any} executionArguments Optional arguments to be given to the execution function.
     * @returns Returns the newly created Task object.
     */
    static createTaskWithExecutionTime(executionTime, executionFunction, ...executionArguments) {

        if (!(executionTime instanceof Date)) {
            throw new TypeError("The given execution time is not an instance of the Date class.");
        }

        if (!(executionFunction instanceof Function)) {
            throw new TypeError("The given execution function is not a function.");
        }

        const output = new Task();

        output.#creationTime = new Date();
        output.#executionTime = executionTime;

        output.#payloadFunction = executionFunction;
        output.#payloadArguments = [...executionArguments];

        return output;
    }

    /**
     * Creates a new Task object that can be used to schedule a delayed function execution once the delay period has passed.
     * Must be added to an Agenda object in order to trigger automatically.
     * @param {Number} executionDelay The delay in miliseconds that must pass before the execution function is triggered.
     * @param {Function} executionFunction The function to be executed when the exectuion time has been reached.
     * @param  {...any} executionArguments Optional arguments to be given to the execution function.
     * @returns Returns the newly created Task object.
     */
    static createTaskWithExecutionDelay(executionDelay, executionFunction, ...executionArguments) {

        if (!(Number.isInteger(executionDelay))) {
            throw new TypeError("The given execution delay is not an integer.");
        }

        if (!(executionFunction instanceof Function)) {
            throw new TypeError("The given execution function is not a function.");
        }

        const output = new Task();

        output.#creationTime = new Date();

        output.#executionTime = new Date(output.#creationTime.getTime() + executionDelay);

        output.#payloadFunction = executionFunction;
        output.#payloadArguments = [...executionArguments];

        return output;
    }

    /**
     * Creates a copy of the calling task to protect the original object.
     * @returns {Task} Returns a copy of the calling task.
     */
    getCopy() {
        const output = new Task();

        output.#id = this.#id;
        output.#name = this.#name
        output.#description = this.#description;
        output.#creationTime = this.#creationTime
        output.#executionTime = this.#executionTime
        output.#payloadFunction = this.#payloadFunction
        output.#payloadArguments = [...this.#payloadArguments]

        return output;
    }

    getId() {
        return this.#id;
    }
    /**
     * Updates the id of this object. This should never be done except by the containing TaskList object.
     * @param {String} newId The id to be assigned. 
     */
    setId(newId) {
        this.#id = newId;
    }

    /**
     * Gives the name assigned to this Task.
     * If none has been assigned then the given value will be null.
     * @returns {String} Returns the name assigned to this Task.
     */
    getName() {
        return this.#name;
    }
    /**
     * Changes this Task's name. 
     * Accepts null or any string.
     * If the newName is not a null or string, then it will be turned into a string.
     * @param {String} newName The name to be assigned to this Task.
     */
    setName(newName) {
        if (newName == null || newName instanceof String) {
            this.#name = newName;
        } else {
            this.#name = `${newName}`;
        }
    }

    /**
     * Gives the description assigned to this Task.
     * If none has been assigned then the given value will be null.
     * @returns {String} Returns the description assigned to this Task.
     */
    getDescription() {
        return this.#description;
    }
    /**
     * Changes this Task's description.
     * Accepts null or any string.
     * If the newName is not a null or string, then it will be turned into a string.
     * @param {String} newDescription The description to be assigned to this Task.
     */
    setDescription(newDescription) {
        if (newDescription == null || newDescription instanceof String) {
            this.#description = newDescription;
        } else {
            this.#description = `${newDescription}`;
        }
    }

    /**
     * Gives the creation time of this Task.
     * @returns {Date} When this Task was created.
     */
    getCreationTime() {
        return this.#creationTime;
    }

    /**
     * Gives the scheduled execution time of this Task.
     * @returns {Date} When this Task is scheduled to execute.
     */
    getExectutionTime() {
        return this.#executionTime;
    }

    /**
     * Gives the function that will be executed when this Task is triggerd.
     * The function will always execute with the payload arguments if there are any.
     * See getPayloadArguments().
     * @returns {Function} The function that will be executed.
     */
    getPayloadFunction() {
        return this.#payloadFunction;
    }

    /**
     * Gives the payload arguments stored within this Task.
     * If there are no payload arguments, this this will return an empty array.
     * @returns {Any[]} The arguments that will be given to the payload function when it is executed, or an empty array.
     */
    getPayloadArguments() {
        if (Array.isArray(this.#payloadArguments)) {
            return [...this.#payloadArguments];
        } else {
            return [];
        }
    }

    /**
     * Executes the payload task with the given payload arguments.
     */
    execute() {
        this.#payloadFunction(...this.getPayloadArguments());
    }

    /**
     * This method tells how long until this task is meant to execute.
     * @returns {Number} Time in milliseconds until this task is scheduled to execute.
     */
    getTimeTillExecution() {
        const nowTime = new Date();
        const output = Math.max((this.#executionTime - nowTime), 0);
        return output;
    }

    /**
     * Attempts to generate a human readable copy of the contents of this object. Results vary.
     * @returns {Object} Human readable copy of contents.
     */
    toJson() {
        const copy = this.getCopy();
        const output = {
            id: copy.#id,
            name: copy.#name,
            description: copy.#description,
            creationTime: copy.#creationTime,
            executionTime: copy.#executionTime,
            payloadFunction: copy.#payloadFunction,
            payloadArguments: [...copy.#payloadArguments],
        }

        return output;
    }
}

export { Task }