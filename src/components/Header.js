import { AppBar, Toolbar, Typography, makeStyles } from "@material-ui/core";
import { HeadsetTwoTone } from "@material-ui/icons";
import React from "react";

const useStyles=makeStyles(theme => ({
    title:{
        marginLeft:theme.spacing(2)
    }
}));

function Header(){
    const classes=useStyles();
    return(
        <AppBar position='fixed' color="primary" >
            <Toolbar>
                <HeadsetTwoTone />
                <Typography className={classes.title} variant="h6" component="h1">
                    Apollo Music Share
                </Typography>
            </Toolbar>
        </AppBar>
    )
}
export default Header;