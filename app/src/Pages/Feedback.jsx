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

        this.lang = window.getLanguageFile();
    }

    componentDidMount = () => {
        document.body.style.backgroundColor = window.getThemeType() ? darkTheme.palette.background.default : lightTheme.palette.background.default;
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
                        fallback: 'フィードバックの送信 (ベータ)',
                        color: '#FF8000',
                        title: 'フィードバックの送信 (ベータ)',
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
            <ThemeProvider theme={window.getThemeType() ? darkTheme : lightTheme}>
                <Grid container className={classes.root}>
                    <Grid item xs={12} style={{ display: 'flex', flexDirection: 'column' }}>
                        <ThemeProvider theme={window.getThemeType() ? darkTheme : lightTheme}>
                            <Typography variant="h6" color="textPrimary" className={classes.paperHeading}>フィードバックの送信</Typography>
                            <Divider />
                            <TextField
                                label="状況の説明"
                                multiline
                                rows="4"
                                variant="outlined"
                                className={classes.textField}

                                value={this.state.reason}
                                onChange={(e) => this.setState({ reason: e.target.value })}
                            />
                            <TextField
                                label="URL (任意)"
                                type="url"
                                variant="outlined"
                                className={classes.textField}

                                value={this.state.url}
                                onChange={(e) => this.setState({ url: e.target.value })}
                            />
                            <TextField
                                label="メールアドレス (任意)"
                                type="email"
                                variant="outlined"
                                className={classes.textField}

                                value={this.state.mailAddress}
                                onChange={(e) => this.setState({ mailAddress: e.target.value })}
                            />
                            <Divider />
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 10 }}>
                                <Button variant="contained" color="primary" onClick={this.handleSendClick}>送信</Button>
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
};

const Page = withStyles(styles, { withTheme: true })(Feedback);

render(
    <Page />,
    document.getElementById('app')
);