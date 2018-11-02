const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {isLoggedIn} = require('./middlewares');
const {User, Room, Chat} = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try{
        const rooms = await Room.findAll({
            include : [{
                model : User,
                attributes : [
                    'nick'
                ]
            }]
        });
        res.render('chatMain', {rooms, title: 'Sharever Chat Room', error: req.flash('roomError')});
    }catch(error){
        console.error(error);
        next(error);
    }
});

router.get('/room', isLoggedIn, (req, res) => {
    res.render('room', {title: 'Open new chat room'});
});

router.post('/room', isLoggedIn, async (req, res, next) => {
    try{
        const newRoom = await Room.create({
            title: req.body.title,
            max: req.body.max,
            userId: req.user.id,
            password:req.body.password, 
        });

        const io = req.app.get('io');
        io.of('/room').emit('newRoom', newRoom);
        res.redirect(`/chatmain/room/${newRoom.id}?password=${req.body.password}`);
    }catch(error){
        console.error(error);
        next(error);
    }
});

router.get('/room/:id', isLoggedIn, async (req, res, next) => {
    try{
        const room = await Room.find({where : {id : req.params.id}});
        const io = req.app.get('io');
        if(!room){
            req.flash('roomError', '존재하지 않는 방입니다.');
            return res.redirect('/chatmain/');
        }
        if(room.password && room.password !== req.query.password){
            req.flash('roomError', '비밀번호가 틀렸습니다.');
            return res.redirect('/chatmain/');
        }

        const {rooms} = io.of('/chat').adapter;
        if(rooms && rooms[req.params.id] && room.max < rooms[req.params.id.length]){
            req.flash('roomError', '허용 인원이 초과하였습니다.');
            return res.redirect('/chatmain/');
        }

        const chats = await Chat.findAll({
            where : {
                roomId : room.id
            },
            order : [['createdAt']],
            include : [{
                model : User,
                attributes : [
                    'nick'
                ]
            }]
        });

        const user = await User.find({
            where : {id : req.user.id}
        })

        return res.render('chat', {
            room,
            title : room.title,
            chats,
            user: req.user.id,
            nick : user.nick
        });
    }catch(error){
        console.error(error);
        return next(error);
    }
});

router.delete('/room/:id', async (req, res, next) => {
    try{
        console.log('방 삭제 시작');
        await Chat.destroy({where : {roomId : req.params.id}});
        await Room.destroy({where : {id : req.params.id}});
        
        console.log('방 삭제 완료');

        res.send('ok');
        setTimeout(() => {
            req.app.get('io').of('/room').emit('removeRoom', req.params.id);
        }, 2000);
    }catch(error){
        console.error(error);
        return next(error);
    }
});

router.post('/room/:id/chat', isLoggedIn, async (req, res, next) => {
    try{
        const chatWithoutUser = await Chat.create({
            roomId : req.params.id,
            userId: req.user.id,
            chat: req.body.chat,
        });

        const chat = await Chat.find({
            where : {
                id : chatWithoutUser.id
            },
            include : [{
                model : User,
                attributes : [
                    'nick'
                ]
            }]
        });

        req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
        res.send('ok');
    }catch(error){
        console.error(error);
        next(error);
    }
});

fs.readdir('uploads', (error) => {
    if(error){
        console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
        fs.mkdirSync('uploads');
    }
});

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb){
            cb(null, 'uploads/');
        },
        filename(req, file, cb){
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
        },
    }),
    limits : {fileSize: 5 * 1024 * 1024},
});

router.post('/room/:id/gif', isLoggedIn, upload.single('gif'), async (req, res, next) => {
    try{
        const chat = await Chat.Create({
            roomId : req.params.id,
            userId: req.user.id,
            image: req.file.filename,
        });

        req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
        res.send('ok');
    }catch(error){
        console.error(error);
        next(error);
    }
});

module.exports = router;