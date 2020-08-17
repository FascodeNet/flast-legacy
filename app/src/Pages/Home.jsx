import React, { Component } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import classNames from 'classnames';
import Moment from 'react-moment';
import throttle from 'lodash/throttle';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

import { Grid } from '@material-ui/core';

import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ButtonBase from '@material-ui/core/ButtonBase';

import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

import SearchIcon from '@material-ui/icons/Search';
import SendIcon from '@material-ui/icons/Send';

import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import BookmarksIcon from '@material-ui/icons/BookmarksOutlined';
import HistoryIcon from '@material-ui/icons/HistoryOutlined';
import DownloadsIcon from '@material-ui/icons/GetAppOutlined';
import SettingsIcon from '@material-ui/icons/SettingsOutlined';

import { isDarkTheme, getTheme, darkTheme, lightTheme } from './Theme.jsx';

const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;


const Menu = styled.div`
  width: 320px;
  padding: 10px;
  position: absolute;
  top: 85px;
  right: 20px;
  opacity: ${props => props.isShowing ? 1 : 0};
  transform: translate3d(0px, ${props => props.isShowing ? 0 : -10}px, 0px);
  box-sizing: border-box;
  background-color: ${isDarkTheme() ? 'rgba(60, 60, 60, 0.6)' : 'rgba(255, 255, 255, 0.7)'};
  transition: opacity 0.35s cubic-bezier(0.1, 0.9, 0.2, 1) 0s, transform 0.35s cubic-bezier(0.1, 0.9, 0.2, 1) 0s;
  backdrop-filter: blur(10px);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 5px -3px, rgba(0, 0, 0, 0.14) 0px 8px 10px 1px, rgba(0, 0, 0, 0.12) 0px 3px 14px 2px;
  border-radius: 4px;
  z-index: 1;
`;

const MenuContainer = styled.div`
  width: 100%;
  height: 100%;
  display: ${props => props.isShowing ? 'flex' : 'none'};
  flex-flow: column nowrap;
`;

const MenuDivider = styled.div`
  width: 100%;
  height: 1px;
  margin: ${props => !props.disableMargin ? '8px 0px' : '0px'};
  background-color: ${isDarkTheme() ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'};
`;


const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    floatingButton: {
        width: 48,
        height: 48,
        margin: '.5rem',
        backdropFilter: 'blur(10px)',
        transition: 'box-shadow 0.2s ease 0s, background-color 0.2s ease 0s',
        cursor: 'pointer',
        '&:hover': {
            boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 5px -3px, rgba(0, 0, 0, 0.14) 0px 8px 10px 1px, rgba(0, 0, 0, 0.12) 0px 3px 14px 2px'
        }
    },
    blurEffect: {
        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 5px -3px, rgba(0, 0, 0, 0.14) 0px 8px 10px 1px, rgba(0, 0, 0, 0.12) 0px 3px 14px 2px'
    },
    pageHeaderLight: {
        paddingTop: '1rem',
        paddingBottom: '0.5rem',
        marginBottom: '0.4rem',
        borderBottom: '1px solid #dee2e6',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    pageHeaderDark: {
        paddingTop: '1rem',
        paddingBottom: '0.5rem',
        marginBottom: '0.4rem',
        borderBottom: '1px solid rgba(81, 81, 81, 1)',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    topImage: {
        minHeight: '100%',
        backgroundSize: 'cover !important',
        backgroundAttachment: 'fixed !important',
        backgroundRepeat: 'no-repeat !important'
    },
    serviceButton: {
        width: 90,
        height: 90,
        margin: 5,
        display: 'flex',
        flexFlow: 'column nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease 0s',
        borderRadius: 4,
        '& img': {
            width: 50,
            height: 50,
            userSelect: 'none',
            pointerEvents: 'none'
        },
        '& span': {
            marginTop: 3,
            userSelect: 'none',
            fontFamily: '"Product-Sans-Regular", "Noto Sans JP"',
            fontSize: 11,
            textAlign: 'center'
        },
        '&:hover': {
            backgroundColor: isDarkTheme() ? 'rgba(60, 60, 60, 0.6)' : 'rgba(255, 255, 255, 0.7)'
        }
    },
    table: {
        tableLayout: 'fixed',
        whiteSpace: 'nowrap'
    },
    tableDate: {
        width: 150,
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
        width: '55%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    tableUrl: {
        width: '45%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        color: getTheme().palette.text.secondary
    },
    tableDate2: {
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
        width: '45%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    tableUrl2: {
        width: '35%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    tableStatus2: {
        width: '16%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        userSelect: 'none',
        pointerEvents: 'none'
    },
    button: {
        margin: theme.spacing(1),
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    rightIcon: {
        marginLeft: theme.spacing(1),
    },
});


class Home extends Component {

    constructor(props) {
        super(props);

        this.state = {
            profile: window.getProfile(),

            isMenuShowing: false,
            isServiceShowing: false,
            services: [
                { id: 'myAccount', url: 'https://myaccount.google.com/' },
                { id: 'search', url: 'https://www.google.com/' },
                { id: 'maps', url: 'https://www.google.com/maps/' },
                { id: 'youtube', url: 'https://www.youtube.com/' },
                { id: 'news', url: 'https://news.google.com/' },
                { id: 'gmail', url: 'https://mail.google.com/mail/' },
                { id: 'drive', url: 'https://drive.google.com/drive/' },
                { id: 'calendar', url: 'https://calendar.google.com/calendar/' },
                { id: 'translate', url: 'https://translate.google.com/' },
                { id: 'documents', url: 'https://docs.google.com/document/' },
                { id: 'sheets', url: 'https://docs.google.com/spleadsheets/' },
                { id: 'slides', url: 'https://docs.google.com/presentation/' }
            ],

            bookMarks: [],
            privMarks: [],
            histories: [],
            downloads: [],

            topImageId: 1,
            inputText: '',
            inputType: false,

            isExpanded: 'bookMarks',
            isDialogOpened: false,
            scrollTop: 0
        };

        window.addEventListener('scroll', throttle((e) => {
            this.setState({
                scrollTop: document.documentElement.scrollTop
            });
        }, 100));

        this.menuRef = React.createRef()
        this.handleMenuClose = this.handleMenuClose.bind(this)

        this.internalPages = window.getLanguageFile().internalPages;
    }

    componentDidMount = () => {
        let now = new Date();
        let start = new Date(now.getFullYear(), 0, 0);
        let diff = now - start;
        let oneDay = 1000 * 60 * 60 * 24;
        let day = Math.floor(diff / oneDay);
        if (day > 100 && day) {
            day = day.toString().slice(1, 3);
            this.setState({ topImageId: parseInt(day) });
        }

        window.getBookmarks(true).then((data1) => {
            this.setState({ privMarks: data1 });

            window.getBookmarks(false).then((data2) => {
                this.setState({ bookMarks: data2 });
            });
        });

        window.getHistories().then((data) => {
            let datas = [];

            data.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
            data.map((value, i) => datas.push(value));

            this.setState({ histories: datas });
        });

        window.getDownloads().then((data) => {
            this.setState({ downloads: data });
        });

        document.addEventListener('click', this.handleMenuClose);

        document.title = this.internalPages.home.title;
    }

    componentWillUnmount = () => {
        document.removeEventListener('click', this.handleMenuClose);
    }

    handleMenuButton = () => {
        this.setState({ isMenuShowing: !this.state.isMenuShowing });
    }

    handleMenuClose = (e) => {
        if (!this.state.isMenuShowing || e.target.id === 'userButton') return
        if (this.menuRef && this.menuRef.current && !this.menuRef.current.contains(e.target))
            this.setState({ isMenuShowing: false });
    }

    handleChange = (panel) => (e, isExpanded) => {
        this.setState({ isExpanded: isExpanded ? panel : false });
    }

    handleKeydown = (e) => {
        let text = String(this.state.inputText);

        if (text.length === 0 || text == '') return;

        if (e.keyCode === 13) {
            if (this.isURL(text) && !text.includes('://')) {
                window.location.href = `http://${text}`;
            } else if (!text.includes('://')) {
                window.location.href = window.getSearchEngine().url.replace('%s', encodeURIComponent(text));
            } else {
                const pattern = /^(file:\/\/\S.*)\S*$/;

                if (pattern.test(text)) {
                    this.setState({ inputText: '' });
                } else {
                    window.location.href = text;
                }
            }
        } else {
            if (this.isURL(text) && !text.includes('://')) {
                this.setState({ inputType: true });
            } else if (!text.includes('://')) {
                this.setState({ inputType: false });
            } else {
                this.setState({ inputType: true });
            }
        }
    }

    isURL = (input) => {
        const pattern = /^((?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)|flast:\/\/\S.*)\S*$/;
        return pattern.test(input) || pattern.test(`http://${input}`);
    }

    getName = () => {
        const name = String(window.getProfile().name);
        return name.trim().length > 0 ? name.trim() : window.getLanguageFile().main.user;
    }

    render() {
        const { classes } = this.props;

        const UserButton = () => (
            <Tooltip title={this.state.profile.name}>
                <Avatar imgProps={{ id: 'userButton' }} src={this.state.profile.avatar} className={classNames(classes.floatingButton, this.state.isMenuShowing ? classes.blurEffect : null)} onClick={this.handleMenuButton} />
            </Tooltip>
        )

        const ServiceButton = (props) => (
            <Grid item className={classes.serviceButton} onClick={() => window.location.href = props.url}>
                <img src={props.icon} />
                <span>{props.name}</span>
            </Grid>
        )

        return (
            <ThemeProvider theme={getTheme()}>
                <main className="container" style={{ minHeight: '100vh', margin: 0, padding: 0, boxSizing: 'border-box', color: window.getThemeType() ? '#fff' : '#000000de', backgroundColor: window.getThemeType() ? '#303030' : '#fafafa' }}>
                    {window.getHomePageBackgroundType() !== -1 ?
                        <div className={classes.topImage} style={{ position: 'relative', display: 'flex', flexFlow: 'column nowrap', justifyContent: 'space-between', height: '100vh', background: `url(${window.getHomePageBackgroundType() === 0 ? `${protocolStr}://resources/photos/${this.state.topImageId}.jpg` : window.getHomePageBackgroundImage()})` }}>
                            <div style={{
                                display: 'flex',
                                margin: 15,
                                flexFlow: 'row nowrap',
                                justifyContent: 'flex-start',
                                alignItems: 'center'
                            }}>
                                <div style={{ marginLeft: 'auto' }}>
                                    <UserButton />
                                </div>
                            </div>
                            <div style={{
                                height: '40%',
                                margin: '0 auto',
                                display: 'flex',
                                flexFlow: 'column nowrap',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <TextField
                                    id="outlined-full-width"
                                    placeholder="検索またはアドレスを入力"
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    style={{
                                        width: '70vw',
                                        margin: 8,
                                        backgroundColor: window.getThemeType() ? '#303030' : '#fafafa',
                                        boxShadow: '0 5px 10px -3px rgba(0,0,0,.15), 0 0 3px rgba(0,0,0,.1)',
                                        borderRadius: 5,
                                        color: '#000000de !important'
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.inputText}
                                    onChange={(e) => { this.setState({ inputText: e.target.value }); }}
                                    onKeyDown={this.handleKeydown}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" >
                                                    {this.state.inputType ? <SendIcon /> : <SearchIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                margin: '0 auto',
                                height: '45%',
                                flexFlow: 'column nowrap',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Button variant="contained" color="primary" className={classes.button} onClick={() => { window.scrollTo(0, window.innerHeight); }}>
                                    <ArrowDownwardIcon className={classes.leftIcon} />
                                    Send
                                </Button>
                            </div>
                        </div>
                        :
                        <div className={classes.topImage} style={{ position: 'sticky', transition: 'all 500ms ease 0s', top: 0, background: `url(${window.getHomePageBackgroundType() === 0 ? `${protocolStr}://resources/photos/${this.state.topImageId}.jpg` : window.getHomePageBackgroundImage()})` }}>
                            <div style={{
                                height: '50%',
                                margin: '0 15px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <TextField
                                    id="outlined-full-width"
                                    placeholder="検索またはアドレスを入力"
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    style={{
                                        width: '70vw',
                                        margin: 8,
                                        marginLeft: 'auto',
                                        backgroundColor: window.getThemeType() ? '#303030' : '#fafafa',
                                        boxShadow: '0 5px 10px -3px rgba(0,0,0,.15), 0 0 3px rgba(0,0,0,.1)',
                                        borderRadius: 5,
                                        color: '#000000de !important'
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.inputText}
                                    onChange={(e) => { this.setState({ inputText: e.target.value }); }}
                                    onKeyDown={this.handleKeydown}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" >
                                                    {this.state.inputType ? <SendIcon /> : <SearchIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <div style={{ marginLeft: 'auto' }}>
                                    <UserButton />
                                </div>
                            </div>
                        </div>
                    }
                    <Menu ref={this.menuRef} isShowing={this.state.isMenuShowing}>
                        <MenuContainer isShowing={this.state.isMenuShowing}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Tooltip title={this.internalPages.bookmarks.title}>
                                    <IconButton aria-label={this.internalPages.bookmarks.title} style={{ margin: 10 }} onClick={(e) => { window.location.href = `${protocolStr}://bookmarks`; }}>
                                        <BookmarksIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={this.internalPages.history.title}>
                                    <IconButton aria-label={this.internalPages.history.title} style={{ margin: 10 }} onClick={(e) => { window.location.href = `${protocolStr}://history`; }}>
                                        <HistoryIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={this.internalPages.downloads.title}>
                                    <IconButton aria-label={this.internalPages.downloads.title} style={{ margin: 10 }} onClick={(e) => { window.location.href = `${protocolStr}://downloads`; }}>
                                        <DownloadsIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={this.internalPages.settings.title}>
                                    <IconButton aria-label={this.internalPages.settings.title} style={{ margin: 10 }} onClick={(e) => { window.location.href = `${protocolStr}://settings`; }}>
                                        <SettingsIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                            <MenuDivider disableMargin />
                            <div style={{ height: 250, display: 'flex', flexFlow: 'column nowrap', justifyContent: 'center', alignItems: 'center' }}>
                                <Avatar src={this.state.profile.avatar} style={{ borderRadius: '50%', width: 150, height: 150, objectFit: 'cover' }} />
                                <Typography variant="h6" style={{ marginTop: '1rem', marginBottom: 0 }}>{this.getName()}</Typography>
                            </div>
                            <MenuDivider disableMargin />
                            <Grid container spacing={0}>
                                <Grid item xs={12} component={ButtonBase} onClick={() => this.setState({ isServiceShowing: !this.state.isServiceShowing })} style={{ padding: 5 }}>
                                    <Typography variant="body2">{this.internalPages.home.menu.services[`${!this.state.isServiceShowing ? 'show' : 'hide'}Menu`]}</Typography>
                                </Grid>
                                <div style={{ width: '100%', display: this.state.isServiceShowing ? 'flex' : 'none', flexWrap: 'wrap' }}>
                                    {this.state.services.map((item, i) => (
                                        <ServiceButton
                                            key={i}
                                            name={this.internalPages.home.menu.services[item.id]}
                                            icon={`${protocolStr}://resources/services/${item.id}_48dp.svg`}
                                            url={item.url}
                                        />
                                    ))}
                                </div>
                            </Grid>
                        </MenuContainer>
                    </Menu>
                    <Grid container style={{ padding: '30px 0px 50px 0px' }}>
                        <Grid item xs={1} />
                        <Grid item xs={10}>
                            {navigator.userAgent.indexOf('PrivMode') !== -1 ?
                                <div>
                                    <ExpansionPanel expanded={this.state.isExpanded === 'privMarks'} onChange={this.handleChange('privMarks')}>
                                        <ExpansionPanelSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="privMarks-content"
                                            id="privMarks-header"
                                        >
                                            <Typography className={classes.heading}>プライベート ブックマーク</Typography>
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails>
                                            <Paper className={classes.root}>
                                                <Table className={classes.table}>
                                                    <TableBody>
                                                        {this.state.privMarks.map((item, i) => {
                                                            if (item.isFolder) return;
                                                            if (i < 10) {
                                                                return (
                                                                    <TableRow key={i}>
                                                                        <TableCell className={classes.tableDate}><Moment format="YYYY/MM/DD HH:mm">{item.createdAt}</Moment></TableCell>
                                                                        <TableCell className={classes.tableIcon}><img src={String(item.url).startsWith(`${protocolStr}://`) || String(item.url).startsWith(`${fileProtocolStr}://`) ? `${protocolStr}://resources/icons/public.svg` : (item.favicon ? item.favicon : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`)} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
                                                                        <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={item.url} title={item.title} color="inherit">{item.title}</Link></TableCell>
                                                                        <TableCell title={item.url} className={classes.tableUrl}>{item.url}</TableCell>
                                                                    </TableRow>
                                                                )
                                                            }
                                                        })}
                                                        {this.state.privMarks.length > 10 &&
                                                            <TableRow>
                                                                <TableCell className={classes.tableDate} />
                                                                <TableCell className={classes.tableIcon} />
                                                                <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={`${protocolStr}://bookmarks`} title={this.internalPages.home.bookmarks.title} color="inherit">{this.internalPages.home.bookmarks.title}</Link></TableCell>
                                                                <TableCell className={classes.tableUrl} />
                                                            </TableRow>
                                                        }
                                                    </TableBody>
                                                </Table>
                                            </Paper>
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>
                                    <ExpansionPanel expanded={this.state.isExpanded === 'bookMarks'} onChange={this.handleChange('bookMarks')}>
                                        <ExpansionPanelSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="bookMarks-content"
                                            id="bookMarks-header"
                                        >
                                            <Typography className={classes.heading}>ブックマーク</Typography>
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails>
                                            <Paper className={classes.root}>
                                                <Table className={classes.table}>
                                                    <TableBody>
                                                        {this.state.bookMarks.map((item, i) => {
                                                            if (item.isFolder) return;
                                                            if (i < 10) {
                                                                return (
                                                                    <TableRow key={i}>
                                                                        <TableCell className={classes.tableDate}><Moment format="YYYY/MM/DD HH:mm">{item.createdAt}</Moment></TableCell>
                                                                        <TableCell className={classes.tableIcon}><img src={String(item.url).startsWith(`${protocolStr}://`) || String(item.url).startsWith(`${fileProtocolStr}://`) ? `${protocolStr}://resources/icons/public.svg` : (item.favicon ? item.favicon : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`)} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
                                                                        <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={item.url} title={item.title} color="inherit">{item.title}</Link></TableCell>
                                                                        <TableCell title={item.url} className={classes.tableUrl}>{item.url}</TableCell>
                                                                    </TableRow>
                                                                )
                                                            }
                                                        })}
                                                        {this.state.bookMarks.length > 10 &&
                                                            <TableRow>
                                                                <TableCell className={classes.tableDate} />
                                                                <TableCell className={classes.tableIcon} />
                                                                <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={`${protocolStr}://bookmarks`} title={this.internalPages.home.bookmarks.title} color="inherit">{this.internalPages.home.bookmarks.title}</Link></TableCell>
                                                                <TableCell className={classes.tableUrl} />
                                                            </TableRow>
                                                        }
                                                    </TableBody>
                                                </Table>
                                            </Paper>
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>
                                </div>
                                :
                                <div>
                                    <Typography className={window.getThemeType() ? classes.pageHeaderDark : classes.pageHeaderLight} component="h4">{this.internalPages.home.bookmarks.title}</Typography>
                                    <Paper className={classes.root}>
                                        <Table className={classes.table}>
                                            <TableBody>
                                                {this.state.bookMarks.map((item, i) => {
                                                    if (item.isFolder) return;
                                                    if (i < 10) {
                                                        return (
                                                            <TableRow key={i}>
                                                                <TableCell className={classes.tableDate}><Moment format="YYYY/MM/DD HH:mm">{item.createdAt}</Moment></TableCell>
                                                                <TableCell className={classes.tableIcon}><img src={String(item.url).startsWith(`${protocolStr}://`) || String(item.url).startsWith(`${fileProtocolStr}://`) ? `${protocolStr}://resources/icons/public.svg` : (item.favicon ? item.favicon : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`)} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
                                                                <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={item.url} title={item.title} color="inherit">{item.title}</Link></TableCell>
                                                                <TableCell title={item.url} className={classes.tableUrl}>{item.url}</TableCell>
                                                            </TableRow>
                                                        )
                                                    }
                                                })}
                                                {this.state.bookMarks.length > 10 &&
                                                    <TableRow>
                                                        <TableCell className={classes.tableDate} />
                                                        <TableCell className={classes.tableIcon} />
                                                        <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={`${protocolStr}://bookmarks`} title={this.internalPages.home.bookmarks.title} color="inherit">{this.internalPages.home.bookmarks.title}</Link></TableCell>
                                                        <TableCell className={classes.tableUrl} />
                                                    </TableRow>
                                                }
                                            </TableBody>
                                        </Table>
                                    </Paper>
                                </div>
                            }

                            <Typography className={window.getThemeType() ? classes.pageHeaderDark : classes.pageHeaderLight} component="h4">{this.internalPages.home.history.title}</Typography>
                            <Paper className={classes.root}>
                                <Table className={classes.table}>
                                    <TableBody>
                                        {this.state.histories.map((item, i) => {
                                            if (i < 10) {
                                                return (
                                                    <TableRow key={i}>
                                                        <TableCell className={classes.tableDate}><Moment format="YYYY/MM/DD HH:mm">{item.createdAt}</Moment></TableCell>
                                                        <TableCell className={classes.tableIcon}><img src={String(item.url).startsWith(`${protocolStr}://`) || String(item.url).startsWith(`${fileProtocolStr}://`) ? `${protocolStr}://resources/icons/public.svg` : (item.favicon ? item.favicon : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`)} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
                                                        <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={item.url} title={item.title} color="inherit">{item.title}</Link></TableCell>
                                                        <TableCell title={item.url} className={classes.tableUrl}>{new URL(item.url).hostname}</TableCell>
                                                    </TableRow>
                                                );
                                            }
                                        })}
                                        {this.state.histories.length > 10 &&
                                            <TableRow>
                                                <TableCell className={classes.tableDate} />
                                                <TableCell className={classes.tableIcon} />
                                                <TableCell component="th" scope="row" className={classes.tableTitle}><Link href={`${protocolStr}://history`} title={this.internalPages.home.history.title} color="inherit">{this.internalPages.home.history.title}</Link></TableCell>
                                                <TableCell className={classes.tableUrl} />
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </Paper>

                            <Typography className={window.getThemeType() ? classes.pageHeaderDark : classes.pageHeaderLight} component="h4">{this.internalPages.home.downloads.title}</Typography>
                            <Paper className={classes.root}>
                                <Table className={classes.table}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell className={classes.tableIcon2} style={{ userSelect: 'none', pointerEvents: 'none' }}></TableCell>
                                            <TableCell className={classes.tableTitle2} style={{ userSelect: 'none', pointerEvents: 'none' }}>{this.internalPages.home.downloads.table.title}</TableCell>
                                            <TableCell className={classes.tableUrl2} style={{ userSelect: 'none', pointerEvents: 'none' }}>{this.internalPages.home.downloads.table.url}</TableCell>
                                            <TableCell className={classes.tableStatus2} style={{ userSelect: 'none', pointerEvents: 'none' }}>{this.internalPages.home.downloads.table.status}</TableCell>
                                            <TableCell className={classes.tableDate2} style={{ userSelect: 'none', pointerEvents: 'none' }}>{this.internalPages.home.downloads.table.date}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {this.state.downloads.map((item, i) => {
                                            if (i < 10) {
                                                return (
                                                    <TableRow key={i}>
                                                        <TableCell className={classes.tableIcon2}><img src={new URL(item.url).protocol === `${protocolStr}:` ? `${fileProtocolStr}:///public.svg` : `http://www.google.com/s2/favicons?domain=${new URL(item.url).origin}`} style={{ width: 16, height: 16, verticalAlign: 'sub' }} /></TableCell>
                                                        <TableCell component="th" scope="row" title={item.path} className={classes.tableTitle2}>{item.name}</TableCell>
                                                        <TableCell title={item.url} className={classes.tableUrl2}>{item.url}</TableCell>
                                                        <TableCell title={item.status} className={classes.tableStatus2}>{item.status}</TableCell>
                                                        <TableCell className={classes.tableDate2}><Moment format="YYYY/MM/DD HH:mm">{item.createdAt}</Moment></TableCell>
                                                    </TableRow>
                                                );
                                            }
                                        })}
                                        {this.state.downloads.length > 10 &&
                                            <TableRow>
                                                <TableCell className={classes.tableIcon2} />
                                                <TableCell component="th" scope="row" className={classes.tableTitle2}><Link href={`${protocolStr}://downloads`} title={this.internalPages.home.downloads.title} color="inherit">{this.internalPages.home.downloads.title}</Link></TableCell>
                                                <TableCell className={classes.tableUrl2} />
                                                <TableCell className={classes.tableStatus2} />
                                                <TableCell className={classes.tableDate2} />
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </Paper>
                        </Grid>
                        <Grid item xs={1} />
                    </Grid>
                </main>
            </ThemeProvider>
        );
    }
}

Home.propTypes = {
    classes: PropTypes.object.isRequired,
    container: PropTypes.object,
    theme: PropTypes.object.isRequired,
};

const Page = withStyles(styles, { withTheme: true })(Home);

render(
    <Page />,
    document.getElementById('app')
);