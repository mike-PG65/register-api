const mysql = require ('mysql2');
const express = require('express');
const bcrypt = require('bcrypt');

require ('dotenv').config();

const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_BASE,
    port:process.env.DB_PORT


})


const promisedb = db.promise()


db.connect((err)=>{
    if  (err){
        console.error("Error connecting to the database",err)
        return;
    }
    console.log("Connected to the database")
})

app.post('/add-user', async (req, res)=>{
    const {firstname, lastname, email, password}=  req.body;

    if(!firstname || !lastname || !email || !password){
        return res.status(401).json({message: "All filds are required"})
    }


    //check if the user has already been registered

    const check = 'SELECT * FROM userss WHERE email =? '
    const value = [email]
    
    try {

        const [rows] = await promisedb.query(check, value);

        if (rows.length > 0){
            return res.status(400).json({message: "User already exists"});
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);


        const insert = 'INSERT INTO userss (firstname, lastname, email, password) VALUES(?,?,?,?) '
        const values = [firstname, lastname, email, hashedPassword];

        const [results] = await promisedb.query(insert, values);

        return res.status(200).json({message: "User added to the database"})
        
    } catch (error) {

        console.error('Error inserting data into the database', error)
        return res.status(500).json({message:'Failed to add user'})
        
    }

    
})


app.get('/user-list', async (req, res)=>{
    try {
        const [list] = await promisedb.query('SELECT * FROM userss')
        return res.status(200).json(list);
        
    } catch (error) {
        res.status(500).json('Failed to get users', error)
        
    }
   
});



app.listen(3000,()=>{
    console.log("App is listening to port 3000")
})