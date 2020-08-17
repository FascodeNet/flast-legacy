import React, { Component } from 'react';
import { render } from 'react-dom';
import Moment from 'react-moment';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';

import Button from '@material-ui/core/Button';

import NavigationBar from './Components/NavigationBar.jsx';


const styles = (theme) => ({
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    table: {
        tableLayout: 'fixed',
        whiteSpace: 'nowrap'
    },
    tableIcon: {
        width: '4%',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    tableTitle: {
        width: '51%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    tableUrl: {
        width: '35%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    tableStatus: {
        width: '10%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    tableDate: {
        width: 150,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    tableIcon2: {
        width: '4%',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    tableTitle2: {
        width: '51%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    tableUrl2: {
        width: '35%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    tableStatus2: {
        width: '10%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    tableDate2: {
        width: 150,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        userSelect: 'none',
        pointerEvents: 'none'
    }
});


class Downloads extends Component {

    constructor(props) {
        super(props);

        this.state = {
            downloads: [],
            isDialogOpened: false
        };
        
        this.downloads = window.getLanguageFile().internalPages.downloads;
    }

    componentDidMount = () => {
        document.title = this.downloads.title;

        window.getDownloads().then((data) => {
            this.setState({ downloads: data });
        });
    }

    componentWillReceiveProps = () => {
        document.title = this.downloads.title;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={this.downloads.title} buttons={[<Button color="inherit" onClick={() => { this.setState({ isDialogOpened: true }); }}>{this.downloads.clear}</Button>]}>
                <Paper className={classes.root}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.tableIcon2}></TableCell>
                                <TableCell className={classes.tableTitle2}>{this.downloads.table.title}</TableCell>
                                <TableCell className={classes.tableUrl2}>{this.downloads.table.url}</TableCell>
                                <TableCell className={classes.tableStatus2}>{this.downloads.table.status}</TableCell>
                                <TableCell className={classes.tableDate2}>{this.downloads.table.date}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.downloads.map((item, i) => (
                                <TableRow key={i}>
                                    <TableCell className={classes.tableIcon}><img src={new URL(item.url).protocol === 'flast:' ? 'flast-file:///public.svg' : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
                                    <TableCell component="th" scope="row" title={item.path} className={classes.tableTitle}>{item.name}</TableCell>
                                    <TableCell title={item.url} className={classes.tableUrl}>{item.url}</TableCell>
                                    <TableCell title={item.status} className={classes.tableStatus}>{item.status}</TableCell>
                                    <TableCell className={classes.tableDate}><Moment format="YYYY/MM/DD HH:mm">{item.createdAt}</Moment></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
                <Dialog
                    open={this.state.isDialogOpened}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">ダウンロード履歴の削除</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            これまでダウンロードしたダウンロード履歴をすべて削除します。<br />
                            <b>続行</b>を押すとダウンロード履歴が削除されます。
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" variant="outlined" onClick={this.handleDialogClose} style={{ marginRight: 5 }}>
                            キャンセル
                        </Button>
                        <Button color="primary" variant="contained" onClick={() => { this.setState({ isDialogOpened: false }); window.clearDownloads(true); window.location.reload(); }}>
                            続行
                        </Button>
                    </DialogActions>
                </Dialog>
            </NavigationBar>
        );
    }
}

Downloads.propTypes = {
    classes: PropTypes.object.isRequired,
};

const Page = withStyles(styles)(Downloads);

render(
    <Page />,
    document.getElementById('app')
);