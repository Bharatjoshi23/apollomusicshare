import { useMutation } from "@apollo/client";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, makeStyles, TextField } from "@material-ui/core";
import { AddBoxOutlined, Link } from "@material-ui/icons";
import React from "react";
import ReactPlayer from "react-player";
import SoundCloudPlayer from "react-player/lib/players/SoundCloud";
import YouTubePlayer from "react-player/lib/players/YouTube";
import { ADD_SONG } from "../graphql/mutations";


const useStyles=makeStyles(theme => ({
    container:{
        display:'flex',
        alignItems:'center'
    },
    urlInput:{
        margin:theme.spacing(1)
    },
    addSongButton:{
        margin:theme.spacing(1)
    },
    dialog:{
        textAlign:'center',
    },
    thumbnail:{
        width:'90%'
    }
}));

const DEFAULT_SONG ={
        duration: 0,
        title: "",
        artist: "",
        thumbnail: ""
}

function AddSong(){
    const classes=useStyles();
    const [addSong, { error }]=useMutation(ADD_SONG);
    const [url,setUrl]= React.useState('');
    const [dialog,setDialog]=React.useState(false);
    const [playable,setPlayable]=React.useState(false);
    const [song, setSong]=React.useState(DEFAULT_SONG);

    React.useEffect(()=>{
        const isPlayable=SoundCloudPlayer.canPlay(url) || YouTubePlayer.canPlay(url);
        setPlayable(isPlayable);
    },[url]);
    function handleChangeSong(event){
        const { name,value }=event.target;
        setSong(prevSong =>({
            ...prevSong,
            [name]:value
        }));
    }

    function handleCloseDialog(){
        setDialog(false);
    }

    async function handleEditSong({player}){
        const nestedPlayer=player.player.player;
        let songData;
        if(nestedPlayer.getVideoData){
           songData =getYoutubeInfo(nestedPlayer);          
        }else if(nestedPlayer.getCurrentSound){
            songData=await getSoundCloudInfo(nestedPlayer);
        }
        setSong({ ...songData,url})
    }

    async function handleAddSong(){
        // addSong({variables:{...song }})
        try{
            const { url ,thumbnail , duration , title , artist }=song;
           await addSong({
                variables:{
                url: url.length > 0 ? url : null,
                thumbnail: thumbnail.length > 0 ? thumbnail:null,
                duration:duration > 0 ?duration : null,
                title: title.length > 0 ? title : null,
                artist: artist.length> 0 ? artist : null
            }
        });
        handleCloseDialog();
        setSong(DEFAULT_SONG);
        setUrl('');
        }catch(error){
            console.error("Error Adding Song", error);
        }
    }

    function getYoutubeInfo(player){
        const duration=player.getDuration();
        const {title,video_id,author}=player.getVideoData();
        const thumbnail=`http://img.youtube.com/vi/${video_id}/0.jpg`;
        return {
            duration,
            title,
            artist:author,
            thumbnail
        }
    }

    function getSoundCloudInfo(player){
        return new Promise(resolve => {
        player.getCurrentSound(songData => {
            if(songData){
                resolve ({
                    duration: Number(songData.duration/1000),
                    title:songData.title,
                    artist:songData.user.userame,
                    thumbnail:songData.artwork_url.replace('-large','-t500x500')
                });
            }
        })
       })
    }

    function handleError(field){
        return error?.graphQLErrors[0]?.extensions?.path.includes(field);
    }

    const { thumbnail,title,artist }=song;
    return( 
    <div className={classes.container}>
        <Dialog
        className={classes.dialog}
          open={dialog}
          onClose={handleCloseDialog}
        >
         <DialogTitle>Edit Song</DialogTitle>
         <DialogContent>
             <img 
             src={thumbnail} 
             alt="Song thumbnail"
             className={classes.thumbnail}
             />
             <TextField 
               value={title}
               onChange={handleChangeSong}
               margin="dense"
               name="title"
               label="Title"
               fullWidth
               error={handleError('title')}
               helperText={handleError('title') && 'Fill Out Field'}
            />
            <TextField 
              value={artist}
              onChange={handleChangeSong}
               margin="dense"
               name="artist"
               label="Artist"
               fullWidth
               error={handleError('artist')}
               helperText={handleError('artist') && 'Fill Out Field'}
            />
            <TextField
               value={thumbnail} 
               onChange={handleChangeSong}
               margin="dense"
               name="thumbnail"
               label="Thumbnail"
               fullWidth
               error={handleError('thumbnail')}
               helperText={handleError('thumbnail') && 'Fill Out Field'}
            />
         </DialogContent>
         <DialogActions>
             <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
             <Button onClick={handleAddSong} variant="outlined" color="primary">Add Song</Button>
         </DialogActions>
        </Dialog>
        <TextField
        onChange={event => setUrl(event.target.value)}
        value={url}
        className={classes.urlInput}
        placeholder="Add Youtube or Soundcloud Url"
        fullWidth
        margin="normal"
        type="url" 
        InputProps={{
            startAdornment:(
                <InputAdornment position="start">
                  <Link />
                </InputAdornment>
            )
        }}
        />
        <Button 
        disabled={!playable}
        className={classes.addSongButton}
        onClick={() => setDialog(true)}
        variant="contained"
        color="primary"
        endIcon={<AddBoxOutlined />}>
        Add    
        </Button>
        <ReactPlayer url={url} hidden onReady={handleEditSong} />
    </div>)
}
export default AddSong;