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
# Key Points of Main Components

## A Quick Warning about Task and TaskList copies

All methods within this library that return a Task or TaskList implement defensive copying. The return values are always **copies** and most alterations will not affect the original...with one exception...

Although it is not intended or recommended: alterations to the payload arguements of a Task copy can effect the original: be warned.

## Library Classes

At the core of this library are three classes:
- Task
- TaskList
- Agenda

## Task

At its core, a Task is just an executable function and some optional parameters to feed into that function.

Wrapped around this core are segments of information used to sort and search for Tasks within a group.

### Creation

There are two static factory methods contained within this class. They are the intended method of Task creation.
```
createTaskWithExecutionTime(executionTime, executionFunction, ...executionArguments)

createTaskWithExecutionDelay(executionDelay, executionFunction, ...executionArguments)
```

### Automatic execution

A Task is not *scheduled to execute* when it is initially created and has to be manually triggered in order to execute its function. To enable automatic execution, the Task must be added to the Agenda.

## TaskList

A TaskList is essentially just a group of tasks ordered by their scheduled execution times and some methods to help search through those Tasks.

### FindTasksBy___ methods

The TaskList class contains a special set of methods to search through the Tasks contained within for items that match the defined parameter.
Each of these methods returns a new (and usually smaller) TaskList containing a subset of the original TaskList's contents.

For instance: TaskList contains an instance method that searches for task descriptions.
```
const smallerTaskList = agenda.getTaskList().findTasksByDescription("zero");
```
This method collects all of the tasks whose description contains the given string value, copies them, and places the copies inside a new TaskList.

There is a FindTasksBy___ method for each Task member variable.

## Agenda

The Agenda is the primary class of this library. It keeps track of all of the scheduled Tasks, automatically executing each when its scheduled time arrives.

### Initialization
```
const agenda = getAgenda();
```
In order to function as intended, the **getAgenda()** method must called near the start of the project's execution. Any attempt to use the Agenda before it has been initialized will result in errors.

### Singleton

The Agenda is designed to be used as a singleton: only one instance exists for an entire project. To access this instance, use the **getAgenda()** static method. Calling this method anywhere in the project will always return the exact same instance of Agenda.

### TaskList Container

The Agenda contains a TaskList instance and a copy of this object can be accessed using a get method.

```
const taskList = agenda.getTaskList();
```

### Manual Execution
The Agenda object can be used to trigger manual execution of Tasks with the option of removing said Tasks from the Agenda after it has been executed.

#### Execute a single task manually
```
const removeAfterExecution = true;

const targetTaskIds = agenda..getTaskList().getNextTaskIds();

agenda.executeTasksNow(targetTaskIds, removeAfterExecution);
// or
agenda.executeTasksNow(targetTaskId);
```
Both functions above do the same thing. By default, the executeAll() method will remove the Tasks once they are executed.
#### Executing all tasks manually

```
const removeAfterExecution = true;

agenda.executeAll(removeAfterExecution);
```
```
agenda.executeAll();
```
Both functions above do the same thing. By default, the executeAll() method will remove the Tasks once they are executed.