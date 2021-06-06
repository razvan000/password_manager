const express= require('express')

const bodyParser = require('body-parser')
const cors = require('cors')
const bcrypt = require('bcrypt')
const Sequelize = require('sequelize')
// import express from 'express'
// import bodyParser from 'body-parser'
// import cors from 'cors'
// import bcrypt from 'bcrypt'
// import Sequelize from 'sequelize'
const Op = Sequelize.Op
const sequelize = new Sequelize('extension', 'root', 'root', {
  dialect: 'mysql',
  host: "localhost"
})

const app= express()
app.use(bodyParser.json())
app.use(cors())
sequelize.authenticate().then(() => {
    console.log("Connected to database")
  }).catch((err) => {
    console.log(err)
    console.log("Unable to connect to database")
  })

const User = sequelize.define('user', {
    email:{
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
        validate:{
            isEmail: true
        }
    },
    password:{
        type: Sequelize.STRING,
        allowNull: false,
    }
})

  const Account = sequelize.define('account',{
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [3, 255]
        }
    },
    password:{
        type: Sequelize.STRING,
        allowNull: false
    },
    key:{
        type: Sequelize.STRING,
        allowNull: false
    },
    site :{
        type:Sequelize.STRING,
        allowNull:false
    }     
  })

 Account.belongsTo(User)

app.get('/create', async (req, res, next) => {
    try {
      await sequelize.sync({ force: true })
      res.status(201).json({ message: 'created' })
    } catch (err) {
      next(err)
    }
  })

  app.get('/users', async (req, res, next)=>{
      try{
          const users = await User.findAll()
          if(users){
              res.status(200).json(users)
          }else{
              res.status(404).json({message:"not found"})
          }
      }catch(err){
          next(err)
      }
  })

  app.get('/users/:email', async(req, res, next)=>{
      try{
        const user= await User.findByPk(req.params.email)
        if(user){
            res.status(201).json(user)
        }else{
            res.status(404).json({message:'not found'})
        }
      }catch(err){
          next(err)
      }
  })

  app.post('/users', async(req, res, next)=>{
    try{
        const hashedPass = await bcrypt.hash(req.body.password,10)
        const user = {
            email: req.body.email,
            password: hashedPass
        }
        await User.create(user)
        res.status(200).json({message:"created"})
    }catch(err){
        next(err)
    }
  })

  app.post('/users/login', async(req,res,next)=>{
      const user = await User.findOne({where:{email:req.body.email}})
      if(user === null){
          res.status(404).json({message:"not found"})
      }else{
          try{
              if(await bcrypt.compare(req.body.password,user.password)){
              res.status(201).json({message:"Accepted"})
            }else{
            res.status(400).json({message:"Not allowed"})
            }      
        }catch(err){
            console.error(err)
      }
    }
  })

  app.put('/users/:email', async (req, res, next)=>{
      try{
        const user= await User.findByPk(req.params.email)
        if(user){
            await user.update(req.body)
            res.status(201).json({message:"accepted"})
        }else{
            res.status(404).json({message:"not found"})
        }
      }catch(err){
          next(err)
      }
  })

  app.delete('/users/:email', async(req, res, next)=>{
    try{
        const user= await User.findByPk(req.params.email)
        if(user){
            await user.destroy()
            res.status(201).json({message:"accepted"})
        }else{
            res.status(404).json({message:"not found"})
        }
      }catch(err){
          next(err)
      }
  })

  app.get('/users/:email/accounts', async (req, res ,next)=>{
      try{
        const user = await User.findByPk(req.params.email)
        if(user){
            const accounts=await Account.findAll({where:{userEmail:req.params.email}})
            res.status(201).json(accounts)
        }else{
            res.status(404).json({message:'not found'})
        }
      }catch(err){
          next(err)
      }
  })

  app.get('/users/:email/accounts/:acc_site', async(req , res, next)=>{
      try{
        const user = await User.findByPk(req.params.email)
            if(user){
                const account= await Account.findOne({where:{
                    [Op.or]:[
                        {userEmail:req.params.email,site:{[Op.substring]:req.params.acc_site.split('.')[1]}},
                        {userEmail:req.params.email,site:{[Op.substring]:req.params.acc_site}}
                    ]
                }})
                if(account){
                    res.status(201).json(account)
                }else{
                    res.status(404).json({message:'not found'})
                }
            }
      }catch(err){
          next(err)
      }
  })

  app.post('/users/:email/accounts', async (req, res, next)=>{
      try{
          const user= await User.findByPk(req.params.email)
            if(user){
                const account = new Account(req.body)
                account.userEmail=req.params.email
                await account.save()
                res.status(201).json({message: 'created'})
            }else{
                res.status(404).json({message:'not found'})
            }
      }catch(err){
          next(err)
      }
  })

  app.delete('/users/:email/accounts/:acc_site', async( req, res, next )=>{
      try{
        const user = await User.findByPk(req.params.email)
        if(user){
            const account= await Account.findOne({where:{
                [Op.or]:[
                    {userEmail:req.params.email,site:{[Op.substring]:req.params.acc_site.split('.')[1]}},
                    {userEmail:req.params.email,site:{[Op.substring]:req.params.acc_site}}
                ]
            }})
            if(account){
                await account.destroy()
                res.status(201).json({message:"accepted"})
            }else{
                res.status(404).json({message:'not found'})
            }
        }
      }catch(err){
          next(err)
      }
  })


app.listen(8080)

