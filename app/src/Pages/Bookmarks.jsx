import React, { Component } from 'react';
import ReactDOM, { render } from 'react-dom';
import { BrowserRouter, Route, Link as RouterLink, Switch as RouterSwitch } from 'react-router-dom';
import Moment from 'react-moment';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
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
import Collapse from '@material-ui/core/Collapse';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';

import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

import CloudIcon from '@material-ui/icons/CloudOutlined';
import CloudOffIcon from '@material-ui/icons/CloudOffOutlined';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

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
        flexBasis: '55%',
        flexShrink: 0,
        [theme.breakpoints.up('md')]: {
            flexBasis: '15%'
        }
    },
    panelSecondaryHeading: {
        fontSize: theme.typography.pxToRem(15)
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

class Bookmarks extends Component {

    constructor(props) {
        super(props);

        this.state = {
            bookMarks: [],
            privMarks: [],
            createFolderName: '',
            isExpanded: 'bookMarks',
            isDialogOpened: false
        };

        this.bookmarks = window.getLanguageFile().internalPages.bookmarks;
    }

    componentDidMount = () => {
        document.title = this.bookmarks.title;

        this.reloadData();
        setInterval(() => this.reloadData(), 1000 * 5);
    }

    componentWillReceiveProps = () => {
        document.title = this.bookmarks.title;
        this.reloadData();
    }

    reloadData = () => {
        window.getBookmarks(true).then((data1) => {
            this.setState({ privMarks: data1 });

            window.getBookmarks(false).then((data2) => {
                this.setState({ bookMarks: data2 });
            });
        });
    }

    handleChange = (panel) => (e, isExpanded) => {
        this.setState({ isExpanded: isExpanded ? panel : false });
    }

    handleDialogOpen = (id) => {
        this.setState({ isDialogOpened: id });
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    render() {
        const { classes } = this.props;

        console.log(this.state.bookMarks);

        return (
            <NavigationBar title={this.bookmarks.title} buttons={[
                <Button color="inherit" onClick={this.handleDialogOpen.bind(this, 'create')}>フォルダを追加</Button>,
                <Button color="inherit" onClick={this.handleDialogOpen.bind(this, 'clear')}>{this.bookmarks.clear}</Button>
            ]}>
                <Container fixed className={classes.containerRoot}>
                    <div className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.panelRoot}>
                                {this.props.match.params.id &&
                                    <Paper elevation={0} variant="outlined" style={{ padding: 10, marginBottom: 10 }}>
                                        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                                            <Link to="/" color="inherit" component={RouterLink}>{this.bookmarks.title}</Link>
                                            <Typography color="textPrimary">{this.props.match.params.id}</Typography>
                                        </Breadcrumbs>
                                    </Paper>
                                }
                                <Paper>
                                    <Table className={classes.table}>
                                        <TableBody>
                                            {this.state.bookMarks
                                                .filter((item, i) => this.props.match.params.id ? item.parentId == this.props.match.params.id : item.parentId == undefined || item.parentId == null || item.parentId == '')
                                                .sort((a, b) => a.isFolder < b.isFolder ? 1 : -1)
                                                .map((item, v) => {
                                                    return (
                                                        <TableRow key={v}>
                                                            <TableCell className={classes.tableDate}><Moment format="HH:mm">{item.createdAt}</Moment></TableCell>
                                                            <TableCell className={classes.tableIcon}><img src={!item.isFolder ? (String(item.url).startsWith(`${protocolStr}://`) || String(item.url).startsWith(`${fileProtocolStr}://`) ? `${protocolStr}://resources/icons/public.svg` : (item.favicon ? item.favicon : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`)) : `${protocolStr}://resources/icons/folder_close.png`} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
                                                            <TableCell component="th" scope="row" className={classes.tableTitle}>
                                                                {!item.isFolder ?
                                                                    <Link href={item.url} title={item.title} color="inherit">{item.title}</Link>
                                                                    :
                                                                    <Link to={`/${item.id}`} color="inherit" style={{ textDecoration: 'none' }} component={RouterLink}>{item.title}</Link>
                                                                }
                                                            </TableCell>
                                                            <TableCell title={item.url} className={classes.tableUrl}>{!item.isFolder ? new URL(item.url).hostname : ''}</TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            }
                                        </TableBody>
                                    </Table>
                                </Paper>
                            </Grid>
                        </Grid>
                    </div>
                </Container>
                <Dialog
                    open={this.state.isDialogOpened === 'create'}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">フォルダを追加</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            variant="outlined"
                            label="名前"
                            type="text"
                            fullWidth
                            required
                            value={this.state.createFolderName}
                            onChange={(e) => this.setState({ createFolderName: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" variant="outlined" onClick={this.handleDialogClose}>
                            キャンセル
                        </Button>
                        <Button color="primary" variant="contained" onClick={() => { window.addBookmark(this.state.createFolderName, '', this.props.match.params.id ? this.props.match.params.id : '', true, false); this.setState({ createFolderName: '' }); }}>
                            登録
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.isDialogOpened === 'clear'}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">ブックマークの削除</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            これまで登録したブックマークをすべて削除します。<br />
                            <b>続行</b>を押すとブックマークが削除されます。
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" variant="outlined" onClick={this.handleDialogClose} style={{ marginRight: 5 }}>
                            キャンセル
                        </Button>
                        <Button color="primary" variant="contained" onClick={() => { this.setState({ isDialogOpened: false }); window.clearBookmarks(true); window.location.reload(); }}>
                            続行
                        </Button>
                    </DialogActions>
                </Dialog>
            </NavigationBar>
        );
    }
}

Bookmarks.propTypes = {
    classes: PropTypes.object.isRequired,
};

const Page = withStyles(styles)(Bookmarks);

render(
    <BrowserRouter>
        <div>
            <Route exact path='/:id?' component={Page} />
        </div>
    </BrowserRouter>,
    document.getElementById('app')
);