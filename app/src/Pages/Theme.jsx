import { createMuiTheme, withStyles } from '@material-ui/core/styles';

export const lightTheme = createMuiTheme({
    palette: {
        type: 'light'
    }
});

export const darkTheme = createMuiTheme({
    palette: {
        type: 'dark'
    }
});

export const isDarkTheme = () => {
    return window.getThemeType();
}

export const getTheme = () => {
    return window.getThemeType() ? darkTheme : lightTheme;
}