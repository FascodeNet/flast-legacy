import React, { Component } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { render } from 'react-dom';
import Moment from 'react-moment';

import PropTypes from 'prop-types';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

const lightTheme = createMuiTheme({
    palette: {
        type: 'light'
    },
});
const darkTheme = createMuiTheme({
    palette: {
        type: 'dark'
    },
});

const styles = theme => ({
    root: {
        height: '100%',
        backgroundColor: window.getThemeType() ? darkTheme.palette.background.default : lightTheme.palette.background.default
    },
});

class ErrorPage extends Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.lang = window.getLanguageFile();
    }

    componentDidMount = () => {
        document.body.style.backgroundColor = window.getThemeType() ? darkTheme.palette.background.default : lightTheme.palette.background.default;
    }

    render() {
        const { classes } = this.props;

        return (
            <ThemeProvider theme={window.getThemeType() ? darkTheme : lightTheme}>
                <Grid container className={classes.root} direction="row" justify="center" alignItems="center">
                    <Grid item xs={12} style={{ flexBasis: 'initial' }}>
                        <Grid container direction="row" justify="center" alignItems="center">
                            <Grid item xs={12} style={{ flexBasis: 'initial', padding: 8 }}>
                                <Typography variant="h5" component="h3" color="textPrimary" style={{ marginBottom: 15 }}>{this.lang.window.view.errorMessage[String(this.props.match.params.error).replace('ERR_', '')] !== undefined && this.lang.window.view.errorMessage[String(this.props.match.params.error).replace('ERR_', '')] !== null ? this.lang.window.view.errorMessage[String(this.props.match.params.error).replace('ERR_', '')].title : this.lang.window.view.errorMessage.UNDEFINED.title}</Typography>
                                {String(this.lang.window.view.errorMessage[String(this.props.match.params.error).replace('ERR_', '')] !== undefined && this.lang.window.view.errorMessage[String(this.props.match.params.error).replace('ERR_', '')] !== null ? this.lang.window.view.errorMessage[String(this.props.match.params.error).replace('ERR_', '')].description : this.lang.window.view.errorMessage.UNDEFINED.description).split('\n').map((text) => {
                                    return (
                                        <Typography component="p" color="textPrimary">{text}</Typography>
                                    );
                                })}
                                <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }} gutterBottom>
                                    {this.props.match.params.error}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} style={{ flexBasis: '75%' }}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} style={{ flexBasis: '75%', padding: 8 }}>
                                <div style={{ justifyContent: 'flex-end', display: 'flex' }}>
                                    <Button variant="text" color="primary" style={{ marginRight: 5 }} onClick={(e) => { window.location.href = decodeURIComponent(this.props.match.params.url); }}>再読み込み</Button>
                                    <Button variant="contained" color="primary" style={{ marginLeft: 8 }} onClick={(e) => { window.history.back(); window.history.back(); }}>前のページに戻る</Button>
                                </div>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </ThemeProvider>
        );
    }
}

ErrorPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

const Page = withStyles(styles)(ErrorPage);

const App = () => (
    <HashRouter>
        <Route exact path='/:error/:url' component={Page} />
    </HashRouter>
);

render(<App />, document.getElementById('app'));