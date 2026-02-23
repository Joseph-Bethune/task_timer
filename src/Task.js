class Task {
    #id = ""
    #name = ""
    #creationTime
    #executionTime
    #payloadFunction
    #payloadArguments

    /**
     * Creates a new Task object that can be used to schedule a delayed function execution once the designated time has arrived.
     * Must be added to an Agenda object in order to trigger automatically.
     * @param {Date} executionTime A Date object specifying when the execution function is to be triggered.
     * @param {Function} executionFunction The function to be executed when the exectuion time has been reached.
     * @param  {...any} executionArguments Optional arguements to be given to the execution function.
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
     * @param  {...any} executionArguments Optional arguements to be given to the execution function.
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

    getName() {
        return this.#name;
    }
    setName(newName) {
        this.#name = newName;
    }

    getCreationTime() {
        return this.#creationTime;
    }

    getExectutionTime() {
        return this.#executionTime;
    }

    getPayloadFunction() {
        return this.#payloadFunction;
    }

    getPayloadArguements() {
        return this.#payloadArguments;
    }

    execute() {
        this.#payloadFunction(...this.#payloadArguments);
    }

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
            creationTime: copy.#creationTime,
            executionTime: copy.#executionTime,
            payloadFunction: copy.#payloadFunction,
            payloadArguments: [...copy.#payloadArguments],
        }

        return output;
    }
}

export { Task }