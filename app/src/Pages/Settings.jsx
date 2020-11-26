import React, { Component, forwardRef, Fragment } from 'react';
import ReactDOM, { render } from 'react-dom';
import { BrowserRouter, Route, Link as RouterLink, Switch as RouterSwitch, Redirect, withRouter } from 'react-router-dom';
import { SnackbarProvider, withSnackbar } from 'notistack';
import { ChromePicker } from 'react-color';
import { WindowsControl } from 'react-windows-controls';
import MaterialTable from 'material-table';

import clsx from 'clsx';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { withStyles } from '@material-ui/core/styles';

import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import Popover from '@material-ui/core/Popover';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';

import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ButtonBase from '@material-ui/core/ButtonBase';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputBase from '@material-ui/core/InputBase';

import PaletteIcon from '@material-ui/icons/PaletteOutlined';
import CloudUploadIcon from '@material-ui/icons/CloudUploadOutlined';
import RestoreIcon from '@material-ui/icons/RestoreOutlined';
import CloseIcon from '@material-ui/icons/CloseOutlined';
import ReloadIcon from '@material-ui/icons/RefreshOutlined';
import ExpandLessIcon from '@material-ui/icons/ExpandLessOutlined';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreOutlined';

import LocationIcon from '@material-ui/icons/LocationOnOutlined';
import CameraIcon from '@material-ui/icons/PhotoCameraOutlined';
import MicIcon from '@material-ui/icons/MicNoneOutlined';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import RadioIcon from '@material-ui/icons/RadioOutlined';
import LockIcon from '@material-ui/icons/LockOutlined';
import FullScreenIcon from '@material-ui/icons/FullscreenOutlined';
import LaunchIcon from '@material-ui/icons/LaunchOutlined';

import PDFIcon from '@material-ui/icons/PictureAsPdfOutlined';

import SyncIcon from '@material-ui/icons/SyncOutlined';
import ArrowBackIcon from '@material-ui/icons/ArrowBackOutlined';

import AddBoxIcon from '@material-ui/icons/AddBox';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import CheckIcon from '@material-ui/icons/Check';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import EditIcon from '@material-ui/icons/Edit';
import FilterListIcon from '@material-ui/icons/FilterList';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import RemoveIcon from '@material-ui/icons/Remove';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import SearchIcon from '@material-ui/icons/Search';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';

import WindowButtons from '../Windows/Components/WindowButtons.jsx';

import NavigationBar from './Components/NavigationBar.jsx';
import { isDarkTheme, getTheme, darkTheme, lightTheme } from './Theme.jsx';

const protocolStr = 'flast';
const fileProtocolStr = `${protocolStr}-file`;

const styles = (theme) => ({
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15)
    },
    dialogRoot: {
        margin: 0,
        padding: theme.spacing(2),
    },
    dialogTitleCloseButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    button: {
        margin: theme.spacing(1),
    },
    formRoot: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 200,
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    textFieldDense: {
        marginTop: theme.spacing(2),
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
    snackBarClose: {
        padding: theme.spacing(0.5),
    },
    avatar: {
        margin: 10,
    },
    containerRoot: {
        height: 'calc(100% - 32px)',
        position: 'relative',
        top: 32,
        [theme.breakpoints.up('md')]: {
            height: 'calc(100% - 40px)',
            top: 40
        }
    },
    paperRoot: {
        minHeight: '100%',
        padding: theme.spacing(3, 2),
        borderRadius: 0
    },
    paperHeadingRoot: {
        paddingBottom: '0px !important'
    },
    paperHeading: {
        userSelect: 'none',
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5)
    },
    itemDivider: {
        paddingTop: '0px !important',
        paddingBottom: '0px !important'
    },
    itemButtonRoot: {
        height: 60,
        margin: '0 8px',
        padding: '8px 8px !important',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        [theme.breakpoints.up('md')]: {
            height: 60,
            margin: '0 8px',
            padding: '2px 8px !important'
        }
    },
    itemPermissionButtonRoot: {
        height: 60,
        margin: '0 8px',
        padding: '0px !important',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    itemPermissionButtonContainer: {
        width: '100%',
        height: '100%',
        margin: 0,
        padding: '8px 8px !important',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        [theme.breakpoints.up('md')]: {
            padding: '2px 8px !important'
        }
    },
    itemPermissionButtonDivider: {
        margin: '10px 0'
    },
    itemPermissionButtonRemove: {
        margin: 6
    },
    itemRoot: {
        height: 60,
        padding: '8px 16px !important',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        [theme.breakpoints.up('md')]: {
            padding: '2px 16px !important',
        }
    },
    itemTitleRoot: {
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none',
        [theme.breakpoints.down('sm')]: {
            padding: '8px 0px !important',
        }
    },
    itemControlRoot: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: 'auto'
    },
    userInfoRoot: {
        padding: theme.spacing(1),
    },
    userInfoAvatarRoot: {
        display: 'flex',
        padding: theme.spacing(1),
        paddingRight: theme.spacing(2),
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    bigAvatar: {
        width: 60,
        height: 60
    },

    // デザイン テーマプレビュー用ウィンドウ
    listRoot: {
        width: '100%',
        position: 'relative',
        overflow: 'auto',
        backgroundColor: getTheme().palette.background.paper,
        [theme.breakpoints.down('md')]: {
            maxHeight: 350
        }
    },
    listSection: {
        backgroundColor: 'inherit',
    },
    listUl: {
        backgroundColor: 'inherit',
        padding: 0,
    },
    window: {
        height: 'calc(100% - 48px)',
        margin: 24,
        display: 'grid',
        gridTemplateRows: '33px 40px 1fr',
        boxSizing: 'border-box',
        boxShadow: '0px 1px 4px #123'
    },
    windowTitlebar: {
        gridRow: '1 / 2',
        display: 'flex'
    },
    windowToolbar: {
        gridRow: '2 / 3'
    },
    windowContents: {
        height: '100%',
        gridRow: '3 / 4'
    }
});


const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.dialogRoot} {...other}>
            <Typography variant="h6" style={{ userSelect: 'none' }}>{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.dialogTitleCloseButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme) => ({
    root: {
        padding: theme.spacing(2)
    }
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1)
    }
}))(MuiDialogActions);

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBoxIcon {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <CheckIcon {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <ClearIcon {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteIcon {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRightIcon {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <EditIcon {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAltIcon {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterListIcon {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPageIcon {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPageIcon {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRightIcon {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeftIcon {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <ClearIcon {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <SearchIcon {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowUpwardIcon {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <RemoveIcon {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumnIcon {...props} ref={ref} />)
};


const UserNameTextField = withStyles({
    root: {
        padding: '6px 12px',
        backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.09)' : 'rgba(255, 255, 255, 0.09)',
        transition: '0.2s background',
        borderRadius: getTheme().shape.borderRadius,
        '&:hover': {
            backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.13)' : 'rgba(255, 255, 255, 0.13)'
        }
    },
})(InputBase);


class SettingsUsersPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            avatar: window.getProfile().avatar,
            name: this.getName()
        }

        this.settings = window.getLanguageFile().internalPages.settings;
        this.section = this.settings.sections.users;
    }

    getName = () => {
        const name = String(window.getProfile().name);
        return name.trim().length > 0 ? name.trim() : window.getLanguageFile().main.user;
    }

    componentDidMount = () => {
        this.setState({
            name: this.getName()
        });

        document.title = `${this.settings.title} » ${this.section.title}`;
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={this.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="h6" className={classes.paperHeading}>{this.section.title}</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12}>
                                <Paper className={classes.userInfoRoot}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div className={classes.userInfoAvatarRoot}>
                                            <Badge
                                                overlap="circle"
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'right',
                                                }}
                                                badgeContent={
                                                    <Fragment>
                                                        <input
                                                            accept="image/*"
                                                            type="file"
                                                            id="imageUpload"
                                                            style={{ display: 'none' }}
                                                            onChange={(e) => {
                                                                window.setAvatar(e.target.files[0].path);
                                                                window.location.reload();
                                                            }}
                                                        />
                                                        <label htmlFor="imageUpload">
                                                            <IconButton component="span" size="small" style={{ backdropFilter: 'blur(10px)' }}>
                                                                <CloudUploadIcon />
                                                            </IconButton>
                                                        </label>
                                                    </Fragment>
                                                }
                                            >
                                                <Avatar src={this.state.avatar} className={classes.bigAvatar} />
                                            </Badge>
                                        </div>
                                        <UserNameTextField
                                            defaultValue={this.state.name}
                                            onChange={(e) => { this.setState({ name: e.target.value }); }}
                                            onKeyDown={(e) => {
                                                if (e.key != 'Enter') return;
                                                window.setProfile({ avatar: this.state.avatar, name: this.state.name });
                                            }}
                                        />
                                    </div>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </NavigationBar>
        );
    }
}

SettingsUsersPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsAdBlockPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,

            // AdBlock
            isEnabled: false,
            filters: [],
        };

        this.settings = window.getLanguageFile().internalPages.settings;
        this.section = this.settings.sections.adBlock;
    }

    componentDidMount = () => {
        this.setState({
            // AdBlock
            isEnabled: window.getAdBlock(),
            filters: window.getFilters()
        });

        document.title = `${this.settings.title} » ${this.section.title}`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="h6" className={classes.paperHeading}>{this.section.title}</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} className={classes.itemRoot} style={{ flexDirection: 'row' }}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{this.section.controls.useAdBlock}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <Switch
                                        checked={this.state.isEnabled}
                                        onChange={(e) => {
                                            this.setState({ isEnabled: e.target.checked });
                                            window.setAdBlock(e.target.checked);
                                        }}
                                        color="primary"
                                        value="isEnabled"
                                    />
                                </div>
                            </Grid>
                            {this.state.isEnabled && (
                                <Fragment>
                                    <Grid item xs={12} style={{ paddingTop: 0, paddingBottom: 2 }}>
                                        <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                                        {this.state.filters.map((item, i) => {
                                            return (
                                                <Grid item xs={12} style={{ padding: '4px 8px', display: 'flex', alignItems: 'center' }} key={i}>
                                                    <div className={classes.itemTitleRoot}>
                                                        <Typography variant="body2" title={item.url}>{item.name}</Typography>
                                                    </div>
                                                    <div className={classes.itemControlRoot}>
                                                        <Switch
                                                            checked={item.isEnabled}
                                                            onChange={(e) => {
                                                                const filters = this.state.filters.slice();
                                                                filters[i].isEnabled = e.target.checked;
                                                                this.setState({ filters });
                                                                window.setFilters(filters);
                                                            }}
                                                            color="primary"
                                                            value={i}
                                                        />
                                                    </div>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                    <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                                    <Grid item xs={12} className={classes.itemRoot}>
                                        <div className={classes.itemControlRoot}>
                                            <Button variant="outlined" size="small" onClick={() => window.updateFilters()}>
                                                {this.section.controls.updateAndReload}
                                            </Button>
                                        </div>
                                    </Grid>
                                </Fragment>
                            )}
                        </Grid>
                    </Paper>
                </Container>
            </NavigationBar>
        );
    }
}

SettingsAdBlockPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsDesignPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,
            colorPickerAnchorEl: null,

            // Design
            isHomeButton: false,
            isBookmarkBar: 0,
            theme: 'System',
            themeSelected: window.getThemePath(),
            tabAccentColor: '#0a84ff',
            isCustomTitlebar: false,
            isCustomTitlebar2: false,

            // HomePage
            isDefaultHomePage: false,
            homePage: 'None',

            // TextInput
            homePageValue: '',
        };

        this.settings = window.getLanguageFile().internalPages.settings;
        this.section = this.settings.sections.design;
    }

    componentDidMount = () => {
        this.setState({
            // Design
            isHomeButton: window.getHomeButton(),
            isBookmarkBar: window.getBookmarkBar(),
            theme: window.getTheme(),
            themeSelected: window.getThemePath(),
            tabAccentColor: window.getTabAccentColor(),
            isCustomTitlebar: window.getCustomTitlebar(),
            isCustomTitlebar2: window.getCustomTitlebar(),

            // HomePage
            isDefaultHomePage: window.getButtonDefaultHomePage(),
            homePage: window.getButtonStartPage(false),

            homePageValue: window.getButtonStartPage(false)
        });

        document.title = `${this.settings.title} » ${this.section.title}`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    handleColorPicker = (e) => {
        this.setState({ colorPickerAnchorEl: e.currentTarget });
    }

    handleColorPickerClose = () => {
        this.setState({ colorPickerAnchorEl: null });
    }

    handleColorPickerChangeComplete = (color) => {
        this.setState({ tabAccentColor: color.hex });
        window.setTabAccentColor(color.hex);
    };

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="h6" className={classes.paperHeading}>{this.section.title}</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} className={classes.itemRoot} style={{ flexDirection: 'row' }}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{this.section.controls.homeButton.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <Switch
                                        checked={this.state.isHomeButton}
                                        onChange={(e) => {
                                            this.setState({ ...this.state, isHomeButton: e.target.checked });
                                            window.setHomeButton(e.target.checked);
                                        }}
                                        color="primary"
                                        value="isHomeButton"
                                    />
                                </div>
                            </Grid>
                            {this.state.isHomeButton ?
                                <Grid item xs={12} style={{ padding: '0px 14px 8px' }}>
                                    <div className={classes.formRoot}>
                                        <FormControl component="fieldset" className={classes.formControl}>
                                            <RadioGroup
                                                onChange={(e) => {
                                                    this.setState({ ...this.state, isDefaultHomePage: (e.target.value === 'default') });
                                                    window.setButtonDefaultHomePage(e.target.value === 'default');
                                                }}
                                                value={this.state.isDefaultHomePage ? 'default' : 'custom'}
                                            >
                                                <FormControlLabel value="default" control={<Radio color="primary" />} label={this.section.controls.homeButton.controls.openWithHomePage} />
                                                <FormControlLabel value="custom" control={<Radio color="primary" />} label={this.section.controls.homeButton.controls.openWithCustomPage} />
                                            </RadioGroup>
                                        </FormControl>
                                    </div>
                                    <TextField
                                        id="standard-full-width"
                                        style={{ width: '-webkit-fill-available', margin: 8 }}
                                        label="URL を入力"
                                        className={clsx(classes.textField, classes.dense)}
                                        margin="dense"
                                        variant="outlined"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        value={this.state.homePageValue}
                                        onChange={(e) => { this.setState({ ...this.state, homePageValue: e.target.value }); }}
                                        onKeyDown={(e) => {
                                            if (e.key != 'Enter') return;

                                            if (window.isURL(this.state.homePageValue) && !this.state.homePageValue.includes('://')) {
                                                window.setButtonStartPage(`http://${this.state.homePageValue}`);
                                            } else if (!this.state.homePageValue.includes('://')) {
                                                window.setButtonDefaultHomePage(true);
                                                window.setButtonStartPage('flast://home');
                                            } else {
                                                window.setButtonStartPage(this.state.homePageValue);
                                            }
                                        }}
                                    />
                                </Grid>
                                :
                                null
                            }
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot} style={{ flexDirection: 'row' }}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{this.section.controls.bookMarkBar.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <div className={classes.formRoot}>
                                        <FormControl variant="outlined" margin="dense" className={classes.formControl} style={{ minWidth: 120 }}>
                                            <Select
                                                inputProps={{ name: 'isBookmarkBar', id: 'isBookmarkBar' }}
                                                value={this.state.isBookmarkBar}
                                                onChange={(e) => {
                                                    this.setState({ isBookmarkBar: e.target.value });
                                                    window.setBookmarkBar(e.target.value);
                                                }}
                                            >
                                                <MenuItem value={1}>{this.section.controls.bookMarkBar.controls.enabled}</MenuItem>
                                                <MenuItem value={0}>{this.section.controls.bookMarkBar.controls.onlyHomePage}</MenuItem>
                                                <MenuItem value={-1}>{this.section.controls.bookMarkBar.controls.disabled}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot} style={{ flexDirection: 'row' }}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{this.section.controls.theme.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <Button variant="contained" color="primary" startIcon={<PaletteIcon />} onClick={() => this.setState({ isDialogOpened: true })}>{this.section.controls.theme.controls.select}</Button>
                                    <Tooltip title={this.section.controls.theme.controls.openStore}>
                                        <IconButton size="small" style={{ marginLeft: 5 }} onClick={() => window.location.href = `${window.getAppURL()}/store/`}>
                                            <LaunchIcon />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{this.section.controls.accentColor.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <Tooltip title={this.section.controls.accentColor.controls.reset}>
                                        <IconButton size="small" style={{ marginRight: 5 }}
                                            onClick={() => {
                                                this.setState({ tabAccentColor: '#0a84ff' });
                                                window.setTabAccentColor('#0a84ff');
                                            }}
                                        >
                                            <RestoreIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Button variant="contained" color="primary" startIcon={<PaletteIcon />} onClick={this.handleColorPicker}>{this.section.controls.accentColor.controls.select}</Button>
                                    <Popover
                                        id={Boolean(this.state.colorPickerAnchorEl) ? 'colorPickerPopOver' : undefined}
                                        open={Boolean(this.state.colorPickerAnchorEl)}
                                        anchorEl={this.state.colorPickerAnchorEl}
                                        onClose={this.handleColorPickerClose}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'right',
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                    >
                                        <ChromePicker
                                            color={this.state.tabAccentColor}
                                            onChangeComplete={this.handleColorPickerChangeComplete} />
                                    </Popover>
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot} style={{ flexDirection: 'row' }}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{this.section.controls.titleBar.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    {this.state.isCustomTitlebar2 !== this.state.isCustomTitlebar && <Button variant="outlined" className={classes.button} onClick={() => { window.setCustomTitlebar(this.state.isCustomTitlebar); window.restart(); }}>{this.section.controls.titleBar.controls.restart}</Button>}
                                    <Switch
                                        checked={this.state.isCustomTitlebar}
                                        onChange={(e) => this.setState({ ...this.state, isCustomTitlebar: e.target.checked })}
                                        color="primary"
                                        value="isCustomTitlebar"
                                    />
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot} style={{ flexDirection: 'row' }}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{this.section.controls.moreSettings.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <Button variant="outlined">{this.section.controls.moreSettings.controls.change}</Button>
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
                <Dialog open={this.state.isDialogOpened} onClose={this.handleDialogClose} maxWidth="lg" fullWidth={true} aria-labelledby="dialog-title">
                    <DialogTitle id="dialog-title" onClose={this.handleDialogClose}>{this.section.controls.theme.name}</DialogTitle>
                    <DialogContent dividers style={{ padding: 0 }}>
                        <Grid container spacing={0}>
                            <Grid item md={3} xs={12}>
                                <List className={classes.listRoot} style={{ backgroundColor: getTheme().palette.background.paper }} subheader={<li />}>
                                    <li className={classes.listSection}>
                                        <ul className={classes.listUl}>
                                            <ListSubheader style={{ userSelect: 'none' }}>{window.getAppName()}</ListSubheader>
                                            {window.getThemes().map((item, i) => {
                                                if (String(item).endsWith('/System.json') || String(item).endsWith('/Light.json') || String(item).endsWith('/Dark.json')
                                                    || String(item).endsWith('/White.json') || String(item).endsWith('/Black.json')) {


                                                    const themeName = item.substring(item.lastIndexOf('/') + 1, item.lastIndexOf('.'));
                                                    const themeSelectedName = this.state.themeSelected.substring(this.state.themeSelected.lastIndexOf('/') + 1, this.state.themeSelected.lastIndexOf('.'));
                                                    const themeConfig = window.getThemeByFile(item);

                                                    return (
                                                        <ListItem button selected={themeName === themeSelectedName} key={i} onClick={() => { this.setState({ themeSelected: item }); this.forceUpdate(); }}>
                                                            <ListItemText primary={themeConfig.meta.name} secondary={themeConfig.meta.description} />
                                                        </ListItem>
                                                    );
                                                }
                                            })}
                                        </ul>
                                    </li>
                                    <li className={classes.listSection}>
                                        <ul className={classes.listUl}>
                                            <ListSubheader style={{ userSelect: 'none' }}>From {window.getAppName()} Store</ListSubheader>
                                            {window.getThemes().map((item, i) => {
                                                if (String(item).endsWith('/System.json') || String(item).endsWith('/Light.json') || String(item).endsWith('/Dark.json')
                                                    || String(item).endsWith('/White.json') || String(item).endsWith('/Black.json')) return;

                                                const themeName = item.substring(item.lastIndexOf('/') + 1, item.lastIndexOf('.'));
                                                const themeSelectedName = this.state.themeSelected.substring(this.state.themeSelected.lastIndexOf('/') + 1, this.state.themeSelected.lastIndexOf('.'));
                                                const themeConfig = window.getThemeByFile(item);

                                                return (
                                                    <ListItem button selected={themeName === themeSelectedName} key={i} onClick={() => this.setState({ themeSelected: item })}>
                                                        <ListItemText primary={themeConfig.meta.name} secondary={themeConfig.meta.description} />
                                                    </ListItem>
                                                );
                                            })}
                                        </ul>
                                    </li>
                                </List>
                                <Divider />
                                <List component="nav">
                                    <ListItem button>
                                        <ListItemText primary={`${window.getAppName()} Store`} />
                                    </ListItem>
                                </List>
                            </Grid>
                            <Grid item md={9} xs={12} style={{ background: getTheme().palette.background.default }}>
                                {(() => {
                                    const themeConfig = window.getThemeByFile(this.state.themeSelected).theme;

                                    const getOrDefault = (value, defaultValue) => {
                                        return value !== undefined && value !== null && value != 'auto' ? value : defaultValue;
                                    }
                                    const getForegroundColor = (hexColor) => {
                                        var r = parseInt(hexColor.substr(1, 2), 16);
                                        var g = parseInt(hexColor.substr(3, 2), 16);
                                        var b = parseInt(hexColor.substr(5, 2), 16);

                                        return ((((r * 299) + (g * 587) + (b * 114)) / 1000) < 128) ? '#ffffff' : '#000000';
                                    }

                                    return (
                                        <div className={classes.window} style={{ border: `solid 1px ${getOrDefault(themeConfig.window.border.active, window.getThemeColor())}` }}>
                                            <div className={classes.windowTitlebar} style={{ background: getOrDefault(themeConfig.window.border.active, window.getThemeColor()) }}>
                                                <WindowButtons isMaximized={false} isCustomTitlebar={true} isWindowsOrLinux={true} style={{ position: 'initial', height: 33, marginLeft: 'auto' }}>
                                                    <WindowsControl
                                                        minimize
                                                        whiteIcon={getForegroundColor(themeConfig.window.foreground) === '#000000'}
                                                    />
                                                    <WindowsControl
                                                        maximize={true}
                                                        restore={false}
                                                        whiteIcon={getForegroundColor(themeConfig.window.foreground) === '#000000'}
                                                    />
                                                    <WindowsControl
                                                        close
                                                        whiteIcon={getForegroundColor(themeConfig.window.foreground) === '#000000'}
                                                    />
                                                </WindowButtons>
                                            </div>
                                            <div className={classes.windowToolbar} style={{ background: getOrDefault(themeConfig.toolBar.background, !window.getThemeType() ? '#f9f9fa' : '#353535'), borderBottom: getOrDefault(themeConfig.toolBar.border, !window.getThemeType() ? '#0000001f' : '#ffffff14') }}></div>
                                            <div className={classes.windowContents}>
                                                <iframe src={`${protocolStr}://credits`} style={{ width: '100%', height: '100%', border: 0 }} />
                                            </div>
                                        </div>
                                    );
                                })()}
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={() => {
                            const themeName = this.state.themeSelected.substring(this.state.themeSelected.lastIndexOf('/') + 1, this.state.themeSelected.lastIndexOf('.'));
                            this.setState({ isDialogOpened: false, theme: themeName });
                            window.setTheme(themeName);
                        }}>
                            Save changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </NavigationBar>
        );
    }
}

SettingsDesignPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsHomePage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,

            // HomePage
            isDefaultHomePage: false,
            homePage: 'None',

            // TextInput
            homePageValue: '',

            // HomePage Settings
            homePageBackgroundType: 0
        };

        this.settings = window.getLanguageFile().internalPages.settings;
        this.section = this.settings.sections.homePage;
    }

    componentDidMount = () => {
        this.setState({
            // HomePage
            isDefaultHomePage: window.getNewTabDefaultHomePage(),
            homePage: window.getNewTabStartPage(false),

            homePageValue: window.getNewTabStartPage(false),

            homePageBackgroundType: window.getHomePageBackgroundType()
        });

        document.title = `${this.settings.title} » ${this.section.title}`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    handleChangeFile = (e) => {
        let file = e.target.files[0];
        window.copyHomePageBackgroundImage(file.path);
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="h6" className={classes.paperHeading}>{this.section.title}</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{this.section.controls.pageType.name}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} style={{ padding: '0px 14px 8px' }}>
                                <div className={classes.formRoot}>
                                    <FormControl component="fieldset" className={classes.formControl}>
                                        <RadioGroup
                                            aria-label="Gender"
                                            onChange={(e) => {
                                                this.setState({ ...this.state, isDefaultHomePage: (e.target.value === 'default') });
                                                window.setNewTabDefaultHomePage(e.target.value === 'default');
                                            }}
                                            value={this.state.isDefaultHomePage ? 'default' : 'custom'}
                                        >
                                            <FormControlLabel value="default" control={<Radio color="primary" />} label={this.section.controls.pageType.controls.openWithHomePage} />
                                            <FormControlLabel value="custom" control={<Radio color="primary" />} label={this.section.controls.pageType.controls.openWithCustomPage} />
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                                <TextField
                                    id="standard-full-width"
                                    style={{ width: '-webkit-fill-available', margin: 8 }}
                                    label="URL を入力"
                                    className={clsx(classes.textField, classes.dense)}
                                    margin="dense"
                                    variant="outlined"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.homePageValue}
                                    onChange={(e) => { this.setState({ ...this.state, homePageValue: e.target.value }); }}
                                    onKeyDown={(e) => {
                                        if (e.key != 'Enter') return;

                                        if (window.isURL(this.state.homePageValue) && !this.state.homePageValue.includes('://')) {
                                            window.setNewTabStartPage(`http://${this.state.homePageValue}`);
                                        } else if (!this.state.homePageValue.includes('://')) {
                                            window.setNewTabDefaultHomePage(true);
                                            window.setNewTabStartPage('flast://home');
                                        } else {
                                            window.setNewTabStartPage(this.state.homePageValue);
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{this.section.controls.backgroundType.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <div className={classes.formRoot}>
                                        <FormControl variant="outlined" margin="dense" className={classes.formControl}>
                                            <Select
                                                value={this.state.homePageBackgroundType}
                                                onChange={(e) => {
                                                    this.setState({ homePageBackgroundType: e.target.value });
                                                    window.setHomePageBackgroundType(e.target.value);
                                                }}
                                                inputProps={{
                                                    name: 'homePageBackgroundType',
                                                    id: 'homePageBackgroundType',
                                                }}
                                            >
                                                <MenuItem value={-1}>{this.section.controls.backgroundType.controls.disabled}</MenuItem>
                                                <MenuItem value={0}>{this.section.controls.backgroundType.controls.dailyImage}</MenuItem>
                                                <MenuItem value={1}>{this.section.controls.backgroundType.controls.customImage}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{this.section.controls.backgroundImage.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <input
                                        accept="image/*"
                                        type="file"
                                        id="imageUpload"
                                        style={{ display: 'none' }}
                                        onChange={this.handleChangeFile.bind(this)}
                                    />
                                    <label htmlFor="imageUpload">
                                        <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} component="span">{this.section.controls.backgroundImage.controls.upload}</Button>
                                    </label>
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </NavigationBar>
        );
    }
}

SettingsHomePage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsStartUpPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,

            // HomePage
            isDefaultHomePage: false,
            startUpPagesTableData: [],

            // TextInput
            homePageValue: '',

            startUpPagesTableColumns: [
                {
                    title: '',
                    editable: 'never',
                    render: rowData => {
                        const pageUrl = rowData != undefined ? rowData.pageUrl : `${protocolStr}://home`;
                        const parsed = new URL(pageUrl);
                        return <Avatar src={pageUrl.startsWith(`${protocolStr}://`) || pageUrl.startsWith(`${fileProtocolStr}://`) ? undefined : `https://www.google.com/s2/favicons?domain=${parsed.protocol}//${parsed.hostname}`} style={{ width: 20, height: 20, margin: 10 }} />;
                    }
                },
                { title: 'URL', field: 'pageUrl' }
            ]
        };

        this.settings = window.getLanguageFile().internalPages.settings;
        this.section = this.settings.sections.startUp;
    }

    componentDidMount = () => {
        this.setState({
            // HomePage
            isDefaultHomePage: window.getDefaultHomePage()
        });

        window.getStartPages(false).forEach((item, i) => {
            this.setState(state => { return { startUpPagesTableData: [...state.startUpPagesTableData, { pageUrl: item }] }; });
        });

        document.title = `${this.settings.title} » ${this.section.title}`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="h6" className={classes.paperHeading}>{window.getLanguageFile().internalPages.settings.sections.startUp.title}</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} style={{ padding: '8px 14px' }}>
                                <div className={classes.formRoot}>
                                    <FormControl component="fieldset" className={classes.formControl}>
                                        <RadioGroup
                                            aria-label="Gender"
                                            onChange={(e) => {
                                                this.setState({ ...this.state, isDefaultHomePage: (e.target.value === 'default') });
                                                window.setDefaultHomePage(e.target.value === 'default');
                                            }}
                                            value={this.state.isDefaultHomePage ? 'default' : 'custom'}
                                        >
                                            <FormControlLabel value="default" control={<Radio color="primary" />} label={window.getLanguageFile().internalPages.settings.sections.startUp.controls.openWithHomePage} />
                                            <FormControlLabel value="custom" control={<Radio color="primary" />} label={window.getLanguageFile().internalPages.settings.sections.startUp.controls.openWithCustomPageOrPageSet} />
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                                {!this.state.isDefaultHomePage ?
                                    <MaterialTable
                                        title="スタートアップ ページ"
                                        icons={tableIcons}
                                        columns={this.state.startUpPagesTableColumns}
                                        data={this.state.startUpPagesTableData}
                                        components={{
                                            Container: (props) => <Paper variant="outlined" elevation={0}>{props.children}</Paper>
                                        }}
                                        editable={{
                                            onRowAdd: newData =>
                                                new Promise(resolve => {
                                                    setTimeout(() => {
                                                        resolve();
                                                        const data = [...this.state.startUpPagesTableData];
                                                        data.push(newData);
                                                        this.setState({ ...this.state, startUpPagesTableData: data });

                                                        let list = [];
                                                        this.state.startUpPagesTableData.map((item, i) => {
                                                            list.push(item.pageUrl);
                                                        });
                                                        window.setStartPages(this.state.startUpPagesTableData.length > 0 ? list : ['flast://home']);
                                                    }, 600);
                                                }),
                                            onRowUpdate: (newData, oldData) =>
                                                new Promise(resolve => {
                                                    setTimeout(() => {
                                                        resolve();
                                                        const data = [...this.state.startUpPagesTableData];
                                                        data[data.indexOf(oldData)] = newData;
                                                        this.setState({ ...this.state, startUpPagesTableData: data });

                                                        let list = [];
                                                        this.state.startUpPagesTableData.map((item, i) => {
                                                            list.push(item.pageUrl);
                                                        });
                                                        window.setStartPages(this.state.startUpPagesTableData.length > 0 ? list : ['flast://home']);
                                                    }, 600);
                                                }),
                                            onRowDelete: oldData =>
                                                new Promise(resolve => {
                                                    setTimeout(() => {
                                                        resolve();
                                                        const data = [...this.state.startUpPagesTableData];
                                                        data.splice(data.indexOf(oldData), 1);
                                                        this.setState({ ...this.state, startUpPagesTableData: data });

                                                        let list = [];
                                                        this.state.startUpPagesTableData.map((item, i) => {
                                                            list.push(item.pageUrl);
                                                        });
                                                        window.setStartPages(this.state.startUpPagesTableData.length > 0 ? list : ['flast://home']);
                                                    }, 600);
                                                }),
                                        }}
                                    />
                                    :
                                    null
                                }
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </NavigationBar>
        );
    }
}

SettingsStartUpPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsSearchEnginePage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,

            // Search Engine
            searchEngine: 'None',
            searchEngines: []
        };

        this.settings = window.getLanguageFile().internalPages.settings;
        this.section = this.settings.sections.searchEngine;
    }

    componentDidMount = () => {
        this.setState({
            // Search Engine
            searchEngine: window.getSearchEngine().name
        });

        window.getSearchEngines().forEach((item, i) => {
            this.setState(state => { return { searchEngines: [...state.searchEngines, item] }; });
        });

        document.title = `${this.settings.title} » ${this.section.title}`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ isShowingSnackbar: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={this.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="h6" className={classes.paperHeading}>{this.section.title}</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} className={classes.itemRoot}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2">{this.section.controls.defaultSearchEngine}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <div className={classes.formRoot}>
                                        <FormControl variant="outlined" margin="dense" className={classes.formControl}>
                                            <Select
                                                value={this.state.searchEngine}
                                                onChange={(e) => {
                                                    this.setState({ searchEngine: e.target.value });
                                                    window.setSearchEngine(e.target.value);
                                                }}
                                                inputProps={{
                                                    name: 'searchEngine',
                                                    id: 'searchEngine',
                                                }}
                                            >
                                                {this.state.searchEngines.map((item, i) => {
                                                    return (
                                                        <MenuItem key={i} value={item.name}>{item.name}</MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </NavigationBar>
        );
    }
}

SettingsSearchEnginePage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsPageSettingsPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,

            // Page Settings
            isLocation: -1,
            isCamera: -1,
            isMic: -1,
            isNotifications: -1,
            isMidi: -1,
            isPointer: -1,
            isFullScreen: -1,
            isOpenExternal: -1,

            zoomLevel: 1
        };

        this.settings = window.getLanguageFile().internalPages.settings;
        this.section = this.settings.sections.pageSettings;
    }

    componentDidMount = () => {
        this.setState({
            // Page Settings
            isLocation: window.getLocation(),
            isCamera: window.getCamera(),
            isMic: window.getMic(),
            isNotifications: window.getNotifications(),
            isMidi: window.getMidi(),
            isPointer: window.getPointer(),
            isFullScreen: window.getFullScreen(),
            isOpenExternal: window.getOpenExternal(),

            zoomLevel: window.getZoomLevel()
        });

        document.title = `${this.settings.title} » ${this.section.title}`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    render() {
        const { classes } = this.props;

        const permissions = ['location', 'camera', 'mic', 'notifications', 'midi', 'pointer', 'fullScreen', 'openExternal'];

        const PermissionIcon = (props) => {
            switch (props.type) {
                case 'location': return (<LocationIcon />)
                case 'camera': return (<CameraIcon />)
                case 'mic': return (<MicIcon />)
                case 'notifications': return (<NotificationsIcon />)
                case 'midi': return (<RadioIcon />)
                case 'pointer': return (<LockIcon />)
                case 'fullScreen': return (<FullScreenIcon />)
                case 'openExternal': return (<LaunchIcon />)
                default: return (null)
            }
        }

        const PermissionState = (props) => {
            switch (props.type) {
                case 'location': return getPermissionState(this.state.isLocation)
                case 'camera': return getPermissionState(this.state.isCamera)
                case 'mic': return getPermissionState(this.state.isMic)
                case 'notifications': return getPermissionState(this.state.isNotifications)
                case 'midi': return getPermissionState(this.state.isMidi)
                case 'pointer': return getPermissionState(this.state.isPointer)
                case 'fullScreen': return getPermissionState(this.state.isFullScreen)
                case 'openExternal': return getPermissionState(this.state.isOpenExternal)
                default: break;
            }
        }

        const getPermissionState = (state) => {
            switch (state) {
                case 1: return this.section.controls.allow
                case 0: return this.section.controls.deny
                default: return this.section.controls.check
            }
        }

        return (
            <NavigationBar title={this.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="h6" className={classes.paperHeading}>{this.section.title}</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} className={classes.itemButtonRoot} component={ButtonBase} onClick={(e) => this.props.history.push('/pageSettings/all')}>
                                <div className={classes.itemTitleRoot}>
                                    <Typography variant="body2" style={{ marginLeft: getTheme().spacing(4) }}>{this.section.controls.viewDatas}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <ChevronRightIcon />
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="subtitle2" className={classes.paperHeading}>{this.section.controls.permission}</Typography>
                                <Divider />
                            </Grid>
                            {permissions.map((type, v) => (
                                <Fragment key={v}>
                                    <Grid item xs={12} className={classes.itemButtonRoot} component={ButtonBase} onClick={(e) => this.props.history.push(`/pageSettings/permission/${type}`)}>
                                        <div className={classes.itemTitleRoot}>
                                            <PermissionIcon type={type} />
                                            <Typography variant="body2" style={{ marginLeft: getTheme().spacing(1) }}>{this.section.controls[type]}</Typography>
                                        </div>
                                        <div className={classes.itemControlRoot}>
                                            <Typography variant="body2" color="textSecondary" style={{ marginRight: getTheme().spacing(1) }}><PermissionState type={type} /></Typography>
                                            <ChevronRightIcon />
                                        </div>
                                    </Grid>
                                    {v < permissions.length - 1 && <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>}
                                </Fragment>
                            ))}
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="subtitle2" className={classes.paperHeading}>{this.section.controls.content}</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} className={classes.itemButtonRoot} component={ButtonBase} onClick={(e) => this.props.history.push('/pageSettings/content/zoomLevels')}>
                                <div className={classes.itemTitleRoot}>
                                    <SearchIcon />
                                    <Typography variant="body2" style={{ marginLeft: 10 }}>{this.section.controls.zoomLevels.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <Typography variant="body2" color="textSecondary" style={{ marginRight: getTheme().spacing(1) }}>{this.state.zoomLevel * 100}%</Typography>
                                    <ChevronRightIcon />
                                </div>
                            </Grid>
                            <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                            <Grid item xs={12} className={classes.itemButtonRoot} component={ButtonBase} onClick={(e) => this.props.history.push('/pageSettings/content/pdfDocuments')}>
                                <div className={classes.itemTitleRoot}>
                                    <PDFIcon />
                                    <Typography variant="body2" style={{ marginLeft: 10 }}>{this.section.controls.pdfDocuments.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <ChevronRightIcon />
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </NavigationBar>
        );
    }
}

SettingsPageSettingsPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsPageSettingsAllPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,

            // Page Settings
            datas: []
        };

        this.settings = window.getLanguageFile().internalPages.settings;
        this.section = this.settings.sections.pageSettings;
    }

    componentDidMount = () => {
        this.reloadData();
        setInterval(() => this.reloadData(), 1000 * 5);

        document.title = `${this.settings.title} » ${this.section.title}`;
    }

    componentWillReceiveProps = () => {
        this.reloadData();

        document.title = `${this.settings.title} » ${this.section.title}`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }


    reloadData = () => {
        window.getPageSettings().then((items) => {
            let datas = [];
            items.map((item) => window.getFavicon(item.origin).then((favicon) => datas.push({ origin: item.origin, favicon, type: item.type })));

            this.setState({ datas });
            console.log(this.state.datas);
        });
    }


    render() {
        const { classes } = this.props;


        const PageHeading = (props) => (
            <Grid item xs={12}>
                <div style={{ display: 'flex', alignItems: 'center', height: 30, marginBottom: 4 }}>
                    <IconButton size="small" component={RouterLink} to="/pageSettings">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" style={{
                        userSelect: 'none',
                        paddingLeft: getTheme().spacing(1),
                        paddingRight: getTheme().spacing(0.5)
                    }}>
                        <Typography variant="inherit" color="textSecondary">{this.section.title} / </Typography>
                        {props.text}
                    </Typography>
                </div>
                <Divider />
            </Grid>
        );

        const PermissionButton = (props) => (
            <Grid item xs={12} className={classes.itemPermissionButtonRoot}>
                <ButtonBase className={classes.itemPermissionButtonContainer} onClick={(e) => this.props.history.push(`/pageSettings/detail?origin=${props.origin}`)}>
                    <div className={classes.itemTitleRoot}>
                        <img src={props.favicon === undefined ? `${protocolStr}://resources/icons/public.svg` : props.favicon} style={{ width: 24, height: 24, pointerEvents: 'none' }} />
                        <Typography variant="body2" style={{ marginLeft: 10 }}>{props.origin}</Typography>
                    </div>
                    <div className={classes.itemControlRoot}>
                        <ChevronRightIcon />
                    </div>
                </ButtonBase>
                <Divider orientation="vertical" flexItem className={classes.itemPermissionButtonDivider} />
                <IconButton className={classes.itemPermissionButtonRemove}
                    onClick={() => {
                        window.removePageSettings(props.origin, props.type);
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </Grid>
        );


        return (
            <NavigationBar title={this.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <PageHeading text={this.section.controls.datas} />
                            {this.state.datas.length > 0 ?
                                this.state.datas.map((item, v) => (
                                    <Fragment>
                                        <PermissionButton key={v} origin={item.origin} favicon={item.favicon} type={item.type} />
                                        {v < this.state.datas.length - 1 && <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>}
                                    </Fragment>
                                ))
                                :
                                <Grid item xs={12} className={classes.itemRoot}>
                                    <div className={classes.itemTitleRoot}>
                                        <Typography variant="body2" style={{ marginLeft: getTheme().spacing(4) }}>{this.section.controls.noDatas}</Typography>
                                    </div>
                                    <div className={classes.itemControlRoot} />
                                </Grid>
                            }
                        </Grid>
                    </Paper>
                </Container>
            </NavigationBar>
        );
    }
}

SettingsPageSettingsAllPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsPageSettingsDetailPage extends Component {

    constructor(props) {
        super(props);

        const parsed = queryString.parse(this.props.location.search)

        this.state = {
            isDialogOpened: false,

            origin: parsed.origin,

            // Page Settings
            isLocation: -1,
            isCamera: -1,
            isMic: -1,
            isNotifications: -1,
            isMidi: -1,
            isPointer: -1,
            isFullScreen: -1,
            isOpenExternal: -1,

            zoomLevel: 1
        };

        this.settings = window.getLanguageFile().internalPages.settings;
        this.section = this.settings.sections.pageSettings;
    }

    componentDidMount = () => {
        const permissions = ['location', 'camera', 'mic', 'notifications', 'midi', 'pointer', 'fullScreen', 'openExternal'];

        window.getPageSettings(this.state.origin).then((items) => {
            items.filter((item) => permissions.includes(item.type)).forEach((item, i) => {
                this.setPermissionValue(item.type, item.result ? 1 : 0);
            });
        });

        document.title = `${this.settings.title} » ${this.section.title}`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }


    setPermissionValue = (type, value) => {
        switch (type) {
            case 'location': {
                this.setState({ isLocation: value });
                break;
            }
            case 'camera': {
                this.setState({ isCamera: value });
                break;
            }
            case 'mic': {
                this.setState({ isMic: value });
                break;
            }
            case 'notifications': {
                this.setState({ isNotifications: value });
                break;
            }
            case 'midi': {
                this.setState({ isMidi: value });
                break;
            }
            case 'pointer': {
                this.setState({ isPointer: value });
                break;
            }
            case 'fullScreen': {
                this.setState({ isFullScreen: value });
                break;
            }
            case 'openExternal': {
                this.setState({ isOpenExternal: value });
                break;
            }
            default: break;
        }
    }


    render() {
        const { classes } = this.props;

        const permissions = ['location', 'camera', 'mic', 'notifications', 'midi', 'pointer', 'fullScreen', 'openExternal'];

        const PermissionIcon = (props) => {
            switch (props.type) {
                case 'location': return (<LocationIcon />)
                case 'camera': return (<CameraIcon />)
                case 'mic': return (<MicIcon />)
                case 'notifications': return (<NotificationsIcon />)
                case 'midi': return (<RadioIcon />)
                case 'pointer': return (<LockIcon />)
                case 'fullScreen': return (<FullScreenIcon />)
                case 'openExternal': return (<LaunchIcon />)
                default: return (null)
            }
        }

        const getPermissionValue = (type) => {
            switch (type) {
                case 'location': return this.state.isLocation
                case 'camera': return this.state.isCamera
                case 'mic': return this.state.isMic
                case 'notifications': return this.state.isNotifications
                case 'midi': return this.state.isMidi
                case 'pointer': return this.state.isPointer
                case 'fullScreen': return this.state.isFullScreen
                case 'openExternal': return this.state.isOpenExternal
                default: break;
            }
        }

        return (
            <NavigationBar title={this.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <div style={{ display: 'flex', alignItems: 'center', height: 30, marginBottom: 4 }}>
                                    <IconButton size="small" component={RouterLink} to="/pageSettings">
                                        <ArrowBackIcon />
                                    </IconButton>
                                    <Typography variant="h6" style={{
                                        userSelect: 'none',
                                        paddingLeft: getTheme().spacing(1),
                                        paddingRight: getTheme().spacing(0.5)
                                    }}>
                                        <Typography variant="inherit" color="textSecondary">{this.section.title} / </Typography>
                                        {this.state.origin}
                                    </Typography>
                                </div>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="subtitle2" className={classes.paperHeading}>{this.section.controls.permission}</Typography>
                                <Divider />
                            </Grid>
                            {permissions.map((type, v) => (
                                <Fragment key={v}>
                                    <Grid item xs={12} className={classes.itemButtonRoot}>
                                        <div className={classes.itemTitleRoot}>
                                            <PermissionIcon type={type} />
                                            <Typography variant="body2" style={{ marginLeft: getTheme().spacing(1) }}>{this.section.controls[type]}</Typography>
                                        </div>
                                        <div className={classes.itemControlRoot}>
                                            <div className={classes.formRoot}>
                                                <FormControl variant="outlined" margin="dense" className={classes.formControl} style={{ minWidth: 210 }}>
                                                    <Select
                                                        value={getPermissionValue(type)}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            this.setPermissionValue(type, value);
                                                            value !== -1 ? window.updatePageSettings(this.state.origin, type, value) : window.removePageSettings(this.state.origin, type);
                                                        }}
                                                        inputProps={{
                                                            name: this.state.type,
                                                            id: this.state.type
                                                        }}
                                                    >
                                                        <MenuItem value={-1}>{this.section.controls.useDefault}</MenuItem>
                                                        <MenuItem value={1}>{this.section.controls.allow}</MenuItem>
                                                        <MenuItem value={0}>{this.section.controls.deny}</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </div>
                                        </div>
                                    </Grid>
                                    {v < permissions.length - 1 && <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>}
                                </Fragment>
                            ))}
                            <Grid item xs={12} className={classes.paperHeadingRoot}>
                                <Typography variant="subtitle2" className={classes.paperHeading}>{this.section.controls.content}</Typography>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} className={classes.itemButtonRoot} component={ButtonBase} onClick={(e) => this.props.history.push('/pageSettings/content/zoomLevels')}>
                                <div className={classes.itemTitleRoot}>
                                    <SearchIcon />
                                    <Typography variant="body2" style={{ marginLeft: 10 }}>{this.section.controls.zoomLevels.name}</Typography>
                                </div>
                                <div className={classes.itemControlRoot}>
                                    <Typography variant="body2" color="textSecondary" style={{ marginRight: getTheme().spacing(1) }}>{this.state.zoomLevel * 100}%</Typography>
                                    <ChevronRightIcon />
                                </div>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </NavigationBar>
        );
    }
}

SettingsPageSettingsDetailPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsPageSettingsPermissionPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,

            // Page Settings
            type: this.props.match.params.type,
            default: -1,
            allows: [],
            denies: []
        };

        this.settings = window.getLanguageFile().internalPages.settings;
        this.section = this.settings.sections.pageSettings;
    }

    componentDidMount = () => {
        switch (this.state.type) {
            case 'location': {
                this.setState({ default: window.getLocation() });
                break;
            }
            case 'camera': {
                this.setState({ default: window.getCamera() });
                break;
            }
            case 'mic': {
                this.setState({ default: window.getMic() });
                break;
            }
            case 'notifications': {
                this.setState({ default: window.getNotifications() });
                break;
            }
            case 'midi': {
                this.setState({ default: window.getMidi() });
                break;
            }
            case 'pointer': {
                this.setState({ default: window.getPointer() });
                break;
            }
            case 'fullScreen': {
                this.setState({ default: window.getFullScreen() });
                break;
            }
            case 'openExternal': {
                this.setState({ default: window.getOpenExternal() });
                break;
            }
            default: break;
        }

        window.getAllowPermissions(this.state.type).then((dataAllows) => {
            let allows = [];
            dataAllows.map((allow) => window.getFavicon(allow.origin).then((favicon) => allows.push({ origin: allow.origin, favicon })));
            window.getDenyPermissions(this.state.type).then((dataDenies) => {
                let denies = [];
                dataDenies.map((deny) => window.getFavicon(deny.origin).then((favicon) => denies.push({ origin: deny.origin, favicon })));

                this.setState({ allows, denies });
            });
        });

        document.title = `${this.settings.title} » ${this.section.title}`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }


    reloadPermissions = () => {
        window.getAllowPermissions(this.state.type).then((dataAllows) => {
            let allows = [];
            dataAllows.map((allow) => window.getFavicon(allow.origin).then((favicon) => allows.push({ origin: allow.origin, favicon })));
            window.getDenyPermissions(this.state.type).then((dataDenies) => {
                let denies = [];
                dataDenies.map((deny) => window.getFavicon(deny.origin).then((favicon) => denies.push({ origin: deny.origin, favicon })));

                this.setState({ allows, denies });
            });
        });
    }

    isPermission = (type = this.state.type) => {
        return type !== undefined && ['location', 'camera', 'mic', 'notifications', 'midi', 'pointer', 'fullScreen', 'openExternal'].includes(type)
    }

    setDefault = (value) => {
        switch (this.state.type) {
            case 'location': {
                window.setLocation(value);
                break;
            }
            case 'camera': {
                window.setCamera(value);
                break;
            }
            case 'mic': {
                window.setMic(value);
                break;
            }
            case 'notifications': {
                window.setNotifications(value);
                break;
            }
            case 'midi': {
                window.setMidi(value);
                break;
            }
            case 'pointer': {
                window.setPointer(value);
                break;
            }
            case 'fullScreen': {
                window.setFullScreen(value);
                break;
            }
            case 'openExternal': {
                window.setOpenExternal(value);
                break;
            }
            default: break;
        }
    }


    render() {
        const { classes } = this.props;

        const PageHeading = (props) => (
            <Grid item xs={12}>
                <div style={{ display: 'flex', alignItems: 'center', height: 30, marginBottom: 4 }}>
                    <IconButton size="small" component={RouterLink} to="/pageSettings">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" style={{
                        userSelect: 'none',
                        paddingLeft: getTheme().spacing(1),
                        paddingRight: getTheme().spacing(0.5)
                    }}>
                        <Typography variant="inherit" color="textSecondary">{this.section.title} / </Typography>
                        {props.text}
                    </Typography>
                </div>
                <Divider />
            </Grid>
        );

        const PermissionButton = (props) => (
            <Grid item xs={12} className={classes.itemPermissionButtonRoot}>
                <ButtonBase className={classes.itemPermissionButtonContainer} onClick={(e) => this.props.history.push(`/pageSettings/detail?origin=${props.origin}`)}>
                    <div className={classes.itemTitleRoot}>
                        <img src={props.favicon === undefined ? `${protocolStr}://resources/icons/public.svg` : props.favicon} style={{ width: 24, height: 24, pointerEvents: 'none' }} />
                        <Typography variant="body2" style={{ marginLeft: 10 }}>{props.origin}</Typography>
                    </div>
                    <div className={classes.itemControlRoot}>
                        <ChevronRightIcon />
                    </div>
                </ButtonBase>
                <Divider orientation="vertical" flexItem className={classes.itemPermissionButtonDivider} />
                <IconButton className={classes.itemPermissionButtonRemove}
                    onClick={() => {
                        window.removePageSettings(props.origin, this.state.type);
                        this.reloadPermissions();
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </Grid>
        );

        return (
            <NavigationBar title={this.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        {this.isPermission(this.state.type) ? (
                            <Grid container spacing={2}>
                                <PageHeading text={this.section.controls[this.state.type]} />
                                <Grid item xs={12} className={classes.itemRoot}>
                                    <div className={classes.itemTitleRoot}>
                                        <Typography variant="body2" style={{ marginLeft: 10 }}>{this.section.controls.default}</Typography>
                                    </div>
                                    <div className={classes.itemControlRoot}>
                                        <div className={classes.formRoot}>
                                            <FormControl variant="outlined" margin="dense" className={classes.formControl} style={{ minWidth: 150 }}>
                                                <Select
                                                    value={this.state.default}
                                                    onChange={(e) => {
                                                        this.setState({ default: e.target.value });
                                                        this.setDefault(e.target.value);
                                                    }}
                                                    inputProps={{
                                                        name: this.state.type,
                                                        id: this.state.type
                                                    }}
                                                >
                                                    <MenuItem value={-1}>{this.section.controls.check}</MenuItem>
                                                    <MenuItem value={1}>{this.section.controls.allow}</MenuItem>
                                                    <MenuItem value={0}>{this.section.controls.deny}</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div>
                                    </div>
                                </Grid>
                                <Grid item xs={12} className={classes.paperHeadingRoot}>
                                    <Typography variant="subtitle2" className={classes.paperHeading}>{this.section.controls.allow}</Typography>
                                    <Divider />
                                </Grid>
                                {this.state.allows.length > 0 ?
                                    this.state.allows.map((item, v) => (
                                        <Fragment>
                                            <PermissionButton key={v} origin={item.origin} favicon={item.favicon} />
                                            {v < this.state.allows.length - 1 && <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>}
                                        </Fragment>
                                    ))
                                    :
                                    <Grid item xs={12} className={classes.itemRoot}>
                                        <div className={classes.itemTitleRoot}>
                                            <Typography variant="body2" style={{ marginLeft: getTheme().spacing(4) }}>{this.section.controls.noDatas}</Typography>
                                        </div>
                                        <div className={classes.itemControlRoot} />
                                    </Grid>
                                }
                                <Grid item xs={12} className={classes.paperHeadingRoot}>
                                    <Typography variant="subtitle2" className={classes.paperHeading}>{this.section.controls.deny}</Typography>
                                    <Divider />
                                </Grid>
                                {this.state.denies.length > 0 ?
                                    this.state.denies.map((item, v) => (
                                        <Fragment>
                                            <PermissionButton key={v} origin={item.origin} favicon={item.favicon} />
                                            {v < this.state.denies.length - 1 && <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>}
                                        </Fragment>
                                    ))
                                    :
                                    <Grid item xs={12} className={classes.itemRoot}>
                                        <div className={classes.itemTitleRoot}>
                                            <Typography variant="body2" style={{ marginLeft: getTheme().spacing(4) }}>{this.section.controls.noDatas}</Typography>
                                        </div>
                                        <div className={classes.itemControlRoot} />
                                    </Grid>
                                }
                            </Grid>
                        ) : (<Redirect to="/pageSettings" />)}
                    </Paper>
                </Container>
            </NavigationBar>
        );
    }
}

SettingsPageSettingsPermissionPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsPageSettingsContentPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false,

            // Page Settings
            type: this.props.match.params.type,

            defaultZoomLevel: 1,

            isDownload: false,
            useNewViewer: false
        };

        this.settings = window.getLanguageFile().internalPages.settings;
        this.section = this.settings.sections.pageSettings;
    }

    componentDidMount = () => {
        this.setState({
            // Page Settings
            defaultZoomLevel: window.getZoomLevel(),

            isDownload: window.getPDFDownload(),
            useNewViewer: window.getUseNewPDFViewer(),
        });

        document.title = `${this.settings.title} » ${this.section.title}`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    render() {
        const { classes } = this.props;

        const PageHeading = (props) => (
            <Grid item xs={12} className={classes.paperHeadingRoot}>
                <div className={classes.paperHeading} style={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small" component={RouterLink} to="/pageSettings">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" style={{
                        userSelect: 'none',
                        paddingLeft: getTheme().spacing(1),
                        paddingRight: getTheme().spacing(0.5)
                    }}>
                        <Typography variant="inherit" color="textSecondary">{this.section.title} / </Typography>
                        {props.text}
                    </Typography>
                </div>
                <Divider />
            </Grid>
        );

        const Content = (props) => {
            const type = props.type ?? this.state.type
            switch (type) {
                case 'zoomLevels': return (
                    <Fragment>
                        <Grid item xs={12} className={classes.itemRoot}>
                            <div className={classes.itemTitleRoot}>
                                <Typography variant="body2" style={{ marginLeft: 10 }}>{this.section.controls.default}</Typography>
                            </div>
                            <div className={classes.itemControlRoot}>
                                <Tooltip title={this.section.controls[this.state.type].controls.reset}>
                                    <IconButton size="small" style={{ marginRight: 5 }}
                                        onClick={() => {
                                            this.setState({ defaultZoomLevel: 1 });
                                            window.setZoomLevel(1);
                                        }}
                                    >
                                        <RestoreIcon />
                                    </IconButton>
                                </Tooltip>
                                <FormControl variant="outlined" margin="dense" className={classes.formControl} style={{ minWidth: 150 }}>
                                    <Select
                                        value={this.state.defaultZoomLevel}
                                        onChange={(e) => {
                                            this.setState({ defaultZoomLevel: e.target.value });
                                            window.setZoomLevel(e.target.value);
                                        }}
                                        inputProps={{
                                            name: this.state.type,
                                            id: this.state.type
                                        }}
                                    >
                                        {[25, 33, 50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500].map((item, i) => (
                                            <MenuItem key={i} value={item / 100}>{item}%</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        </Grid>
                    </Fragment>
                )
                case 'pdfDocuments': return (
                    <Fragment>
                        <Grid item xs={12} className={classes.itemRoot}>
                            <div className={classes.itemTitleRoot}>
                                <Typography variant="body2" style={{ marginLeft: 10 }}>{this.section.controls[this.state.type].controls.isDownload}</Typography>
                            </div>
                            <div className={classes.itemControlRoot}>
                                <Switch
                                    checked={this.state.isDownload}
                                    onChange={(e) => {
                                        this.setState({ ...this.state, isDownload: e.target.checked });
                                        window.setPDFDownload(e.target.checked);
                                    }}
                                    color="primary"
                                    value="isDownload"
                                />
                            </div>
                        </Grid>
                        <Grid item xs={12} className={classes.itemDivider}><Divider /></Grid>
                        <Grid item xs={12} className={classes.itemRoot}>
                            <div className={classes.itemTitleRoot}>
                                <Typography variant="body2" style={{ marginLeft: 10 }}>{this.section.controls[this.state.type].controls.useNewViewer}</Typography>
                            </div>
                            <div className={classes.itemControlRoot}>
                                <Switch
                                    checked={this.state.useNewViewer}
                                    onChange={(e) => {
                                        this.setState({ ...this.state, useNewViewer: e.target.checked });
                                        window.setUseNewPDFViewer(e.target.checked);
                                    }}
                                    color="primary"
                                    value="useNewViewer"
                                />
                            </div>
                        </Grid>
                    </Fragment>
                )
                default: return (<Redirect to="/pageSettings" />)
            }
        }


        return (
            <NavigationBar title={this.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <PageHeading text={this.section.controls[this.state.type].name} />
                            <Content />
                        </Grid>
                    </Paper>
                </Container>
            </NavigationBar>
        );
    }
}

SettingsPageSettingsContentPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

class SettingsAboutPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            updateStatus: 'checking',

            isDialogOpened: false
        };

        this.settings = window.getLanguageFile().internalPages.settings;
        this.section = this.settings.sections.about;
    }

    componentDidMount = () => {
        window.getUpdateStatus().then((result) => {
            this.setState({ updateStatus: result });
        });
        setInterval(() => {
            this.setState({ updateStatus: 'checking' });
            window.getUpdateStatus().then((result) => {
                this.setState({ updateStatus: result });
            });
        }, 1000 * 30);

        document.title = `${this.settings.title} » ${this.section.title}`;
    }

    handleDialogClose = () => {
        this.setState({ isDialogOpened: false });
    }

    render() {
        const { classes } = this.props;

        return (
            <NavigationBar title={window.getLanguageFile().internalPages.settings.title} buttons={[<Button color="inherit" onClick={() => { window.openInEditor(); }}>テキストエディタで開く</Button>]}>
                <Container fixed className={classes.containerRoot}>
                    <Paper className={classes.paperRoot}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6" className={classes.paperHeading}>{this.section.title}</Typography>
                                <Divider />
                            </Grid>
                            <Grid item style={{ width: 190, padding: '0px 16px' }}>
                                <img src={`${protocolStr}://resources/icons/logo_${window.getThemeType() ? 'dark' : 'light'}.svg`} width="173" style={{ userSelect: 'none' }} />
                            </Grid>
                            <Grid item style={{ padding: '0px 16px' }} alignItems="center">
                                <Typography variant="subtitle1" gutterBottom style={{ userSelect: 'none' }}>{window.getAppName()}</Typography>
                                <Typography variant="subtitle2" gutterBottom style={{ userSelect: 'none' }}>
                                    {(() => {
                                        const updates = this.section.controls.updates;
                                        switch (this.state.updateStatus) {
                                            case 'available': return updates.available;
                                            case 'not-available': return updates.notAvailable;
                                            case 'error': return updates.error;
                                            case 'downloading': return updates.downloading;
                                            case 'downloaded': return updates.downloaded;
                                            default: return updates.checking;
                                        }
                                    })()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" gutterBottom style={{ userSelect: 'none' }}>
                                    {this.section.controls.version}: {window.getAppVersion()} (<b>{window.getAppChannel()}</b>, Electron: {window.getElectronVersion()}, Chromium: {window.getChromiumVersion()})
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} style={{ padding: '0px 16px' }}>
                                <Typography variant="body2" color="textSecondary" gutterBottom style={{ marginBottom: '0.8em' }}>
                                    {window.getAppName()}<br />
                                    {window.getAppDescription()}<br />
                                    {window.getAppCopyright()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    {window.getAppName()} はChromiumやその他の<Link href="flast://credits/">オープンソース ソフトウェア</Link>によって実現しました。
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12} style={{ display: 'flex', padding: '0px 14px' }} direction="column" alignItems="flex-end">
                                <Button variant="outlined" size="small" onClick={() => { this.setState({ isDialogOpened: 'reset' }); }}>{this.section.controls.reset.name}</Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
                <Dialog open={this.state.isDialogOpened === 'reset'} onClose={this.handleDialogClose} aria-labelledby="dialog-title">
                    <DialogTitle id="dialog-title" onClose={this.handleDialogClose}>{this.section.controls.reset.name}</DialogTitle>
                    <DialogContent dividers>
                        <Typography gutterBottom style={{ userSelect: 'none' }}>
                            {this.section.controls.reset.controls.description.split('\n').map((text) => (<Fragment>{text}<br /></Fragment>))}
                        </Typography>
                        <Divider style={{ margin: '5px 0px' }} />
                        <Typography variant="subtitle1" gutterBottom style={{ userSelect: 'none' }}>削除されるデータ</Typography>
                        <Typography>
                            <ul style={{ margin: 0, paddingLeft: 29 }}>
                                <li>履歴</li>
                                <li>ブックマーク (プライベート ブックマークも含む)</li>
                                <li>キャッシュ</li>
                                <li>Cookieとサイトデータ</li>
                                <ul style={{ margin: 0, paddingLeft: 29 }}>
                                    <li>ログイン情報</li>
                                </ul>
                            </ul>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus color="primary" variant="outlined" onClick={this.handleDialogClose}>
                            {this.section.controls.reset.controls.cancel}
                        </Button>
                        <Button color="primary" variant="contained" onClick={() => { window.clearBrowserData(true); window.restart(); }}>
                            {this.section.controls.reset.name}
                        </Button>
                    </DialogActions>
                </Dialog>
            </NavigationBar>
        );
    }
}

SettingsAboutPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

render(
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
        <BrowserRouter>
            <div>
                <Route exact path='/'><Redirect to='/users' /></Route>
                <Route path='/users' component={withStyles(styles)(SettingsUsersPage)} />
                <Route path='/adBlock' component={withStyles(styles)(SettingsAdBlockPage)} />
                <Route path='/design' component={withStyles(styles)(SettingsDesignPage)} />
                <Route path='/homePage' component={withStyles(styles)(SettingsHomePage)} />
                <Route path='/startUp' component={withStyles(styles)(SettingsStartUpPage)} />
                <Route path='/search' component={withStyles(styles)(SettingsSearchEnginePage)} />
                <RouterSwitch>
                    <Route exact path='/pageSettings' component={withRouter(withStyles(styles)(SettingsPageSettingsPage))} />
                    <Route path='/pageSettings/all' component={withRouter(withStyles(styles)(SettingsPageSettingsAllPage))} />
                    <Route path='/pageSettings/detail' component={withRouter(withStyles(styles)(SettingsPageSettingsDetailPage))} />
                    <Route path='/pageSettings/permission/:type' component={withRouter(withStyles(styles)(SettingsPageSettingsPermissionPage))} />
                    <Route path='/pageSettings/content/:type' component={withRouter(withStyles(styles)(SettingsPageSettingsContentPage))} />
                    <Route path='/pageSettings/*'><Redirect to='/pageSettings' /></Route>
                </RouterSwitch>
                <Route path='/about' component={withStyles(styles)(SettingsAboutPage)} />
            </div>
        </BrowserRouter>
    </SnackbarProvider>,
    document.getElementById('app')
);