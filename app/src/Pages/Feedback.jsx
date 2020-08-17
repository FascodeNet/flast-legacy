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
import TextField from '@material-ui/core/TextField';


import { isDarkTheme, getTheme, darkTheme, lightTheme } from './Theme.jsx';


const styles = (theme) => ({
    root: {
        height: '100%',
        padding: 8,
        backgroundColor: getTheme().palette.background.default
    },
    paperHeading: {
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5)
    },
    textField: {
        margin: 10
    }
});


class Feedback extends Component {

    constructor(props) {
        super(props);

        this.state = {
            reason: '',
            url: '',
            mailAddress: ''
        };

        this.feedback = window.getLanguageFile().internalPages.feedback;
    }

    componentDidMount = () => {
        document.title = this.feedback.title;
    }

    handleSendClick = () => {
        fetch(window.getFeedbackSendURL(), {
            mode: 'no-cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                attachments: [
                    {
                        fallback: 'フィードバックの送信',
                        color: '#FF8000',
                        title: 'フィードバックの送信',
                        fields: [
                            {
                                short: false,
                                title: '状況の説明',
                                value: this.state.reason
                            },
                            {
                                short: true,
                                title: 'URL',
                                value: this.state.url
                            },
                            {
                                short: true,
                                title: 'メールアドレス',
                                value: this.state.mailAddress
                            },
                            {
                                short: false,
                                title: 'システム情報',
                                value: `OS: \`${window.getOSVersion()}\`, Flast Version: \`${window.getAppVersion()}\` (\`${window.getAppChannel()}\`), Electron Version: \`${window.getElectronVersion()}\`, Chromium Version: \`${window.getChromiumVersion()}\``
                            }
                        ]
                    }
                ]
            })
        }).then((res) => {
            window.closeWindow();
        }).catch((err) => {
            console.log(err); // rejected: TypeError: Failed to fetch
        });
    }

    render() {
        const { classes } = this.props;

        return (
            <ThemeProvider theme={getTheme()}>
                <Grid container className={classes.root}>
                    <Grid item xs={12} style={{ display: 'flex', flexDirection: 'column' }}>
                        <ThemeProvider theme={getTheme()}>
                            <Typography variant="h6" color="textPrimary" className={classes.paperHeading}>{this.feedback.title}</Typography>
                            <Divider />
                            <TextField
                                label={this.feedback.controls.description}
                                multiline
                                rows="4"
                                variant="outlined"
                                className={classes.textField}

                                value={this.state.reason}
                                onChange={(e) => this.setState({ reason: e.target.value })}
                            />
                            <TextField
                                label={this.feedback.controls.url}
                                type="url"
                                variant="outlined"
                                className={classes.textField}

                                value={this.state.url}
                                onChange={(e) => this.setState({ url: e.target.value })}
                            />
                            <TextField
                                label={this.feedback.controls.email}
                                type="email"
                                variant="outlined"
                                className={classes.textField}

                                value={this.state.mailAddress}
                                onChange={(e) => this.setState({ mailAddress: e.target.value })}
                            />
                            <Divider />
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 10 }}>
                                <Button variant="contained" color="primary" onClick={this.handleSendClick}>{this.feedback.controls.send}</Button>
                            </div>
                        </ThemeProvider>
                    </Grid>
                </Grid>
            </ThemeProvider>
        );
    }
}

Feedback.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

const Page = withStyles(styles, { withTheme: true })(Feedback);

render(
    <Page />,
    document.getElementById('app')
);