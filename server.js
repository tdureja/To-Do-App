const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const PORT = 3000; // set port number for server to listen to
const cors = require('cors');


app.use(cors());

app.use(express.json());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri); // create new mongoclient instance to conenct to mongodb

let db;
let tasksCollection;

async function connectDB(){
    try{
        await client.connect(); // asynchronously connect to mongodb server
        db = client.db('todoApp'); //select database
        tasksCollection = db.collection('tasks'); // select collection where tasks are stores
        console.log('Connected to MongoDB');
    } catch(error){
        console.error('MongoDB connection error:', error);
    }
}

connectDB();

app.get('/tasks', async (req, res) => {
    try {
        const tasks = await tasksCollection.find({}).toArray(); // query task collection to find tasks and convert them to array
        console.log(`Fetched ${tasks.length} tasks`); // Log the number of tasks fetched
        res.json(tasks); // respond to client with list of tasks 
    } catch (error){
        console.error('Error fetching tasks:', error);
        res.status(500).send('Error fetching tasks'); //send error 
    }
});


app.post('/tasks', async (req, res) => {
    console.log('Post /tasks', req.body);
    const newTask = {
        title: req.body.title,          // get title from request body
        completed: false                // new tasks uncompleted by default
    };
    try{
        const result = await tasksCollection.insertOne(newTask);
        res.status(201).json({_id: result.insertedId, ...newTask});
    } catch(error) {
        console.error('Error adding task:', error);
        res.status(500).send('Error adding task');
    }                  
});

app.put('/tasks/:id', async(req, res) => {
    
    const taskId = req.params.id;
    console.log('Received taskId:', taskId); // Add this line


    try{
        const result = await tasksCollection.findOneAndUpdate(
            {_id: new ObjectId(taskId) },
            {$set: {title: req.body.title, completed: req.body.completed}},
            {returnDocument: 'after'}
        );

        if (!result.value){
            return res.status(404).send('Task not found');
        }

        res.json(result.value);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).send('Error updating task');
    }
});         

app.delete('/tasks/:id', async (req, res) => {

    const taskId = req.params.id;
    
    try{
        const result = await tasksCollection.deleteOne({_id: new ObjectId(taskId)});

        if (result.deletedCount === 0){
            return res.status(404).send('Task not found');
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).send('Error deleting task');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
