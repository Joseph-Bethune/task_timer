# Explanation
- This library allows the user to schedule and manage multiple time delayed tasks while only ever using a single active timer.
- Once a task is created and added to the Agenda object (the central object of the library), 
then it will automatically execute when its time arrives. No other interactions are required.
- The lightweight design requires no other dependencies.
# Basic Usage
Using the Agenda is simple and can be done in 4 easy steps.
1. Initialize Agenda
2. Define a Task
3. Add task to Agenda
4. Wait for execution
## Basic summarized example
```
import { Task, getAgenda }

const agenda = getAgenda();

const task1 = Task.createTaskWithExecutionDelay(
    1000 * 2,
    (param1, param2, param3) => {
        console.log([param1, param2, param3].join(""));
    },
    arg1, arg2, arg3
);
task1.setName("Task1");

agenda.addTasks(task1);
```
# Expanded Basic Usage Explanation
## Initialize
Initialization must occur before the Agenda object can be used, but you only need to do so once at the start of the program.
The Agenda object makes use of static references: any attempts to reference it after it is initialized will give a reference to the same Agenda object.
```
const agenda = getAgenda();
```
## Create Task
There are two ways to create a Task:
1. With a delay
2. With an execution time

The only differance is the first arguement.

Using **setName()** to label the Tasks is optional.

### Create Task using a delay
Please note that the execution time for objects created using a delay is calculated ***when the object is created*** not when it is added to the Agenda.
#### Condensed Task Creation
```
const task1 = Task.createTaskWithExecutionDelay(
    1000 * 2,
    (param1, param2, param3) => {
        console.log([param1, param2, param3].join(""));
    },
    arg1, arg2, arg3
);
task1.setName("Task1");
```
#### Expanded Task Creation
```
const delayInMilliSeconds = 1000 * 2;

const taskFunction = (param1, param2, param3) => { 
    console.log([param1, param2, param3].join("")); 
};

const arg1 = "This is Task "
const arg2 = 1;
const arg3 = "."

const task1 = Task.createTaskWithExecutionDelay(delayInMilliSeconds, taskFunction, arg1, arg2, arg3);

task1.setName("Task1");
```
### Create Task using execution time
#### Condensed Task Creation
```
const task2 = Task.createTaskWithExecutionTime(
    new Date(new Date().getTime() + (1000 * 4)),
    (param1, param2, param3) => {
        console.log([param1, param2, param3].join(""));
    },
    "This is Task ", 2, "."
);
task2.setName("Task2");
```
#### Expanded Task Creation
```
const executionTime = new Date(new Date().getTime() + (1000 * 4));
const taskFunction = (param1, param2, param3) => {
    console.log([param1, param2, param3].join(""));
};
const arg1 = "This is Task "
const arg2 = 2;
const arg3 = "."
const task2 = Task.createTaskWithExecutionTime(executionTime, taskFunction, arg1, arg2, arg3)
task2.setName("Task2");
```
## Add Tasks to Agenda
Once a task is added to the agenda, it will automatically execute when its time arrives (unless it is removed.)
```
agenda.addTasks(task1, task2);
```
## Wait
After the elapsed time periods, the following message will be displayed in the console.
```
This is Task 1. // this will display after 2 seconds
This is Task 2. // this will display after 4 seconds
```