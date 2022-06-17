const cron = require("node-cron");
const userSchema = require("../../model/userSchema");
const taskSchema = require("../../model/taskSchema");
const statusMail = require("../../helper/mailFunction").statusMail
const startDate = require("../../helper/time").startDate
const endDate = require("../../helper/time").endDate


// Task create function with userid
exports.taskCreate = async (req, res) => {

  const id = req.params.userid;

  await taskSchema.create({
    task: req.body.task,
    taskDescription: req.body.taskDescription,
    taskSendBy: await userSchema.findOne({ _id: id }, { new: true }),
  })
    .then(async result => {
      res.json({
        message: "Task created sucessfully",
        result,
      });
      
      await userSchema.findOneAndUpdate({_id:id},{$push: { taskDetails: result._id }})
      console.log("Task created");
    })

    .catch((err) => {
      console.log(err.message);
    });
};

// Task edit function
exports.taskEdit = async (req, res) => {

  await taskSchema.findByIdAndUpdate({ _id: req.params.taskid }, { $set: req.body })

    .then((task) => {
      if (task) {
        console.log(" Task edited successfully");
        res.status(200).send({ message: "Task Edited", task });
      } else {
        res.status(404).send({ message: "invalid id" });
      }
    })
    .catch((error) => {
      console.log(error.message);
      res.send(error.message);
    });
};

//  Task Delete function
exports.taskDelete = async (req, res) => {

  await taskSchema.findByIdAndDelete({ _id: req.params.taskid }, { new: true })
    .then((task) => {
      if (!task) {
        res.status(404).send("Taskid not found");
      } else {
        console.log("user deleted successfully");
        res.status(200).send("Task deleted successfully.");
      }
    })
    .catch((errors) => {
      res.send(errors.message);
    });
};

// if the user finish the task change the status Completed
exports.taskCompleted = async (req, res) => {

  const taskId = req.params.taskid ;

  await taskSchema.findByIdAndUpdate( { _id: taskId },{ $set: { status: "Completed" } },{ new: true })

    .then((result) => {
      if (result) {
        console.log(" Task Completed successfully");
        res.status(200).send({ message: "Task Completed", result});
      } else {
        res.send("invalid Id");
      }
    })
    .catch((error) => {
      console.log(error.message);
      res.send(error.message);
    });
};

//find the user by task id 
exports.findUser = async (req, res) => {

  await taskSchema.findOne({ _id: req.body.taskid }).populate('taskSendBy',['task','status','userName','fullName','email'])

    .then((result) => {
    
      res.json({
        message: "user details here",
      result

      });
      console.log(result);
    })
    .catch((err) => {
      console.log(err.message);
    });
};


/** View the Date wise Task  -if we give the Date in body(yyyy-mm-dd),
 * 
We get that day task list,else we get  Today's Task list  **/

exports.todayTask = async (req, res) => {

  const getDate = req.body.date;

  if (getDate) {
    const dateStart = getDate + "T00:00:00.000Z";
    const dateEnd = getDate + "T23:59:59.000Z";

    await taskSchema.find({ createdAt: { $gte: dateStart, $lt: dateEnd}})
    .then(task => {
      res.json({
        message:"task details here",
        task 
      })
      console.log(task);
     })
     .catch(err=>{
       res.send(err.message)
     })
  
  } else {

     await taskSchema.find({ createdAt: { $gte: startDate, $lt: endDate }})
    .then(todayTask=>{

      res.json({
        message:"task details here",
        todayTask 
      })
    })
     .catch(err=>{
       res.send(err.message)
     })
    
  }
};

// comment the task by userid and taskid
exports.taskComment = async (req, res) => {

 
  const userId = req.params.userid; 
  const taskId = req.params.taskid;

  await taskSchema.findById({ _id:taskId })

    .then(async result => {
      console.log(result)
      
      if (result.taskSendBy == userId && result._id == taskId)  {

       await Task.findOneAndUpdate( { _id: taskId },{ $set: { comment: req.body.comment } },{new:true})
        .then(comment => {

          res.json({
          message: "comment updated sucessfully",
          comment,
         });
        })
      
      }

      else {
        res.json({
          message: "wrong userid or taskid",
        });

      } 
    })

    .catch((err) => {
      res.send(err.message);
    })
};


/* Mail Notification send on particular time*/

exports.mailSend = async (req, res) => {
  
  
    
  await taskSchema.find({createdAt: { $gte: startDate, $lt: endDate }}).populate("taskSendBy")

     .then((result) => {
    
       if(result.length == 0){ 

          console.log("Tasks not updated today")
        }

        else {

        cron.schedule(" * * * * * ", () => {     // E-mail schedule  at 9.00 pm
          
        for (const e in result) {
          
          const userEmail = result[e].tasksendBy.email;
          const fullName = result[e].tasksendBy.fullName;
          const task = result[e].task;
          const taskStatus = result[e].status;
  
          statusMail(userEmail,fullName,task,taskStatus)
          
          console.log(userEmail)
           
        }
            res.send("EOD Mail sent to All")
        });
      
        }

      })
      .catch (error => {
         console.log(error.message);
         res.send(error.message);
       })

};

