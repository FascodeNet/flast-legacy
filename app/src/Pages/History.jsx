import React, { Component } from 'react';
import { render } from 'react-dom';
import Moment from 'react-moment';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import MuiTableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Collapse from '@material-ui/core/Collapse';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

import CloudIcon from '@material-ui/icons/CloudOutlined';
import CloudOffIcon from '@material-ui/icons/CloudOffOutlined';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import NavigationBar from './Components/NavigationBar.jsx';

import { isDarkTheme, getTheme, darkTheme, lightTheme } from './Theme.jsx';

const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;


const styles = (theme) => ({
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    containerRoot: {
        position: 'relative',
        top: 32,
        height: 'calc(100% - 32px)',
        [theme.breakpoints.up('md')]: {
            top: 40,
            height: 'calc(100% - 40px)'
        }
    },
    paperRoot: {
        padding: theme.spacing(3, 2),
        borderRadius: 0,
        minHeight: '100%'
    },
    panelRoot: {
        padding: '8px 0px !important'
    },
    panelHeading: {
        fontSize: theme.typography.pxToRem(15),
        flexShrink: 0
    },
    panelSecondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        marginLeft: 15
    },
    table: {
        tableLayout: 'fixed',
        whiteSpace: 'nowrap'
    },
    tableDate: {
        width: 80,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        userSelect: 'none',
        pointerEvents: 'none',
        color: getTheme().palette.text.secondary
    },
    tableIcon: {
        width: 20,
        whiteSpace: 'nowrap',
        padding: '14px 16px',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    tableTitle: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    tableUrl: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        color: getTheme().palette.text.secondary
    }
});


const TableRow = withStyles({
    root: {
        '&:last-child': {
            '& > td, th': {
                borderBottom: 'none'
            }
        }
    }
})(MuiTableRow);


class History extends Component {

    constructor(props) {
        super(props);

        this.state = {
            histories: {},
            isDialogOpened: false
        };
        
        this.history = window.getLanguageFile().internalPages.history;
    }

    componentDidMount = () => {
        document.title = this.history.title;

        this.reloadData();
        setInterval(() => this.reloadData(), 1000 * 5);
    }

    componentWillReceiveProps = () => {
        document.title = this.history.title;
        this.reloadData();
    }

    reloadData = () => {
        window.getHistories().then((data) => {
            let datas = {};
            data.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
            data.map((value, i) => {
                const date = new Date(value.updatedAt);
                const cat = JSON.stringify({ year: date.getFullYear(), month: date.getMonth(), day: date.getDate() });

                if (datas[cat] === undefined)
                    datas[cat] = [];
                datas[cat].push(value);
            });

            this.setState({ histories: datas });
        });
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={this.history.title} buttons={[<Button color="inherit" onClick={() => { this.setState({ isDialogOpened: true }); }}>{this.history.clear}</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <div className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.panelRoot}>
                                {Object.keys(this.state.histories).map((history, i) => {
                                    const json = JSON.parse(history);
                                    const date = new Date(json.year, json.month, json.day);

                                    return (
                                        <ExpansionPanel defaultExpanded={i === 0} TransitionProps={{ unmountOnExit: true }} key={i}>
                                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                                <Typography className={classes.panelHeading}><Moment format="YYYY年MM月DD日">{date}</Moment></Typography>
                                                <Typography className={classes.panelSecondaryHeading} color="textSecondary">{this.state.histories[history].length}</Typography>
                                            </ExpansionPanelSummary>
                                            <ExpansionPanelDetails style={{ padding: 0 }}>
                                                <Table className={classes.table}>
                                                    <TableBody>
                                                        {this.state.histories[history].map((item, v) => {
                                                            return (
                                                                <TableRow key={v}>
                                                                    <TableCell padding="checkbox">
                                                                        <Checkbox color={isDarkTheme() ? 'secondary' : 'primary'} />
                                                                    </TableCell>
                                                                    <TableCell className={classes.tableDate}><Moment format="HH:mm">{item.updatedAt}</Moment></TableCell>
                                                                    <TableCell className={classes.tableIcon}><img src={String(item.url).startsWith(`${protocolStr}://`) || String(item.url).startsWith(`${fileProtocolStr}://`) ? `${protocolStr}://resources/icons/public.svg` : item.favicon ? item.favicon : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
                                                                    <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={item.url} title={item.title} color="inherit">{item.title}</Link></TableCell>
                                                                    <TableCell title={item.url} className={classes.tableUrl}>{new URL(item.url).hostname}</TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </ExpansionPanelDetails>
                                        </ExpansionPanel>
                                    );
                                })}
                            </Grid>
                        </Grid>
                    </div>
                </Container>
                <Dialog
                    open={this.state.isDialogOpened}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">閲覧履歴の削除</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            これまで閲覧した閲覧履歴をすべて削除します。<br />
                            <b>続行</b>を押すと閲覧履歴が削除されます。
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" variant="outlined" onClick={this.handleDialogClose} style={{ marginRight: 5 }}>
                            キャンセル
                        </Button>
                        <Button color="primary" variant="contained" onClick={() => { this.setState({ isDialogOpened: false }); window.clearHistories(true); window.location.reload(); }}>
                            続行
                        </Button>
                    </DialogActions>
                </Dialog>
            </NavigationBar>
        );
    }
}

History.propTypes = {
    classes: PropTypes.object.isRequired,
};

const Page = withStyles(styles)(History);

render(
    <Page />,
    document.getElementById('app')
);