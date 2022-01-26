const express = require('express');
const { all } = require('express/lib/application');
const app = express();
const port =6500;
const fs = require('fs');
const Playlist = require('./playlistDatabase.json');

//middleware
app.use(express.json());

app.get('/', ( req, res) => {
    res.status(200).json({
        see : `Access : 'http://localhost:${port}/playlist' to see your all playlist`,
        addp : `Access : 'http://localhost:${port}/addplaylist' to add new playlist`,
        change : `Access : 'http://localhost:${port}/updateplaylist/{playlist name you want to change}'`,
        deletep : `Access : 'http://localhost:${port}/delete/{playlist name you want to delete}'`,
        seefav : `Access : 'http://localhost:${port}/favourite' to see your favourite playlist`,
        makefav : `Access : 'http://localhost:${port}/assignfavourite/{playlist name you want to make it favourite}'`,
    })
})
app.get('/playlist', ( req, res) => {
    const allplaylist = Playlist.map( playlist => {
        delete playlist.favourite;
        return playlist;
    })
    if(allplaylist.length>0){
        res.status(200).json({
            Message : 'Here is Your all playlist !',
            Data :  allplaylist
        })
    }else{
        res.status(204).json({
            Message : 'Here is Your all playlist !',
            Data :  'No playlist is there in your playlist'
        })
    }
})

app.post('/addplaylist', ( req, res ) => {
    const { name, favourite } = req.body;
    const newplaylist = { name, favourite};
    const playlistExist = Playlist.find(playlist => {
        return playlist.name === name;
    })
    if(playlistExist){
        res.status(406).json({
            Message : 'New playlist Not Added , it\'s Already Exist !',
            Data : newplaylist
        })
    }else{
        Playlist.push(newplaylist);
        fs.writeFile('./playlistDatabase.json', JSON.stringify(Playlist), (err) => {
            if(err){
                res.status(500).send('server Error ! ', err);
            }else{
                res.status(201).json({
                    Message : 'New playlist added !',
                    Data : newplaylist
                })
            }
        })
    }
})

app.put('/updateplaylist/:name', ( req, res) => {
    const { name } = req.params;
    const { newName, favourite} = req.body;
    const playlistfound = Playlist.find(playlist => {
        return (playlist.name === name);
    })
    const newplaylistExist = Playlist.find(playlist => {
        return playlist.name === newName;
    })
    if(playlistfound){
        if((playlistfound.name !== newName) || (playlistfound.favourite !== favourite)){
            if(newplaylistExist){
                res.status(406).json({
                    Message : 'This playlist with same name already Exist . Hence, Not Updated !',
                    Data : `playlist name : ${newName}`
                })
            }else{
                playlistfound.name = newName;
                playlistfound.favourite = favourite;
                fs.writeFile('./playlistDatabase.json',JSON.stringify(Playlist), err => {
                    if(err){
                        res.status(501).send('Internal error !')
                    }else{
                        res.status(202).json({
                            Message : 'playlist Updated !',
                            Data : playlistfound
                        })
                    }
                })
            }
        }else{
            res.status(406).json({
                Message : 'Not Updated !',
                Data : 'Original Data Not Changed'
            })
        }  
    }else{
        res.status(204).json({
            Message : 'This playlist is Not in your list . Hence, Not Updated !',
            Data : `playlist name : ${name}`
        })
    }
})
app.put('/assignfavourite/:name', ( req, res) => {
    const { name } = req.params;
    const { favourite } = req.body;
    const playlistfound = Playlist.find(playlist => {
        return (playlist.name === name);
    })
    if(playlistfound){
        if(playlistfound.favourite !== favourite){
            playlistfound.favourite = favourite;
            fs.writeFile('./playlistDatabase.json',JSON.stringify(Playlist), err => {
                if(err){
                    res.status(500).send('Internal error !')
                }else{
                    res.status(201).json({
                        Message : 'playlist Updated !',
                        Data : playlistfound
                    })
                }
            })
        } else{
            res.status(406).json({
                Message : 'Not assign Favourite  !',
                Data : 'Original Data Not Changed'
            })
        } 
    }else{
        res.status(204).json({
            Message : 'This playlist is Not in your list . Hence, Not assign Favourite !',
            Data : `playlist name : ${name}`
        })
    }
})

app.delete('/delete/:name', (req, res) => {
    const { name } = req.params;
    const playlistExist = Playlist.find(playlist => {
        return playlist.name === name;
    })
    if(playlistExist){
        const index = Playlist.indexOf(playlistExist);
        Playlist.splice(index, 1);
        fs.writeFile('/playlistDatabase.json',JSON.stringify(Playlist), err => {
            if(err){
                res.status(500).json({
                    Message : 'This playlist doesnt Deleted . Internal Error !', err,
                    Data : `playlist name : ${name}`
                })
            }else{
                res.status(200).json({
                    Message : 'This playlist is Deleted !',
                    Data : `playlist name : ${name}`
                })
            }
        })
    }else{
        res.status(406).json({
            Message : 'This playlist is Not in your list . Hence, Not Deleted !',
            Data : `playlist name : ${name}`
        })
    }

})

app.get('/favourite', (req, res) => {
    const favplaylist = Playlist.filter( playlist => {
        return playlist.favourite === true;
    })
    if(favplaylist){
        res.status(200).json({
            Message : 'Here is your Favourite PlayList !',
            Data : favplaylist
        })
    }else{
        res.status(200).json({
            Message : 'Here is your Favourite PlayList !',
            Data : 'You don\'t have any playlist in Favourite PlayList '
        })
    }
    
})






app.listen( port , ( req, res ) => {
    console.log(`Server is running on Port number : ${port} !...`);
})